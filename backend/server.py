from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Literal, Dict, Any
import uuid
from datetime import datetime, timedelta
from urllib.parse import urlparse
from passlib.context import CryptContext
from jose import JWTError, jwt
import re

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

# Authentication setup
SECRET_KEY = os.environ.get("SECRET_KEY", "peerfact-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)


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


class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserModel(BaseModel):
    id: str
    username: str
    email: Optional[str] = None
    is_anonymous: bool = False
    reputation: float = 1.0
    created_at: datetime
    last_login: Optional[datetime] = None


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[str] = None


class PasswordReset(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)


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
    ai_confidence: Optional[float] = None
    ai_reasoning: Optional[str] = None
    ai_entities: Optional[List[Dict[str, Any]]] = None
    ai_bias_score: Optional[float] = None
    ai_stance: Optional[str] = None
    ai_evidence_quality: Optional[str] = None
    ai_temporal_relevance: Optional[float] = None
    ai_contradiction_flags: Optional[List[str]] = None
    ai_verification_suggestions: Optional[List[str]] = None
    ai_sources_analysis: Optional[List[Dict[str, Any]]] = None
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
# Authentication Utilities
# --------------------------------------
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def validate_password(password: str) -> tuple[bool, str]:
    """Validate password strength"""
    if len(password) < 6:
        return False, "Password must be at least 6 characters long"
    if len(password) > 128:
        return False, "Password must be less than 128 characters"
    if not re.search(r"[A-Za-z]", password):
        return False, "Password must contain at least one letter"
    if not re.search(r"[0-9]", password):
        return False, "Password must contain at least one number"
    return True, "Valid password"


def validate_username(username: str) -> tuple[bool, str]:
    """Validate username format"""
    if len(username) < 3:
        return False, "Username must be at least 3 characters long"
    if len(username) > 50:
        return False, "Username must be less than 50 characters"
    if not re.match(r"^[a-zA-Z0-9_-]+$", username):
        return False, "Username can only contain letters, numbers, hyphens, and underscores"
    return True, "Valid username"


async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[Dict[str, Any]]:
    """Get current user from JWT token - returns None if no token or invalid token"""
    if not credentials:
        return None
    
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        token_data = TokenData(user_id=user_id)
    except JWTError:
        return None
    
    user = await get_user(token_data.user_id)
    if user is None:
        return None
    return user


async def get_current_active_user(current_user: Optional[Dict[str, Any]] = Depends(get_current_user)) -> Dict[str, Any]:
    """Get current user - requires authentication"""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user


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
        api_key = os.environ.get("EMERGENT_LLM_KEY") or os.environ.get("OPENAI_API_KEY")
        if api_key:
            try:
                from emergentintegrations.llm.chat import LlmChat, UserMessage  # type: ignore
                
                system_message = (
                    "You are an advanced fact-checking assistant. Analyze claims comprehensively and classify them with high accuracy. "
                    "Consider context, verifiability, and nuance. Always respond in valid JSON format with these exact keys: "
                    "summary (brief overview), label (one of: 'Likely True', 'Likely False', 'Unclear', 'Satire/Humor'), "
                    "reasoning (detailed explanation), confidence (number between 0 and 1). Be precise and objective."
                )
                
                chat = LlmChat(
                    api_key=api_key,
                    session_id=f"peerfact-{uuid.uuid4()}",
                    system_message=system_message
                )
                chat = chat.with_model("openai", "gpt-4o-mini")
                
                analysis_prompt = f"""
                Claim to analyze: "{text}"
                Source URL: {link or 'None provided'}
                
                Provide a comprehensive fact-check analysis in JSON format with:
                - summary: Brief factual summary
                - label: Classification (Likely True/Likely False/Unclear/Satire/Humor)
                - reasoning: Detailed explanation of your analysis
                - confidence: Confidence score (0.0 to 1.0)
                
                Return only valid JSON, no other text.
                """
                
                user_message = UserMessage(text=analysis_prompt)
                result = await chat.send_message(user_message)
                
                import json
                try:
                    # Clean the response to extract JSON
                    result_clean = result.strip()
                    if result_clean.startswith('```json'):
                        result_clean = result_clean[7:]
                    if result_clean.endswith('```'):
                        result_clean = result_clean[:-3]
                    result_clean = result_clean.strip()
                    
                    data = json.loads(result_clean)
                    return {
                        "summary": str(data.get("summary", "Analysis completed")),
                        "label": str(data.get("label", "Unclear")),
                        "confidence": float(data.get("confidence", 0.5)),
                        "reasoning": str(data.get("reasoning", "AI analysis performed")),
                        "entities": [],
                        "bias_score": 0.5,
                        "stance": "neutral",
                        "evidence_quality": "medium",
                        "temporal_relevance": 0.5,
                        "contradiction_flags": [],
                        "verification_suggestions": ["Manual verification recommended"],
                        "sources_analysis": []
                    }
                except json.JSONDecodeError:
                    # If JSON parsing fails, use the raw result as summary
                    summary = str(result)[:300] if result else text[:240] + "..."
                    
                    # Simple heuristic labeling as fallback
                    lowered = text.lower()
                    if any(k in lowered for k in ["fake", "hoax", "debunk", "false"]):
                        label = "Likely False"
                        confidence = 0.7
                    elif any(k in lowered for k in ["official", "confirmed", "verified", "true"]):
                        label = "Likely True"
                        confidence = 0.7
                    elif any(k in lowered for k in ["satire", "parody", "joke"]):
                        label = "Satire/Humor"
                        confidence = 0.8
                    else:
                        label = "Unclear"
                        confidence = 0.4
                    
                    return {
                        "summary": summary,
                        "label": label,
                        "confidence": confidence,
                        "reasoning": "AI provided non-JSON response, applied heuristic analysis",
                        "entities": [],
                        "bias_score": 0.5,
                        "stance": "neutral", 
                        "evidence_quality": "medium",
                        "temporal_relevance": 0.5,
                        "contradiction_flags": [],
                        "verification_suggestions": ["Manual verification recommended"],
                        "sources_analysis": []
                    }
                    
            except Exception as inner_e:
                logging.error(f"Fallback AI analysis also failed: {inner_e}")
                pass

        # Final heuristic fallback
        snippet = text.strip().replace("\n", " ")
        summary = (snippet[:240] + "…") if len(snippet) > 240 else snippet
        lowered = text.lower()
        
        if any(k in lowered for k in ["satire", "parody", "joke", "humor"]):
            label = "Satire/Humor"
            confidence = 0.8
        elif any(k in lowered for k in ["fake", "hoax", "debunk", "false", "misinformation"]):
            label = "Likely False"
            confidence = 0.6
        elif any(k in lowered for k in ["official", "press release", "confirmed", "verified"]):
            label = "Likely True"
            confidence = 0.6
        else:
            label = "Unclear"
            confidence = 0.3
            
        return {
            "summary": summary,
            "label": label,
            "confidence": confidence,
            "reasoning": "Heuristic analysis - AI services unavailable, manual verification recommended",
            "entities": [],
            "bias_score": 0.5,
            "stance": "neutral",
            "evidence_quality": "unknown",
            "temporal_relevance": 0.5,
            "contradiction_flags": [],
            "verification_suggestions": ["Manual fact-checking required", "Verify with reliable sources"],
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


# --------------------------------------
# Routes: Authentication
# --------------------------------------
@api_router.post("/auth/register", response_model=dict)
async def register_user(user: UserRegister):
    # Validate password strength
    password_valid, password_msg = validate_password(user.password)
    if not password_valid:
        raise HTTPException(status_code=400, detail=password_msg)
    
    # Validate username format
    username_valid, username_msg = validate_username(user.username)
    if not username_valid:
        raise HTTPException(status_code=400, detail=username_msg)
    
    # Check if email already exists
    existing_user = await db.users.find_one({"email": user.email.lower()})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if username already exists
    existing_username = await db.users.find_one({"username": user.username})
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    user_data = {
        "id": str(uuid.uuid4()),
        "username": user.username,
        "email": user.email.lower(),
        "password_hash": hashed_password,
        "is_anonymous": False,
        "reputation": 1.0,
        "created_at": datetime.utcnow(),
        "last_login": None,
    }
    
    await db.users.insert_one(user_data)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_data["id"]}, expires_delta=access_token_expires
    )
    
    # Update last login
    await db.users.update_one(
        {"id": user_data["id"]}, 
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    return {
        "message": "User registered successfully",
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserModel(**clean_doc(user_data))
    }


@api_router.post("/auth/login", response_model=dict)
async def login_user(user_credentials: UserLogin):
    # Find user by email
    user = await db.users.find_one({"email": user_credentials.email.lower()})
    if not user or not verify_password(user_credentials.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["id"]}, expires_delta=access_token_expires
    )
    
    # Update last login
    await db.users.update_one(
        {"id": user["id"]}, 
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserModel(**clean_doc(user))
    }


