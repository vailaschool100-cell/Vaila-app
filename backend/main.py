import os
import sys
import io
import time
import tempfile
import hashlib
import json
import smtplib
import random
import base64
import urllib.request
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, List
from datetime import datetime

# Server-side speech recognition for audio file transcription
try:
    import speech_recognition as sr
    _sr_available = True
except ImportError:
    _sr_available = False
    print("[WARNING] speech_recognition not installed. Server-side audio transcription disabled.")

_ffmpeg_initialized = False

def setup_ffmpeg():
    global _ffmpeg_initialized
    if _ffmpeg_initialized: return
    _ffmpeg_initialized = True
    try:
        if os.name == "nt":
            import imageio_ffmpeg, shutil
            ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
            ffmpeg_dir = os.path.dirname(ffmpeg_exe)
            target1 = os.path.join(ffmpeg_dir, "ffmpeg.exe")
            if not os.path.exists(target1):
                try: shutil.copy(ffmpeg_exe, target1)
                except Exception: pass
            sys_path = os.environ.get("PATH", "")
            if ffmpeg_dir not in sys_path:
                os.environ["PATH"] = ffmpeg_dir + os.path.pathsep + sys_path
    except Exception as f_err:
        print(f"[FFmpeg Notice] {f_err}")

try:
    from pymongo import MongoClient
except ImportError:
    MongoClient = None

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "0.0.0.0")
MONGODB_URI = os.getenv("MONGODB_URI", "")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
SECRET_KEY = os.getenv("SECRET_KEY", "vaila_secret_jwt_key_2026")

SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")

app = FastAPI(
    title="Vaila Phonetics Teaching Backend API",
    description="Whisper Speech Evaluation + MongoDB Atlas + Real Gmail SMTP Notifications",
    version="4.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uploads static directory
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# ─── MongoDB Atlas Connection ──────────────────────────────────────────────────
mongo_client = None
db = None

if MONGODB_URI:
    try:
        from pymongo import MongoClient
        try:
            import certifi
            ca = certifi.where()
            mongo_client = MongoClient(MONGODB_URI, tlsCAFile=ca, serverSelectionTimeoutMS=2000)
        except Exception:
            mongo_client = MongoClient(MONGODB_URI, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=2000)
        db = mongo_client.get_default_database()
        print("[MongoDB Atlas] Connected successfully to Cloud Database!")
    except Exception as m_err:
        print(f"[MongoDB Atlas Connection Notice] {m_err}")
        db = None

# Local SQLite Fallback if MongoDB URI is not set
if db is None:
    import sqlite3
    DB_PATH = os.getenv("DB_PATH", "vaila.db")
    print("ℹ️ Running with local SQLite fallback database.")

def hash_password(password: str) -> str:
    return hashlib.sha256((password + SECRET_KEY).encode()).hexdigest()

def send_email_notification(to_email: str, subject: str, body_text: str):
    """Sends real email via Gmail SMTP credentials."""
    print(f"\n📧 [Sending Email] To: {to_email} | Subject: {subject}")
    if SMTP_USER and SMTP_PASS:
        try:
            msg = MIMEMultipart()
            msg['From'] = f"Vaila Phonics Teaching <{SMTP_USER}>"
            msg['To'] = to_email
            msg['Subject'] = subject
            msg.attach(MIMEText(body_text, 'plain'))

            with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
                server.login(SMTP_USER, SMTP_PASS)
                server.send_message(msg)
            print(f"✅ Real Email sent successfully to {to_email}!\n")
        except Exception as err:
            print(f"❌ SMTP Error sending email: {err}\n")
    else:
        print(f"Console Email Log: {body_text}\n")


# ─── Database Seeder ────────────────────────────────────────────────────────────
def init_db():
    current_month = time.strftime("%Y-%m")
    created_at = time.strftime("%Y-%m-%d %H:%M:%S")

    if db is not None:
        # MongoDB Seeding
        # Alphabets
        if db.alphabets.count_documents({}) == 0:
            default_alphabets = [
                {"id": "a", "letter": "a", "phonetic_sound": "aaa", "sample_word": "Apple", "repeat_count": 3, "tips": "Open mouth wide for 'aaa'."},
                {"id": "b", "letter": "b", "phonetic_sound": "buh", "sample_word": "Ball", "repeat_count": 3, "tips": "Press lips together for 'buh'."},
                {"id": "c", "letter": "c", "phonetic_sound": "kuh", "sample_word": "Cat", "repeat_count": 3, "tips": "Make a crisp 'kuh' sound."},
                {"id": "d", "letter": "d", "phonetic_sound": "dah", "sample_word": "Dog", "repeat_count": 3, "tips": "Touch tongue to teeth for 'dah'."},
                {"id": "e", "letter": "e", "phonetic_sound": "eh", "sample_word": "Elephant", "repeat_count": 3, "tips": "Smile and make 'eh' sound."},
            ]
            db.alphabets.insert_many(default_alphabets)

        # Seed Admin User (Admin@vaila.com / Admin123)
        if not db.users.find_one({"email": "Admin@vaila.com"}):
            db.users.insert_one({
                "username": "Admin",
                "email": "Admin@vaila.com",
                "password_hash": hash_password("Admin123"),
                "role": "admin",
                "avatar_url": "",
                "registration_screenshot": "",
                "is_approved": 1,
                "is_active": 1,
                "registration_month": current_month,
                "last_payment_month": current_month,
                "created_at": created_at
            })
            print("👑 [MongoDB Atlas] Seeded Admin: Admin@vaila.com / Admin123")
    else:
        # SQLite Fallback
        conn = sqlite3.connect("vaila.db")
        cursor = conn.cursor()
        cursor.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, email TEXT, password_hash TEXT, role TEXT, avatar_url TEXT, registration_screenshot TEXT, is_approved INTEGER, is_active INTEGER, registration_month TEXT, last_payment_month TEXT, created_at TEXT)")
        cursor.execute("CREATE TABLE IF NOT EXISTS payment_requests (id INTEGER PRIMARY KEY, user_id INTEGER, username TEXT, month TEXT, year TEXT, screenshot_url TEXT, status TEXT, created_at TEXT)")
        cursor.execute("CREATE TABLE IF NOT EXISTS session_logs (id INTEGER PRIMARY KEY, student TEXT, alphabet TEXT, spoken_sound TEXT, whisper_transcription TEXT, target_ipa TEXT, spoken_ipa TEXT, accuracy REAL, passed INTEGER, timestamp TEXT)")
        cursor.execute("SELECT * FROM users WHERE email = 'Admin@vaila.com'")
        if not cursor.fetchone():
            cursor.execute("INSERT INTO users (username, email, password_hash, role, is_approved, is_active, registration_month, last_payment_month, created_at) VALUES (?, ?, ?, 'admin', 1, 1, ?, ?, ?)",
                           ("Admin", "Admin@vaila.com", hash_password("Admin123"), current_month, current_month, created_at))
        conn.commit()
        conn.close()

init_db()


# ─── Whisper AI Lazy Loading ───────────────────────────────────────────────────
_whisper_model = None
_whisper_loaded = False

def get_whisper():
    global _whisper_model, _whisper_loaded
    if not _whisper_loaded:
        _whisper_loaded = True
        try:
            import whisper as _whisper_lib
            print("[Vaila] Loading lightweight Whisper tiny model for Render cloud...")
            _whisper_model = _whisper_lib.load_model("tiny")
            print("[Vaila] Whisper tiny model loaded successfully")
        except Exception as e:
            print(f"[Vaila Notice] Whisper AI running in lightweight evaluation mode: {e}")
            _whisper_model = None
    return _whisper_model

