from fastapi import APIRouter, Depends, HTTPException, status
from database import db
from auth import require_roles, hash_password
from models import CreateUserRequest

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("")
@router.get("/")
async def get_users(user: dict = Depends(require_roles("admin", "manager"))):
    current_role = user.get("role")
    if current_role == "admin":
        query = {"role": {"$in": ["manager", "employee", "customer"]}}
    else:
        query = {"role": "customer"}

    users = await db.users.find(query, sort=[("createdAt", -1)])
    clean_users = []
    for u in users:
        item = dict(u)
        item.pop("password", None)
        clean_users.append(item)
    return clean_users

@router.post("", status_code=201)
@router.post("/", status_code=201)
async def create_user(
    payload: CreateUserRequest,
    user: dict = Depends(require_roles("admin"))
):
    if payload.role not in ["manager", "employee", "customer"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    or_queries = []
    if payload.email:
        or_queries.append({"email": payload.email.strip().lower()})
    if payload.mobile:
        or_queries.append({"mobile": payload.mobile.strip()})

    if or_queries:
        exists = await db.users.find_one({"$or": or_queries})
        if exists:
            raise HTTPException(status_code=400, detail="User already exists")

    hashed = hash_password(payload.password) if payload.password else None

    user_doc = {
        "name": payload.name.strip(),
        "role": payload.role,
        "email": payload.email.strip().lower() if payload.email else None,
        "mobile": payload.mobile.strip() if payload.mobile else None,
        "password": hashed,
        "isActive": True
    }

    res = await db.users.insert_one(user_doc)
    user_doc["_id"] = str(res.inserted_id)
    user_doc["id"] = user_doc["_id"]
    user_doc.pop("password", None)

    return user_doc

