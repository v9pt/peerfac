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
from urllib.parse import urlparse

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="PeerFact API", version="0.2.0")

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


# Payments models
class CreateCheckoutRequest(BaseModel):
    package_id: str
    origin_url: Optional[str] = None
    # metadata will be added on backend


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

    label_key = max(weights, key=weights.get)
    total_weight = sum(weights.values()) or 1.0
    confidence = float(weights[label_key] / total_weight)

    label_map = {"support": "Mostly True", "refute": "Mostly False", "unclear": "Unclear"}
    human_label = label_map[label_key]

    return {
        "label": human_label,
        "confidence": round(confidence, 3),
        "support": counts["support"],
        "refute": counts["refute"],
        "unclear": counts["unclear"],
    }


async def try_ai_analyze(text: str, link: Optional[str] = None) -> Dict[str, Any]:
    """Enhanced AI analysis using the advanced AI engine"""
    try:
        from advanced_ai_engine import ai_engine
        
        # Use the comprehensive analysis from our advanced AI engine
        result = await ai_engine.comprehensive_analysis(text, link)
        
        # Convert to the expected format for backward compatibility
        return {
            "summary": result.summary,
            "label": result.label,
            "confidence": result.confidence,
            "reasoning": result.reasoning,
            "entities": result.entities,
            "bias_score": result.bias_score,
            "stance": result.stance,
            "evidence_quality": result.evidence_quality,
            "temporal_relevance": result.temporal_relevance,
            "contradiction_flags": result.contradiction_flags,
            "verification_suggestions": result.verification_suggestions,
            "sources_analysis": result.sources_analysis
        }
        
    except Exception as e:
        logging.error(f"Advanced AI analysis failed: {e}")
        
        # Fallback to basic analysis
        api_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("EMERGENT_LLM_KEY")
        if api_key:
            try:
                from emergentintegrations.llm.chat import LlmChat, UserMessage  # type: ignore
                chat = LlmChat(
                    api_key=api_key,
                    session_id=f"peerfact-{uuid.uuid4()}",
                    system_message=(
                        "You are an advanced fact-checking assistant. Analyze the claim comprehensively "
                        "and classify it with high accuracy. Consider context, verifiability, and nuance. "
                        "Respond in JSON with keys: summary, label, reasoning, confidence (0-1)."
                    ),
                )
                chat = chat.with_model("openai", "gpt-4o-mini")
                user_message = UserMessage(text=f"Claim: {text}\nSource URL: {link or 'None'}\nReturn detailed JSON analysis.")
                result = await chat.send_message(user_message)
                
                import json
                try:
                    data = json.loads(result)
                    return {
                        "summary": str(data.get("summary") or ""),
                        "label": str(data.get("label") or "Unclear"),
                        "confidence": float(data.get("confidence", 0.5)),
                        "reasoning": str(data.get("reasoning", "")),
                        "entities": [],
                        "bias_score": 0.5,
                        "stance": "neutral",
                        "evidence_quality": "medium",
                        "temporal_relevance": 0.5,
                        "contradiction_flags": [],
                        "verification_suggestions": [],
                        "sources_analysis": []
                    }
                except Exception:
                    summary = str(result)[:300] if result else text[:240] + "..."
                    return {
                        "summary": summary,
                        "label": "Unclear", 
                        "confidence": 0.3,
                        "reasoning": "Basic analysis due to parsing error",
                        "entities": [],
                        "bias_score": 0.5,
                        "stance": "neutral", 
                        "evidence_quality": "medium",
                        "temporal_relevance": 0.5,
                        "contradiction_flags": [],
                        "verification_suggestions": [],
                        "sources_analysis": []
                    }
            except Exception as inner_e:
                logging.error(f"Fallback AI analysis also failed: {inner_e}")
                pass

        # Final heuristic fallback
        snippet = text.strip().replace("\n", " ")
        summary = (snippet[:240] + "…") if len(snippet) > 240 else snippet
        lowered = text.lower()
        
        if any(k in lowered for k in ["satire", "parody"]):
            label = "Satire/Humor"
        elif any(k in lowered for k in ["fake", "hoax", "debunk"]):
            label = "Likely False"
        elif any(k in lowered for k in ["official", "press release", "confirmed"]):
            label = "Likely True"
        else:
            label = "Unclear"
            
        return {
            "summary": summary,
            "label": label,
            "confidence": 0.2,
            "reasoning": "Heuristic analysis - manual verification recommended",
            "entities": [],
            "bias_score": 0.5,
            "stance": "neutral",
            "evidence_quality": "unknown",
            "temporal_relevance": 0.5,
            "contradiction_flags": [],
            "verification_suggestions": ["Manual fact-checking required"],
            "sources_analysis": []
        }


def clean_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    doc = dict(doc)
    doc.pop("_id", None)
    return doc


# --------------------------------------
# Routes: Core
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

    enriched: List[ClaimModel] = []
    for c in claims:
        verdict = await compute_verdict(c["id"])
        c = dict(c)
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

    # reputation tweak
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


