import asyncio
from fastapi.testclient import TestClient
from main import app
from seed import seed_data

def run_tests():
    # Ensure seed data is populated
    asyncio.run(seed_data(force=True))

    with TestClient(app) as client:
        print("=== 1. Root & Health Check ===")
        r = client.get("/")
        assert r.status_code == 200, f"Root failed: {r.text}"
        assert "Trolly Hub" in r.json()["message"]
        print("✓ Root endpoint working")

        r = client.get("/health")
        assert r.status_code == 200, f"Health failed: {r.text}"
        assert r.json()["status"] == "ok"
        print("✓ Health endpoint working")

        print("\n=== 2. Staff Authentication ===")
        # Admin login
        r = client.post("/api/auth/staff-login", json={"email": "admin@trollyhub.com", "password": "Admin@123"})
        assert r.status_code == 200, f"Admin login failed: {r.text}"
        admin_data = r.json()
        admin_token = admin_data["token"]
        assert admin_data["user"]["role"] == "admin"
        assert admin_data["user"]["name"] == "Trolly Hub Admin"
        print("✓ Admin login working")

        # Manager login
        r = client.post("/api/auth/staff-login", json={"email": "manager@trollyhub.com", "password": "Manager@123"})
        assert r.status_code == 200
        manager_token = r.json()["token"]
        print("✓ Manager login working")

        # Invalid login
        r = client.post("/api/auth/staff-login", json={"email": "admin@trollyhub.com", "password": "WrongPassword"})
        assert r.status_code == 401
        assert "Invalid credentials" in r.json()["message"]
        print("✓ Invalid credentials rejected with 401")

        # GET /api/auth/me
        r = client.get("/api/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 200
        assert r.json()["role"] == "admin"
        print("✓ Auth /me endpoint working")

        print("\n=== 3. Customer OTP Flow ===")
        # Request OTP
        r = client.post("/api/auth/customer/request-otp", json={"mobile": "9999999999"})
        assert r.status_code == 200
        otp_data = r.json()
        assert otp_data["devOtp"] == "123456"
        print("✓ OTP request working")

        # Verify OTP
        r = client.post("/api/auth/customer/verify-otp", json={"mobile": "9999999999", "otp": "123456"})
        assert r.status_code == 200
        cust_token = r.json()["token"]
        assert r.json()["user"]["role"] == "customer"
        print("✓ OTP verification working")

        print("\n=== 4. Customer Registration ===")
        r = client.post("/api/auth/register", json={
            "name": "New Shopper",
            "mobile": "9888888888",
            "email": "shopper@test.com",
            "password": "Shopper@123"
        })
        assert r.status_code == 201
        reg_token = r.json()["token"]
        assert r.json()["user"]["role"] == "customer"
        print("✓ Registration working")

        print("\n=== 5. Product Management ===")
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        
        # Get products
        r = client.get("/api/products", headers=admin_headers)
        assert r.status_code == 200
        products = r.json()
        assert len(products) >= 6
        first_prod = products[0]
        prod_id = first_prod["_id"]
        print(f"✓ Fetched {len(products)} products")

        # Search products
        r = client.get("/api/products?search=Rice", headers=admin_headers)
        assert r.status_code == 200
        assert any("Rice" in p["product_name"] for p in r.json())
        print("✓ Product search working")

        # Create new product
        r = client.post("/api/products", json={
            "product_name": "Test Dark Chocolate",
            "category": "Snacks",
            "price": 85.0,
            "stock": 25,
            "barcode": "999001"
        }, headers=admin_headers)
        assert r.status_code == 201
        new_prod = r.json()
        new_prod_id = new_prod["_id"]
        assert new_prod["product_name"] == "Test Dark Chocolate"
        print("✓ Product creation working")

        # Update product
        r = client.put(f"/api/products/{new_prod_id}", json={
            "price": 95.0,
            "stock": 30
        }, headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["price"] == 95.0
        print("✓ Product update working")

        # Delete product
        r = client.delete(f"/api/products/{new_prod_id}", headers=admin_headers)
        assert r.status_code == 200
        assert "Product deleted" in r.json()["message"]
        print("✓ Product delete working")

        print("\n=== 6. Stock Operations ===")
        # Low stock
        r = client.get("/api/stock/low-stock", headers=admin_headers)
        assert r.status_code == 200
        print("✓ Low stock endpoint working")

        # Update stock & price
        r = client.patch(f"/api/stock/{prod_id}", json={"stock": 45, "price": 22.0}, headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["stock"] == 45
        print("✓ Stock patch working")

        # Check stock logs
        r = client.get("/api/stock/logs", headers=admin_headers)
        assert r.status_code == 200
        logs = r.json()
        assert len(logs) > 0
        assert logs[0]["product_id"]["product_name"] != ""
        print(f"✓ Stock logs working ({len(logs)} logs found)")

        print("\n=== 7. Order & Billing Workflow ===")
        # Create an order
        r = client.post("/api/orders", json={
            "customerMobile": "9999999999",
            "customerName": "Demo Customer",
            "items": [{"product_id": prod_id, "quantity": 2}],
            "payment_method": "Cash",
            "tax": 5.0,
            "discount": 2.0
        }, headers=admin_headers)
        assert r.status_code == 201
        order_res = r.json()
        order_obj = order_res["order"]
        bill_obj = order_res["bill"]
        order_id = order_obj["_id"]
        assert bill_obj["bill_number"].startswith("TH-")
        print(f"✓ Order created successfully: #{order_id} (Bill: {bill_obj['bill_number']})")

        # Get all orders
        r = client.get("/api/orders", headers=admin_headers)
        assert r.status_code == 200
        orders_list = r.json()
        assert len(orders_list) > 0
        print(f"✓ Orders list working ({len(orders_list)} orders)")

        # Get all bills
        r = client.get("/api/orders/bills/all", headers=admin_headers)
        assert r.status_code == 200
        bills_list = r.json()
        assert len(bills_list) > 0
        print(f"✓ Bills list working ({len(bills_list)} bills)")

        # Update order status
        r = client.patch(f"/api/orders/{order_id}/status", json={"status": "Completed"}, headers=admin_headers)
        assert r.status_code == 200
        assert r.json()["order"]["status"] == "Completed"
        print("✓ Order status update working")

        print("\n=== 8. Analytics & Reports ===")
        # Dashboard stats
        r = client.get("/api/reports/dashboard", headers=admin_headers)
        assert r.status_code == 200
        dash = r.json()
        assert "totalProducts" in dash
        assert "lowStockCount" in dash
        assert "totalSales" in dash
        print(f"✓ Dashboard stats working (Products: {dash['totalProducts']}, Sales: ₹{dash['totalSales']})")

        # Sales report
        r = client.get("/api/reports/sales", headers=admin_headers)
        assert r.status_code == 200
        sales_rep = r.json()
        assert "salesByDay" in sales_rep
        assert "topProducts" in sales_rep
        print("✓ Sales analytics working")

        print("\n=== 9. User Management ===")
        # List users
        r = client.get("/api/users", headers=admin_headers)
        assert r.status_code == 200
        users_list = r.json()
        assert len(users_list) >= 3
        print(f"✓ User list working ({len(users_list)} users)")

        # Create user (as admin)
        r = client.post("/api/users", json={
            "name": "New Shift Cashier",
            "role": "employee",
            "email": "cashier2@trollyhub.com",
            "mobile": "9111111111",
            "password": "Cashier@123"
        }, headers=admin_headers)
        assert r.status_code == 201
        assert r.json()["name"] == "New Shift Cashier"
        print("✓ User creation working")

        print("\n🎉 ALL BACKEND FASTAPI TESTS PASSED PERFECTLY! 🎉\n")

if __name__ == "__main__":
    run_tests()

