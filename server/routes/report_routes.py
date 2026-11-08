from collections import defaultdict
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from database import db
from auth import require_roles

router = APIRouter(prefix="/reports", tags=["reports"])

def _get_today_utc_start():
    now_utc = datetime.now(timezone.utc)
    # Convert to IST (+05:30)
    ist_now = now_utc + timedelta(hours=5, minutes=30)
    ist_start = datetime(ist_now.year, ist_now.month, ist_now.day, 0, 0, 0)
    # Convert back to UTC
    return ist_start - timedelta(hours=5, minutes=30)

@router.get("/dashboard")
async def get_dashboard_stats(user: dict = Depends(require_roles("admin", "manager"))):
    all_products = await db.products.find({})
    total_products = len(all_products)
    low_stock_count = sum(1 for p in all_products if p.get("stock", 0) <= 10)
    low_stock_items = sorted([p for p in all_products if p.get("stock", 0) <= 10], key=lambda x: x.get("stock", 0))[:4]

    today_start = _get_today_utc_start()
    all_orders = await db.orders.find({}, sort=[("createdAt", -1)])
    all_bills = await db.bills.find({})

    today_orders = []
    product_revenue = defaultdict(lambda: {"qty": 0, "revenue": 0.0})

    for o in all_orders:
        created_str = o.get("createdAt") or o.get("date")
        if created_str:
            try:
                dt = datetime.fromisoformat(str(created_str).replace("Z", "+00:00"))
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                if dt >= today_start.replace(tzinfo=timezone.utc):
                    today_orders.append(o)
            except Exception:
                today_orders.append(o)

        for item in o.get("items", []):
            name = item.get("product_name") or "Product"
            qty = item.get("quantity", 0)
            sub = float(item.get("subtotal", 0.0))
            product_revenue[name]["qty"] += qty
            product_revenue[name]["revenue"] += sub

    total_orders_count = len(today_orders)
    total_sales = sum(float(o.get("total_amount", 0.0)) for o in today_orders)
    total_bills_count = len(all_bills)

    # Top products by revenue
    sorted_top = sorted(product_revenue.items(), key=lambda x: x[1]["revenue"], reverse=True)[:5]
    top_products = [
        {"_id": name, "qtySold": data["qty"], "revenue": data["revenue"]}
        for name, data in sorted_top
    ]

    # Recent orders populated
    recent_orders = []
    for o in all_orders[:5]:
        item = dict(o)
        cust_id = item.get("customer_id")
        if cust_id:
            c = await db.users.find_one({"_id": str(cust_id)})
            item["customer_id"] = {"_id": str(cust_id), "name": c.get("name") if c else "Customer", "mobile": c.get("mobile") if c else ""}
        emp_id = item.get("employee_id")
        if emp_id:
            e = await db.users.find_one({"_id": str(emp_id)})
            item["employee_id"] = {"_id": str(emp_id), "name": e.get("name") if e else "Staff"}
        recent_orders.append(item)

    return {
        "totalProducts": total_products,
        "lowStockCount": low_stock_count,
        "totalOrders": total_orders_count,
        "totalBills": total_bills_count,
        "totalSales": total_sales,
        "recentOrders": recent_orders,
        "topProducts": top_products,
        "lowStockItems": low_stock_items
    }

@router.get("/sales")
async def get_sales_report(user: dict = Depends(require_roles("admin", "manager"))):
    all_orders = await db.orders.find({}, sort=[("createdAt", 1)])
    all_products = await db.products.find({})
    low_stock = sorted([p for p in all_products if p.get("stock", 0) <= 10], key=lambda x: x.get("stock", 0))

    by_day = defaultdict(lambda: {"orders": 0, "revenue": 0.0})
    product_stats = defaultdict(lambda: {"count": 0, "revenue": 0.0})

    for o in all_orders:
        created_str = o.get("createdAt") or o.get("date")
        if created_str:
            try:
                dt = datetime.fromisoformat(str(created_str).replace("Z", "+00:00"))
                # Adjust to IST
                ist_dt = dt + timedelta(hours=5, minutes=30)
                day_key = (ist_dt.year, ist_dt.month, ist_dt.day)
            except Exception:
                now = datetime.now()
                day_key = (now.year, now.month, now.day)
        else:
            now = datetime.now()
            day_key = (now.year, now.month, now.day)

        by_day[day_key]["orders"] += 1
        by_day[day_key]["revenue"] += float(o.get("total_amount", 0.0))

        for item in o.get("items", []):
            name = item.get("product_name") or "Product"
            qty = item.get("quantity", 0)
            sub = float(item.get("subtotal", 0.0))
            product_stats[name]["count"] += qty
            product_stats[name]["revenue"] += sub

    sales_by_day = [
        {
            "_id": {"year": k[0], "month": k[1], "day": k[2]},
            "orders": v["orders"],
            "revenue": v["revenue"]
        }
        for k, v in sorted(by_day.items())
    ]

    sorted_top = sorted(product_stats.items(), key=lambda x: x[1]["revenue"], reverse=True)[:10]
    top_products = [
        {"_id": name, "count": data["count"], "revenue": data["revenue"]}
        for name, data in sorted_top
    ]

    return {
        "salesByDay": sales_by_day,
        "topProducts": top_products,
        "lowStock": low_stock
    }

