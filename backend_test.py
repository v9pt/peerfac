#!/usr/bin/env python3
"""
Backend API Testing for PeerFact MVP
Tests all backend endpoints according to the review request
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

# Get backend URL from environment
BACKEND_URL = "https://factcrowd.preview.emergentagent.com/api"

class PeerFactTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.test_users = []
        self.test_claims = []
        self.results = []
        
    def log_result(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        print()
        
        self.results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "response": response_data
        })
    
    def test_health_endpoint(self):
        """Test 1: GET /api/ -> expect {"message":"PeerFact API is live"}"""
        try:
            response = self.session.get(f"{self.base_url}/")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("message") == "PeerFact API is live":
                    self.log_result("Health endpoint", True, "API is live")
                    return True
                else:
                    self.log_result("Health endpoint", False, f"Unexpected message: {data.get('message')}", data)
                    return False
            else:
                self.log_result("Health endpoint", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Health endpoint", False, f"Exception: {str(e)}")
            return False
    
    def test_user_bootstrap(self):
        """Test 2: POST /api/users/bootstrap with {"username": null} -> expect 200, body includes id, username (auto anon-xxxx), reputation=1.0"""
        try:
            payload = {"username": None}
            response = self.session.post(f"{self.base_url}/users/bootstrap", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["id", "username", "reputation"]
                
                if all(field in data for field in required_fields):
                    if data["username"].startswith("anon-") and data["reputation"] == 1.0:
                        self.test_users.append(data)
                        self.log_result("User bootstrap", True, f"Created user: {data['username']}")
                        return True
                    else:
                        self.log_result("User bootstrap", False, f"Invalid username format or reputation: {data['username']}, {data['reputation']}", data)
                        return False
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("User bootstrap", False, f"Missing fields: {missing}", data)
                    return False
            else:
                self.log_result("User bootstrap", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("User bootstrap", False, f"Exception: {str(e)}")
            return False
    
    def test_create_claim_missing_author(self):
        """Test 3: POST /api/claims with missing author -> expect 400 {detail:"Invalid author_id"}"""
        try:
            payload = {
                "author_id": "invalid-user-id-12345",
                "text": "Government announces new healthcare policy",
                "link": "https://pib.gov.in/healthcare-policy"
            }
            response = self.session.post(f"{self.base_url}/claims", json=payload)
            
            if response.status_code == 400:
                data = response.json()
                if data.get("detail") == "Invalid author_id":
                    self.log_result("Create claim with invalid author", True, "Correctly rejected invalid author_id")
                    return True
                else:
                    self.log_result("Create claim with invalid author", False, f"Unexpected error message: {data.get('detail')}", data)
                    return False
            else:
                self.log_result("Create claim with invalid author", False, f"Expected 400, got {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Create claim with invalid author", False, f"Exception: {str(e)}")
            return False
    
    def test_create_valid_claim(self):
        """Test 4: Create a user, then POST /api/claims with valid data -> expect 200, claim with ai_summary and ai_label"""
        try:
            # First create a user
            user_payload = {"username": "fact_checker_sarah"}
            user_response = self.session.post(f"{self.base_url}/users/bootstrap", json=user_payload)
            
            if user_response.status_code != 200:
                self.log_result("Create valid claim", False, "Failed to create user for claim test", user_response.text)
                return False
            
            user_data = user_response.json()
            self.test_users.append(user_data)
            
            # Now create a claim
            claim_payload = {
                "author_id": user_data["id"],
                "text": "Government gives grant to renewable energy startups under new green initiative",
                "link": "https://pib.gov.in/renewable-energy-grants"
            }
            
            response = self.session.post(f"{self.base_url}/claims", json=claim_payload)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["id", "author_id", "text", "ai_summary", "ai_label"]
                
                if all(field in data for field in required_fields):
                    if data["ai_summary"] and data["ai_label"]:
                        self.test_claims.append(data)
                        self.log_result("Create valid claim", True, f"Created claim with AI analysis: {data['ai_label']}")
                        return True
                    else:
                        self.log_result("Create valid claim", False, "AI summary or label is empty", data)
                        return False
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("Create valid claim", False, f"Missing fields: {missing}", data)
                    return False
            else:
                self.log_result("Create valid claim", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Create valid claim", False, f"Exception: {str(e)}")
            return False
    
    def test_list_claims(self):
        """Test 5: GET /api/claims -> expect list with the created claim"""
        try:
            response = self.session.get(f"{self.base_url}/claims")
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    if len(data) > 0:
                        # Check if our test claim is in the list
                        if self.test_claims:
                            test_claim_id = self.test_claims[0]["id"]
                            found_claim = next((c for c in data if c["id"] == test_claim_id), None)
                            
                            if found_claim:
                                # Verify it has the computed verdict fields
                                verdict_fields = ["support_count", "refute_count", "unclear_count", "confidence"]
                                if all(field in found_claim for field in verdict_fields):
                                    self.log_result("List claims", True, f"Found {len(data)} claims with verdict data")
                                    return True
                                else:
                                    missing = [f for f in verdict_fields if f not in found_claim]
                                    self.log_result("List claims", False, f"Missing verdict fields: {missing}", found_claim)
                                    return False
                            else:
                                self.log_result("List claims", False, "Test claim not found in list", data)
                                return False
                        else:
                            self.log_result("List claims", True, f"Retrieved {len(data)} claims")
                            return True
                    else:
                        self.log_result("List claims", True, "Empty claims list (valid)")
                        return True
                else:
                    self.log_result("List claims", False, "Response is not a list", data)
                    return False
            else:
                self.log_result("List claims", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("List claims", False, f"Exception: {str(e)}")
            return False
    
    def test_get_claim_detail(self):
        """Test 6: GET /api/claims/{claim_id} -> expect claim, verifications array (empty), verdict label/confidence"""
        try:
            if not self.test_claims:
                self.log_result("Get claim detail", False, "No test claims available")
                return False
            
            claim_id = self.test_claims[0]["id"]
            response = self.session.get(f"{self.base_url}/claims/{claim_id}")
            
            if response.status_code == 200:
                data = response.json()
                required_keys = ["claim", "verifications", "verdict"]
                
                if all(key in data for key in required_keys):
                    claim = data["claim"]
                    verifications = data["verifications"]
                    verdict = data["verdict"]
                    
                    # Verify structure
                    if isinstance(verifications, list) and isinstance(verdict, dict):
                        verdict_fields = ["label", "confidence", "support", "refute", "unclear"]
                        if all(field in verdict for field in verdict_fields):
                            self.log_result("Get claim detail", True, f"Retrieved claim detail with {len(verifications)} verifications, verdict: {verdict['label']}")
                            return True
                        else:
                            missing = [f for f in verdict_fields if f not in verdict]
                            self.log_result("Get claim detail", False, f"Missing verdict fields: {missing}", verdict)
                            return False
                    else:
                        self.log_result("Get claim detail", False, "Invalid verifications or verdict structure", data)
                        return False
                else:
                    missing = [k for k in required_keys if k not in data]
                    self.log_result("Get claim detail", False, f"Missing keys: {missing}", data)
                    return False
            else:
                self.log_result("Get claim detail", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Get claim detail", False, f"Exception: {str(e)}")
            return False
    
    def test_add_verification_support(self):
        """Test 7: POST /api/claims/{claim_id}/verify -> with valid user and stance support"""
        try:
            if not self.test_claims or not self.test_users:
                self.log_result("Add verification (support)", False, "No test claims or users available")
                return False
            
            claim_id = self.test_claims[0]["id"]
            user_id = self.test_users[0]["id"]
            
            verification_payload = {
                "author_id": user_id,
                "stance": "support",
                "source_url": "https://reuters.com/renewable-energy-verification",
                "explanation": "This claim is verified by multiple government sources and press releases from the Ministry of New and Renewable Energy."
            }
            
            response = self.session.post(f"{self.base_url}/claims/{claim_id}/verify", json=verification_payload)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["id", "claim_id", "author_id", "stance", "source_url", "explanation"]
                
                if all(field in data for field in required_fields):
                    if data["stance"] == "support" and data["claim_id"] == claim_id:
                        self.log_result("Add verification (support)", True, "Successfully added support verification")
                        return True
                    else:
                        self.log_result("Add verification (support)", False, "Verification data mismatch", data)
                        return False
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("Add verification (support)", False, f"Missing fields: {missing}", data)
                    return False
            else:
                self.log_result("Add verification (support)", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Add verification (support)", False, f"Exception: {str(e)}")
            return False
    
    def test_add_verification_refute(self):
        """Test 8: POST another verification with stance refute from a different user"""
        try:
            if not self.test_claims:
                self.log_result("Add verification (refute)", False, "No test claims available")
                return False
            
            # Create another user for refute verification
            user_payload = {"username": "skeptical_analyst"}
            user_response = self.session.post(f"{self.base_url}/users/bootstrap", json=user_payload)
            
            if user_response.status_code != 200:
                self.log_result("Add verification (refute)", False, "Failed to create second user", user_response.text)
                return False
            
            user_data = user_response.json()
            self.test_users.append(user_data)
            
            claim_id = self.test_claims[0]["id"]
            
            verification_payload = {
                "author_id": user_data["id"],
                "stance": "refute",
                "source_url": "https://factcheck.org/renewable-energy-grants-disputed",
                "explanation": "The grant amounts mentioned are exaggerated and the timeline is unrealistic based on budget allocations."
            }
            
            response = self.session.post(f"{self.base_url}/claims/{claim_id}/verify", json=verification_payload)
            
            if response.status_code == 200:
                data = response.json()
                if data["stance"] == "refute" and data["claim_id"] == claim_id:
                    self.log_result("Add verification (refute)", True, "Successfully added refute verification")
                    return True
                else:
                    self.log_result("Add verification (refute)", False, "Verification data mismatch", data)
                    return False
            else:
                self.log_result("Add verification (refute)", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Add verification (refute)", False, f"Exception: {str(e)}")
            return False
    
    def test_get_verdict(self):
        """Test 9: GET /api/claims/{claim_id}/verdict -> returns verdict JSON"""
        try:
            if not self.test_claims:
                self.log_result("Get verdict", False, "No test claims available")
                return False
            
            claim_id = self.test_claims[0]["id"]
            response = self.session.get(f"{self.base_url}/claims/{claim_id}/verdict")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["label", "confidence", "support", "refute", "unclear"]
                
                if all(field in data for field in required_fields):
                    # After adding both support and refute verifications, check if counts are updated
                    if data["support"] > 0 and data["refute"] > 0:
                        self.log_result("Get verdict", True, f"Verdict: {data['label']} (confidence: {data['confidence']}, support: {data['support']}, refute: {data['refute']})")
                        return True
                    else:
                        self.log_result("Get verdict", False, f"Verification counts not updated properly: support={data['support']}, refute={data['refute']}", data)
                        return False
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("Get verdict", False, f"Missing fields: {missing}", data)
                    return False
            else:
                self.log_result("Get verdict", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Get verdict", False, f"Exception: {str(e)}")
            return False
    
    def test_analyze_claim(self):
        """Test 10: POST /api/analyze/claim with text -> expect JSON {summary, label}"""
        try:
            payload = {"text": "This is official confirmed news from government press release"}
            response = self.session.post(f"{self.base_url}/analyze/claim", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["summary", "label"]
                
                if all(field in data for field in required_fields):
                    if data["summary"] and data["label"]:
                        self.log_result("Analyze claim", True, f"Analysis: {data['label']} - {data['summary'][:100]}...")
                        return True
                    else:
                        self.log_result("Analyze claim", False, "Empty summary or label", data)
                        return False
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("Analyze claim", False, f"Missing fields: {missing}", data)
                    return False
            else:
                self.log_result("Analyze claim", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Analyze claim", False, f"Exception: {str(e)}")
            return False
    
    def test_edge_cases(self):
        """Test edge cases: Invalid claim id in verify -> 404, Invalid author_id in verify -> 400"""
        results = []
        
        # Test 1: Invalid claim ID
        try:
            if self.test_users:
                verification_payload = {
                    "author_id": self.test_users[0]["id"],
                    "stance": "support",
                    "explanation": "Test verification"
                }
                
                response = self.session.post(f"{self.base_url}/claims/invalid-claim-id/verify", json=verification_payload)
                
                if response.status_code == 404:
                    self.log_result("Edge case: Invalid claim ID", True, "Correctly returned 404 for invalid claim ID")
                    results.append(True)
                else:
                    self.log_result("Edge case: Invalid claim ID", False, f"Expected 404, got {response.status_code}", response.text)
                    results.append(False)
            else:
                self.log_result("Edge case: Invalid claim ID", False, "No test users available")
                results.append(False)
        except Exception as e:
            self.log_result("Edge case: Invalid claim ID", False, f"Exception: {str(e)}")
            results.append(False)
        
        # Test 2: Invalid author ID
        try:
            if self.test_claims:
                verification_payload = {
                    "author_id": "invalid-author-id-12345",
                    "stance": "support",
                    "explanation": "Test verification"
                }
                
                claim_id = self.test_claims[0]["id"]
                response = self.session.post(f"{self.base_url}/claims/{claim_id}/verify", json=verification_payload)
                
                if response.status_code == 400:
                    data = response.json()
                    if data.get("detail") == "Invalid author_id":
                        self.log_result("Edge case: Invalid author ID", True, "Correctly returned 400 for invalid author ID")
                        results.append(True)
                    else:
                        self.log_result("Edge case: Invalid author ID", False, f"Wrong error message: {data.get('detail')}", data)
                        results.append(False)
                else:
                    self.log_result("Edge case: Invalid author ID", False, f"Expected 400, got {response.status_code}", response.text)
                    results.append(False)
            else:
                self.log_result("Edge case: Invalid author ID", False, "No test claims available")
                results.append(False)
        except Exception as e:
            self.log_result("Edge case: Invalid author ID", False, f"Exception: {str(e)}")
            results.append(False)
        
        return all(results)
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print(f"🚀 Starting PeerFact Backend API Tests")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)
        
        tests = [
            self.test_health_endpoint,
            self.test_user_bootstrap,
            self.test_create_claim_missing_author,
            self.test_create_valid_claim,
            self.test_list_claims,
            self.test_get_claim_detail,
            self.test_add_verification_support,
            self.test_add_verification_refute,
            self.test_get_verdict,
            self.test_analyze_claim,
            self.test_edge_cases
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if test():
                passed += 1
        
        print("=" * 60)
        print(f"📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {total - passed} tests failed")
            return False

def main():
    """Main test runner"""
    tester = PeerFactTester()
    success = tester.run_all_tests()
    
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()