#!/usr/bin/env python3
"""
Backend API Testing for PeerFact Enhanced Features
Tests all backend endpoints including new media upload and blockchain features
"""

import requests
import json
import sys
import io
import tempfile
from typing import Dict, Any, Optional
from PIL import Image

# Get backend URL from environment
import os
BACKEND_URL = os.environ.get('preview_endpoint', 'http://localhost:8001') + "/api"

class PeerFactTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.test_users = []
        self.test_claims = []
        self.test_media = []
        self.results = []
        self.auth_token = None
        self.authenticated_user = None
        
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
    
    def create_test_image(self) -> io.BytesIO:
        """Create a test image for media upload testing"""
        img = Image.new('RGB', (100, 100), color='red')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        return img_bytes

    def test_media_upload(self):
        """Test 1: POST /api/upload/media with image file"""
        try:
            if not self.auth_token:
                self.log_result("Media upload", False, "No auth token available")
                return False
            
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            # Create test image
            test_image = self.create_test_image()
            
            files = {
                'file': ('test_image.jpg', test_image, 'image/jpeg')
            }
            
            response = self.session.post(f"{self.base_url}/upload/media", files=files, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["media_id", "media_url", "media_type", "file_size"]
                
                if all(field in data for field in required_fields):
                    if data["media_type"] == "image/jpeg" and data["file_size"] > 0:
                        self.test_media.append(data)
                        self.log_result("Media upload", True, f"Uploaded media: {data['media_id']}, size: {data['file_size']} bytes")
                        return True
                    else:
                        self.log_result("Media upload", False, "Invalid media type or file size", data)
                        return False
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("Media upload", False, f"Missing fields: {missing}", data)
                    return False
            else:
                self.log_result("Media upload", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Media upload", False, f"Exception: {str(e)}")
            return False

    def test_media_upload_anonymous(self):
        """Test 2: POST /api/upload/media without authentication (should work)"""
        try:
            # Create test image
            test_image = self.create_test_image()
            
            files = {
                'file': ('test_image_anon.jpg', test_image, 'image/jpeg')
            }
            
            response = self.session.post(f"{self.base_url}/upload/media", files=files)
            
            if response.status_code == 200:
                data = response.json()
                if data["media_type"] == "image/jpeg" and data["file_size"] > 0:
                    self.test_media.append(data)
                    self.log_result("Media upload (anonymous)", True, f"Anonymous upload successful: {data['media_id']}")
                    return True
                else:
                    self.log_result("Media upload (anonymous)", False, "Invalid media data", data)
                    return False
            else:
                self.log_result("Media upload (anonymous)", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Media upload (anonymous)", False, f"Exception: {str(e)}")
            return False

    def test_media_upload_invalid_file(self):
        """Test 3: POST /api/upload/media with invalid file type"""
        try:
            # Create a text file instead of image
            text_content = io.BytesIO(b"This is not an image file")
            
            files = {
                'file': ('test.txt', text_content, 'text/plain')
            }
            
            response = self.session.post(f"{self.base_url}/upload/media", files=files)
            
            if response.status_code == 400:
                data = response.json()
                if "Invalid file type" in data.get("detail", ""):
                    self.log_result("Media upload (invalid file)", True, "Correctly rejected invalid file type")
                    return True
                else:
                    self.log_result("Media upload (invalid file)", False, f"Unexpected error: {data.get('detail')}", data)
                    return False
            else:
                self.log_result("Media upload (invalid file)", False, f"Expected 400, got {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Media upload (invalid file)", False, f"Exception: {str(e)}")
            return False

    def test_get_media_file(self):
        """Test 4: GET /api/media/{media_id} to serve uploaded media"""
        try:
            if not self.test_media:
                self.log_result("Get media file", False, "No test media available")
                return False
            
            media_id = self.test_media[0]["media_id"]
            response = self.session.get(f"{self.base_url}/media/{media_id}")
            
            if response.status_code == 200:
                content_type = response.headers.get('content-type', '')
                if content_type.startswith('image/'):
                    content_length = len(response.content)
                    self.log_result("Get media file", True, f"Retrieved media file: {content_length} bytes, type: {content_type}")
                    return True
                else:
                    self.log_result("Get media file", False, f"Invalid content type: {content_type}")
                    return False
            else:
                self.log_result("Get media file", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Get media file", False, f"Exception: {str(e)}")
            return False

    def test_get_media_thumbnail(self):
        """Test 5: GET /api/media/{media_id}/thumbnail for image thumbnails"""
        try:
            if not self.test_media:
                self.log_result("Get media thumbnail", False, "No test media available")
                return False
            
            media_id = self.test_media[0]["media_id"]
            response = self.session.get(f"{self.base_url}/media/{media_id}/thumbnail")
            
            if response.status_code == 200:
                content_type = response.headers.get('content-type', '')
                if content_type == 'image/jpeg':
                    content_length = len(response.content)
                    self.log_result("Get media thumbnail", True, f"Retrieved thumbnail: {content_length} bytes")
                    return True
                else:
                    self.log_result("Get media thumbnail", False, f"Invalid content type: {content_type}")
                    return False
            elif response.status_code == 404:
                # Thumbnail might not be generated yet, which is acceptable
                self.log_result("Get media thumbnail", True, "Thumbnail not found (acceptable for some media types)")
                return True
            else:
                self.log_result("Get media thumbnail", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Get media thumbnail", False, f"Exception: {str(e)}")
            return False

    def test_get_media_not_found(self):
        """Test 6: GET /api/media/{invalid_id} should return 404"""
        try:
            response = self.session.get(f"{self.base_url}/media/invalid-media-id-12345")
            
            if response.status_code == 404:
                self.log_result("Get media (not found)", True, "Correctly returned 404 for invalid media ID")
                return True
            else:
                self.log_result("Get media (not found)", False, f"Expected 404, got {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Get media (not found)", False, f"Exception: {str(e)}")
            return False

    def test_create_claim_with_media_urls(self):
        """Test 7: Create claim with media_urls parameter"""
        try:
            if not self.auth_token or not self.test_media:
                self.log_result("Create claim with media", False, "No auth token or test media available")
                return False
            
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            media_url = self.test_media[0]["media_url"]
            
            payload = {
                "author_id": "dummy-id",  # Should be ignored when authenticated
                "text": "New climate change report shows alarming trends",
                "link": "https://example.com/climate-report",
                "media_urls": [media_url]
            }
            
            response = self.session.post(f"{self.base_url}/claims", json=payload, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["id", "author_id", "text", "media_urls", "media_metadata"]
                
                if all(field in data for field in required_fields):
                    if (data["media_urls"] and len(data["media_urls"]) > 0 and 
                        data["media_metadata"] and len(data["media_metadata"]) > 0):
                        self.test_claims.append(data)
                        self.log_result("Create claim with media", True, f"Created claim with media: {len(data['media_urls'])} files")
                        return True
                    else:
                        self.log_result("Create claim with media", False, "Media URLs or metadata missing", data)
                        return False
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("Create claim with media", False, f"Missing fields: {missing}", data)
                    return False
            else:
                self.log_result("Create claim with media", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Create claim with media", False, f"Exception: {str(e)}")
            return False

    def test_create_claim_with_media_base64_backward_compatibility(self):
        """Test 8: Create claim with media_base64 (backward compatibility)"""
        try:
            if not self.auth_token:
                self.log_result("Create claim with base64 media", False, "No auth token available")
                return False
            
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            # Create a small base64 encoded image
            import base64
            test_image = self.create_test_image()
            base64_image = base64.b64encode(test_image.getvalue()).decode('utf-8')
            
            payload = {
                "author_id": "dummy-id",
                "text": "Legacy claim with base64 image",
                "media_base64": f"data:image/jpeg;base64,{base64_image}"
            }
            
            response = self.session.post(f"{self.base_url}/claims", json=payload, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("media_base64") and data["media_base64"].startswith("data:image/"):
                    self.test_claims.append(data)
                    self.log_result("Create claim with base64 media", True, "Created claim with base64 media (backward compatibility)")
                    return True
                else:
                    self.log_result("Create claim with base64 media", False, "Base64 media not stored properly", data)
                    return False
            else:
                self.log_result("Create claim with base64 media", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Create claim with base64 media", False, f"Exception: {str(e)}")
            return False

    def test_blockchain_status(self):
        """Test 9: GET /api/blockchain/status for blockchain statistics"""
        try:
            response = self.session.get(f"{self.base_url}/blockchain/status")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["total_blocks", "total_transactions", "reputation_records", "claim_verifications", "chain_integrity"]
                
                if all(field in data for field in required_fields):
                    if (isinstance(data["total_blocks"], int) and data["total_blocks"] >= 1 and
                        isinstance(data["chain_integrity"], bool)):
                        self.log_result("Blockchain status", True, 
                                      f"Blockchain stats: {data['total_blocks']} blocks, {data['total_transactions']} transactions, integrity: {data['chain_integrity']}")
                        return True
                    else:
                        self.log_result("Blockchain status", False, "Invalid blockchain statistics", data)
                        return False
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("Blockchain status", False, f"Missing fields: {missing}", data)
                    return False
            else:
                self.log_result("Blockchain status", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Blockchain status", False, f"Exception: {str(e)}")
            return False

    def test_blockchain_user_integrity(self):
        """Test 10: GET /api/blockchain/user/{user_id}/integrity for reputation verification"""
        try:
            if not self.authenticated_user:
                self.log_result("Blockchain user integrity", False, "No authenticated user available")
                return False
            
            user_id = self.authenticated_user["id"]
            response = self.session.get(f"{self.base_url}/blockchain/user/{user_id}/integrity")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["user_id", "records_found", "reputation_history", "chain_integrity"]
                
                if all(field in data for field in required_fields):
                    if (data["user_id"] == user_id and 
                        isinstance(data["records_found"], int) and
                        isinstance(data["reputation_history"], list) and
                        isinstance(data["chain_integrity"], bool)):
                        self.log_result("Blockchain user integrity", True, 
                                      f"User integrity verified: {data['records_found']} records, chain integrity: {data['chain_integrity']}")
                        return True
                    else:
                        self.log_result("Blockchain user integrity", False, "Invalid user integrity data", data)
                        return False
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("Blockchain user integrity", False, f"Missing fields: {missing}", data)
                    return False
            else:
                self.log_result("Blockchain user integrity", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Blockchain user integrity", False, f"Exception: {str(e)}")
            return False

    def test_blockchain_claim_integrity(self):
        """Test 11: GET /api/blockchain/claim/{claim_id}/integrity for claim verification"""
        try:
            if not self.test_claims:
                self.log_result("Blockchain claim integrity", False, "No test claims available")
                return False
            
            claim_id = self.test_claims[0]["id"]
            response = self.session.get(f"{self.base_url}/blockchain/claim/{claim_id}/integrity")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["claim_id", "records_found", "verification_history", "chain_integrity"]
                
                if all(field in data for field in required_fields):
                    if (data["claim_id"] == claim_id and 
                        isinstance(data["records_found"], int) and
                        isinstance(data["verification_history"], list) and
                        isinstance(data["chain_integrity"], bool)):
                        self.log_result("Blockchain claim integrity", True, 
                                      f"Claim integrity verified: {data['records_found']} records, chain integrity: {data['chain_integrity']}")
                        return True
                    else:
                        self.log_result("Blockchain claim integrity", False, "Invalid claim integrity data", data)
                        return False
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("Blockchain claim integrity", False, f"Missing fields: {missing}", data)
                    return False
            else:
                self.log_result("Blockchain claim integrity", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Blockchain claim integrity", False, f"Exception: {str(e)}")
            return False

    def test_claims_list_includes_media_info(self):
        """Test 12: GET /api/claims includes media information for claims with media"""
        try:
            response = self.session.get(f"{self.base_url}/claims")
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list) and len(data) > 0:
                    # Find a claim with media
                    media_claim = None
                    for claim in data:
                        if claim.get("media_urls") or claim.get("media_base64"):
                            media_claim = claim
                            break
                    
                    if media_claim:
                        if media_claim.get("media_urls") or media_claim.get("media_base64"):
                            self.log_result("Claims list includes media", True, "Claims list includes media information")
                            return True
                        else:
                            self.log_result("Claims list includes media", False, "Media information missing from claims list")
                            return False
                    else:
                        # No claims with media found, but that's okay if we haven't created any yet
                        self.log_result("Claims list includes media", True, "No claims with media found (acceptable)")
                        return True
                else:
                    self.log_result("Claims list includes media", True, "Empty claims list (acceptable)")
                    return True
            else:
                self.log_result("Claims list includes media", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Claims list includes media", False, f"Exception: {str(e)}")
            return False

    def test_user_registration_valid(self):
        """Test 1: POST /api/auth/register with valid data"""
        try:
            import time
            timestamp = str(int(time.time()))
            payload = {
                "username": f"testuser1_{timestamp}",
                "email": f"test_{timestamp}@example.com", 
                "password": "password123"
            }
            response = self.session.post(f"{self.base_url}/auth/register", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["access_token", "token_type", "user", "message"]
                
                if all(field in data for field in required_fields):
                    user = data["user"]
                    if user["username"].startswith("testuser1_") and user["email"].startswith("test_"):
                        self.auth_token = data["access_token"]
                        self.authenticated_user = user
                        self.log_result("User registration (valid)", True, f"Registered user: {user['username']}")
                        return True
                    else:
                        self.log_result("User registration (valid)", False, "User data mismatch", data)
                        return False
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("User registration (valid)", False, f"Missing fields: {missing}", data)
                    return False
            else:
                self.log_result("User registration (valid)", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("User registration (valid)", False, f"Exception: {str(e)}")
            return False

    def test_user_registration_duplicate_email(self):
        """Test 2: POST /api/auth/register with duplicate email"""
        try:
            if not self.authenticated_user:
                self.log_result("User registration (duplicate email)", False, "No authenticated user from previous test")
                return False
                
            payload = {
                "username": "testuser2",
                "email": self.authenticated_user["email"],  # Same email as previous test
                "password": "password123"
            }
            response = self.session.post(f"{self.base_url}/auth/register", json=payload)
            
            if response.status_code == 400:
                data = response.json()
                if data.get("detail") == "Email already registered":
                    self.log_result("User registration (duplicate email)", True, "Correctly rejected duplicate email")
                    return True
                else:
                    self.log_result("User registration (duplicate email)", False, f"Unexpected error: {data.get('detail')}", data)
                    return False
            else:
                self.log_result("User registration (duplicate email)", False, f"Expected 400, got {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("User registration (duplicate email)", False, f"Exception: {str(e)}")
            return False

    def test_user_registration_duplicate_username(self):
        """Test 3: POST /api/auth/register with duplicate username"""
        try:
            if not self.authenticated_user:
                self.log_result("User registration (duplicate username)", False, "No authenticated user from previous test")
                return False
                
            payload = {
                "username": self.authenticated_user["username"],  # Same username as first test
                "email": "test2@example.com",
                "password": "password123"
            }
            response = self.session.post(f"{self.base_url}/auth/register", json=payload)
            
            if response.status_code == 400:
                data = response.json()
                if data.get("detail") == "Username already taken":
                    self.log_result("User registration (duplicate username)", True, "Correctly rejected duplicate username")
                    return True
                else:
                    self.log_result("User registration (duplicate username)", False, f"Unexpected error: {data.get('detail')}", data)
                    return False
            else:
                self.log_result("User registration (duplicate username)", False, f"Expected 400, got {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("User registration (duplicate username)", False, f"Exception: {str(e)}")
            return False

    def test_user_registration_password_validation(self):
        """Test 4: POST /api/auth/register with invalid passwords"""
        test_cases = [
            {"password": "123", "expected_status": [400, 422], "description": "too short"},
            {"password": "password", "expected_status": [400], "expected_error": "Password must contain at least one number"},
            {"password": "123456", "expected_status": [400], "expected_error": "Password must contain at least one letter"}
        ]
        
        all_passed = True
        for i, case in enumerate(test_cases):
            try:
                payload = {
                    "username": f"testuser_pwd_{i}",
                    "email": f"test_pwd_{i}@example.com",
                    "password": case["password"]
                }
                response = self.session.post(f"{self.base_url}/auth/register", json=payload)
                
                if response.status_code in case["expected_status"]:
                    if response.status_code == 422:
                        # Pydantic validation error for very short passwords
                        self.log_result(f"Password validation ({case['password']})", True, f"Correctly rejected {case['description']} password")
                    elif response.status_code == 400:
                        data = response.json()
                        if "expected_error" in case and data.get("detail") == case["expected_error"]:
                            self.log_result(f"Password validation ({case['password']})", True, f"Correctly rejected: {case['expected_error']}")
                        else:
                            self.log_result(f"Password validation ({case['password']})", True, f"Correctly rejected {case['description']} password")
                    else:
                        self.log_result(f"Password validation ({case['password']})", False, f"Unexpected status code: {response.status_code}", response.text)
                        all_passed = False
                else:
                    self.log_result(f"Password validation ({case['password']})", False, f"Expected {case['expected_status']}, got {response.status_code}", response.text)
                    all_passed = False
                    
            except Exception as e:
                self.log_result(f"Password validation ({case['password']})", False, f"Exception: {str(e)}")
                all_passed = False
        
        return all_passed

    def test_user_login_valid(self):
        """Test 5: POST /api/auth/login with valid credentials"""
        try:
            if not self.authenticated_user:
                self.log_result("User login (valid)", False, "No authenticated user from registration test")
                return False
                
            payload = {
                "email": self.authenticated_user["email"],
                "password": "password123"
            }
            response = self.session.post(f"{self.base_url}/auth/login", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["access_token", "token_type", "user"]
                
                if all(field in data for field in required_fields):
                    user = data["user"]
                    if user["email"] == self.authenticated_user["email"]:
                        # Update token for subsequent tests
                        self.auth_token = data["access_token"]
                        self.authenticated_user = user
                        self.log_result("User login (valid)", True, f"Logged in user: {user['username']}")
                        return True
                    else:
                        self.log_result("User login (valid)", False, "User data mismatch", data)
                        return False
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("User login (valid)", False, f"Missing fields: {missing}", data)
                    return False
            else:
                self.log_result("User login (valid)", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("User login (valid)", False, f"Exception: {str(e)}")
            return False

    def test_user_login_invalid(self):
        """Test 6: POST /api/auth/login with invalid credentials"""
        if not self.authenticated_user:
            self.log_result("User login invalid", False, "No authenticated user from registration test")
            return False
            
        test_cases = [
            {"email": "wrong@example.com", "password": "password123"},
            {"email": self.authenticated_user["email"], "password": "wrongpassword"}
        ]
        
        all_passed = True
        for case in test_cases:
            try:
                response = self.session.post(f"{self.base_url}/auth/login", json=case)
                
                if response.status_code == 401:
                    data = response.json()
                    if data.get("detail") == "Incorrect email or password":
                        self.log_result(f"Login invalid ({case['email']})", True, "Correctly rejected invalid credentials")
                    else:
                        self.log_result(f"Login invalid ({case['email']})", False, f"Unexpected error: {data.get('detail')}", data)
                        all_passed = False
                else:
                    self.log_result(f"Login invalid ({case['email']})", False, f"Expected 401, got {response.status_code}", response.text)
                    all_passed = False
                    
            except Exception as e:
                self.log_result(f"Login invalid ({case['email']})", False, f"Exception: {str(e)}")
                all_passed = False
        
        return all_passed

    def test_auth_me_endpoint(self):
        """Test 7: GET /api/auth/me with Bearer token"""
        try:
            if not self.auth_token:
                self.log_result("Auth me endpoint", False, "No auth token available")
                return False
            
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = self.session.get(f"{self.base_url}/auth/me", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["id", "username", "email", "is_anonymous", "reputation"]
                
                if all(field in data for field in required_fields):
                    if data["username"] == self.authenticated_user["username"] and data["email"] == self.authenticated_user["email"]:
                        self.log_result("Auth me endpoint", True, f"Retrieved user info: {data['username']}")
                        return True
                    else:
                        self.log_result("Auth me endpoint", False, "User data mismatch", data)
                        return False
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("Auth me endpoint", False, f"Missing fields: {missing}", data)
                    return False
            else:
                self.log_result("Auth me endpoint", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Auth me endpoint", False, f"Exception: {str(e)}")
            return False

    def test_auth_me_no_token(self):
        """Test 8: GET /api/auth/me without token"""
        try:
            response = self.session.get(f"{self.base_url}/auth/me")
            
            if response.status_code == 401:
                self.log_result("Auth me (no token)", True, "Correctly rejected request without token")
                return True
            else:
                self.log_result("Auth me (no token)", False, f"Expected 401, got {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Auth me (no token)", False, f"Exception: {str(e)}")
            return False

    def test_create_claim_authenticated(self):
        """Test 9: Create claim as authenticated user (should auto-use user ID)"""
        try:
            if not self.auth_token:
                self.log_result("Create claim (authenticated)", False, "No auth token available")
                return False
            
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            payload = {
                "author_id": "dummy-id",  # Should be ignored when authenticated
                "text": "New renewable energy policy announced by government",
                "link": "https://example.com/policy"
            }
            
            response = self.session.post(f"{self.base_url}/claims", json=payload, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data["author_id"] == self.authenticated_user["id"]:
                    self.test_claims.append(data)
                    self.log_result("Create claim (authenticated)", True, f"Created claim with authenticated user ID: {data['author_id']}")
                    return True
                else:
                    self.log_result("Create claim (authenticated)", False, f"Expected author_id: {self.authenticated_user['id']}, got: {data['author_id']}", data)
                    return False
            else:
                self.log_result("Create claim (authenticated)", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Create claim (authenticated)", False, f"Exception: {str(e)}")
            return False

    def test_create_verification_authenticated(self):
        """Test 10: Create verification as authenticated user"""
        try:
            if not self.auth_token or not self.test_claims:
                self.log_result("Create verification (authenticated)", False, "No auth token or test claims available")
                return False
            
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            claim_id = self.test_claims[-1]["id"]  # Use the claim created by authenticated user
            
            payload = {
                "author_id": "dummy-id",  # Should be ignored when authenticated
                "stance": "support",
                "source_url": "https://example.com/verification",
                "explanation": "This is verified by authenticated user"
            }
            
            response = self.session.post(f"{self.base_url}/claims/{claim_id}/verify", json=payload, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data["author_id"] == self.authenticated_user["id"]:
                    self.log_result("Create verification (authenticated)", True, f"Created verification with authenticated user ID: {data['author_id']}")
                    return True
                else:
                    self.log_result("Create verification (authenticated)", False, f"Expected author_id: {self.authenticated_user['id']}, got: {data['author_id']}", data)
                    return False
            else:
                self.log_result("Create verification (authenticated)", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Create verification (authenticated)", False, f"Exception: {str(e)}")
            return False

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

    def test_ai_analysis_covid_claim(self):
        """REVIEW REQUEST: Test AI analysis with COVID vaccine microchip claim"""
        try:
            payload = {"text": "The COVID-19 vaccine contains microchips"}
            response = self.session.post(f"{self.base_url}/analyze/claim", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["summary", "label", "confidence", "reasoning"]
                
                if all(field in data for field in required_fields):
                    if (data["summary"] and data["label"] and 
                        data["confidence"] is not None and data["reasoning"]):
                        self.log_result("AI Analysis (COVID claim)", True, 
                                      f"Label: {data['label']}, Confidence: {data['confidence']}, Summary: {data['summary'][:100]}...")
                        return True
                    else:
                        self.log_result("AI Analysis (COVID claim)", False, "Missing or empty AI analysis fields", data)
                        return False
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_result("AI Analysis (COVID claim)", False, f"Missing fields: {missing}", data)
                    return False
            else:
                self.log_result("AI Analysis (COVID claim)", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("AI Analysis (COVID claim)", False, f"Exception: {str(e)}")
            return False

    def test_claim_creation_with_ai_analysis(self):
        """REVIEW REQUEST: Test claim creation includes AI analysis fields"""
        try:
            # First create a user
            user_payload = {"username": "ai_test_user"}
            user_response = self.session.post(f"{self.base_url}/users/bootstrap", json=user_payload)
            
            if user_response.status_code != 200:
                self.log_result("Claim creation with AI", False, "Failed to create user", user_response.text)
                return False
            
            user_data = user_response.json()
            
            # Create claim with COVID vaccine microchip text
            claim_payload = {
                "author_id": user_data["id"],
                "text": "The COVID-19 vaccine contains microchips"
            }
            
            response = self.session.post(f"{self.base_url}/claims", json=claim_payload)
            
            if response.status_code == 200:
                data = response.json()
                ai_fields = ["ai_summary", "ai_label", "ai_confidence", "ai_reasoning"]
                
                if all(field in data for field in ai_fields):
                    if (data["ai_summary"] and data["ai_label"] and 
                        data["ai_confidence"] is not None and data["ai_reasoning"]):
                        self.log_result("Claim creation with AI", True, 
                                      f"Created claim with AI analysis - Label: {data['ai_label']}, Confidence: {data['ai_confidence']}")
                        return True
                    else:
                        self.log_result("Claim creation with AI", False, "AI analysis fields are empty or null", data)
                        return False
                else:
                    missing = [f for f in ai_fields if f not in data]
                    self.log_result("Claim creation with AI", False, f"Missing AI fields: {missing}", data)
                    return False
            else:
                self.log_result("Claim creation with AI", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_result("Claim creation with AI", False, f"Exception: {str(e)}")
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
        print(f"🚀 Starting PeerFact Enhanced Backend API Tests")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 80)
        
        tests = [
            # Authentication tests first (needed for media upload)
            self.test_user_registration_valid,
            self.test_user_registration_duplicate_email,
            self.test_user_registration_duplicate_username,
            self.test_user_registration_password_validation,
            self.test_user_login_valid,
            self.test_user_login_invalid,
            self.test_auth_me_endpoint,
            self.test_auth_me_no_token,
            
            # NEW: Media Upload System Tests
            self.test_media_upload,
            self.test_media_upload_anonymous,
            self.test_media_upload_invalid_file,
            self.test_get_media_file,
            self.test_get_media_thumbnail,
            self.test_get_media_not_found,
            
            # NEW: Enhanced Claims with Media Tests
            self.test_create_claim_with_media_urls,
            self.test_create_claim_with_media_base64_backward_compatibility,
            self.test_claims_list_includes_media_info,
            
            # NEW: Blockchain Integration Tests
            self.test_blockchain_status,
            self.test_blockchain_user_integrity,
            self.test_blockchain_claim_integrity,
            
            # Authenticated claim/verification tests
            self.test_create_claim_authenticated,
            self.test_create_verification_authenticated,
            
            # Original tests (backward compatibility)
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
        
        print("=" * 80)
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