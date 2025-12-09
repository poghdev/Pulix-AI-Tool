import jwt
import os
from fastapi import APIRouter, HTTPException
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from bson import ObjectId
from pydantic import BaseModel, EmailStr, Field
from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

security = HTTPBearer()

router = APIRouter(prefix="/auth", tags=["Auth"])

MONGODB_URL = os.getenv("MONGO_URL")  
JWT_SECRET = os.getenv("JWT_SECRET") 
JWT_ALGORITHM = "HS256"

client = AsyncIOMotorClient(MONGODB_URL)
db = client["Pulix"]
users = db["Users"]

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class RegisterModel(BaseModel):
    first_name: str = Field(..., min_length=2)
    last_name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=8)


class LoginModel(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)


def create_jwt(data: dict):
    expire = datetime.utcnow() + timedelta(days=7)
    data.update({"exp": expire})
    return jwt.encode(data, JWT_SECRET, algorithm=JWT_ALGORITHM)


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str):
    return pwd_context.verify(plain, hashed)

@router.post("/register")
async def register(user: RegisterModel):
    existing = await users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    hashed_pwd = hash_password(user.password)

    user_doc = {
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "password": hashed_pwd,
        "created_at": datetime.utcnow(),
        "plan": "standard",  # дефолтный план
        "is_verified": False
    }

    await users.insert_one(user_doc)

    return {"message": "User registered successfully"}


@router.post("/login")
async def login(user: LoginModel):
    db_user = await users.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Создание JWT токена
    token = create_jwt({"user_id": str(db_user["_id"])})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "first_name": db_user.get("first_name"),
            "last_name": db_user.get("last_name"),
            "email": db_user.get("email"),
            "plan": db_user.get("plan", "standard")  
        }
    }

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        user = await users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.get("/me")
async def me(user=Depends(get_current_user)):
    return {
        "user": {
            "first_name": user.get("first_name"),
            "last_name": user.get("last_name"),
            "email": user.get("email"),
            "plan": user.get("plan", "standard")
        }
    }

@router.delete("/delete")
async def delete_account(user=Depends(get_current_user)):
    await users.delete_one({"_id": user["_id"]})
    return {"message": "Account deleted successfully"}