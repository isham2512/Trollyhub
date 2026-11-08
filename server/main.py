from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from config import CLIENT_URL, PORT, NODE_ENV
from database import db
from seed import seed_data
from routes.auth_routes import router as auth_router
from routes.product_routes import router as product_router
from routes.stock_routes import router as stock_router
from routes.order_routes import router as order_router
from routes.report_routes import router as report_router
from routes.user_routes import router as user_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await db.connect()
    # Auto-seed default users and products if database is empty
    await seed_data(force=False)
    yield
    # Shutdown
    if db.mongo_client:
        db.mongo_client.close()

app = FastAPI(
    title="Trolly Hub API",
    description="FastAPI Backend for Trolly Hub Supermarket POS & Management System",
    version="2.0.0",
    lifespan=lifespan
)

# Exception handlers for 100% frontend compatibility with error response shapes
@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": str(exc.detail), "detail": exc.detail}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_msg = exc.errors()[0].get("msg") if exc.errors() else "Validation error"
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"message": error_msg, "errors": exc.errors()}
    )

# CORS Configuration
allowed_origins = [o.strip() for o in CLIENT_URL.split(",") if o.strip()]
if "http://localhost:5173" not in allowed_origins:
    allowed_origins.append("http://localhost:5173")
if "http://127.0.0.1:5173" not in allowed_origins:
    allowed_origins.append("http://127.0.0.1:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root & Health check
@app.get("/")
async def root():
    return {"message": "Trolly Hub API running ✅"}

@app.get("/health")
async def health():
    return {"status": "ok"}

# Include Routers
app.include_router(auth_router)
app.include_router(product_router)
app.include_router(stock_router)
app.include_router(order_router)
app.include_router(report_router)
app.include_router(user_router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)

