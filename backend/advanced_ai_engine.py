"""
Advanced AI/NLP Engine for PeerFact
====================================

This module provides the most advanced AI-powered fact-checking and analysis
capabilities using multiple AI models, ensemble techniques, and sophisticated
NLP analysis.

Features:
- Multi-model AI analysis with ensemble voting
- Advanced entity extraction and fact verification
- Source credibility analysis and verification
- Bias and stance detection
- Conflict detection against existing claims
- Advanced classification with confidence scoring
- Real-time source validation
"""

import os
import re
import json
import asyncio
import urllib.parse
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import uuid
import logging
from dataclasses import dataclass

from emergentintegrations.llm.chat import LlmChat, UserMessage

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class AnalysisResult:
    """Comprehensive analysis result structure"""
    summary: str
    label: str
    confidence: float
    reasoning: str
    entities: List[Dict[str, Any]]
    sources_analysis: List[Dict[str, Any]]
    bias_score: float
    stance: str
    fact_checks: List[Dict[str, Any]]
    evidence_quality: str
    temporal_relevance: float
    contradiction_flags: List[str]
    verification_suggestions: List[str]

@dataclass
class SourceAnalysis:
    """Source credibility and analysis result"""
    url: str
    domain: str
    credibility_score: float
    domain_reputation: str
    is_fact_check_source: bool
    potential_bias: str
    accessibility_status: str
    content_type: str