# --------------------------------------
# Routes: Leaderboard & Source Reliability (Phase 2)
# --------------------------------------
@api_router.get("/leaderboard/users")
async def leaderboard_users(limit: int = 20):
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    # compute verifications count and alignment rate
    verifs = await db.verifications.find({}, {"_id": 0}).to_list(5000)

    # group by user
    stats: Dict[str, Dict[str, Any]] = {}
    for u in users:
        stats[u["id"]] = {"user": u, "verif_count": 0, "aligned": 0}

    # alignment vs current majority
    for v in verifs:
        stats.setdefault(v["author_id"], {"user": {"id": v["author_id"], "username": "unknown", "reputation": 1.0}, "verif_count": 0, "aligned": 0})
        stats[v["author_id"]]["verif_count"] += 1
        try:
            verdict = await compute_verdict(v["claim_id"])  # can be cached later
            align_map = {"Mostly True": "support", "Mostly False": "refute", "Unclear": "unclear"}
            if v["stance"] == align_map.get(verdict.get("label", "Unclear"), "unclear"):
                stats[v["author_id"]]["aligned"] += 1
        except Exception:
            pass

    # build list
    rows = []
    for user_id, d in stats.items():
        verif_count = d["verif_count"]
        aligned = d["aligned"]
        acc = (aligned / verif_count) if verif_count else 0.0
        rows.append({
            "id": user_id,
            "username": d["user"].get("username", "unknown"),
            "reputation": round(float(d["user"].get("reputation", 1.0)), 3),
            "verifications": verif_count,
            "accuracy": round(acc, 3),
        })

    rows.sort(key=lambda r: (r["reputation"], r["accuracy"], r["verifications"]), reverse=True)
    return rows[:limit]


@api_router.get("/leaderboard/sources")
async def leaderboard_sources(limit: int = 20):
    verifs = await db.verifications.find({}, {"_id": 0}).to_list(5000)
    by_domain: Dict[str, Dict[str, Any]] = {}

    def get_domain(u: Optional[str]) -> Optional[str]:
        if not u:
            return None
        try:
            d = urlparse(u).netloc or None
            return d.lower() if d else None
        except Exception:
            return None

    for v in verifs:
        domain = get_domain(v.get("source_url"))
        if not domain:
            continue
        if domain not in by_domain:
            by_domain[domain] = {"domain": domain, "total": 0, "aligned": 0}
        by_domain[domain]["total"] += 1
        try:
            verdict = await compute_verdict(v["claim_id"])  # uses current majority
            align_map = {"Mostly True": "support", "Mostly False": "refute", "Unclear": "unclear"}
            if v["stance"] == align_map.get(verdict.get("label", "Unclear"), "unclear"):
                by_domain[domain]["aligned"] += 1
        except Exception:
            pass

    rows = []
    for d in by_domain.values():
        acc = (d["aligned"] / d["total"]) if d["total"] else 0.0
        rows.append({"domain": d["domain"], "samples": d["total"], "reliability": round(acc, 3)})

    rows.sort(key=lambda r: (r["reliability"], r["samples"]), reverse=True)
    return rows[:limit]


# --------------------------------------
# Routes: Stripe Payments (Phase 2)
# --------------------------------------
PACKAGES = {  # server-side only pricing, amounts are floats in USD
    "starter": 5.00,
    "pro": 15.00,
    "donation": 3.00,
}


@api_router.post("/payments/v1/checkout/session")
async def create_checkout_session(req: CreateCheckoutRequest, http_request: Request):
    api_key = os.environ.get("STRIPE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Stripe not configured")

    try:
        from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stripe library missing: {e}")

    package_id = req.package_id
    if package_id not in PACKAGES:
        raise HTTPException(status_code=400, detail="Invalid package")

    amount = float(PACKAGES[package_id])
    currency = "usd"

    # Build success/cancel URLs from origin
    origin = req.origin_url or http_request.headers.get("origin")
    if not origin:
        # Try reconstruct from request
        base = str(http_request.base_url).rstrip('/')
        origin = base
    success_url = f"{origin}?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = origin

    # Initialize stripe checkout
    host_url = str(http_request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)

    metadata = {"package": package_id}
    checkoutrequest = CheckoutSessionRequest(amount=amount, currency=currency, success_url=success_url, cancel_url=cancel_url, metadata=metadata)
    session = await stripe_checkout.create_checkout_session(checkoutrequest)

    # record payment transaction (pending)
    tx = {
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "status": "initiated",
        "payment_status": "pending",
        "amount": amount,
        "currency": currency,
        "package": package_id,
        "metadata": metadata,
        "created_at": datetime.utcnow(),
    }
    await db.payment_transactions.insert_one(tx)

    return {"url": session.url, "session_id": session.session_id}


@api_router.get("/payments/v1/checkout/status/{session_id}")
async def checkout_status(session_id: str):
    api_key = os.environ.get("STRIPE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Stripe not configured")

    try:
        from emergentintegrations.payments.stripe.checkout import StripeCheckout
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stripe library missing: {e}")

    # Initialize
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")
    status = await stripe_checkout.get_checkout_status(session_id)

    # Update once
    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {"$set": {
            "status": status.status,
            "payment_status": status.payment_status,
            "amount": status.amount_total / 100.0 if status.amount_total else None,
            "currency": status.currency,
            "metadata": status.metadata,
            "updated_at": datetime.utcnow(),
        }},
        upsert=True,
    )

    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency,
        "metadata": status.metadata,
    }


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    api_key = os.environ.get("STRIPE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Stripe not configured")

    try:
        from emergentintegrations.payments.stripe.checkout import StripeCheckout
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stripe library missing: {e}")

    body = await request.body()
    sig = request.headers.get("Stripe-Signature")

    # host for webhook init
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)

    webhook_response = await stripe_checkout.handle_webhook(body, sig)

    # Update DB
    await db.payment_transactions.update_one(
        {"session_id": webhook_response.session_id},
        {"$set": {
            "webhook_event": webhook_response.event_type,
            "payment_status": webhook_response.payment_status,
            "metadata": webhook_response.metadata,
            "updated_at": datetime.utcnow(),
        }},
        upsert=True,
    )

    return {"ok": True}


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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 8001)),
    )