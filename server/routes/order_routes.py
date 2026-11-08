from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from database import db
from auth import get_current_user, require_roles
from models import CreateOrderRequest, UpdateOrderStatusRequest
from utils.bill_number import generate_bill_number

router = APIRouter(prefix="/api/orders", tags=["orders"])

async def _populate_order(order: dict) -> dict:
    res = dict(order)
    cust_id = res.get("customer_id")
    if cust_id:
        cust = await db.users.find_one({"_id": str(cust_id)})
        if cust:
            res["customer_id"] = {
                "_id": str(cust["_id"]),
                "name": cust.get("name", "Customer"),
                "mobile": cust.get("mobile", "")
            }
        else:
            res["customer_id"] = {"_id": str(cust_id), "name": "Customer", "mobile": ""}
    else:
        res["customer_id"] = None

    emp_id = res.get("employee_id")
    if emp_id:
        emp = await db.users.find_one({"_id": str(emp_id)})
        if emp:
            res["employee_id"] = {
                "_id": str(emp["_id"]),
                "name": emp.get("name", "Staff"),
                "role": emp.get("role", "employee")
            }
        else:
            res["employee_id"] = {"_id": str(emp_id), "name": "Staff"}
    else:
        res["employee_id"] = None

    return res

@router.post("", status_code=201)
@router.post("/", status_code=201)
async def create_order(
    payload: CreateOrderRequest,
    user: dict = Depends(require_roles("employee", "admin", "manager", "customer"))
):
    if not payload.items:
        raise HTTPException(status_code=400, detail="At least one item is required")

    customer_id = None
    customer_mobile = payload.customerMobile or payload.alternate_phone
    customer_name = payload.customerName or payload.customer_name_manual

    if customer_mobile:
        customer_mobile = customer_mobile.strip()
        existing_cust = await db.users.find_one({"mobile": customer_mobile, "role": "customer"})
        if not existing_cust:
            user_doc = {
                "name": customer_name or "Walk-in Customer",
                "role": "customer",
                "mobile": customer_mobile,
                "isActive": True
            }
            c_res = await db.users.insert_one(user_doc)
            customer_id = str(c_res.inserted_id)
        else:
            customer_id = str(existing_cust["_id"])
            if customer_name and existing_cust.get("name") == "Walk-in Customer":
                await db.users.update_one({"_id": customer_id}, {"$set": {"name": customer_name}})

    normalized_items = []
    total_amount = 0.0

    # Validate all items first
    for item in payload.items:
        product = await db.products.find_one({"_id": item.product_id})
        if not product:
            raise HTTPException(status_code=404, detail=f"Product not found: {item.product_id}")
        
        current_stock = product.get("stock", 0)
        if current_stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {product.get('product_name')}"
            )
        
        price = float(product.get("price", 0))
        subtotal = price * item.quantity
        normalized_items.append({
            "product_id": str(product["_id"]),
            "product_name": product.get("product_name"),
            "quantity": item.quantity,
            "price": price,
            "subtotal": subtotal
        })
        total_amount += subtotal

    # Update stocks and record stock logs
    for item in normalized_items:
        product = await db.products.find_one({"_id": item["product_id"]})
        old_stock = product.get("stock", 0)
        new_stock = old_stock - item["quantity"]
        await db.products.update_one({"_id": item["product_id"]}, {"$set": {"stock": new_stock}})

        await db.stock_logs.insert_one({
            "product_id": item["product_id"],
            "updated_by": str(user["id"]),
            "old_stock": old_stock,
            "new_stock": new_stock,
            "change_type": "billing"
        })

    tax = float(payload.tax or 0)
    discount = float(payload.discount or 0)
    final_amount = max(total_amount + tax - discount, 0.0)

    is_customer = user.get("role") == "customer"
    is_takeaway = is_customer or payload.order_type == "Takeaway"

    order_doc = {
        "customer_id": str(user["id"]) if is_customer else customer_id,
        "employee_id": None if is_customer else str(user["id"]),
        "total_amount": total_amount,
        "date": datetime.now(timezone.utc).isoformat(),
        "status": "Pending" if is_customer else "Completed",
        "payment_method": payload.payment_method or "Cash",
        "order_type": "Takeaway" if is_takeaway else "In-Store",
        "takeaway_time": payload.takeaway_time,
        "items": normalized_items
    }
    order_res = await db.orders.insert_one(order_doc)
    order_id = str(order_res.inserted_id)
    order_doc["_id"] = order_id
    order_doc["id"] = order_id

    bill_doc = {
        "order_id": order_id,
        "bill_number": generate_bill_number(),
        "total_amount": total_amount,
        "tax_amount": tax,
        "discount": discount,
        "final_amount": final_amount,
        "customer_mobile": customer_mobile or ""
    }
    bill_res = await db.bills.insert_one(bill_doc)
    bill_doc["_id"] = str(bill_res.inserted_id)
    bill_doc["id"] = bill_doc["_id"]

    populated_order = await _populate_order(order_doc)

    return {
        "order": populated_order,
        "bill": bill_doc
    }

@router.get("")
@router.get("/")
async def get_orders(user: dict = Depends(get_current_user)):
    user_role = user.get("role")
    user_id = str(user.get("id"))

    query = {}
    if user_role == "customer":
        query["customer_id"] = user_id
    elif user_role == "employee":
        query["$or"] = [
            {"employee_id": user_id},
            {"order_type": "Takeaway", "status": "Pending"}
        ]

    raw_orders = await db.orders.find(query, sort=[("createdAt", -1)])
    populated = []
    for order in raw_orders:
        p = await _populate_order(order)
        populated.append(p)
    return populated

@router.get("/bills/all")
async def get_bills(user: dict = Depends(get_current_user)):
    user_role = user.get("role")
    user_id = str(user.get("id"))

    order_query = {}
    if user_role == "customer":
        order_query["customer_id"] = user_id
    elif user_role == "employee":
        order_query["employee_id"] = user_id

    bills = await db.bills.find({}, sort=[("created_at", -1), ("createdAt", -1)])
    populated_bills = []

    for bill in bills:
        order_id = str(bill.get("order_id"))
        order = await db.orders.find_one({"_id": order_id})
        
        # Check permissions for customer and employee
        if user_role == "customer":
            if not order or str(order.get("customer_id")) != user_id:
                continue
        elif user_role == "employee":
            if not order or str(order.get("employee_id")) != user_id:
                continue

        b = dict(bill)
        if order:
            b["order_id"] = await _populate_order(order)
        populated_bills.append(b)

    return populated_bills

@router.get("/{id}")
async def get_order_by_id(id: str, user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"_id": id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    user_role = user.get("role")
    user_id = str(user.get("id"))

    if user_role == "customer" and str(order.get("customer_id")) != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    if user_role == "employee" and str(order.get("employee_id")) != user_id:
        if not (order.get("order_type") == "Takeaway" and order.get("status") == "Pending"):
            raise HTTPException(status_code=403, detail="Access denied")

    return await _populate_order(order)

@router.patch("/{id}/status")
async def update_order_status(
    id: str,
    payload: UpdateOrderStatusRequest,
    user: dict = Depends(require_roles("employee", "admin", "manager"))
):
    order = await db.orders.find_one({"_id": id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    updates = {"status": payload.status}
    if payload.status == "Completed":
        updates["employee_id"] = str(user["id"])

    await db.orders.update_one({"_id": id}, {"$set": updates})
    updated = await db.orders.find_one({"_id": id})
    populated = await _populate_order(updated)

    return {
        "message": "Order status updated",
        "order": populated
    }