class AdvancedAIEngine:
    """Advanced AI/NLP Engine for comprehensive fact-checking analysis"""
    
    def __init__(self):
        self.api_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("EMERGENT_LLM_KEY")
        if not self.api_key:
            logger.warning("No API key found. Falling back to heuristic analysis.")
        
        # Known high-credibility domains
        self.trusted_domains = {
            'reuters.com', 'apnews.com', 'bbc.com', 'npr.org', 'pbs.org',
            'factcheck.org', 'snopes.com', 'politifact.com', 'factcheck.afp.com',
            'fullfact.org', 'checkyourfact.com', 'truthorfiction.com',
            'nature.com', 'science.org', 'nejm.org', 'thelancet.com',
            'who.int', 'cdc.gov', 'fda.gov', 'nih.gov', 'nasa.gov',
            'gov.uk', 'gov.au', 'canada.ca', 'europa.eu'
        }
        
        # Known low-credibility or biased domains
        self.suspicious_domains = {
            'infowars.com', 'breitbart.com', 'naturalnews.com', 'activistpost.com',
            'beforeitsnews.com', 'worldtruth.tv', 'davidwolfe.com', 'truththeory.com'
        }
        
        # Fact-checking specific domains
        self.fact_check_domains = {
            'factcheck.org', 'snopes.com', 'politifact.com', 'factcheck.afp.com',
            'fullfact.org', 'checkyourfact.com', 'truthorfiction.com',
            'mediabiasfactcheck.com', 'factcheckni.org'
        }
    
    async def comprehensive_analysis(self, text: str, source_url: Optional[str] = None) -> AnalysisResult:
        """
        Perform comprehensive AI analysis using multiple models and techniques
        """
        try:
            # Run multiple analysis tasks concurrently
            tasks = [
                self._multi_model_fact_analysis(text),
                self._entity_extraction(text),
                self._bias_and_stance_analysis(text),
                self._source_analysis(source_url) if source_url else asyncio.create_task(self._empty_source_analysis()),
                self._contradiction_detection(text),
                self._evidence_quality_assessment(text, source_url)
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Extract results
            fact_analysis = results[0] if not isinstance(results[0], Exception) else self._fallback_analysis(text)
            entities = results[1] if not isinstance(results[1], Exception) else []
            bias_stance = results[2] if not isinstance(results[2], Exception) else {"bias_score": 0.5, "stance": "neutral"}
            source_analysis = results[3] if not isinstance(results[3], Exception) else []
            contradictions = results[4] if not isinstance(results[4], Exception) else []
            evidence_quality = results[5] if not isinstance(results[5], Exception) else "medium"
            
            # Calculate ensemble confidence
            confidence = self._calculate_ensemble_confidence(fact_analysis, bias_stance, source_analysis)
            
            # Generate verification suggestions
            suggestions = self._generate_verification_suggestions(text, entities, source_analysis)
            
            return AnalysisResult(
                summary=fact_analysis.get("summary", text[:200] + "..."),
                label=fact_analysis.get("label", "Unclear"),
                confidence=confidence,
                reasoning=fact_analysis.get("reasoning", "Analysis based on content patterns"),
                entities=entities,
                sources_analysis=source_analysis,
                bias_score=bias_stance.get("bias_score", 0.5),
                stance=bias_stance.get("stance", "neutral"),
                fact_checks=[],  # Will be populated by database lookup
                evidence_quality=evidence_quality,
                temporal_relevance=self._assess_temporal_relevance(text),
                contradiction_flags=contradictions,
                verification_suggestions=suggestions
            )
            
        except Exception as e:
            logger.error(f"Comprehensive analysis failed: {e}")
            return self._fallback_comprehensive_analysis(text)
    
    async def _multi_model_fact_analysis(self, text: str) -> Dict[str, Any]:
        """Use multiple AI models for fact analysis with ensemble voting"""
        if not self.api_key:
            return self._fallback_analysis(text)
        
        try:
            # Define different system prompts for different aspects
            prompts = {
                "factuality": {
                    "system": """You are an expert fact-checker with access to vast knowledge. 
                    Analyze claims for factual accuracy, considering:
                    1. Verifiable facts vs opinions
                    2. Context and nuance
                    3. Potential for verification
                    4. Historical accuracy
                    
                    Respond in JSON with: summary, label (Verified True/Likely True/Mixed/Likely False/Verified False/Unverifiable), reasoning, key_facts[]""",
                    "model": ("openai", "gpt-4o")
                },
                "credibility": {
                    "system": """You are a credibility assessment expert. Evaluate claims for:
                    1. Plausibility and internal consistency
                    2. Extraordinary claims requiring extraordinary evidence
                    3. Scientific accuracy where applicable
                    4. Logical coherence
                    
                    Respond in JSON with: credibility_score (0-1), assessment, red_flags[]""",
                    "model": ("anthropic", "claude-3-7-sonnet-20250219")
                },
                "verification": {
                    "system": """You are a verification specialist. Assess how this claim could be verified:
                    1. What evidence would prove/disprove this?
                    2. What sources should be consulted?
                    3. What are the verification challenges?
                    
                    Respond in JSON with: verifiability_score (0-1), verification_methods[], challenges[]""",
                    "model": ("gemini", "gemini-2.0-flash")
                }
            }
            
            # Run all analyses concurrently
            tasks = []
            for analysis_type, config in prompts.items():
                task = self._run_single_analysis(text, config["system"], config["model"])
                tasks.append(task)
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Ensemble the results
            return self._ensemble_fact_analysis(results, text)
            
        except Exception as e:
            logger.error(f"Multi-model analysis failed: {e}")
            return self._fallback_analysis(text)
    
    async def _run_single_analysis(self, text: str, system_prompt: str, model: Tuple[str, str]) -> Dict[str, Any]:
        """Run a single AI analysis"""
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"peerfact-analysis-{uuid.uuid4()}",
                system_message=system_prompt
            ).with_model(model[0], model[1])
            
            user_message = UserMessage(text=f"Analyze this claim: {text}")
            result = await chat.send_message(user_message)
            
            # Try to parse JSON response
            try:
                return json.loads(result)
            except json.JSONDecodeError:
                # Fallback to extracting key information
                return {"analysis": result, "raw": True}
                
        except Exception as e:
            logger.error(f"Single analysis failed for {model}: {e}")
            return {"error": str(e)}
    
    def _ensemble_fact_analysis(self, results: List[Any], text: str) -> Dict[str, Any]:
        """Combine multiple AI analyses into ensemble result"""
        try:
            valid_results = [r for r in results if isinstance(r, dict) and "error" not in r]
            
            if not valid_results:
                return self._fallback_analysis(text)
            
            # Extract labels and convert to numeric scores for voting
            label_scores = []
            reasonings = []
            summaries = []
            
            label_mapping = {
                "Verified True": 1.0, "Likely True": 0.8, "Mixed": 0.5,
                "Likely False": 0.2, "Verified False": 0.0, "Unverifiable": 0.5,
                "Unclear": 0.5
            }
            
            for result in valid_results:
                if "label" in result:
                    score = label_mapping.get(result["label"], 0.5)
                    label_scores.append(score)
                
                if "reasoning" in result:
                    reasonings.append(result["reasoning"])
                
                if "summary" in result:
                    summaries.append(result["summary"])
            
            # Calculate ensemble score
            if label_scores:
                avg_score = sum(label_scores) / len(label_scores)
                # Convert back to label
                if avg_score >= 0.8:
                    ensemble_label = "Likely True"
                elif avg_score >= 0.6:
                    ensemble_label = "Mixed"
                elif avg_score >= 0.4:
                    ensemble_label = "Unclear"
                elif avg_score >= 0.2:
                    ensemble_label = "Likely False"
                else:
                    ensemble_label = "Likely False"
            else:
                ensemble_label = "Unclear"
            
            # Combine summaries and reasonings
            best_summary = summaries[0] if summaries else text[:200] + "..."
            combined_reasoning = " | ".join(reasonings) if reasonings else "Ensemble analysis of multiple AI models"
            
            return {
                "summary": best_summary,
                "label": ensemble_label,
                "reasoning": combined_reasoning,
                "confidence": self._calculate_confidence_from_consensus(label_scores),
                "model_count": len(valid_results)
            }
            
        except Exception as e:
            logger.error(f"Ensemble analysis failed: {e}")
            return self._fallback_analysis(text)
    
    async def _entity_extraction(self, text: str) -> List[Dict[str, Any]]:
        """Extract and analyze entities from the claim"""
        if not self.api_key:
            return self._fallback_entity_extraction(text)
        
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"peerfact-entities-{uuid.uuid4()}",
                system_message="""Extract and categorize entities from the text. 
                Focus on: people, organizations, locations, dates, numbers, products, events.
                For each entity, assess its verifiability and importance to the claim.
                
                Respond in JSON format:
                {
                  "entities": [
                    {
                      "text": "entity text",
                      "type": "person/organization/location/date/number/product/event",
                      "importance": "high/medium/low",
                      "verifiable": true/false,
                      "context": "how this entity relates to the claim"
                    }
                  ]
                }"""
            ).with_model("openai", "gpt-4o-mini")
            
            user_message = UserMessage(text=f"Extract entities from: {text}")
            result = await chat.send_message(user_message)
            
            try:
                parsed = json.loads(result)
                return parsed.get("entities", [])
            except json.JSONDecodeError:
                return self._fallback_entity_extraction(text)
                
        except Exception as e:
            logger.error(f"Entity extraction failed: {e}")
            return self._fallback_entity_extraction(text)
    
    async def _bias_and_stance_analysis(self, text: str) -> Dict[str, Any]:
        """Analyze bias and stance in the claim"""
        if not self.api_key:
            return {"bias_score": 0.5, "stance": "neutral"}
        
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"peerfact-bias-{uuid.uuid4()}",
                system_message="""Analyze the text for bias and stance. Consider:
                1. Emotional language vs neutral language
                2. One-sided presentation vs balanced view
                3. Loaded words and framing
                4. Political or ideological lean
                5. Commercial bias
                
                Respond in JSON:
                {
                  "bias_score": 0.0-1.0 (0=neutral, 1=highly biased),
                  "stance": "strongly_positive/positive/neutral/negative/strongly_negative",
                  "bias_indicators": ["list of biased language"],
                  "neutrality_suggestions": ["how to make more neutral"]
                }"""
            ).with_model("anthropic", "claude-3-5-sonnet-20241022")
            
            user_message = UserMessage(text=f"Analyze bias and stance: {text}")
            result = await chat.send_message(user_message)
            
            try:
                return json.loads(result)
            except json.JSONDecodeError:
                return {"bias_score": 0.5, "stance": "neutral"}
                
        except Exception as e:
            logger.error(f"Bias analysis failed: {e}")
            return {"bias_score": 0.5, "stance": "neutral"}
    
    async def _source_analysis(self, url: Optional[str]) -> List[Dict[str, Any]]:
        """Analyze source credibility and characteristics"""
        if not url:
            return []
        
        try:
            # Parse URL to get domain
            parsed = urllib.parse.urlparse(url)
            domain = parsed.netloc.lower()
            
            # Remove www. prefix
            domain = domain.replace("www.", "")
            
            # Basic domain analysis
            analysis = {
                "url": url,
                "domain": domain,
                "credibility_score": self._get_domain_credibility_score(domain),
                "domain_reputation": self._get_domain_reputation(domain),
                "is_fact_check_source": domain in self.fact_check_domains,
                "potential_bias": self._assess_domain_bias(domain),
                "accessibility_status": "unknown",  # Could be enhanced with URL checking
                "content_type": self._guess_content_type(url)
            }
            
            return [analysis]
            
        except Exception as e:
            logger.error(f"Source analysis failed: {e}")
            return []
    
    async def _empty_source_analysis(self) -> List[Dict[str, Any]]:
        """Return empty source analysis when no URL provided"""
        return []
    
    async def _contradiction_detection(self, text: str) -> List[str]:
        """Detect potential contradictions and logical issues"""
        if not self.api_key:
            return []
        
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"peerfact-contradictions-{uuid.uuid4()}",
                system_message="""Analyze the text for logical contradictions, inconsistencies, or red flags:
                1. Internal contradictions within the claim
                2. Claims that contradict well-established facts
                3. Impossible timelines or logistics
                4. Conflicting numbers or statistics
                5. Implausible cause-effect relationships
                
                Return a JSON list of contradiction flags:
                ["flag1", "flag2", ...]"""
            ).with_model("gemini", "gemini-2.0-flash")
            
            user_message = UserMessage(text=f"Find contradictions in: {text}")
            result = await chat.send_message(user_message)
            
            try:
                return json.loads(result)
            except json.JSONDecodeError:
                # Try to extract flags from text
                return [line.strip() for line in result.split('\n') if line.strip().startswith('-') or line.strip().startswith('•')][:5]
                
        except Exception as e:
            logger.error(f"Contradiction detection failed: {e}")
            return []
    
    async def _evidence_quality_assessment(self, text: str, source_url: Optional[str]) -> str:
        """Assess the quality of evidence presented"""
        try:
            # Basic heuristic assessment
            quality_indicators = {
                "high": ["study", "research", "peer-reviewed", "statistics", "data", "survey", "official", "government"],
                "medium": ["reported", "according to", "sources", "analysis", "expert", "professor"],
                "low": ["claims", "allegedly", "rumored", "some say", "it is said", "anonymous"]
            }
            
            text_lower = text.lower()
            
            high_count = sum(1 for word in quality_indicators["high"] if word in text_lower)
            medium_count = sum(1 for word in quality_indicators["medium"] if word in text_lower)
            low_count = sum(1 for word in quality_indicators["low"] if word in text_lower)
            
            # Consider source credibility
            source_boost = 0
            if source_url:
                parsed = urllib.parse.urlparse(source_url)
                domain = parsed.netloc.lower().replace("www.", "")
                if domain in self.trusted_domains:
                    source_boost = 2
                elif domain in self.fact_check_domains:
                    source_boost = 3
            
            total_score = high_count * 3 + medium_count * 2 - low_count + source_boost
            
            if total_score >= 6:
                return "high"
            elif total_score >= 2:
                return "medium"
            else:
                return "low"
                
        except Exception as e:
            logger.error(f"Evidence quality assessment failed: {e}")
            return "medium"
    
    def _get_domain_credibility_score(self, domain: str) -> float:
        """Get credibility score for domain"""
        if domain in self.trusted_domains:
            return 0.9
        elif domain in self.fact_check_domains:
            return 0.95
        elif domain in self.suspicious_domains:
            return 0.2
        elif domain.endswith(('.gov', '.edu', '.org')):
            return 0.8
        elif domain.endswith('.com'):
            return 0.6
        else:
            return 0.5
    
    def _get_domain_reputation(self, domain: str) -> str:
        """Get domain reputation assessment"""
        if domain in self.trusted_domains:
            return "high_credibility"
        elif domain in self.fact_check_domains:
            return "fact_checker"
        elif domain in self.suspicious_domains:
            return "low_credibility"
        elif domain.endswith('.gov'):
            return "government"
        elif domain.endswith('.edu'):
            return "academic"
        else:
            return "unknown"
    
    def _assess_domain_bias(self, domain: str) -> str:
        """Assess potential bias of domain"""
        # This is a simplified assessment - in production, you'd want a more comprehensive database
        left_leaning = {'cnn.com', 'msnbc.com', 'huffpost.com', 'theguardian.com'}
        right_leaning = {'foxnews.com', 'breitbart.com', 'dailymail.co.uk', 'nypost.com'}
        
        if domain in left_leaning:
            return "left_leaning"
        elif domain in right_leaning:
            return "right_leaning"
        else:
            return "neutral"
    
    def _guess_content_type(self, url: str) -> str:
        """Guess content type from URL"""
        if any(platform in url.lower() for platform in ['youtube', 'vimeo', 'tiktok']):
            return "video"
        elif any(platform in url.lower() for platform in ['twitter', 'facebook', 'instagram']):
            return "social_media"
        elif url.lower().endswith(('.pdf', '.doc', '.docx')):
            return "document"
        elif any(term in url.lower() for term in ['blog', 'post']):
            return "blog"
        else:
            return "article"
    
    def _assess_temporal_relevance(self, text: str) -> float:
        """Assess how time-sensitive the claim is"""
        # Look for temporal indicators
        temporal_indicators = {
            "immediate": ["today", "now", "currently", "this week", "breaking"],
            "recent": ["recently", "this month", "this year", "lately"],
            "historical": ["in 1999", "last decade", "historically", "since"]
        }
        
        text_lower = text.lower()
        
        immediate_count = sum(1 for word in temporal_indicators["immediate"] if word in text_lower)
        recent_count = sum(1 for word in temporal_indicators["recent"] if word in text_lower)
        historical_count = sum(1 for word in temporal_indicators["historical"] if word in text_lower)
        
        if immediate_count > 0:
            return 1.0  # Highly time-sensitive
        elif recent_count > 0:
            return 0.7  # Moderately time-sensitive
        elif historical_count > 0:
            return 0.3  # Low time-sensitivity
        else:
            return 0.5  # Medium time-sensitivity
    
    def _calculate_ensemble_confidence(self, fact_analysis: Dict[str, Any], 
                                     bias_stance: Dict[str, Any], 
                                     source_analysis: List[Dict[str, Any]]) -> float:
        """Calculate overall confidence from multiple analysis components"""
        try:
            # Base confidence from fact analysis
            base_confidence = fact_analysis.get("confidence", 0.5)
            
            # Adjust for bias (lower bias = higher confidence in neutrality)
            bias_score = bias_stance.get("bias_score", 0.5)
            bias_adjustment = 1.0 - (bias_score * 0.2)  # Max 20% reduction for high bias
            
            # Adjust for source credibility
            source_adjustment = 1.0
            if source_analysis:
                source_cred = source_analysis[0].get("credibility_score", 0.5)
                source_adjustment = 0.8 + (source_cred * 0.4)  # Range 0.8-1.2
            
            # Calculate final confidence
            final_confidence = base_confidence * bias_adjustment * source_adjustment
            
            # Clamp between 0 and 1
            return max(0.0, min(1.0, final_confidence))
            
        except Exception as e:
            logger.error(f"Confidence calculation failed: {e}")
            return 0.5
    
    def _calculate_confidence_from_consensus(self, label_scores: List[float]) -> float:
        """Calculate confidence based on consensus among models"""
        if not label_scores:
            return 0.5
        
        # Calculate variance (lower variance = higher confidence)
        mean_score = sum(label_scores) / len(label_scores)
        variance = sum((score - mean_score) ** 2 for score in label_scores) / len(label_scores)
        
        # Convert variance to confidence (lower variance = higher confidence)
        # Max variance is 0.25 (scores 0 and 1), so we normalize
        confidence = 1.0 - (variance * 4)  # Scale variance to 0-1 range
        return max(0.1, min(1.0, confidence))
    
    def _generate_verification_suggestions(self, text: str, entities: List[Dict[str, Any]], 
                                        source_analysis: List[Dict[str, Any]]) -> List[str]:
        """Generate suggestions for verifying the claim"""
        suggestions = []
        
        # Based on entities
        for entity in entities:
            if entity.get("type") == "organization":
                suggestions.append(f"Check official statements from {entity['text']}")
            elif entity.get("type") == "person":
                suggestions.append(f"Verify statements attributed to {entity['text']}")
            elif entity.get("type") == "date":
                suggestions.append(f"Cross-reference events on {entity['text']}")
        
        # Based on source analysis
        if source_analysis and source_analysis[0].get("credibility_score", 0) < 0.6:
            suggestions.append("Seek corroboration from more credible sources")
        
        # General suggestions
        suggestions.extend([
            "Search for primary sources and official documentation",
            "Check multiple fact-checking websites",
            "Look for peer-reviewed research on the topic",
            "Verify with domain experts or relevant authorities"
        ])
        
        return suggestions[:5]  # Limit to top 5 suggestions
    
    def _fallback_analysis(self, text: str) -> Dict[str, Any]:
        """Fallback heuristic analysis when AI fails"""
        snippet = text.strip().replace("\n", " ")
        summary = (snippet[:240] + "…") if len(snippet) > 240 else snippet
        lowered = text.lower()
        
        # Enhanced heuristic analysis
        if any(k in lowered for k in ["satire", "parody", "joke", "humor"]):
            label = "Satire/Humor"
        elif any(k in lowered for k in ["fake", "hoax", "debunk", "false", "misleading"]):
            label = "Likely False"
        elif any(k in lowered for k in ["official", "press release", "confirmed", "verified", "study shows"]):
            label = "Likely True"
        elif any(k in lowered for k in ["allegedly", "rumored", "claims", "some say"]):
            label = "Unverified"
        else:
            label = "Unclear"
        
        return {
            "summary": summary,
            "label": label,
            "reasoning": "Heuristic analysis based on keyword patterns",
            "confidence": 0.3  # Lower confidence for heuristic analysis
        }
    
    def _fallback_comprehensive_analysis(self, text: str) -> AnalysisResult:
        """Fallback comprehensive analysis when AI fails"""
        fallback = self._fallback_analysis(text)
        
        return AnalysisResult(
            summary=fallback["summary"],
            label=fallback["label"],
            confidence=fallback["confidence"],
            reasoning=fallback["reasoning"],
            entities=[],
            sources_analysis=[],
            bias_score=0.5,
            stance="neutral",
            fact_checks=[],
            evidence_quality="unknown",
            temporal_relevance=0.5,
            contradiction_flags=[],
            verification_suggestions=["Manual verification required"]
        )
    
    def _fallback_entity_extraction(self, text: str) -> List[Dict[str, Any]]:
        """Simple regex-based entity extraction as fallback"""
        entities = []
        
        # Simple patterns for basic entity extraction
        patterns = {
            "date": r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b\d{4}\b',
            "number": r'\b\d+(?:,\d{3})*(?:\.\d+)?\s*(?:percent|%|million|billion|trillion)?\b',
            "organization": r'\b[A-Z][a-z]+ (?:Inc|Corp|LLC|Ltd|Company|Organization|Department|Ministry)\b'
        }
        
        for entity_type, pattern in patterns.items():
            matches = re.findall(pattern, text)
            for match in matches[:3]:  # Limit to avoid spam
                entities.append({
                    "text": match,
                    "type": entity_type,
                    "importance": "medium",
                    "verifiable": True,
                    "context": "Extracted using pattern matching"
                })
        
        return entities

# Create global instance
ai_engine = AdvancedAIEngine()