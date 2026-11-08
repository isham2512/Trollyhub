import asyncio
import json
import os
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from bson import ObjectId
import motor.motor_asyncio
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from config import MONGO_URI

DATA_DIR = Path(__file__).resolve().parent / "data"
STORE_FILE = DATA_DIR / "store.json"

class JSONCollection:
    def __init__(self, name: str, db: "JSONDatabase"):
        self.name = name
        self.db = db

    async def find(self, query: Optional[Dict[str, Any]] = None, sort: Optional[List[tuple]] = None, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        docs = self.db.get_collection(self.name)
        result = []
        for doc in docs:
            if self._matches(doc, query or {}):
                result.append(self._format_doc(doc))

        if sort:
            for field, direction in reversed(sort):
                reverse = direction < 0
                result.sort(key=lambda d: self._sort_key(d.get(field)), reverse=reverse)

        if limit:
            result = result[:limit]

        return result

    async def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        docs = self.db.get_collection(self.name)
        for doc in docs:
            if self._matches(doc, query):
                return self._format_doc(doc)
        return None

    async def insert_one(self, doc: Dict[str, Any]) -> Any:
        doc_copy = dict(doc)
        if "_id" not in doc_copy or not doc_copy["_id"]:
            doc_copy["_id"] = str(uuid.uuid4()).replace("-", "")[:24]
        now = datetime.now(timezone.utc).isoformat()
        if "createdAt" not in doc_copy:
            doc_copy["createdAt"] = now
        if "updatedAt" not in doc_copy:
            doc_copy["updatedAt"] = now
        if "created_at" not in doc_copy and self.name == "bills":
            doc_copy["created_at"] = now

        self.db.add_doc(self.name, doc_copy)
        await self.db.save()
        
        class InsertResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id
        return InsertResult(doc_copy["_id"])

    async def insert_many(self, docs: List[Dict[str, Any]]) -> Any:
        ids = []
        for d in docs:
            res = await self.insert_one(d)
            ids.append(res.inserted_id)
        class InsertManyResult:
            def __init__(self, inserted_ids):
                self.inserted_ids = inserted_ids
        return InsertManyResult(ids)

    async def update_one(self, filter_query: Dict[str, Any], update_doc: Dict[str, Any]) -> int:
        docs = self.db.get_collection(self.name)
        for i, doc in enumerate(docs):
            if self._matches(doc, filter_query):
                now = datetime.now(timezone.utc).isoformat()
                doc["updatedAt"] = now
                if "$set" in update_doc:
                    doc.update(update_doc["$set"])
                else:
                    for k, v in update_doc.items():
                        if not k.startswith("$"):
                            doc[k] = v
                await self.db.save()
                return 1
        return 0

    async def delete_one(self, filter_query: Dict[str, Any]) -> int:
        docs = self.db.get_collection(self.name)
        for i, doc in enumerate(docs):
            if self._matches(doc, filter_query):
                docs.pop(i)
                await self.db.save()
                return 1
        return 0

    async def delete_many(self, filter_query: Dict[str, Any]) -> int:
        docs = self.db.get_collection(self.name)
        initial_len = len(docs)
        self.db.data[self.name] = [d for d in docs if not self._matches(d, filter_query)]
        await self.db.save()
        return initial_len - len(self.db.data[self.name])

    async def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        if not query:
            return len(self.db.get_collection(self.name))
        count = 0
        for doc in self.db.get_collection(self.name):
            if self._matches(doc, query):
                count += 1
        return count

    def _matches(self, doc: Dict[str, Any], query: Dict[str, Any]) -> bool:
        for k, v in query.items():
            if k == "$or" and isinstance(v, list):
                if not any(self._matches(doc, subq) for subq in v):
                    return False
                continue
            if k == "$and" and isinstance(v, list):
                if not all(self._matches(doc, subq) for subq in v):
                    return False
                continue

            doc_val = doc.get(k)
            if isinstance(v, dict):
                for op, op_val in v.items():
                    if op == "$regex":
                        pattern = op_val
                        options = v.get("$options", "")
                        flags = re.IGNORECASE if "i" in options else 0
                        if not re.search(pattern, str(doc_val or ""), flags=flags):
                            return False
                    elif op == "$lte":
                        if doc_val is None or doc_val > op_val:
                            return False
                    elif op == "$gte":
                        if doc_val is None or doc_val < op_val:
                            return False
                    elif op == "$in":
                        if doc_val not in op_val:
                            return False
                    elif op == "$options":
                        continue
            else:
                if str(doc_val) != str(v):
                    return False
        return True

    def _format_doc(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        d = dict(doc)
        if "_id" in d:
            d["_id"] = str(d["_id"])
            d["id"] = d["_id"]
        return d

    def _sort_key(self, val: Any) -> Any:
        if val is None:
            return ""
        return val

class JSONDatabase:
    def __init__(self):
        self.data: Dict[str, List[Dict[str, Any]]] = {
            "users": [],
            "products": [],
            "orders": [],
            "bills": [],
            "stock_logs": [],
            "otp_verifications": []
        }
        self.load()

    def load(self):
        if STORE_FILE.exists():
            try:
                with open(STORE_FILE, "r", encoding="utf-8") as f:
                    content = f.read()
                    if content.strip():
                        loaded = json.loads(content)
                        self.data.update(loaded)
            except Exception as e:
                print(f"Notice: creating new JSON store ({e})")

    async def save(self):
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        with open(STORE_FILE, "w", encoding="utf-8") as f:
            json.dump(self.data, f, indent=2, default=str)

    def get_collection(self, name: str) -> List[Dict[str, Any]]:
        if name not in self.data:
            self.data[name] = []
        return self.data[name]

    def add_doc(self, name: str, doc: Dict[str, Any]):
        coll = self.get_collection(name)
        coll.append(doc)

class MongoCollectionWrapper:
    def __init__(self, raw_collection):
        self.raw = raw_collection

    def _convert_id(self, query: Any) -> Any:
        if isinstance(query, dict):
            new_q = {}
            for k, v in query.items():
                if k in ("_id", "id") and isinstance(v, str) and ObjectId.is_valid(v):
                    new_q["_id"] = ObjectId(v)
                elif isinstance(v, (dict, list)):
                    new_q[k] = self._convert_id(v)
                else:
                    new_q[k] = v
            return new_q
        elif isinstance(query, list):
            return [self._convert_id(item) for item in query]
        return query

    def _format_doc(self, doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        if not doc:
            return None
        d = dict(doc)
        if "_id" in d:
            d["_id"] = str(d["_id"])
            d["id"] = d["_id"]
        # Format nested object IDs
        for k in ("customer_id", "employee_id", "product_id", "order_id", "updated_by"):
            if k in d and isinstance(d[k], ObjectId):
                d[k] = str(d[k])
        return d

    async def find(self, query: Optional[Dict[str, Any]] = None, sort: Optional[List[tuple]] = None, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        q = self._convert_id(query or {})
        cursor = self.raw.find(q)
        if sort:
            cursor = cursor.sort(sort)
        if limit:
            cursor = cursor.limit(limit)
        docs = await cursor.to_list(length=1000)
        return [self._format_doc(d) for d in docs]

    async def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        q = self._convert_id(query)
        doc = await self.raw.find_one(q)
        return self._format_doc(doc)

    async def insert_one(self, doc: Dict[str, Any]) -> Any:
        d = dict(doc)
        now = datetime.now(timezone.utc)
        if "createdAt" not in d:
            d["createdAt"] = now
        if "updatedAt" not in d:
            d["updatedAt"] = now
        if "created_at" not in d and self.raw.name == "bills":
            d["created_at"] = now
        res = await self.raw.insert_one(d)
        return res

    async def insert_many(self, docs: List[Dict[str, Any]]) -> Any:
        now = datetime.now(timezone.utc)
        formatted = []
        for d in docs:
            c = dict(d)
            if "createdAt" not in c:
                c["createdAt"] = now
            if "updatedAt" not in c:
                c["updatedAt"] = now
            formatted.append(c)
        return await self.raw.insert_many(formatted)

    async def update_one(self, filter_query: Dict[str, Any], update_doc: Dict[str, Any]) -> Any:
        q = self._convert_id(filter_query)
        u = dict(update_doc)
        now = datetime.now(timezone.utc)
        if "$set" in u:
            u["$set"]["updatedAt"] = now
        else:
            u["$set"] = {"updatedAt": now}
        return await self.raw.update_one(q, u)

    async def delete_one(self, filter_query: Dict[str, Any]) -> Any:
        q = self._convert_id(filter_query)
        return await self.raw.delete_one(q)

    async def delete_many(self, filter_query: Dict[str, Any]) -> Any:
        q = self._convert_id(filter_query)
        return await self.raw.delete_many(q)

    async def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        q = self._convert_id(query or {})
        return await self.raw.count_documents(q)

class Database:
    def __init__(self):
        self.is_mongo = False
        self.mongo_client = None
        self.json_db = JSONDatabase()
        self.users = JSONCollection("users", self.json_db)
        self.products = JSONCollection("products", self.json_db)
        self.orders = JSONCollection("orders", self.json_db)
        self.bills = JSONCollection("bills", self.json_db)
        self.stock_logs = JSONCollection("stock_logs", self.json_db)
        self.otp_verifications = JSONCollection("otp_verifications", self.json_db)

    async def connect(self):
        if MONGO_URI and "<username>" not in MONGO_URI:
            try:
                client = motor.motor_asyncio.AsyncIOMotorClient(
                    MONGO_URI,
                    serverSelectionTimeoutMS=2500
                )
                # Verify connection
                await client.admin.command("ping")
                self.mongo_client = client
                raw_db = client.get_database("trolly_hub")
                self.users = MongoCollectionWrapper(raw_db["users"])
                self.products = MongoCollectionWrapper(raw_db["products"])
                self.orders = MongoCollectionWrapper(raw_db["orders"])
                self.bills = MongoCollectionWrapper(raw_db["bills"])
                self.stock_logs = MongoCollectionWrapper(raw_db["stocklogs"])
                self.otp_verifications = MongoCollectionWrapper(raw_db["otpverifications"])
                self.is_mongo = True
                print("✅ MongoDB connected successfully to database: trolly_hub")
                return
            except Exception as e:
                print(f"⚠️ MongoDB connection skipped ({e}). Falling back to local persistent store.")
        
        print("📁 Using local JSON document store at server/data/store.json")

db = Database()