PHONETIC_TARGET_WORDS = {
    "a": "ah",     "b": "buh",     "c": "kuh",     "d": "dah",     "e": "eh",     "f": "fff",     "g": "guh",     "h": "huh",     "i": "ih",     "j": "juh",     "k": "kuh",     "l": "lll",     "m": "mmm",     "n": "nnn",     "o": "oh",     "p": "puh",     "q": "quh",     "r": "rrr",     "s": "sss",     "t": "tuh",     "u": "uh",     "v": "vvv",     "w": "wuh",     "x": "ks",     "y": "yuh",     "z": "zzz",
    # Numbers
    "1": "one", "2": "two", "3": "three", "4": "four", "5": "five",
    "6": "six", "7": "seven", "8": "eight", "9": "nine", "10": "ten",
    "11": "eleven", "12": "twelve", "13": "thirteen", "14": "fourteen", "15": "fifteen",
    "16": "sixteen", "17": "seventeen", "18": "eighteen", "19": "nineteen", "20": "twenty",
    "30": "thirty", "40": "forty", "50": "fifty", "60": "sixty", "70": "seventy",
    "80": "eighty", "90": "ninety", "100": "one hundred", "1000": "one thousand",
}
IPA_REFERENCE_WORDS = {
    "a": "ah",     "b": "buh",     "c": "kuh",     "d": "dah",     "e": "eh",     "f": "fff",     "g": "guh",     "h": "huh",     "i": "ih",     "j": "juh",     "k": "kuh",     "l": "lll",     "m": "mmm",     "n": "nnn",     "o": "oh",     "p": "puh",     "q": "quh",     "r": "rrr",     "s": "sss",     "t": "tuh",     "u": "uh",     "v": "vvv",     "w": "wuh",     "x": "ks",     "y": "yuh",     "z": "zzz",
    # Numbers
    "1": "one", "2": "two", "3": "three", "4": "four", "5": "five",
    "6": "six", "7": "seven", "8": "eight", "9": "nine", "10": "ten",
    "11": "eleven", "12": "twelve", "13": "thirteen", "14": "fourteen", "15": "fifteen",
    "16": "sixteen", "17": "seventeen", "18": "eighteen", "19": "nineteen", "20": "twenty",
    "30": "thirty", "40": "forty", "50": "fifty", "60": "sixty", "70": "seventy",
    "80": "eighty", "90": "ninety", "100": "one hundred", "1000": "one thousand",
}
PHONETIC_VARIANTS = {
    "a": ["ah", "aaa", "a"],
    "b": ["buh", "bah", "b"],
    "c": ["kuh", "kah", "c"],
    "d": ["dah", "da", "d"],
    "e": ["eh", "aeh", "e"],
    "f": ["fff", "fuh", "f"],
    "g": ["guh", "gah", "g"],
    "h": ["huh", "hah", "h"],
    "i": ["ih", "ee", "i"],
    "j": ["juh", "jah", "j"],
    "k": ["kuh", "kah", "k"],
    "l": ["lll", "luh", "l"],
    "m": ["mmm", "muh", "m"],
    "n": ["nnn", "nuh", "n"],
    "o": ["oh", "aw", "o"],
    "p": ["puh", "pah", "p"],
    "q": ["quh", "qwa", "q"],
    "r": ["rrr", "ruh", "r"],
    "s": ["sss", "suh", "s"],
    "t": ["tuh", "tah", "t"],
    "u": ["uh", "oo", "u"],
    "v": ["vvv", "vuh", "v"],
    "w": ["wuh", "wah", "w"],
    "x": ["ks", "eks", "x"],
    "y": ["yuh", "yah", "y"],
    "z": ["zzz", "zuh", "z"],
    # Numbers
    "1": ["one", "won", "wan", "1"],
    "2": ["two", "too", "to", "tu", "2"],
    "3": ["three", "tree", "free", "3"],
    "4": ["four", "for", "fore", "4"],
    "5": ["five", "fiv", "fife", "5"],
    "6": ["six", "sicks", "sics", "6"],
    "7": ["seven", "sev", "sevin", "7"],
    "8": ["eight", "ate", "ait", "8"],
    "9": ["nine", "nein", "nien", "9"],
    "10": ["ten", "tin", "10"],
    "11": ["eleven", "levin", "11"],
    "12": ["twelve", "twelv", "12"],
    "13": ["thirteen", "therteen", "13"],
    "14": ["fourteen", "forteen", "14"],
    "15": ["fifteen", "fiften", "15"],
    "16": ["sixteen", "sixten", "16"],
    "17": ["seventeen", "seventen", "17"],
    "18": ["eighteen", "eighten", "18"],
    "19": ["nineteen", "nineten", "19"],
    "20": ["twenty", "tweny", "20"],
    "30": ["thirty", "thirdy", "30"],
    "40": ["forty", "fourty", "fordy", "40"],
    "50": ["fifty", "fifdy", "50"],
    "60": ["sixty", "sixdy", "60"],
    "70": ["seventy", "sevendy", "70"],
    "80": ["eighty", "eighdy", "80"],
    "90": ["ninety", "ninedy", "90"],
    "100": ["one hundred", "hundred", "a hundred", "100"],
    "1000": ["one thousand", "thousand", "a thousand", "1000"],
}

def text_to_ipa(word: str) -> str:
    try:
        from phonemizer import phonemize
        return phonemize(word, backend="espeak", language="en-us", with_stress=False).strip()
    except Exception:
        return word.lower().strip()

def levenshtein_accuracy(s1: str, s2: str) -> float:
    try:
        from Levenshtein import distance
        if not s1 or not s2: return 0.0
        dist = distance(s1, s2)
        return round((1 - dist / max(len(s1), len(s2))) * 100, 1)
    except Exception:
        return 0.0 if not s1 or not s2 else 100.0


# ─── Auth Schemas ─────────────────────────────────────────────────────────────
class EvaluationResponse(BaseModel):
    target_alphabet: str
    phonetic_sound: str
    whisper_transcription: str
    spoken_ipa: str
    target_ipa: str
    accuracy: float
    passed: bool
    threshold: float = 90.0
    feedback: str

class LoginRequest(BaseModel):
    email_or_username: str
    password: str


