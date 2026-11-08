from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from database import db
from auth import get_current_user, require_roles
from models import CreateProductRequest, UpdateProductRequest

router = APIRouter(prefix="/api/products", tags=["products"])

@router.get("")
@router.get("/")
async def get_products(
    search: str = Query("", description="Search by name or barcode"),
    category: str = Query("", description="Filter by category"),
    user: dict = Depends(get_current_user)
):
    query = {}
    if search:
        query["$or"] = [
            {"product_name": {"$regex": search, "$options": "i"}},
            {"barcode": {"$regex": search, "$options": "i"}}
        ]
    if category and category != "All":
        query["category"] = category

    products = await db.products.find(query, sort=[("createdAt", -1)])
    return products

@router.get("/{id}")
async def get_product_by_id(id: str, user: dict = Depends(get_current_user)):
    product = await db.products.find_one({"_id": id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("", status_code=201)
@router.post("/", status_code=201)
async def create_product(
    payload: CreateProductRequest,
    user: dict = Depends(require_roles("admin", "manager"))
):
    doc = payload.model_dump()
    res = await db.products.insert_one(doc)
    doc["_id"] = str(res.inserted_id)
    doc["id"] = doc["_id"]
    return doc

@router.put("/{id}")
async def update_product(
    id: str,
    payload: UpdateProductRequest,
    user: dict = Depends(require_roles("admin", "manager"))
):
    existing = await db.products.find_one({"_id": id})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")

    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if updates:
        await db.products.update_one({"_id": id}, {"$set": updates})

    updated = await db.products.find_one({"_id": id})
    return updated

@router.delete("/{id}")
async def delete_product(
    id: str,
    user: dict = Depends(require_roles("admin"))
):
    existing = await db.products.find_one({"_id": id})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")

    await db.products.delete_one({"_id": id})
    return {"message": "Product deleted"}

