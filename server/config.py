import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent

# Load .env file from server directory if it exists, otherwise project root
env_file = BASE_DIR / ".env"
if env_file.exists():
    load_dotenv(env_file)
else:
    load_dotenv(BASE_DIR.parent / ".env")

MONGO_URI = os.getenv("MONGO_URI", "")
JWT_SECRET = os.getenv("JWT_SECRET", "trolly_hub_super_secret_jwt_key_2026")
JWT_EXPIRES_IN = os.getenv("JWT_EXPIRES_IN", "7d")
CLIENT_URL = os.getenv("CLIENT_URL", "http://localhost:5173")
PORT = int(os.getenv("PORT", "5000"))
NODE_ENV = os.getenv("NODE_ENV", "development")

