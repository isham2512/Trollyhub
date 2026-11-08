from typing import List, Optional
from pydantic import BaseModel, Field

class StaffLoginRequest(BaseModel):
    email: str
    password: str

class CustomerOtpRequest(BaseModel):
    mobile: str
    name: Optional[str] = None

class CustomerOtpVerifyRequest(BaseModel):
    mobile: str
    otp: str

class RegisterRequest(BaseModel):
    name: str
    mobile: str
    email: str
    password: str

class CreateProductRequest(BaseModel):
    product_name: str
    category: str
    price: float = Field(ge=0)
    stock: int = Field(default=0, ge=0)
    barcode: Optional[str] = ""
    description: Optional[str] = ""
    unit: Optional[str] = "pcs"
    image: Optional[str] = ""

class UpdateProductRequest(BaseModel):
    product_name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    barcode: Optional[str] = None
    description: Optional[str] = None
    unit: Optional[str] = None
    image: Optional[str] = None

class UpdateStockRequest(BaseModel):
    stock: Optional[int] = None
    price: Optional[float] = None

class OrderItemInput(BaseModel):
    product_id: str
    quantity: int = Field(ge=1)

class CreateOrderRequest(BaseModel):
    customerMobile: Optional[str] = None
    customerName: Optional[str] = None
    customer_name_manual: Optional[str] = None
    alternate_phone: Optional[str] = None
    items: List[OrderItemInput] = []
    payment_method: Optional[str] = "Cash"
    tax: Optional[float] = 0
    discount: Optional[float] = 0
    takeaway_time: Optional[str] = None
    order_type: Optional[str] = None

class UpdateOrderStatusRequest(BaseModel):
    status: str

class CreateUserRequest(BaseModel):
    name: str
    role: str
    email: Optional[str] = None
    mobile: Optional[str] = None
    password: Optional[str] = None

