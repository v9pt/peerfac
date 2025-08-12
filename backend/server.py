from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any
import uuid
from datetime import datetime

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="PeerFact API", version="0.1.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# --------------------------------------
# Models
# --------------------------------------
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class StatusCheckCreate(BaseModel):
    client_name: str


class UserCreate(BaseModel):
    username: Optional[str] = None


class UserModel(BaseModel):
    id: str
    username: str
    reputation: float = 1.0
    created_at: datetime


class ClaimCreate(BaseModel):
    author_id: str
    text: str
    link: Optional[str] = None
    media_base64: Optional[str] = None  # keep base64 to avoid file storage
    tags: Optional[List[str]] = None


class ClaimModel(BaseModel):
    id: str
    author_id: str
    text: str
    link: Optional[str] = None
    media_base64: Optional[str] = None
    ai_summary: Optional[str] = None
    ai_label: Optional[str] = None
    created_at: datetime
    support_count: int = 0
    refute_count: int = 0
    unclear_count: int = 0
    confidence: float = 0.0


class VerificationCreate(BaseModel):
    author_id: str
    stance: Literal['support', 'refute', 'unclear']
    source_url: Optional[str] = None
    explanation: Optional[str] = None


class VerificationModel(BaseModel):
    id: str
    claim_id: str
    author_id: str
    stance: Literal['support', 'refute', 'unclear']
    source_url: Optional[str] = None
    explanation: Optional[str] = None
    created_at: datetime


# --------------------------------------
# Utilities
# --------------------------------------
async def get_user(user_id: str) -> Optional[Dict[str, Any]]:
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    return user


async def get_user_rep(user_id: str) -> float:
    user = await get_user(user_id)
    if not user:
        return 1.0
    return float(user.get("reputation", 1.0))


async def compute_verdict(claim_id: str) -> Dict[str, Any]:
    """Compute weighted stance and confidence from verifications."""
    verifs = await db.verifications.find({"claim_id": claim_id}, {"_id": 0}).to_list(1000)
    if not verifs:
        return {"label": "Unverified", "confidence": 0.0, "support": 0, "refute": 0, "unclear": 0}

    weights = {"support": 0.0, "refute": 0.0, "unclear": 0.0}
    counts = {"support": 0, "refute": 0, "unclear": 0}

    for v in verifs:
        rep = await get_user_rep(v["author_id"])  # weight by reputation
        weights[v["stance"]] += rep
        counts[v["stance"]] += 1

    # Decide label and confidence
    label = max(weights, key=weights.get)
    total_weight = sum(weights.values()) or 1.0
    confidence = float(weights[label] / total_weight)

    # Map to human label
    label_map = {"support": "Mostly True", "refute": "Mostly False", "unclear": "Unclear"}
    human_label = label_map[label]

    return {
        "label": human_label,
        "confidence": round(confidence, 3),
        "support": counts["support"],
        "refute": counts["refute"],
        "unclear": counts["unclear"],
    }


async def try_ai_analyze(text: str) -> Dict[str, str]:
    """Use emergentintegrations if available and key is set, else return heuristic summary."""
    try:
        # Lazy import to avoid startup failure if not installed
        from emergentintegrations.llm.chat import LlmChat, UserMessage  # type: ignore
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if api_key:
            chat = LlmChat(api_key=api_key, session_id=f"peerfact-{uuid.uuid4()}", system_message="You are a concise fact-checking assistant. Summarize the claim in one sentence and classify it as Likely True / Likely False / Unclear without overclaiming. Respond in JSON with keys: summary, label.")
            # default model per playbook if not otherwise specified
            chat = chat.with_model("openai", "gpt-4o-mini")
            user_message = UserMessage(text=f"Claim: {text}\nReturn compact JSON only.")
            result = await chat.send_message(user_message)
            # Try parsing as JSON-like
            import json
            try:
                data = json.loads(result)
                summary = str(data.get("summary") or "")
                label = str(data.get("label") or "Unclear")
            except Exception:
                # Fallback to plain text processing
                summary = str(result)[:300]
                label = "Unclear"
            return {"summary": summary, "label": label}
    except Exception:
        # Any failure falls through to heuristic
        pass

    # Heuristic fallback
    snippet = text.strip().replace("\n", " ")
    summary = (snippet[:240] + "…") if len(snippet) > 240 else snippet
    # naive label detection
    lowered = text.lower()
    if any(k in lowered for k in ["satire", "parody"]):
        label = "Unclear"
    elif any(k in lowered for k in ["fake", "hoax", "debunk"]):
        label = "Likely False"
    elif any(k in lowered for k in ["official", "press release", "confirmed"]):
        label = "Likely True"
    else:
        label = "Unclear"
    return {"summary": summary, "label": label}


