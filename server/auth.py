import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, List
from fastapi import Header, HTTPException, status
from config import JWT_SECRET, JWT_EXPIRES_IN

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password:
        return False
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_access_token(payload: dict) -> str:
    to_encode = payload.copy()
    expires_delta = timedelta(days=7)
    if JWT_EXPIRES_IN.endswith("d"):
        try:
            expires_delta = timedelta(days=int(JWT_EXPIRES_IN[:-1]))
        except ValueError:
            pass
    elif JWT_EXPIRES_IN.endswith("h"):
        try:
            expires_delta = timedelta(hours=int(JWT_EXPIRES_IN[:-1]))
        except ValueError:
            pass
            
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")

def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authorized, token missing"
        )
    
    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authorized, token missing"
        )
    
    token = parts[1]
    decoded = decode_access_token(token)
    return decoded

def require_roles(*allowed_roles: str):
    async def role_checker(authorization: Optional[str] = Header(None)) -> dict:
        user = await get_current_user(authorization)
        user_role = user.get("role")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        return user
    return role_checker

