from fastapi import APIRouter, Depends, HTTPException, status
from database import db
from auth import require_roles
from models import UpdateStockRequest

router = APIRouter(prefix="/api/stock", tags=["stock"])

@router.get("/low-stock")
async def get_low_stock(user: dict = Depends(require_roles("admin", "manager"))):
    products = await db.products.find({"stock": {"$lte": 10}}, sort=[("stock", 1)])
    return products

@router.get("/logs")
async def get_stock_logs(user: dict = Depends(require_roles("admin", "manager"))):
    logs = await db.stock_logs.find({}, sort=[("createdAt", -1)], limit=100)
    
    # Populate product_id and updated_by
    populated = []
    for log in logs:
        item = dict(log)
        p_id = item.get("product_id")
        if p_id:
            p = await db.products.find_one({"_id": str(p_id)})
            if p:
                item["product_id"] = {"_id": str(p["_id"]), "product_name": p.get("product_name", "—")}
            else:
                item["product_id"] = {"_id": str(p_id), "product_name": "—"}
        else:
            item["product_id"] = {"product_name": "—"}

        u_id = item.get("updated_by")
        if u_id:
            u = await db.users.find_one({"_id": str(u_id)})
            if u:
                item["updated_by"] = {"_id": str(u["_id"]), "name": u.get("name", "System"), "role": u.get("role", "")}
            else:
                item["updated_by"] = {"name": "System", "role": ""}
        else:
            item["updated_by"] = {"name": "System", "role": ""}

        populated.append(item)

    return populated

@router.patch("/{id}")
async def update_stock(
    id: str,
    payload: UpdateStockRequest,
    user: dict = Depends(require_roles("admin", "manager"))
):
    product = await db.products.find_one({"_id": id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    updates = {}
    if payload.stock is not None:
        if payload.stock < 0:
            raise HTTPException(status_code=400, detail="Stock cannot be negative")
        
        old_stock = product.get("stock", 0)
        # Record log
        await db.stock_logs.insert_one({
            "product_id": str(product["_id"]),
            "updated_by": str(user["id"]),
            "old_stock": old_stock,
            "new_stock": payload.stock,
            "change_type": "manual"
        })
        updates["stock"] = payload.stock

    if payload.price is not None:
        if payload.price < 0:
            raise HTTPException(status_code=400, detail="Price cannot be negative")
        updates["price"] = payload.price

    if updates:
        await db.products.update_one({"_id": id}, {"$set": updates})

    updated = await db.products.find_one({"_id": id})
    return updated