@api_router.get("/auth/me", response_model=UserModel)
async def get_current_user_info(current_user: dict = Depends(get_current_active_user)):
    return UserModel(**current_user)


@api_router.post("/auth/logout")
async def logout_user(current_user: dict = Depends(get_current_active_user)):
    # In a real implementation, you might want to blacklist the token
    # For now, we'll just return a success message
    return {"message": "Successfully logged out"}


@api_router.post("/users/bootstrap", response_model=UserModel)
async def users_bootstrap(body: UserCreate):
    """Create anonymous user - kept for backward compatibility"""
    username = body.username or f"anon-{str(uuid.uuid4())[:8]}"
    user = {
        "id": str(uuid.uuid4()),
        "username": username,
        "is_anonymous": True,
        "reputation": 1.0,
        "created_at": datetime.utcnow(),
    }
    await db.users.insert_one(user)
    return UserModel(**clean_doc(user))


@api_router.post("/claims", response_model=ClaimModel)
async def create_claim(body: ClaimCreate, current_user: Optional[dict] = Depends(get_current_user)):
    # If user is authenticated, use their ID, otherwise validate the provided author_id
    if current_user:
        author_id = current_user["id"]
        author = current_user
    else:
        author = await get_user(body.author_id)
        if not author:
            raise HTTPException(status_code=400, detail="Invalid author_id")
        author_id = body.author_id

    claim_id = str(uuid.uuid4())
    now = datetime.utcnow()

    # Enhanced AI analysis with source URL
    ai_result = await try_ai_analyze(body.text, body.link)

    doc = {
        "id": claim_id,
        "author_id": author_id,
        "text": body.text,
        "link": body.link,
        "media_base64": body.media_base64,
        "created_at": now,
        "ai_summary": ai_result.get("summary"),
        "ai_label": ai_result.get("label"),
        "ai_confidence": ai_result.get("confidence", 0.5),
        "ai_reasoning": ai_result.get("reasoning"),
        "ai_entities": ai_result.get("entities", []),
        "ai_bias_score": ai_result.get("bias_score", 0.5),
        "ai_stance": ai_result.get("stance", "neutral"),
        "ai_evidence_quality": ai_result.get("evidence_quality", "medium"),
        "ai_temporal_relevance": ai_result.get("temporal_relevance", 0.5),
        "ai_contradiction_flags": ai_result.get("contradiction_flags", []),
        "ai_verification_suggestions": ai_result.get("verification_suggestions", []),
        "ai_sources_analysis": ai_result.get("sources_analysis", []),
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
async def add_verification(claim_id: str, body: VerificationCreate, current_user: Optional[dict] = Depends(get_current_user)):
    claim = await db.claims.find_one({"id": claim_id})
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    # If user is authenticated, use their ID, otherwise validate the provided author_id
    if current_user:
        author_id = current_user["id"]
    else:
        if not await get_user(body.author_id):
            raise HTTPException(status_code=400, detail="Invalid author_id")
        author_id = body.author_id

    doc = {
        "id": str(uuid.uuid4()),
        "claim_id": claim_id,
        "author_id": author_id,
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
        await db.users.update_one({"id": author_id}, {"$inc": {"reputation": 0.1}})
    else:
        await db.users.update_one({"id": author_id}, {"$inc": {"reputation": -0.05}})

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
    link = body.get("link")
    if not text:
        raise HTTPException(status_code=400, detail="text required")
    
    # Use enhanced AI analysis
    result = await try_ai_analyze(text, link)
    return result


@api_router.post("/analyze/comprehensive")
async def comprehensive_analysis(body: Dict[str, str]):
    """Full comprehensive analysis with all AI features"""
    text = body.get("text")
    link = body.get("link")
    if not text:
        raise HTTPException(status_code=400, detail="text required")
    
    try:
        from advanced_ai_engine import ai_engine
        result = await ai_engine.comprehensive_analysis(text, link)
        
        # Convert dataclass to dict for JSON response
        return {
            "summary": result.summary,
            "label": result.label,
            "confidence": result.confidence,
            "reasoning": result.reasoning,
            "entities": result.entities,
            "sources_analysis": result.sources_analysis,
            "bias_score": result.bias_score,
            "stance": result.stance,
            "fact_checks": result.fact_checks,
            "evidence_quality": result.evidence_quality,
            "temporal_relevance": result.temporal_relevance,
            "contradiction_flags": result.contradiction_flags,
            "verification_suggestions": result.verification_suggestions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@api_router.post("/analyze/entities")
async def extract_entities(body: Dict[str, str]):
    """Extract and analyze entities from text"""
    text = body.get("text")
    if not text:
        raise HTTPException(status_code=400, detail="text required")
    
    try:
        from advanced_ai_engine import ai_engine
        entities = await ai_engine._entity_extraction(text)
        return {"entities": entities}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Entity extraction failed: {str(e)}")


@api_router.post("/analyze/bias")
async def analyze_bias(body: Dict[str, str]):
    """Analyze bias and stance in text"""
    text = body.get("text")
    if not text:
        raise HTTPException(status_code=400, detail="text required")
    
    try:
        from advanced_ai_engine import ai_engine
        bias_analysis = await ai_engine._bias_and_stance_analysis(text)
        return bias_analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bias analysis failed: {str(e)}")


@api_router.post("/analyze/source")
async def analyze_source(body: Dict[str, str]):
    """Analyze source credibility"""
    url = body.get("url")
    if not url:
        raise HTTPException(status_code=400, detail="url required")
    
    try:
        from advanced_ai_engine import ai_engine
        source_analysis = await ai_engine._source_analysis(url)
        return {"source_analysis": source_analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Source analysis failed: {str(e)}")


@api_router.get("/claims/{claim_id}/detailed")
async def get_detailed_claim(claim_id: str):
    """Get claim with detailed AI analysis"""
    claim = await db.claims.find_one({"id": claim_id})
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    claim = clean_doc(claim)
    
    # Get verifications and verdict
    verifs = await db.verifications.find({"claim_id": claim_id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    verdict = await compute_verdict(claim_id)
    
    # Return enhanced response with all AI analysis
    return {
        "claim": claim,
        "verifications": verifs,
        "verdict": verdict,
        "ai_analysis": {
            "summary": claim.get("ai_summary"),
            "label": claim.get("ai_label"),
            "confidence": claim.get("ai_confidence"),
            "reasoning": claim.get("ai_reasoning"),
            "entities": claim.get("ai_entities", []),
            "bias_score": claim.get("ai_bias_score"),
            "stance": claim.get("ai_stance"),
            "evidence_quality": claim.get("ai_evidence_quality"),
            "temporal_relevance": claim.get("ai_temporal_relevance"),
            "contradiction_flags": claim.get("ai_contradiction_flags", []),
            "verification_suggestions": claim.get("ai_verification_suggestions", []),
            "sources_analysis": claim.get("ai_sources_analysis", [])
        }
    }


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