def clean_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    doc = dict(doc)
    doc.pop("_id", None)
    return doc


# --------------------------------------
# Routes
# --------------------------------------
@api_router.get("/")
async def root():
    return {"message": "PeerFact API is live"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    await db.status_checks.insert_one(status_obj.dict())
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    return [StatusCheck(**s) for s in status_checks]


@api_router.post("/users/bootstrap", response_model=UserModel)
async def users_bootstrap(body: UserCreate):
    username = body.username or f"anon-{str(uuid.uuid4())[:8]}"
    user = {
        "id": str(uuid.uuid4()),
        "username": username,
        "reputation": 1.0,
        "created_at": datetime.utcnow(),
    }
    await db.users.insert_one(user)
    return UserModel(**clean_doc(user))


@api_router.post("/claims", response_model=ClaimModel)
async def create_claim(body: ClaimCreate):
    # minimal author validation
    author = await get_user(body.author_id)
    if not author:
        raise HTTPException(status_code=400, detail="Invalid author_id")

    claim_id = str(uuid.uuid4())
    now = datetime.utcnow()

    ai = await try_ai_analyze(body.text)

    doc = {
        "id": claim_id,
        "author_id": body.author_id,
        "text": body.text,
        "link": body.link,
        "media_base64": body.media_base64,
        "created_at": now,
        "ai_summary": ai.get("summary"),
        "ai_label": ai.get("label"),
        "support_count": 0,
        "refute_count": 0,
        "unclear_count": 0,
        "confidence": 0.0,
    }

    await db.claims.insert_one(doc)
    return ClaimModel(**clean_doc(doc))


@api_router.get("/claims", response_model=List[ClaimModel])
async def list_claims():
    claims = await db.claims.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)

    # Attach latest computed verdict to each
    enriched: List[ClaimModel] = []
    for c in claims:
        verdict = await compute_verdict(c["id"])
        c = dict(c)
        # update counts and confidence for display
        c["support_count"] = verdict.get("support", 0)
        c["refute_count"] = verdict.get("refute", 0)
        c["unclear_count"] = verdict.get("unclear", 0)
        c["confidence"] = float(verdict.get("confidence", 0.0))
        enriched.append(ClaimModel(**c))
    return enriched


@api_router.get("/claims/{claim_id}")
async def get_claim(claim_id: str):
    claim = await db.claims.find_one({"id": claim_id})
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    claim = clean_doc(claim)

    verifs = await db.verifications.find({"claim_id": claim_id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    verdict = await compute_verdict(claim_id)

    return {"claim": claim, "verifications": verifs, "verdict": verdict}


@api_router.post("/claims/{claim_id}/verify", response_model=VerificationModel)
async def add_verification(claim_id: str, body: VerificationCreate):
    # validate
    claim = await db.claims.find_one({"id": claim_id})
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    if not await get_user(body.author_id):
        raise HTTPException(status_code=400, detail="Invalid author_id")

    doc = {
        "id": str(uuid.uuid4()),
        "claim_id": claim_id,
        "author_id": body.author_id,
        "stance": body.stance,
        "source_url": body.source_url,
        "explanation": body.explanation,
        "created_at": datetime.utcnow(),
    }
    await db.verifications.insert_one(doc)

    # Optional: light-touch reputation update aligning with current majority
    current = await compute_verdict(claim_id)
    align_map = {"Mostly True": "support", "Mostly False": "refute", "Unclear": "unclear"}
    align_key = align_map.get(current.get("label", "Unclear"), "unclear")
    if body.stance == align_key:
        await db.users.update_one({"id": body.author_id}, {"$inc": {"reputation": 0.1}})
    else:
        await db.users.update_one({"id": body.author_id}, {"$inc": {"reputation": -0.05}})

    return VerificationModel(**clean_doc(doc))


@api_router.get("/claims/{claim_id}/verdict")
async def claim_verdict(claim_id: str):
    # ensure claim exists
    if not await db.claims.find_one({"id": claim_id}):
        raise HTTPException(status_code=404, detail="Claim not found")
    verdict = await compute_verdict(claim_id)
    return verdict


@api_router.post("/analyze/claim")
async def analyze_claim(body: Dict[str, str]):
    text = body.get("text")
    if not text:
        raise HTTPException(status_code=400, detail="text required")
    res = await try_ai_analyze(text)
    return res


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()