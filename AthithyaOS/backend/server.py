"""Athithya OS - Enterprise Hospitality Management Backend."""
try:
    from dotenv import load_dotenv
except ImportError:
    def load_dotenv(path=None):
        return False
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

# --- Configuration ---
JWT_ALGORITHM = "HS256"
JWT_EXP_HOURS = 24
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("athithya")

app = FastAPI(title="Athithya OS API")
api = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)


# --- Helpers ---
def now_iso():
    return datetime.now(timezone.utc).isoformat()

def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False

def create_token(uid: str, email: str, role: str) -> str:
    payload = {
        "sub": uid, "email": email, "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXP_HOURS),
        "type": "access",
    }
    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm=JWT_ALGORITHM)

async def get_current_user(
    request: Request,
    cred: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> dict:
    token = None
    if cred and cred.credentials:
        token = cred.credentials
    elif request.cookies.get("access_token"):
        token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# --- Models ---
class LoginInput(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str
    email: str
    name: str
    role: Literal["owner", "manager", "waiter"]
    avatar: Optional[str] = None

class MenuItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str
    section: str  # kitchen section: main, chinese, tandoor, dessert, beverages
    price: float
    cost: float = 0
    available: bool = True
    image: Optional[str] = None
    prep_time: int = 10  # mins

class Table(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    number: str
    capacity: int
    zone: str  # main, vip, outdoor, banquet
    status: Literal["available", "occupied", "reserved", "cleaning"] = "available"
    waiter_id: Optional[str] = None
    x: int = 0
    y: int = 0
    shape: Literal["round", "square"] = "round"

class OrderItem(BaseModel):
    menu_item_id: str
    name: str
    qty: int
    price: float
    section: str
    notes: Optional[str] = None

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    table_id: Optional[str] = None
    table_number: Optional[str] = None
    items: List[OrderItem]
    status: Literal["received", "preparing", "ready", "served", "cancelled"] = "received"
    priority: Literal["normal", "high", "urgent"] = "normal"
    total: float = 0
    waiter_id: Optional[str] = None
    waiter_name: Optional[str] = None
    chef_id: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)

class InventoryItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str
    unit: str  # kg, l, pcs
    stock: float
    reorder_level: float
    cost_per_unit: float
    expiry: Optional[str] = None
    vendor: Optional[str] = None

class StaffMember(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    role: str
    phone: str
    salary: float
    shift: Literal["morning", "afternoon", "night"] = "morning"
    status: Literal["working", "off", "leave"] = "working"
    performance: int = 80
    avatar: Optional[str] = None

class Reservation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    phone: str
    date: str
    time: str
    party_size: int
    table_id: Optional[str] = None
    notes: Optional[str] = None
    status: Literal["pending", "confirmed", "seated", "cancelled"] = "confirmed"

class OrderCreate(BaseModel):
    table_id: Optional[str] = None
    items: List[OrderItem]
    priority: Literal["normal", "high", "urgent"] = "normal"

class StatusUpdate(BaseModel):
    status: str


# --- Auth Routes ---
@api.post("/auth/login")
async def login(data: LoginInput, response: Response):
    email = data.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(user["id"], user["email"], user["role"])
    response.set_cookie("access_token", token, httponly=True, samesite="lax", max_age=JWT_EXP_HOURS*3600, path="/")
    return {
        "token": token,
        "user": {"id": user["id"], "email": user["email"], "name": user["name"], "role": user["role"], "avatar": user.get("avatar")},
    }

@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}

@api.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return user


# --- Module Routes ---
@api.get("/menu")
async def list_menu(user=Depends(get_current_user)):
    return await db.menu.find({}, {"_id": 0}).to_list(500)

@api.get("/tables")
async def list_tables(user=Depends(get_current_user)):
    return await db.tables.find({}, {"_id": 0}).to_list(500)

@api.patch("/tables/{table_id}")
async def update_table(table_id: str, body: dict, user=Depends(get_current_user)):
    await db.tables.update_one({"id": table_id}, {"$set": body})
    return await db.tables.find_one({"id": table_id}, {"_id": 0})

@api.get("/orders")
async def list_orders(user=Depends(get_current_user)):
    return await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)

@api.post("/orders")
async def create_order(data: OrderCreate, user=Depends(get_current_user)):
    table = None
    if data.table_id:
        table = await db.tables.find_one({"id": data.table_id}, {"_id": 0})
    total = sum(i.price * i.qty for i in data.items)
    order = Order(
        table_id=data.table_id,
        table_number=table["number"] if table else None,
        items=data.items,
        priority=data.priority,
        total=round(total, 2),
        waiter_id=user["id"],
        waiter_name=user["name"],
    )
    await db.orders.insert_one(order.model_dump())
    if data.table_id:
        await db.tables.update_one({"id": data.table_id}, {"$set": {"status": "occupied"}})
    return order.model_dump()

@api.patch("/orders/{order_id}")
async def update_order(order_id: str, body: StatusUpdate, user=Depends(get_current_user)):
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": body.status, "updated_at": now_iso()}},
    )
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if body.status == "served" and order and order.get("table_id"):
        await db.tables.update_one({"id": order["table_id"]}, {"$set": {"status": "cleaning"}})
    return order

