#!/usr/bin/env python3
"""
OpenAI Integration Test for PeerFact Backend
Tests the specific requirements from the review request
"""

import requests
import json
import sys
import os

# Get backend URL from environment
BACKEND_URL = "https://npm-dev-transition.preview.emergentagent.com/api"

class OpenAITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.test_user = None
        self.test_claim = None
        
    def log_result(self, test_name: str, success: bool, details: str = "", response_data=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        print()
        return success
    
    def test_analyze_claim_endpoint(self):
        """Test 1: POST /api/analyze/claim with specific text from review request"""
        try:
            payload = {"text": "Official press release confirms new solar subsidy"}
            response = self.session.post(f"{self.base_url}/analyze/claim", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check required fields
                if "summary" in data and "label" in data:
                    summary = data.get("summary", "")
                    label = data.get("label", "")
                    
                    # Check if summary is non-empty
                    if summary and summary.strip():
                        # Check if label is likely not "Unclear" (as requested)
                        if label != "Unclear":
                            return self.log_result(
                                "Analyze claim endpoint", 
                                True, 
                                f"AI Analysis successful - Label: '{label}', Summary: '{summary[:100]}...'"
                            )
                        else:
                            return self.log_result(
                                "Analyze claim endpoint", 
                                False, 
                                f"Label is 'Unclear' but expected likely not 'Unclear' for clear text. Got: '{label}'"
                            )
                    else:
                        return self.log_result(
                            "Analyze claim endpoint", 
                            False, 
                            "Summary is empty", 
                            data
                        )
                else:
                    return self.log_result(
                        "Analyze claim endpoint", 
                        False, 
                        "Missing 'summary' or 'label' fields", 
                        data
                    )
            else:
                return self.log_result(
                    "Analyze claim endpoint", 
                    False, 
                    f"Status code: {response.status_code}", 
                    response.text
                )
                
        except Exception as e:
            return self.log_result("Analyze claim endpoint", False, f"Exception: {str(e)}")
    
    def test_create_user_and_claim(self):
        """Test 2: Create user then POST /api/claims with clear text -> expect ai_label and ai_summary"""
        try:
            # First create a user
            user_payload = {"username": "openai_tester"}
            user_response = self.session.post(f"{self.base_url}/users/bootstrap", json=user_payload)
            
            if user_response.status_code != 200:
                return self.log_result(
                    "Create user and claim", 
                    False, 
                    "Failed to create user", 
                    user_response.text
                )
            
            self.test_user = user_response.json()
            
            # Now create a claim with clear text
            claim_payload = {
                "author_id": self.test_user["id"],
                "text": "NASA announces successful Mars rover landing with new scientific instruments",
                "link": "https://nasa.gov/mars-rover-landing"
            }
            
            response = self.session.post(f"{self.base_url}/claims", json=claim_payload)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check for ai_label and ai_summary from OpenAI-backed analysis
                if "ai_label" in data and "ai_summary" in data:
                    ai_label = data.get("ai_label", "")
                    ai_summary = data.get("ai_summary", "")
                    
                    if ai_label and ai_summary and ai_label.strip() and ai_summary.strip():
                        self.test_claim = data
                        return self.log_result(
                            "Create user and claim", 
                            True, 
                            f"Claim created with OpenAI analysis - Label: '{ai_label}', Summary: '{ai_summary[:100]}...'"
                        )
                    else:
                        return self.log_result(
                            "Create user and claim", 
                            False, 
                            "ai_label or ai_summary is empty", 
                            data
                        )
                else:
                    return self.log_result(
                        "Create user and claim", 
                        False, 
                        "Missing ai_label or ai_summary fields", 
                        data
                    )
            else:
                return self.log_result(
                    "Create user and claim", 
                    False, 
                    f"Status code: {response.status_code}", 
                    response.text
                )
                
        except Exception as e:
            return self.log_result("Create user and claim", False, f"Exception: {str(e)}")
    
    def test_list_claims_shows_created(self):
        """Test 3: GET /api/claims should show created claim in list"""
        try:
            if not self.test_claim:
                return self.log_result(
                    "List claims shows created", 
                    False, 
                    "No test claim available (previous test failed)"
                )
            
            response = self.session.get(f"{self.base_url}/claims")
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    # Look for our test claim
                    test_claim_id = self.test_claim["id"]
                    found_claim = next((c for c in data if c["id"] == test_claim_id), None)
                    
                    if found_claim:
                        return self.log_result(
                            "List claims shows created", 
                            True, 
                            f"Found created claim in list (total: {len(data)} claims)"
                        )
                    else:
                        return self.log_result(
                            "List claims shows created", 
                            False, 
                            f"Created claim not found in list of {len(data)} claims"
                        )
                else:
                    return self.log_result(
                        "List claims shows created", 
                        False, 
                        "Response is not a list", 
                        data
                    )
            else:
                return self.log_result(
                    "List claims shows created", 
                    False, 
                    f"Status code: {response.status_code}", 
                    response.text
                )
                
        except Exception as e:
            return self.log_result("List claims shows created", False, f"Exception: {str(e)}")
    
    def check_openai_key_status(self):
        """Check if OpenAI API key is configured"""
        print("🔍 Checking OpenAI API Key Configuration...")
        
        # Check environment variable
        openai_key = os.environ.get("OPENAI_API_KEY")
        if openai_key:
            print(f"   ✅ OPENAI_API_KEY found in environment (length: {len(openai_key)})")
            return True
        else:
            print("   ❌ OPENAI_API_KEY not found in environment")
            
            # Check .env file
            try:
                with open("/app/backend/.env", "r") as f:
                    content = f.read()
                    if "OPENAI_API_KEY=" in content:
                        # Extract the value
                        for line in content.split('\n'):
                            if line.startswith("OPENAI_API_KEY="):
                                value = line.split("=", 1)[1].strip().strip('"')
                                if value:
                                    print(f"   ✅ OPENAI_API_KEY found in .env file (length: {len(value)})")
                                    return True
                                else:
                                    print("   ❌ OPENAI_API_KEY is empty in .env file")
                                    return False
            except Exception as e:
                print(f"   ❌ Error reading .env file: {e}")
            
            print("   ⚠️  OpenAI API key not configured - tests will use heuristic fallback")
            return False
    
    def run_tests(self):
        """Run all OpenAI integration tests"""
        print("🚀 Starting OpenAI Integration Tests for PeerFact Backend")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Check OpenAI key status first
        has_openai_key = self.check_openai_key_status()
        print()
        
        tests = [
            ("Analyze claim endpoint", self.test_analyze_claim_endpoint),
            ("Create user and claim", self.test_create_user_and_claim),
            ("List claims shows created", self.test_list_claims_shows_created)
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            if test_func():
                passed += 1
        
        print("=" * 60)
        print(f"📊 Test Results: {passed}/{total} tests passed")
        
        if not has_openai_key:
            print("⚠️  Note: Tests ran with heuristic fallback (no OpenAI key configured)")
        
        if passed == total:
            print("🎉 All OpenAI integration tests passed!")
            return True
        else:
            print(f"⚠️  {total - passed} tests failed")
            return False

def main():
    """Main test runner"""
    tester = OpenAITester()
    success = tester.run_tests()
    
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()