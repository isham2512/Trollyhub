from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from database import db
from auth import hash_password, verify_password, create_access_token, get_current_user
from models import StaffLoginRequest, CustomerOtpRequest, CustomerOtpVerifyRequest, RegisterRequest

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/staff-login")
async def staff_login(payload: StaffLoginRequest):
    user = await db.users.find_one({"email": payload.email.lower().strip()})
    if not user or not user.get("isActive", True):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.get("password") or not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_id = str(user.get("_id") or user.get("id"))
    token = create_access_token({
        "id": user_id,
        "role": user["role"],
        "name": user["name"],
        "email": user.get("email")
    })
    
    return {
        "token": token,
        "user": {
            "id": user_id,
            "_id": user_id,
            "name": user["name"],
            "role": user["role"],
            "email": user.get("email"),
            "mobile": user.get("mobile")
        }
    }

@router.post("/customer/request-otp")
async def request_customer_otp(payload: CustomerOtpRequest):
    mobile = payload.mobile.strip()
    if not mobile or len(mobile) < 10:
        raise HTTPException(status_code=400, detail="Valid mobile number is required")
        
    user = await db.users.find_one({"mobile": mobile, "role": "customer"})
    if not user:
        user_doc = {
            "name": payload.name or "Customer",
            "role": "customer",
            "mobile": mobile,
            "isActive": True
        }
        res = await db.users.insert_one(user_doc)
        user = dict(user_doc)
        user["_id"] = str(res.inserted_id)

    otp = "123456"
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    await db.otp_verifications.delete_many({"mobile": mobile})
    await db.otp_verifications.insert_one({
        "mobile": mobile,
        "otp": otp,
        "expiresAt": expires_at.isoformat(),
        "verified": False
    })

    return {
        "message": "OTP sent successfully",
        "mobile": mobile,
        "devOtp": otp
    }

@router.post("/customer/verify-otp")
async def verify_customer_otp(payload: CustomerOtpVerifyRequest):
    mobile = payload.mobile.strip()
    otp = payload.otp.strip()

    otps = await db.otp_verifications.find({"mobile": mobile, "otp": otp}, sort=[("createdAt", -1)])
    if not otps:
        raise HTTPException(status_code=400, detail="Invalid OTP")
        
    otp_record = otps[0]
    exp = otp_record.get("expiresAt")
    if exp:
        exp_dt = datetime.fromisoformat(str(exp).replace("Z", "+00:00"))
        if exp_dt < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="OTP expired")

    await db.otp_verifications.update_one({"_id": otp_record["_id"]}, {"$set": {"verified": True}})

    user = await db.users.find_one({"mobile": mobile, "role": "customer"})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user_id = str(user.get("_id") or user.get("id"))
    token = create_access_token({
        "id": user_id,
        "role": user["role"],
        "name": user["name"],
        "mobile": user.get("mobile")
    })

    return {
        "token": token,
        "user": {
            "id": user_id,
            "_id": user_id,
            "name": user["name"],
            "role": user["role"],
            "mobile": user.get("mobile")
        }
    }

@router.post("/register", status_code=201)
async def register(payload: RegisterRequest):
    name = payload.name.strip()
    mobile = payload.mobile.strip()
    email = payload.email.strip().lower()
    password = payload.password

    if not name or not mobile or not email or not password:
        raise HTTPException(status_code=400, detail="All fields are required")

    exists = await db.users.find_one({
        "$or": [{"email": email}, {"mobile": mobile}]
    })
    if exists:
        raise HTTPException(status_code=400, detail="User with this email or mobile number already exists")

    hashed = hash_password(password)
    user_doc = {
        "name": name,
        "mobile": mobile,
        "email": email,
        "password": hashed,
        "role": "customer",
        "isActive": True
    }
    res = await db.users.insert_one(user_doc)
    user_id = str(res.inserted_id)

    token = create_access_token({
        "id": user_id,
        "role": "customer",
        "name": name,
        "email": email
    })

    return {
        "token": token,
        "user": {
            "id": user_id,
            "_id": user_id,
            "name": name,
            "role": "customer",
            "email": email,
            "mobile": mobile
        }
    }

@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    user_id = user.get("id")
    found = await db.users.find_one({"_id": user_id})
    if not found:
        raise HTTPException(status_code=404, detail="User not found")
    res = dict(found)
    res.pop("password", None)
    return res