@api.get("/inventory")
async def list_inventory(user=Depends(get_current_user)):
    return await db.inventory.find({}, {"_id": 0}).to_list(500)

@api.get("/staff")
async def list_staff(user=Depends(get_current_user)):
    return await db.staff.find({}, {"_id": 0}).to_list(500)

@api.get("/reservations")
async def list_reservations(user=Depends(get_current_user)):
    return await db.reservations.find({}, {"_id": 0}).to_list(500)

@api.post("/reservations")
async def create_reservation(data: Reservation, user=Depends(get_current_user)):
    await db.reservations.insert_one(data.model_dump())
    return data.model_dump()

@api.get("/dashboard/stats")
async def dashboard_stats(user=Depends(get_current_user)):
    tables = await db.tables.find({}, {"_id": 0}).to_list(500)
    orders = await db.orders.find({}, {"_id": 0}).to_list(500)
    inv = await db.inventory.find({}, {"_id": 0}).to_list(500)
    staff = await db.staff.find({}, {"_id": 0}).to_list(500)
    res = await db.reservations.find({}, {"_id": 0}).to_list(500)
    active = [o for o in orders if o["status"] in ("received", "preparing", "ready")]
    revenue_today = sum(o["total"] for o in orders if o["status"] == "served")
    return {
        "active_tables": len([t for t in tables if t["status"] == "occupied"]),
        "total_tables": len(tables),
        "kitchen_queue": len(active),
        "revenue_today": round(revenue_today, 2),
        "orders_today": len(orders),
        "reservations_today": len([r for r in res if r["status"] in ("confirmed", "seated")]),
        "staff_working": len([s for s in staff if s["status"] == "working"]),
        "avg_service_time": 18,
        "table_turnover": 2.4,
        "customer_satisfaction": 92,
        "kitchen_efficiency": 87,
        "low_stock": len([i for i in inv if i["stock"] <= i["reorder_level"]]),
        "waiting_customers": 4,
    }

@api.get("/ai/insights")
async def ai_insights(user=Depends(get_current_user)):
    return {
        "busy_hours": [
            {"hour": "12-1 PM", "load": 78},
            {"hour": "1-2 PM", "load": 92},
            {"hour": "7-8 PM", "load": 88},
            {"hour": "8-9 PM", "load": 96},
            {"hour": "9-10 PM", "load": 74},
        ],
        "revenue_prediction": {"today": 48200, "tomorrow": 52800, "week": 312400, "trend": "+12%"},
        "best_dish": {"name": "Tandoori Paneer Tikka", "orders": 142, "revenue": 38640},
        "low_dish": {"name": "Mushroom Soup", "orders": 6, "action": "Consider removing or repricing"},
        "fastest_chef": {"name": "Chef Arjun", "avg_prep": "9.2 min"},
        "best_waiter": {"name": "Riya Sharma", "tips": 4820, "rating": 4.9},
        "food_waste": {"percentage": 4.2, "trend": "-1.8%", "saving": 8400},
        "recommendations": [
            {"id": 1, "title": "Schedule 2 extra staff at 8 PM tonight", "impact": "+18% efficiency", "priority": "high"},
            {"id": 2, "title": "Restock Paneer — only 2 days of stock left", "impact": "Prevent stockout", "priority": "high"},
            {"id": 3, "title": "Promote Mushroom Soup as 'Chef Special' with 20% off", "impact": "+₹4,200 weekly", "priority": "medium"},
            {"id": 4, "title": "Tandoor section averaging 15min — needs review", "impact": "Reduce wait time", "priority": "medium"},
        ],
    }


