import asyncio
from database import db
from auth import hash_password

async def seed_data(force: bool = False):
    await db.connect()

    user_count = await db.users.count_documents()
    product_count = await db.products.count_documents()

    if not force and user_count > 0 and product_count > 0:
        print("Database already contains data. Skipping seed (use force=True to reset).")
        return

    if force:
        print("Clearing collections for clean seed...")
        await db.users.delete_many({})
        await db.products.delete_many({})
        await db.orders.delete_many({})
        await db.bills.delete_many({})
        await db.stock_logs.delete_many({})
        await db.otp_verifications.delete_many({})

    admin_pw = hash_password("Admin@123")
    manager_pw = hash_password("Manager@123")
    employee_pw = hash_password("Employee@123")

    users = [
        {
            "name": "Trolly Hub Admin",
            "role": "admin",
            "email": "admin@trollyhub.com",
            "mobile": "9000000001",
            "password": admin_pw,
            "isActive": True
        },
        {
            "name": "Store Manager",
            "role": "manager",
            "email": "manager@trollyhub.com",
            "mobile": "9000000002",
            "password": manager_pw,
            "isActive": True
        },
        {
            "name": "Billing Employee",
            "role": "employee",
            "email": "employee@trollyhub.com",
            "mobile": "9000000003",
            "password": employee_pw,
            "isActive": True
        },
        {
            "name": "Demo Customer",
            "role": "customer",
            "mobile": "9999999999",
            "isActive": True
        }
    ]

    for u in users:
        await db.users.insert_one(u)

    products = [
        {"product_name": "Rice 1kg", "category": "Grocery", "price": 60.0, "stock": 100, "barcode": "111001", "unit": "kg"},
        {"product_name": "Milk 500ml", "category": "Dairy", "price": 30.0, "stock": 50, "barcode": "111002", "unit": "pcs"},
        {"product_name": "Bread", "category": "Bakery", "price": 35.0, "stock": 40, "barcode": "111003", "unit": "pcs"},
        {"product_name": "Cooking Oil 1L", "category": "Grocery", "price": 150.0, "stock": 20, "barcode": "111004", "unit": "L"},
        {"product_name": "Soap", "category": "Personal", "price": 25.0, "stock": 75, "barcode": "111005", "unit": "pcs"},
        {"product_name": "Biscuits", "category": "Snacks", "price": 20.0, "stock": 90, "barcode": "111006", "unit": "pcs"}
    ]

    for p in products:
        await db.products.insert_one(p)

    print("✅ Seed complete! Users and products initialized successfully.")

if __name__ == "__main__":
    asyncio.run(seed_data(force=True))