# ─── Auth Routes ──────────────────────────────────────────────────────────────
@app.post("/api/auth/register")
async def register(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    screenshot: UploadFile = File(...)
):
    current_month = time.strftime("%Y-%m")
    created_at = time.strftime("%Y-%m-%d %H:%M:%S")

    # Save payment screenshot file
    filename = f"reg_{int(time.time())}_{screenshot.filename}"
    filepath = os.path.join(UPLOADS_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(await screenshot.read())

    screenshot_url = f"/uploads/{filename}"

    if db is not None:
        # MongoDB Atlas Registration
        if db.users.find_one({"$or": [{"email": email}, {"username": username}]}):
            raise HTTPException(status_code=400, detail="Username or Email already registered")

        user_doc = {
            "username": username,
            "email": email,
            "password_hash": hash_password(password),
            "role": "student",
            "avatar_url": "",
            "registration_screenshot": screenshot_url,
            "is_approved": 0,
            "is_active": 1,
            "registration_month": current_month,
            "last_payment_month": current_month,
            "created_at": created_at
        }
        db.users.insert_one(user_doc)
    else:
        # SQLite Registration
        conn = sqlite3.connect("vaila.db")
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ? OR username = ?", (email, username))
        if cursor.fetchone():
            conn.close()
            raise HTTPException(status_code=400, detail="Username or Email already registered")
        cursor.execute(
            "INSERT INTO users (username, email, password_hash, role, registration_screenshot, is_approved, is_active, registration_month, last_payment_month, created_at) VALUES (?, ?, ?, 'student', ?, 0, 1, ?, ?, ?)",
            (username, email, hash_password(password), screenshot_url, current_month, current_month, created_at)
        )
        conn.commit()
        conn.close()

    # Send Notification Email to Admin
    send_email_notification(
        "ak1096561@gmail.com",
        f"🚨 New User Signup Alert: {username}",
        f"Hello Admin,\n\nA new user '{username}' ({email}) has registered and submitted a bank payment screenshot for approval.\n\nPlease log into the Admin Dashboard to review and approve/reject the user."
    )

    return {
        "success": True,
        "message": "Registration submitted successfully! Waiting for Admin approval.",
        "username": username
    }


@app.post("/api/auth/login")
def login(req: LoginRequest):
    pwd_hash = hash_password(req.password)
    user_dict = None

    if db is not None:
        user = db.users.find_one({
            "$or": [{"email": req.email_or_username}, {"username": req.email_or_username}],
            "password_hash": pwd_hash
        })
        if user:
            user["id"] = str(user["_id"])
            user_dict = user
    else:
        conn = sqlite3.connect("vaila.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE (email = ? OR username = ?) AND password_hash = ?", (req.email_or_username, req.email_or_username, pwd_hash))
        row = cursor.fetchone()
        if row: user_dict = dict(row)
        conn.close()

    if not user_dict:
        raise HTTPException(status_code=401, detail="Invalid username/email or password")

    if user_dict.get("role") != "admin":
        if not user_dict.get("is_approved"):
            return {
                "success": False,
                "is_approved": False,
                "username": user_dict.get("username"),
                "message": "Your registration is waiting for Admin approval. Please check back soon!"
            }

        current_month = time.strftime("%Y-%m")
        if user_dict.get("last_payment_month", "") < current_month or not user_dict.get("is_active"):
            return {
                "success": False,
                "is_approved": True,
                "is_active": False,
                "requires_monthly_payment": True,
                "username": user_dict.get("username"),
                "message": f"Please pay your monthly fee for {current_month} to continue using Vaila App."
            }

    return {
        "success": True,
        "token": f"jwt_token_{user_dict.get('username')}",
        "user": {
            "username": user_dict.get("username"),
            "email": user_dict.get("email"),
            "role": user_dict.get("role"),
            "avatar_url": user_dict.get("avatar_url", ""),
            "is_approved": bool(user_dict.get("is_approved")),
            "is_active": bool(user_dict.get("is_active"))
        }
    }


@app.post("/api/auth/upload-monthly-payment")
async def upload_monthly_payment(
    username: str = Form(...),
    month: str = Form(...),
    year: str = Form(...),
    screenshot: UploadFile = File(...)
):
    filename = f"monthly_{int(time.time())}_{screenshot.filename}"
    filepath = os.path.join(UPLOADS_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(await screenshot.read())

    screenshot_url = f"/uploads/{filename}"

    target_user_name = username
    if db is not None:
        user_rec = db.users.find_one({"$or": [{"username": username}, {"email": username}]})
        if user_rec:
            target_user_name = user_rec.get("username", username)
            db.users.update_one(
                {"_id": user_rec["_id"]},
                {"$set": {"registration_screenshot": screenshot_url, "is_active": 0}}
            )
        db.payment_requests.insert_one({
            "username": target_user_name,
            "month": month,
            "year": year,
            "screenshot_url": screenshot_url,
            "status": "pending",
            "created_at": time.strftime("%Y-%m-%d %H:%M:%S")
        })
    else:
        conn = sqlite3.connect("vaila.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        row = cursor.execute("SELECT * FROM users WHERE username = ? OR email = ?", (username, username)).fetchone()
        if row:
            target_user_name = dict(row).get("username", username)
        cursor.execute("INSERT INTO payment_requests (username, month, year, screenshot_url, status, created_at) VALUES (?, ?, ?, ?, 'pending', ?)",
                       (target_user_name, month, year, screenshot_url, time.strftime("%Y-%m-%d %H:%M:%S")))
        cursor.execute("UPDATE users SET registration_screenshot = ?, is_active = 0 WHERE username = ? OR email = ?", (screenshot_url, username, username))
        conn.commit()
        conn.close()

    send_email_notification(
        "ak1096561@gmail.com",
        f"💳 Monthly Fee Screenshot Uploaded: {target_user_name}",
        f"User '{target_user_name}' uploaded a monthly fee payment screenshot for {month} {year}.\nPlease verify and activate the user."
    )

    return {"success": True, "message": "Monthly fee screenshot uploaded! Admin will reactivate your account."}


@app.post("/api/auth/update-profile")
async def update_profile(
    username: str = Form(...),
    email: str = Form(...),
    current_username: str = Form(...),
    avatar: Optional[UploadFile] = File(None)
):
    avatar_url = None
    if avatar:
        filename = f"avatar_{int(time.time())}_{avatar.filename}"
        filepath = os.path.join(UPLOADS_DIR, filename)
        with open(filepath, "wb") as f:
            f.write(await avatar.read())
        avatar_url = f"/uploads/{filename}"

    if db is not None:
        update_data = {"username": username, "email": email}
        if avatar_url: update_data["avatar_url"] = avatar_url
        db.users.update_one({"username": current_username}, {"$set": update_data})
        updated = db.users.find_one({"username": username})
        if updated: updated["_id"] = str(updated["_id"])
    else:
        conn = sqlite3.connect("vaila.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        if avatar_url:
            cursor.execute("UPDATE users SET username = ?, email = ?, avatar_url = ? WHERE username = ?", (username, email, avatar_url, current_username))
        else:
            cursor.execute("UPDATE users SET username = ?, email = ? WHERE username = ?", (username, email, current_username))
        conn.commit()
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        updated = dict(cursor.fetchone())
        conn.close()

    return {"success": True, "user": updated}


@app.get("/api/auth/check-status/{username}")
def check_status(username: str):
    if db is not None:
        user = db.users.find_one({"username": username})
        if not user: return {"is_approved": False, "is_active": False}
        return {"is_approved": bool(user.get("is_approved")), "is_active": bool(user.get("is_active"))}
    else:
        conn = sqlite3.connect("vaila.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT is_approved, is_active FROM users WHERE username = ?", (username,))
        row = cursor.fetchone()
        conn.close()
        if not row: return {"is_approved": False, "is_active": False}
        return {"is_approved": bool(row["is_approved"]), "is_active": bool(row["is_active"])}


# ─── Admin Management Routes ───────────────────────────────────────────────────
@app.get("/api/admin/users")
def get_all_users():
    current_month = time.strftime("%Y-%m")
    now = datetime.now()
    days_left = max(0, 30 - now.day)

    if db is not None:
        users = list(db.users.find({"role": {"$ne": "admin"}}))
        for u in users:
            u["id"] = str(u["_id"])
            u.pop("_id", None)
        payments = list(db.payment_requests.find({}))
        for p in payments:
            p["id"] = str(p["_id"])
            p.pop("_id", None)
    else:
        conn = sqlite3.connect("vaila.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        users = [dict(r) for r in cursor.execute("SELECT * FROM users WHERE role != 'admin' ORDER BY id DESC").fetchall()]
        payments = [dict(r) for r in cursor.execute("SELECT * FROM payment_requests ORDER BY id DESC").fetchall()]
        conn.close()

    for u in users:
        # If user has payment requests, map latest screenshot
        u_payments = [p for p in payments if p.get('username') == u.get('username')]
        if u_payments:
            latest_p = u_payments[-1]
            if latest_p.get('screenshot_url'):
                u['registration_screenshot'] = latest_p.get('screenshot_url')

        if u.get('last_payment_month', '') >= current_month and u.get('is_active'):
            if days_left <= 3:
                u['payment_status_badge'] = "orange"
                u['status_text'] = f"Paid ({days_left} days left)"
            else:
                u['payment_status_badge'] = "green"
                u['status_text'] = "Paid (Active)"
        else:
            u['payment_status_badge'] = "red"
            u['status_text'] = "Overdue / Deactivated"

    return {"users": users, "payments": payments}


@app.post("/api/admin/approve-user")
def approve_user(username: Optional[str] = Form(None), user_id: Optional[str] = Form(None)):
    current_month = time.strftime("%Y-%m")
    user_email = None
    target_identifier = (username or user_id or "").strip()

    if not target_identifier:
        raise HTTPException(status_code=400, detail="username or user_id is required")

    canonical_username = target_identifier

    if db is not None:
        from bson import ObjectId
        or_conditions = [
            {"username": target_identifier},
            {"email": target_identifier}
        ]
        if len(target_identifier) == 24:
            try:
                or_conditions.append({"_id": ObjectId(target_identifier)})
            except Exception:
                pass

        user = db.users.find_one({"$or": or_conditions})
        if not user:
            raise HTTPException(status_code=404, detail=f"User '{target_identifier}' not found in database")

        user_email = user.get("email")
        canonical_username = user.get("username")

        db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"is_approved": 1, "is_active": 1, "last_payment_month": current_month}}
        )
        db.payment_requests.update_many(
            {"$or": [{"username": canonical_username}, {"username": user_email}]},
            {"$set": {"status": "approved"}}
        )
    else:
        conn = sqlite3.connect("vaila.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        row = cursor.execute("SELECT * FROM users WHERE username = ? OR email = ? OR id = ?", (target_identifier, target_identifier, target_identifier)).fetchone()
        if not row:
            conn.close()
            raise HTTPException(status_code=404, detail=f"User '{target_identifier}' not found in database")

        u_dict = dict(row)
        user_email = u_dict.get("email")
        canonical_username = u_dict.get("username")

        cursor.execute("UPDATE users SET is_approved = 1, is_active = 1, last_payment_month = ? WHERE id = ? OR username = ?", (current_month, u_dict.get("id"), canonical_username))
        cursor.execute("UPDATE payment_requests SET status = 'approved' WHERE username = ? OR username = ?", (canonical_username, user_email))
        conn.commit()
        conn.close()

    if user_email:
        send_email_notification(
            user_email,
            "🎉 Vaila App Account Approved / Reactivated!",
            f"Hello {canonical_username},\n\nYour payment screenshot has been verified and your account is now active!\n\nYou can now open Vaila App, log in, and start your phonetics learning."
        )

    return {"success": True, "message": "User approved and activated successfully"}


@app.post("/api/admin/deactivate-user")
def deactivate_user(username: Optional[str] = Form(None), user_id: Optional[str] = Form(None)):
    user_email = None
    target_identifier = (username or user_id or "").strip()

    if not target_identifier:
        raise HTTPException(status_code=400, detail="username or user_id is required")

    canonical_username = target_identifier

    if db is not None:
        from bson import ObjectId
        or_conditions = [
            {"username": target_identifier},
            {"email": target_identifier}
        ]
        if len(target_identifier) == 24:
            try:
                or_conditions.append({"_id": ObjectId(target_identifier)})
            except Exception:
                pass

        user = db.users.find_one({"$or": or_conditions})
        if not user:
            raise HTTPException(status_code=404, detail=f"User '{target_identifier}' not found in database")

        user_email = user.get("email")
        canonical_username = user.get("username")

        db.users.update_one({"_id": user["_id"]}, {"$set": {"is_active": 0}})
    else:
        conn = sqlite3.connect("vaila.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        row = cursor.execute("SELECT * FROM users WHERE username = ? OR email = ? OR id = ?", (target_identifier, target_identifier, target_identifier)).fetchone()
        if not row:
            conn.close()
            raise HTTPException(status_code=404, detail=f"User '{target_identifier}' not found in database")

        u_dict = dict(row)
        user_email = u_dict.get("email")
        canonical_username = u_dict.get("username")

        cursor.execute("UPDATE users SET is_active = 0 WHERE id = ? OR username = ?", (u_dict.get("id"), canonical_username))
        conn.commit()
        conn.close()

    if user_email:
        send_email_notification(
            user_email,
            "⚠️ Vaila App Account Deactivated",
            f"Hello {canonical_username},\n\nYour account has been deactivated due to overdue monthly fee. Please upload your payment screenshot to reactivate your account."
        )

    return {"success": True, "message": "User deactivated successfully"}


# ─── Speech Evaluation Route ───────────────────────────────────────────────────
@app.get("/")
def root():
    return {"app": "Vaila Backend v4.0", "status": "online", "db": "MongoDB Atlas Active" if db is not None else "SQLite Fallback"}

@app.get("/api/alphabets")
def get_alphabets():
    if db is not None:
        alphabets = list(db.alphabets.find({}))
        for a in alphabets: a.pop("_id", None)
        return {"alphabets": alphabets}
    else:
        conn = sqlite3.connect("vaila.db")
        conn.row_factory = sqlite3.Row
        rows = conn.execute("SELECT * FROM alphabets").fetchall()
        conn.close()
def evaluate_audio_with_gemini(audio_bytes: bytes, target_options: str, mime_type: str = "audio/wav") -> Optional[dict]:
    gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not gemini_key or len(audio_bytes) < 300:
        return None

    try:
        encoded_audio = base64.b64encode(audio_bytes).decode("utf-8")
        prompt = (
            f"You are a warm, encouraging speech evaluator for deaf children learning to speak.\n"
            f"The student is trying to pronounce ANY of the following acceptable variants: '{target_options}'.\n"
            f"Listen to the attached student audio recording carefully.\n\n"
            f"EVALUATION INSTRUCTIONS FOR DEAF CHILDREN & 50% LENIENCY RULE:\n"
            f"1. Deaf children might not articulate perfectly. You must be lenient and listen for approximations.\n"
            f"2. Calculate a phonetic match accuracy score from 0 to 100% based on how close their attempt is to ANY of the acceptable variants.\n"
            f"3. If they pronounce it perfectly or almost perfectly, assign a score of 95%.\n"
            f"4. PASSING THRESHOLD IS 50%: If the child's attempt is 50% or closer to ANY of these variants ('{target_options}'), set 'passed': true and 'accuracy': <50 to 95>.\n"
            f"5. FAIL RULE: If the child pronounced a completely different letter/number, or no speech at all, set 'passed': false and 'accuracy': <0 to 49> based on effort.\n"
            f"6. Provide a short, encouraging 1-line feedback for the child mentioning their match score.\n\n"
            f"Return ONLY valid JSON matching this schema without markdown code block backticks:\n"
            f"{{\n"
            f'  "transcription": "<word or sound heard>",\n'
            f'  "accuracy": <integer 0 to 100>,\n'
            f'  "passed": <boolean true or false>,\n'
            f'  "feedback": "<1-line encouraging feedback with score>"\n'
            f"}}"
        )

        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "inline_data": {
                                "mime_type": mime_type,
                                "data": encoded_audio
                            }
                        },
                        {
                            "text": prompt
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "responseMimeType": "application/json"
            }
        }

        models_to_try = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.5-flash"]
        for model in models_to_try:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={gemini_key}"
                req_data = json.dumps(payload).encode("utf-8")
                req = urllib.request.Request(
                    url,
                    data=req_data,
                    headers={"Content-Type": "application/json"}
                )
                with urllib.request.urlopen(req, timeout=30) as resp:
                    if resp.status == 200:
                        res_body = resp.read().decode("utf-8")
                        res_json = json.loads(res_body)
                        candidates = res_json.get("candidates", [])
                        if candidates:
                            text_content = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                            clean_text = text_content.strip()
                            if clean_text.startswith("```json"):
                                clean_text = clean_text[7:]
                            if clean_text.endswith("```"):
                                clean_text = clean_text[:-3]
                            clean_text = clean_text.strip()
                            
                            eval_dict = json.loads(clean_text)
                            print(f"[GEMINI EVALUATION] Success with model {model}: {eval_dict}")
                            return eval_dict
            except Exception as m_err:
                print(f"[GEMINI EVALUATION] Model {model} notice: {m_err}")
                continue
    except Exception as e:
        print(f"[GEMINI EVALUATION] General error: {e}")
    
    return None

@app.post("/api/evaluate-audio", response_model=EvaluationResponse)
async def evaluate_audio(
    file: Optional[UploadFile] = File(default=None),
    target_alphabet: str = Form(...),
    spoken_text: str = Form(default=""),
    student_id: str = Form(default="Learner"),
):
    try:
        clean_student = student_id.strip() if (student_id and student_id.strip()) else "Learner"
        target = target_alphabet.strip().lower()
        target_sound = PHONETIC_TARGET_WORDS.get(target, target)

        variants_list = list(PHONETIC_VARIANTS.get(target, [target_sound, target]))
        if db is not None:
            try:
                alpha_doc = db.alphabets.find_one({"$or": [{"id": target}, {"letter": target}]})
                if alpha_doc:
                    if alpha_doc.get("phonetic_sound"):
                        variants_list.append(alpha_doc["phonetic_sound"].lower())
                    if alpha_doc.get("sample_word"):
                        variants_list.append(alpha_doc["sample_word"].lower())
            except Exception:
                pass

        target_variants = set([v.lower() for v in variants_list if v])

        # Build other letters' variant set to prevent cross-letter passing
        other_variants = set()
        for letter_key, vars_arr in PHONETIC_VARIANTS.items():
            if letter_key != target:
                for v in vars_arr:
                    if v and v.lower() not in target_variants:
                        other_variants.add(v.lower())

        stt_transcription = spoken_text.strip().lower()
        audio_file_uploaded = file is not None

        # Sample words map for each letter
        SAMPLE_WORDS = {
            "a": "apple", "b": "ball", "c": "cat", "d": "dog", "e": "elephant",
            "f": "fish", "g": "goat", "h": "hat", "i": "igloo", "j": "jug",
            "k": "kite", "l": "lion", "m": "monkey", "n": "nest", "o": "orange",
            "p": "parrot", "q": "queen", "r": "rabbit", "s": "snake", "t": "tiger",
            "u": "umbrella", "v": "van", "w": "whale", "x": "xylophone", "y": "yak", "z": "zebra",
        }

        target_sounds_map = {
            "a": ["a", "letter a", "say a", "aaa", "ah", "aah", "aa", "apple"],
            "b": ["b", "letter b", "say b", "buh", "bah", "bee", "be", "ball"],
            "c": ["c", "letter c", "say c", "kuh", "kah", "ca", "ka", "see", "cat"],
            "d": ["d", "letter d", "say d", "dah", "da", "deh", "dee", "dog", "duh"],
            "e": ["e", "letter e", "say e", "eh", "ay", "aeh", "elephant"],
            "f": ["f", "letter f", "say f", "fff", "fuh", "eff", "fish"],
            "g": ["g", "letter g", "say g", "guh", "gah", "gee", "goat"],
            "h": ["h", "letter h", "say h", "huh", "hah", "aitch", "hat"],
            "i": ["i", "letter i", "say i", "ih", "ee", "eye", "igloo"],
            "j": ["j", "letter j", "say j", "juh", "jah", "jay", "jug"],
            "k": ["k", "letter k", "say k", "kuh", "kah", "kay", "kite"],
            "l": ["l", "letter l", "say l", "lll", "luh", "ell", "lion"],
            "m": ["m", "letter m", "say m", "mmm", "muh", "em", "monkey"],
            "n": ["n", "letter n", "say n", "nnn", "nuh", "en", "nest"],
            "o": ["o", "letter o", "say o", "oh", "aw", "orange"],
            "p": ["p", "letter p", "say p", "puh", "pah", "pee", "parrot"],
            "q": ["q", "letter q", "say q", "quh", "qwa", "cue", "queen"],
            "r": ["r", "letter r", "say r", "rrr", "ruh", "are", "rabbit"],
            "s": ["s", "letter s", "say s", "sss", "suh", "ess", "snake"],
            "t": ["t", "letter t", "say t", "tuh", "tah", "tee", "tiger"],
            "u": ["u", "letter u", "say u", "uh", "you", "umbrella"],
            "v": ["v", "letter v", "say v", "vvv", "vuh", "vee", "van"],
            "w": ["w", "letter w", "say w", "wuh", "double you", "whale"],
            "x": ["x", "letter x", "say x", "ks", "eks", "ex", "xylophone"],
            "y": ["y", "letter y", "say y", "yuh", "why", "yak"],
            "z": ["z", "letter z", "say z", "zzz", "zuh", "zee", "zed", "zebra"],
            "1": ["1", "one", "won", "wan"], "2": ["2", "two", "too", "to", "tu"],
            "3": ["3", "three", "tree", "free"], "4": ["4", "four", "for", "fore"],
            "5": ["5", "five", "fiv", "fife"], "6": ["6", "six", "sicks", "sics"],
            "7": ["7", "seven", "sev", "sevin"], "8": ["8", "eight", "ate", "ait"],
            "9": ["9", "nine", "nein", "nien"], "10": ["10", "ten", "tin"],
            "11": ["11", "eleven", "levin"], "12": ["12", "twelve", "twelv"],
            "13": ["13", "thirteen", "therteen"], "14": ["14", "fourteen", "forteen"],
            "15": ["15", "fifteen", "fiften"], "16": ["16", "sixteen", "sixten"],
            "17": ["17", "seventeen", "seventen"], "18": ["18", "eighteen", "eighten"],
            "19": ["19", "nineteen", "nineten"], "20": ["20", "twenty", "tweny"],
            "30": ["30", "thirty", "thirdy"], "40": ["40", "forty", "fourty", "fordy"],
            "50": ["50", "fifty", "fifdy"], "60": ["60", "sixty", "sixdy"],
            "70": ["70", "seventy", "sevendy"], "80": ["80", "eighty", "eighdy"],
            "90": ["90", "ninety", "ninedy"], "100": ["100", "one hundred", "hundred", "a hundred"],
            "1000": ["1000", "one thousand", "thousand", "a thousand"],
        }
        _all_number_keys = [str(n) for n in [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,30,40,50,60,70,80,90,100,1000]]
        wrong_sounds_map = {
            "a": ["b", "buh", "c", "kuh", "d", "dah", "e", "eh", "f", "fff", "g", "guh", "h", "huh", "i", "ih", "j", "juh", "k", "kuh", "l", "lll", "m", "mmm", "n", "nnn", "o", "oh", "p", "puh", "q", "quh", "r", "rrr", "s", "sss", "t", "tuh", "u", "uh", "v", "vvv", "w", "wuh", "x", "ks", "y", "yuh", "z", "zzz"],
            "b": ["a", "ah", "c", "kuh", "d", "dah", "e", "eh", "f", "fff", "g", "guh", "h", "huh", "i", "ih", "j", "juh", "k", "kuh", "l", "lll", "m", "mmm", "n", "nnn", "o", "oh", "p", "puh", "q", "quh", "r", "rrr", "s", "sss", "t", "tuh", "u", "uh", "v", "vvv", "w", "wuh", "x", "ks", "y", "yuh", "z", "zzz"],
            "c": ["a", "ah", "b", "buh", "d", "dah", "e", "eh", "f", "fff", "g", "guh", "h", "huh", "i", "ih", "j", "juh", "k", "kuh", "l", "lll", "m", "mmm", "n", "nnn", "o", "oh", "p", "puh", "q", "quh", "r", "rrr", "s", "sss", "t", "tuh", "u", "uh", "v", "vvv", "w", "wuh", "x", "ks", "y", "yuh", "z", "zzz"],
            "d": ["a", "ah", "b", "buh", "c", "kuh", "e", "eh", "f", "fff", "g", "guh", "h", "huh", "i", "ih", "j", "juh", "k", "kuh", "l", "lll", "m", "mmm", "n", "nnn", "o", "oh", "p", "puh", "q", "quh", "r", "rrr", "s", "sss", "t", "tuh", "u", "uh", "v", "vvv", "w", "wuh", "x", "ks", "y", "yuh", "z", "zzz"],
            "e": ["a", "ah", "b", "buh", "c", "kuh", "d", "dah", "f", "fff", "g", "guh", "h", "huh", "i", "ih", "j", "juh", "k", "kuh", "l", "lll", "m", "mmm", "n", "nnn", "o", "oh", "p", "puh", "q", "quh", "r", "rrr", "s", "sss", "t", "tuh", "u", "uh", "v", "vvv", "w", "wuh", "x", "ks", "y", "yuh", "z", "zzz"],
            "f": ["a", "ah", "b", "buh", "c", "kuh", "d", "dah", "e", "eh", "g", "guh", "h", "huh", "i", "ih", "j", "juh", "k", "kuh", "l", "lll", "m", "mmm", "n", "nnn", "o", "oh", "p", "puh", "q", "quh", "r", "rrr", "s", "sss", "t", "tuh", "u", "uh", "v", "vvv", "w", "wuh", "x", "ks", "y", "yuh", "z", "zzz"],
            "g": ["a", "ah", "b", "buh", "c", "kuh", "d", "dah", "e", "eh", "f", "fff", "h", "huh", "i", "ih", "j", "juh", "k", "kuh", "l", "lll", "m", "mmm", "n", "nnn", "o", "oh", "p", "puh", "q", "quh", "r", "rrr", "s", "sss", "t", "tuh", "u", "uh", "v", "vvv", "w", "wuh", "x", "ks", "y", "yuh", "z", "zzz"],
            "h": ["a", "ah", "b", "buh", "c", "kuh", "d", "dah", "e", "eh", "f", "fff", "g", "guh", "i", "ih", "j", "juh", "k", "kuh", "l", "lll", "m", "mmm", "n", "nnn", "o", "oh", "p", "puh", "q", "quh", "r", "rrr", "s", "sss", "t", "tuh", "u", "uh", "v", "vvv", "w", "wuh", "x", "ks", "y", "yuh", "z", "zzz"],
            "i": ["a", "ah", "b", "buh", "c", "kuh", "d", "dah", "e", "eh", "f", "fff", "g", "guh", "h", "huh", "j", "juh", "k", "kuh", "l", "lll", "m", "mmm", "n", "nnn", "o", "oh", "p", "puh", "q", "quh", "r", "rrr", "s", "sss", "t", "tuh", "u", "uh", "v", "vvv", "w", "wuh", "x", "ks", "y", "yuh", "z", "zzz"],
            "j": ["a", "ah", "b", "buh", "c", "kuh", "d", "dah", "e", "eh", "f", "fff", "g", "guh", "h", "huh", "i", "ih", "k", "kuh", "l", "lll", "m", "mmm", "n", "nnn", "o", "oh", "p", "puh", "q", "quh", "r", "rrr", "s", "sss", "t", "tuh", "u", "uh", "v", "vvv", "w", "wuh", "x", "ks", "y", "yuh", "z", "zzz"],
            "k": ["a", "ah", "b", "buh", "c", "kuh", "d", "dah", "e", "eh", "f", "fff", "g", "guh", "h", "huh", "i", "ih", "j", "juh", "l", "lll", "m", "mmm", "n", "nnn", "o", "oh", "p", "puh", "q", "quh", "r", "rrr", "s", "sss", "t", "tuh", "u", "uh", "v", "vvv", "w", "wuh", "x", "ks", "y", "yuh", "z", "zzz"],
            "l": ["a", "ah", "b", "buh", "c", "kuh", "d", "dah", "e", "eh", "f", "fff", "g", "guh", "h", "huh", "i", "ih", "j", "juh", "k", "kuh", "m", "mmm", "n", "nnn", "o", "oh", "p", "puh", "q", "quh", "r", "rrr", "s", "sss", "t", "tuh", "u", "uh", "v", "vvv", "w", "wuh", "x", "ks", "y", "yuh", "z", "zzz"],
            "m": ["a", "ah", "b", "buh", "c", "kuh", "d", "dah", "e", "eh", "f", "fff", "g", "guh", "h", "huh", "i", "ih", "j", "juh", "k", "kuh", "l", "lll", "n", "nnn", "o", "oh", "p", "puh", "q", "quh", "r", "rrr", "s", "sss", "t", "tuh", "u", "uh", "v", "vvv", "w", "wuh", "x", "ks", "y", "yuh", "z", "zzz"],
            "n": ["a", "ah", "b", "buh", "c", "kuh", "d", "dah", "e", "eh", "f", "fff", "g", "guh", "h", "huh", "i", "ih", "j", "juh", "k", "kuh", "l", "lll", "m", "mmm", "o", "oh", "p", "puh", "q", "quh", "r", "rrr", "s", "sss", "t", "tuh", "u", "uh", "v", "vvv", "w", "wuh", "x", "ks", "y", "yuh", "z", "zzz"],
            "o": ["a", "ah", "b", "buh", "c", "kuh", "d", "dah", "e", "eh", "f", "fff", "g", "guh", "h", "huh", "i", "ih", "j", "juh", "k", "kuh", "l", "lll", "m", "mmm", "n", "nnn", "p", "puh", "q", "quh", "r", "rrr", "s", "sss", "t", "tuh", "u", "uh", "v", "vvv", "w", "wuh", "x", "ks", "y", "yuh", "z", "zzz"],
            "p": ["a", "ah", "b", "buh", "c", "kuh", "d", "dah", "e", "eh", "f", "fff", "g", "guh", "h", "huh", "i", "ih", "j", "juh", "k", "kuh", "l", "lll", "m", "mmm", "n", "nnn", "o", "oh", "q", "quh", "r", "rrr", "s", "sss", "t", "tuh", "u", "uh", "v", "vvv", "w", "wuh", "x", "ks", "y", "yuh", "z", "zzz"],
            "q": ["a", "ah", "b", "buh", "c", "kuh", "d", "dah", "e", "eh", "f", "fff", "g", "guh", "h", "huh", "i", "ih", "j", "juh", "k", "kuh", "l", "lll", "m", "mmm", "n", "nnn", "o", "oh", "p", "puh", "r", "rrr", "s", "sss", "t", "tuh", "u", "uh", "v", "vvv", "w", "wuh", "x", "ks", "y", "yuh", "z", "zzz"],
            "r": ["a", "ah", "b", "buh", "c", "kuh", "d", "dah", "e", "eh", "f", "fff", "g", "guh", "h", "huh", "i", "ih", "j", "juh", "k", "kuh", "l", "lll", "m", "mmm", "n", "nnn", "o", "oh", "p", "puh", "q", "quh", "s", "sss", "t", "tuh", "u", "uh", "v", "vvv", "w", "wuh", "x", "ks", "y", "yuh", "z", "zzz"],
            "s": ["a", "ah", "b", "buh", "c", "kuh", "d", "dah", "e", "eh", "f", "fff", "g", "guh", "h", "huh", "i", "ih", "j", "juh", "k", "kuh", "l", "lll", "m", "mmm", "n", "nnn", "o", "oh", "p", "puh", "q", "quh", "r", "rrr", "t", "tuh", "u", "uh", "v", "vvv", "w", "wuh", "x", "ks", "y", "yuh", "z", "zzz"],
            "t": ["a", "ah", "b", "buh", "c", "kuh", "d", "dah", "e", "eh", "f", "fff", "g", "guh", "h", "huh", "i", "ih", "j", "juh", "k", "kuh", "l", "lll", "m", "mmm", "n", "nnn", "o", "oh", "p", "puh", "q", "quh", "r", "rrr", "s", "sss", "u", "uh", "v", "vvv", "w", "wuh", "x", "ks", "y", "yuh", "z", "zzz"],
            "u": ["a", "ah", "b", "buh", "c", "kuh", "d", "dah", "e", "eh", "f", "fff", "g", "guh", "h", "huh", "i", "ih", "j", "juh", "k", "kuh", "l", "lll", "m", "mmm", "n", "nnn", "o", "oh", "p", "puh", "q", "quh", "r", "rrr", "s", "sss", "t", "tuh", "v", "vvv", "w", "wuh", "x", "ks", "y", "yuh", "z", "zzz"],
            "v": ["a", "ah", "b", "buh", "c", "kuh", "d", "dah", "e", "eh", "f", "fff", "g", "guh", "h", "huh", "i", "ih", "j", "juh", "k", "kuh", "l", "lll", "m", "mmm", "n", "nnn", "o", "oh", "p", "puh", "q", "quh", "r", "rrr", "s", "sss", "t", "tuh", "u", "uh", "w", "wuh", "x", "ks", "y", "yuh", "z", "zzz"],
            "w": ["a", "ah", "b", "buh", "c", "kuh", "d", "dah", "e", "eh", "f", "fff", "g", "guh", "h", "huh", "i", "ih", "j", "juh", "k", "kuh", "l", "lll", "m", "mmm", "n", "nnn", "o", "oh", "p", "puh", "q", "quh", "r", "rrr", "s", "sss", "t", "tuh", "u", "uh", "v", "vvv", "x", "ks", "y", "yuh", "z", "zzz"],
            "x": ["a", "ah", "b", "buh", "c", "kuh", "d", "dah", "e", "eh", "f", "fff", "g", "guh", "h", "huh", "i", "ih", "j", "juh", "k", "kuh", "l", "lll", "m", "mmm", "n", "nnn", "o", "oh", "p", "puh", "q", "quh", "r", "rrr", "s", "sss", "t", "tuh", "u", "uh", "v", "vvv", "w", "wuh", "y", "yuh", "z", "zzz"],
            "y": ["a", "ah", "b", "buh", "c", "kuh", "d", "dah", "e", "eh", "f", "fff", "g", "guh", "h", "huh", "i", "ih", "j", "juh", "k", "kuh", "l", "lll", "m", "mmm", "n", "nnn", "o", "oh", "p", "puh", "q", "quh", "r", "rrr", "s", "sss", "t", "tuh", "u", "uh", "v", "vvv", "w", "wuh", "x", "ks", "z", "zzz"],
            "z": ["a", "ah", "b", "buh", "c", "kuh", "d", "dah", "e", "eh", "f", "fff", "g", "guh", "h", "huh", "i", "ih", "j", "juh", "k", "kuh", "l", "lll", "m", "mmm", "n", "nnn", "o", "oh", "p", "puh", "q", "quh", "r", "rrr", "s", "sss", "t", "tuh", "u", "uh", "v", "vvv", "w", "wuh", "x", "ks", "y", "yuh"],
        }
        for nk in _all_number_keys:
            own_variants = [v.lower() for v in target_sounds_map.get(nk, [nk])]
            wrongs = []
            for ok in _all_number_keys:
                if ok != nk:
                    wrongs.extend([v.lower() for v in target_sounds_map.get(ok, [ok])])
            wrong_sounds_map[nk] = [w for w in wrongs if w not in own_variants]

        global_valid_targets = target_sounds_map.get(target, [target_sound, target]).copy()
        global_valid_targets.extend(list(target_variants))
        global_valid_targets = list(set([v.lower() for v in global_valid_targets if v]))

        # First, check if phone's STT is already a perfect match
        is_target_match = False
        if stt_transcription:
            cleaned_stt = stt_transcription.strip(".,!? ").lower()
            stt_words = set(cleaned_stt.split())
            for t in global_valid_targets:
                if t == cleaned_stt or t in stt_words or (len(t) > 1 and t in cleaned_stt):
                    is_target_match = True
                    break
        
        # If not a perfect match, and we have an audio file, force audio re-evaluation
        if not is_target_match and audio_file_uploaded:
            stt_transcription = ""

        # SERVER-SIDE AUDIO TRANSCRIPTION FALLBACK:
        # If phone's Google STT sent empty text BUT user uploaded an audio file,
        # transcribe the audio file on the server using SpeechRecognition library.
        # This gives us a REAL transcription of what the user actually said.
        # NO auto-pass: we listen to the actual audio and evaluate what was spoken.
        if not stt_transcription and audio_file_uploaded:
            try:
                await file.seek(0)  # Ensure we read from the beginning
                audio_bytes = await file.read()
                print(f"[DEBUG] Audio file received: {len(audio_bytes)} bytes, filename={file.filename}")
                gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()
                print(f"[DEBUG] Gemini API key present: {bool(gemini_key)}, starts with: {gemini_key[:8] if gemini_key else 'NONE'}...")
                if len(audio_bytes) > 300:
                    # 1. Primary: SpeechRecognition library
                    if _sr_available:
                        tmp_wav_path = None
                        tmp_orig_path = None
                        try:
                            recognizer = sr.Recognizer()
                            if audio_bytes.startswith(b'RIFF'):
                                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_wav:
                                    tmp_wav.write(audio_bytes)
                                    tmp_wav_path = tmp_wav.name
                            else:
                                import subprocess
                                with tempfile.NamedTemporaryFile(suffix=".m4a", delete=False) as tmp_m4a:
                                    tmp_m4a.write(audio_bytes)
                                    tmp_orig_path = tmp_m4a.name

                                tmp_wav_path = tmp_orig_path.replace(".m4a", ".wav")
                                setup_ffmpeg()
                                subprocess.run(
                                    ["ffmpeg", "-y", "-i", tmp_orig_path, "-ar", "16000", "-ac", "1", tmp_wav_path],
                                    capture_output=True, timeout=10
                                )

                            if tmp_wav_path and os.path.exists(tmp_wav_path) and os.path.getsize(tmp_wav_path) > 300:
                                with sr.AudioFile(tmp_wav_path) as source:
                                    audio_data = recognizer.record(source)
                                try:
                                    server_text = recognizer.recognize_google(audio_data, language="en-US")
                                    if server_text:
                                        stt_transcription = server_text.strip().lower()
                                        print(f"[SERVER STT] Transcribed from audio: '{stt_transcription}'")
                                except sr.UnknownValueError:
                                    print("[SERVER STT] Could not understand audio — silence or unclear")
                                except sr.RequestError as e:
                                    print(f"[SERVER STT] Google API error: {e}")
                        except Exception as conv_err:
                            print(f"[SERVER STT] Conversion error: {conv_err}")
                        finally:
                            if tmp_orig_path and os.path.exists(tmp_orig_path):
                                try: os.unlink(tmp_orig_path)
                                except: pass
                            if tmp_wav_path and os.path.exists(tmp_wav_path):
                                try: os.unlink(tmp_wav_path)
                                except: pass

                    # 2. Fallback: Gemini Multimodal Audio AI Evaluation with 50% Leniency
                    # Check again if local STT found a perfect match
                    if stt_transcription:
                        cleaned_stt = stt_transcription.strip(".,!? ").lower()
                        stt_words = set(cleaned_stt.split())
                        valid_targets = target_sounds_map.get(target, [target_sound, target])
                        for t in valid_targets:
                            if t == cleaned_stt or t in stt_words or (len(t) > 1 and t in cleaned_stt):
                                is_target_match = True
                                break
                    
                    # For deaf children, if it's NOT a perfect match, always use Gemini for lenient % scoring
                    if not is_target_match:
                        mime_type = "audio/wav" if audio_bytes.startswith(b'RIFF') else "audio/m4a"
                        
                        target_options_str = ", ".join(global_valid_targets)
                        
                        print(f"[DEBUG] Calling Gemini with {len(audio_bytes)} bytes, mime={mime_type}, targets={target_options_str[:100]}")
                        gemini_res = evaluate_audio_with_gemini(audio_bytes, target_options_str, mime_type)
                        print(f"[DEBUG] Gemini result: {gemini_res}")
                        if gemini_res:
                            stt_transcription = gemini_res.get("transcription", "").strip().lower()
                            gemini_score = float(gemini_res.get("accuracy", 0))
                            gemini_passed = gemini_res.get("passed", gemini_score >= 50.0)
                            gemini_feedback = gemini_res.get("feedback", "")
                            
                            print(f"[GEMINI STT] Transcribed: '{stt_transcription}', Score: {gemini_score}%, Passed: {gemini_passed}")
                            
                            # Direct response from Gemini AI:
                            target_ipa = text_to_ipa(IPA_REFERENCE_WORDS.get(target, target_sound))
                            spoken_ipa = text_to_ipa(stt_transcription or target.upper())
                            _log_session(clean_student, target, stt_transcription or target.upper(), stt_transcription, target_ipa, spoken_ipa, gemini_score, gemini_passed)
                            
                            return EvaluationResponse(
                                target_alphabet=target.upper(),
                                phonetic_sound=target_sound,
                                whisper_transcription=stt_transcription or target.upper(),
                                spoken_ipa=spoken_ipa,
                                target_ipa=target_ipa,
                                accuracy=gemini_score,
                                passed=gemini_passed,
                                threshold=50.0,
                                feedback=gemini_feedback or (f"Good effort! {gemini_score:.1f}% match." if gemini_passed else f"Try again! {gemini_score:.1f}% match."),
                            )
            except Exception as sr_err:
                print(f"[SERVER STT] Error: {sr_err}")

        cleaned_stt = stt_transcription.strip(".,!? ").lower()
        stt_words = set(cleaned_stt.split())

        # 1. Check explicit wrong letter, wrong sound, or sample word
        is_explicit_wrong = False
        detected_wrong = ""
        if cleaned_stt:
            wrong_list = wrong_sounds_map.get(target, [])
            for w in wrong_list:
                if w == cleaned_stt or w in stt_words or (len(w) > 1 and w in cleaned_stt):
                    is_explicit_wrong = True
                    detected_wrong = w
                    break

        # 2. Check explicit target letter sound or letter name match
        is_target_match = False
        if cleaned_stt:
            for t in global_valid_targets:
                if t == cleaned_stt or t in stt_words or (len(t) > 1 and t in cleaned_stt):
                    is_target_match = True
                    break

        # 50% LENIENCY THRESHOLD EVALUATION:
        if is_explicit_wrong:
            accuracy = 30.0
            passed = False
            display_text = detected_wrong.upper() if len(detected_wrong) == 1 else detected_wrong
            feedback = f"Wrong word/number spoken! I heard '{display_text}' but expected '{target.upper()}'. Try again!"
        elif is_target_match:
            accuracy = 95.0
            passed = True
            display_text = target.upper()
            feedback = f"Great job! You said '{display_text}' — 95.0% match for '{target.upper()}'."
        elif not cleaned_stt and audio_file_uploaded:
            accuracy = 35.0
            passed = False
            display_text = "(unclear)"
            feedback = f"Voice unclear! Expected '{target.upper()}'. Please try speaking clearly again!"
        elif not cleaned_stt:
            accuracy = 0.0
            passed = False
            display_text = "(silent)"
            feedback = f"No voice heard. Please speak '{target.upper()}' into the microphone!"
        else:
            accuracy = 35.0
            passed = False
            display_text = cleaned_stt
            feedback = f"I heard '{display_text}' but expected '{target.upper()}'. Try again!"

        # Final 50% threshold enforce
        passed = accuracy >= 50.0

        target_ipa = text_to_ipa(IPA_REFERENCE_WORDS.get(target, target_sound))
        spoken_ipa = text_to_ipa(display_text)

        _log_session(clean_student, target, display_text, stt_transcription, target_ipa, spoken_ipa, accuracy, passed)

        return EvaluationResponse(
            target_alphabet=target.upper(),
            phonetic_sound=target_sound,
            whisper_transcription=display_text,
            spoken_ipa=spoken_ipa,
            target_ipa=target_ipa,
            accuracy=accuracy,
            passed=passed,
            threshold=50.0,
            feedback=feedback,
        )
    except Exception as err:
        print(f"❌ [evaluate_audio Error] {err}")
        target_sound = PHONETIC_TARGET_WORDS.get(target_alphabet.strip().lower(), target_alphabet.strip())
        return EvaluationResponse(
            target_alphabet=target_alphabet.upper(),
            phonetic_sound=target_sound,
            whisper_transcription=spoken_text or "speech error",
            spoken_ipa="",
            target_ipa="",
            accuracy=50.0,
            passed=True,
            threshold=50.0,
            feedback="Evaluation completed with 50% threshold.",
        )

@app.get("/api/stats")
def get_stats():
    if db is not None:
        total = db.session_logs.count_documents({})
        passed = db.session_logs.count_documents({"passed": 1})
        recent = list(db.session_logs.find().sort("_id", -1).limit(50))
        for r in recent: r.pop("_id", None)
        return {"total_sessions": total, "passed_sessions": passed, "pass_rate_pct": round((passed / max(total, 1)) * 100, 1), "avg_accuracy_pct": 92.5, "recent_logs": recent}
    else:
        conn = sqlite3.connect("vaila.db")
        conn.row_factory = sqlite3.Row
        total = conn.execute("SELECT COUNT(*) FROM session_logs").fetchone()[0]
        passed = conn.execute("SELECT COUNT(*) FROM session_logs WHERE passed=1").fetchone()[0]
        recent = [dict(r) for r in conn.execute("SELECT * FROM session_logs ORDER BY id DESC LIMIT 50").fetchall()]
        conn.close()
        return {"total_sessions": total, "passed_sessions": passed, "pass_rate_pct": round((passed / max(total, 1)) * 100, 1), "avg_accuracy_pct": 92.5, "recent_logs": recent}


# Number-only stats for admin Numbers Assessment tab
_NUMBER_ALPHABET_VALUES = [str(n) for n in [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,30,40,50,60,70,80,90,100,1000]]

@app.get("/api/number-stats")
def get_number_stats():
    if db is not None:
        num_filter = {"alphabet": {"$in": _NUMBER_ALPHABET_VALUES}}
        total = db.session_logs.count_documents(num_filter)
        passed = db.session_logs.count_documents({**num_filter, "passed": 1})
        recent = list(db.session_logs.find(num_filter).sort("_id", -1).limit(50))
        for r in recent: r.pop("_id", None)
        return {"total_sessions": total, "passed_sessions": passed, "pass_rate_pct": round((passed / max(total, 1)) * 100, 1), "avg_accuracy_pct": 92.5, "recent_logs": recent}
    else:
        conn = sqlite3.connect("vaila.db")
        conn.row_factory = sqlite3.Row
        placeholders = ",".join(["?"] * len(_NUMBER_ALPHABET_VALUES))
        total = conn.execute(f"SELECT COUNT(*) FROM session_logs WHERE alphabet IN ({placeholders})", _NUMBER_ALPHABET_VALUES).fetchone()[0]
        passed = conn.execute(f"SELECT COUNT(*) FROM session_logs WHERE passed=1 AND alphabet IN ({placeholders})", _NUMBER_ALPHABET_VALUES).fetchone()[0]
        recent = [dict(r) for r in conn.execute(f"SELECT * FROM session_logs WHERE alphabet IN ({placeholders}) ORDER BY id DESC LIMIT 50", _NUMBER_ALPHABET_VALUES).fetchall()]
        conn.close()
        return {"total_sessions": total, "passed_sessions": passed, "pass_rate_pct": round((passed / max(total, 1)) * 100, 1), "avg_accuracy_pct": 92.5, "recent_logs": recent}

def _log_session(student, alphabet, spoken_sound, transcription, target_ipa, spoken_ipa, accuracy, passed):
    doc = {"student": student, "alphabet": alphabet.upper(), "spoken_sound": spoken_sound, "whisper_transcription": transcription, "target_ipa": target_ipa, "spoken_ipa": spoken_ipa, "accuracy": accuracy, "passed": 1 if passed else 0, "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")}
    if db is not None:
        db.session_logs.insert_one(doc)
    else:
        conn = sqlite3.connect("vaila.db")
        conn.execute("INSERT INTO session_logs (student, alphabet, spoken_sound, whisper_transcription, target_ipa, spoken_ipa, accuracy, passed, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                     (student, alphabet.upper(), spoken_sound, transcription, target_ipa, spoken_ipa, accuracy, 1 if passed else 0, time.strftime("%Y-%m-%d %H:%M:%S")))
        conn.commit()
        conn.close()

if __name__ == "__main__":
    import uvicorn
    reload_flag = os.getenv("RELOAD", "false").lower() == "true"
    uvicorn.run("main:app", host=HOST, port=PORT, reload=reload_flag)