# --- Seed data on startup ---
async def seed():
    # Users
    if await db.users.count_documents({}) == 0:
        users = [
            {"id": str(uuid.uuid4()), "email": "owner@athithya.com", "password_hash": hash_password("owner123"),
             "name": "Vikram Mehta", "role": "owner", "avatar": "https://i.pravatar.cc/100?img=12", "created_at": now_iso()},
            {"id": str(uuid.uuid4()), "email": "manager@athithya.com", "password_hash": hash_password("manager123"),
             "name": "Priya Nair", "role": "manager", "avatar": "https://i.pravatar.cc/100?img=47", "created_at": now_iso()},
            {"id": str(uuid.uuid4()), "email": "waiter@athithya.com", "password_hash": hash_password("waiter123"),
             "name": "Riya Sharma", "role": "waiter", "avatar": "https://i.pravatar.cc/100?img=32", "created_at": now_iso()},
        ]
        await db.users.insert_many(users)
        await db.users.create_index("email", unique=True)
        logger.info("Seeded users")

    if await db.menu.count_documents({}) == 0:
        menu = [
            {"name": "Tandoori Paneer Tikka", "category": "Starters", "section": "tandoor", "price": 320, "cost": 110, "prep_time": 14},
            {"name": "Chicken Tikka Masala", "category": "Mains", "section": "main", "price": 420, "cost": 160, "prep_time": 18},
            {"name": "Butter Naan", "category": "Breads", "section": "tandoor", "price": 80, "cost": 18, "prep_time": 6},
            {"name": "Hakka Noodles", "category": "Chinese", "section": "chinese", "price": 280, "cost": 95, "prep_time": 12},
            {"name": "Schezwan Fried Rice", "category": "Chinese", "section": "chinese", "price": 290, "cost": 90, "prep_time": 14},
            {"name": "Manchurian Dragon", "category": "Chinese", "section": "chinese", "price": 310, "cost": 105, "prep_time": 15},
            {"name": "Dal Makhani", "category": "Mains", "section": "main", "price": 280, "cost": 80, "prep_time": 20},
            {"name": "Gulab Jamun", "category": "Desserts", "section": "dessert", "price": 140, "cost": 35, "prep_time": 5},
            {"name": "Tiramisu", "category": "Desserts", "section": "dessert", "price": 260, "cost": 95, "prep_time": 4},
            {"name": "Masala Chai", "category": "Beverages", "section": "beverages", "price": 60, "cost": 12, "prep_time": 5},
            {"name": "Cold Coffee", "category": "Beverages", "section": "beverages", "price": 180, "cost": 45, "prep_time": 4},
            {"name": "Fresh Lime Soda", "category": "Beverages", "section": "beverages", "price": 90, "cost": 20, "prep_time": 3},
            {"name": "Mushroom Soup", "category": "Starters", "section": "main", "price": 180, "cost": 70, "prep_time": 10},
            {"name": "Veg Biryani", "category": "Mains", "section": "main", "price": 340, "cost": 110, "prep_time": 22},
            {"name": "Mutton Rogan Josh", "category": "Mains", "section": "main", "price": 520, "cost": 220, "prep_time": 28},
        ]
        for m in menu:
            m["id"] = str(uuid.uuid4())
            m["available"] = True
        await db.menu.insert_many(menu)
        logger.info("Seeded menu")

    if await db.tables.count_documents({}) == 0:
        tables = []
        zones = [("main", 8, 80, 80), ("vip", 4, 80, 320), ("outdoor", 4, 480, 80), ("banquet", 4, 480, 320)]
        n = 1
        for zone, count, ox, oy in zones:
            for i in range(count):
                col, row = i % 4, i // 4
                tables.append({
                    "id": str(uuid.uuid4()),
                    "number": f"T{n:02d}",
                    "capacity": 4 if zone != "banquet" else 8,
                    "zone": zone,
                    "status": ["available", "occupied", "reserved", "cleaning"][n % 4],
                    "x": ox + col * 90,
                    "y": oy + row * 90,
                    "shape": "round" if n % 2 else "square",
                })
                n += 1
        await db.tables.insert_many(tables)
        logger.info("Seeded tables")

    if await db.inventory.count_documents({}) == 0:
        inv = [
            {"name": "Paneer", "category": "Dairy", "unit": "kg", "stock": 4.5, "reorder_level": 10, "cost_per_unit": 320, "vendor": "Amul Dairy", "expiry": "2026-02-28"},
            {"name": "Chicken Breast", "category": "Meat", "unit": "kg", "stock": 18, "reorder_level": 15, "cost_per_unit": 280, "vendor": "Fresh Meats", "expiry": "2026-02-22"},
            {"name": "Basmati Rice", "category": "Grains", "unit": "kg", "stock": 42, "reorder_level": 20, "cost_per_unit": 95, "vendor": "Kohinoor"},
            {"name": "Tomato", "category": "Vegetables", "unit": "kg", "stock": 8, "reorder_level": 12, "cost_per_unit": 35, "vendor": "Local Mandi"},
            {"name": "Onion", "category": "Vegetables", "unit": "kg", "stock": 24, "reorder_level": 15, "cost_per_unit": 30, "vendor": "Local Mandi"},
            {"name": "Garam Masala", "category": "Spices", "unit": "kg", "stock": 2.2, "reorder_level": 1, "cost_per_unit": 580, "vendor": "MDH Spices"},
            {"name": "Refined Oil", "category": "Oils", "unit": "l", "stock": 28, "reorder_level": 20, "cost_per_unit": 145, "vendor": "Fortune"},
            {"name": "Milk", "category": "Dairy", "unit": "l", "stock": 14, "reorder_level": 20, "cost_per_unit": 62, "vendor": "Amul Dairy", "expiry": "2026-02-20"},
        ]
        for i in inv:
            i["id"] = str(uuid.uuid4())
        await db.inventory.insert_many(inv)
        logger.info("Seeded inventory")

    if await db.staff.count_documents({}) == 0:
        staff = [
            {"name": "Arjun Kumar", "role": "Head Chef", "phone": "+91-98765-43210", "salary": 65000, "shift": "morning", "status": "working", "performance": 95, "avatar": "https://i.pravatar.cc/100?img=15"},
            {"name": "Riya Sharma", "role": "Senior Waiter", "phone": "+91-98765-43211", "salary": 32000, "shift": "afternoon", "status": "working", "performance": 92, "avatar": "https://i.pravatar.cc/100?img=32"},
            {"name": "Karan Patel", "role": "Waiter", "phone": "+91-98765-43212", "salary": 24000, "shift": "afternoon", "status": "working", "performance": 78, "avatar": "https://i.pravatar.cc/100?img=33"},
            {"name": "Neha Singh", "role": "Cashier", "phone": "+91-98765-43213", "salary": 28000, "shift": "morning", "status": "working", "performance": 88, "avatar": "https://i.pravatar.cc/100?img=45"},
            {"name": "Ravi Verma", "role": "Tandoor Chef", "phone": "+91-98765-43214", "salary": 42000, "shift": "night", "status": "working", "performance": 84, "avatar": "https://i.pravatar.cc/100?img=18"},
            {"name": "Ananya Gupta", "role": "Hostess", "phone": "+91-98765-43215", "salary": 26000, "shift": "afternoon", "status": "leave", "performance": 81, "avatar": "https://i.pravatar.cc/100?img=48"},
            {"name": "Vikram Yadav", "role": "Chinese Chef", "phone": "+91-98765-43216", "salary": 45000, "shift": "afternoon", "status": "working", "performance": 89, "avatar": "https://i.pravatar.cc/100?img=22"},
        ]
        for s in staff:
            s["id"] = str(uuid.uuid4())
        await db.staff.insert_many(staff)
        logger.info("Seeded staff")

    if await db.reservations.count_documents({}) == 0:
        today = datetime.now().strftime("%Y-%m-%d")
        res = [
            {"customer_name": "Rajesh Khanna", "phone": "+91-90000-11111", "date": today, "time": "19:30", "party_size": 4, "status": "confirmed", "notes": "Anniversary"},
            {"customer_name": "Aisha Bhatt", "phone": "+91-90000-22222", "date": today, "time": "20:00", "party_size": 2, "status": "confirmed", "notes": "Window seat"},
            {"customer_name": "Dev Kapoor", "phone": "+91-90000-33333", "date": today, "time": "21:00", "party_size": 6, "status": "pending", "notes": "Birthday"},
            {"customer_name": "Sneha Iyer", "phone": "+91-90000-44444", "date": today, "time": "13:00", "party_size": 3, "status": "seated"},
        ]
        for r in res:
            r["id"] = str(uuid.uuid4())
        await db.reservations.insert_many(res)
        logger.info("Seeded reservations")

    if await db.orders.count_documents({}) == 0:
        tables = await db.tables.find({}).to_list(50)
        menu = await db.menu.find({}).to_list(50)
        import random
        for i in range(8):
            t = random.choice(tables)
            picks = random.sample(menu, k=random.randint(2, 4))
            items = [{"menu_item_id": m["id"], "name": m["name"], "qty": random.randint(1, 3),
                      "price": m["price"], "section": m["section"]} for m in picks]
            total = sum(it["price"] * it["qty"] for it in items)
            status = random.choice(["received", "preparing", "ready", "served"])
            order = {
                "id": str(uuid.uuid4()),
                "table_id": t["id"], "table_number": t["number"],
                "items": items, "status": status, "priority": "normal",
                "total": round(total, 2), "waiter_name": "Riya Sharma",
                "created_at": (datetime.now(timezone.utc) - timedelta(minutes=random.randint(2, 35))).isoformat(),
                "updated_at": now_iso(),
            }
            await db.orders.insert_one(order)
        logger.info("Seeded orders")


@app.on_event("startup")
async def startup():
    await seed()

@app.on_event("shutdown")
async def shutdown():
    client.close()


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
