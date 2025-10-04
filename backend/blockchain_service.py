"""
Blockchain Service for PeerFact
Handles immutable reputation scores and claim verification on blockchain
"""

import os
import logging
import hashlib
import json
from typing import Dict, Any, Optional, List
from datetime import datetime
import httpx
from pydantic import BaseModel


class BlockchainRecord(BaseModel):
    """Blockchain record model"""
    transaction_id: str
    block_hash: str
    timestamp: datetime
    data_type: str  # "reputation", "claim", "verification"
    entity_id: str
    data: Dict[str, Any]


class BlockchainService:
    """Simplified blockchain service for reputation and claim integrity"""
    
    def __init__(self):
        self.chain: List[Dict[str, Any]] = []
        self.pending_transactions: List[Dict[str, Any]] = []
        self.difficulty = 4  # Mining difficulty
        
        # Create genesis block
        if not self.chain:
            self.create_genesis_block()
    
    def create_genesis_block(self) -> None:
        """Create the first block in the chain"""
        genesis_block = {
            "index": 0,
            "timestamp": datetime.utcnow().isoformat(),
            "transactions": [],
            "nonce": 0,
            "previous_hash": "0",
            "hash": self.calculate_hash({
                "index": 0,
                "timestamp": datetime.utcnow().isoformat(),
                "transactions": [],
                "nonce": 0,
                "previous_hash": "0"
            })
        }
        self.chain.append(genesis_block)
    
    def calculate_hash(self, block_data: Dict[str, Any]) -> str:
        """Calculate SHA-256 hash of block data"""
        block_string = json.dumps(block_data, sort_keys=True, default=str)
        return hashlib.sha256(block_string.encode()).hexdigest()
    
    def get_latest_block(self) -> Dict[str, Any]:
        """Get the most recent block"""
        return self.chain[-1]
    
    def add_transaction(self, transaction: Dict[str, Any]) -> str:
        """Add transaction to pending pool"""
        transaction_id = str(len(self.pending_transactions))
        transaction["id"] = transaction_id
        transaction["timestamp"] = datetime.utcnow().isoformat()
        self.pending_transactions.append(transaction)
        return transaction_id
    
    def mine_pending_transactions(self) -> Optional[str]:
        """Mine pending transactions into a new block"""
        if not self.pending_transactions:
            return None
        
        new_block = {
            "index": len(self.chain),
            "timestamp": datetime.utcnow().isoformat(),
            "transactions": self.pending_transactions.copy(),
            "nonce": 0,
            "previous_hash": self.get_latest_block()["hash"]
        }
        
        # Simple proof-of-work mining
        target = "0" * self.difficulty
        while not new_block["hash"].startswith(target) if "hash" in new_block else True:
            new_block["nonce"] += 1
            new_block["hash"] = self.calculate_hash(new_block)
            
            # Prevent infinite loops in development
            if new_block["nonce"] > 1000000:
                break
        
        self.chain.append(new_block)
        self.pending_transactions = []
        
        return new_block["hash"]
    
    def record_user_reputation(self, user_id: str, reputation_score: float, 
                             verification_count: int, accuracy_rate: float) -> str:
        """Record user reputation on blockchain"""
        transaction = {
            "type": "reputation_update",
            "user_id": user_id,
            "reputation_score": reputation_score,
            "verification_count": verification_count,
            "accuracy_rate": accuracy_rate,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        transaction_id = self.add_transaction(transaction)
        block_hash = self.mine_pending_transactions()
        
        return block_hash or "pending"
    
    def record_claim_verification(self, claim_id: str, verifications: List[Dict[str, Any]], 
                                final_verdict: Dict[str, Any]) -> str:
        """Record claim verification results on blockchain"""
        transaction = {
            "type": "claim_verification",
            "claim_id": claim_id,
            "verification_count": len(verifications),
            "final_verdict": final_verdict,
            "verification_hash": self.calculate_hash({"verifications": verifications}),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        transaction_id = self.add_transaction(transaction)
        block_hash = self.mine_pending_transactions()
        
        return block_hash or "pending"
    
    def verify_reputation_integrity(self, user_id: str) -> Dict[str, Any]:
        """Verify the integrity of user reputation records"""
        reputation_records = []
        
        for block in self.chain:
            for transaction in block.get("transactions", []):
                if (transaction.get("type") == "reputation_update" and 
                    transaction.get("user_id") == user_id):
                    reputation_records.append({
                        "block_hash": block["hash"],
                        "timestamp": transaction["timestamp"],
                        "reputation_score": transaction["reputation_score"],
                        "verification_count": transaction["verification_count"],
                        "accuracy_rate": transaction["accuracy_rate"]
                    })
        
        return {
            "user_id": user_id,
            "records_found": len(reputation_records),
            "reputation_history": reputation_records,
            "chain_integrity": self.verify_chain_integrity()
        }
    
    def verify_claim_integrity(self, claim_id: str) -> Dict[str, Any]:
        """Verify the integrity of claim verification records"""
        claim_records = []
        
        for block in self.chain:
            for transaction in block.get("transactions", []):
                if (transaction.get("type") == "claim_verification" and 
                    transaction.get("claim_id") == claim_id):
                    claim_records.append({
                        "block_hash": block["hash"],
                        "timestamp": transaction["timestamp"],
                        "verification_count": transaction["verification_count"],
                        "final_verdict": transaction["final_verdict"],
                        "verification_hash": transaction["verification_hash"]
                    })
        
        return {
            "claim_id": claim_id,
            "records_found": len(claim_records),
            "verification_history": claim_records,
            "chain_integrity": self.verify_chain_integrity()
        }
    
    def verify_chain_integrity(self) -> bool:
        """Verify the integrity of the entire blockchain"""
        for i in range(1, len(self.chain)):
            current_block = self.chain[i]
            previous_block = self.chain[i - 1]
            
            # Verify current block hash
            calculated_hash = self.calculate_hash({
                k: v for k, v in current_block.items() if k != "hash"
            })
            if current_block["hash"] != calculated_hash:
                return False
            
            # Verify link to previous block
            if current_block["previous_hash"] != previous_block["hash"]:
                return False
        
        return True
    
    def get_blockchain_stats(self) -> Dict[str, Any]:
        """Get blockchain statistics"""
        total_transactions = sum(
            len(block.get("transactions", [])) for block in self.chain
        )
        
        reputation_transactions = 0
        claim_transactions = 0
        
        for block in self.chain:
            for transaction in block.get("transactions", []):
                if transaction.get("type") == "reputation_update":
                    reputation_transactions += 1
                elif transaction.get("type") == "claim_verification":
                    claim_transactions += 1
        
        return {
            "total_blocks": len(self.chain),
            "total_transactions": total_transactions,
            "reputation_records": reputation_transactions,
            "claim_verifications": claim_transactions,
            "pending_transactions": len(self.pending_transactions),
            "chain_integrity": self.verify_chain_integrity(),
            "latest_block_hash": self.get_latest_block()["hash"]
        }


# Global blockchain instance
blockchain = BlockchainService()


# Integration functions for use in main server
async def record_reputation_on_blockchain(user_id: str, reputation: float, 
                                        verification_count: int, accuracy_rate: float) -> str:
    """Record user reputation on blockchain (async wrapper)"""
    try:
        return blockchain.record_user_reputation(user_id, reputation, verification_count, accuracy_rate)
    except Exception as e:
        logging.error(f"Blockchain reputation recording failed: {e}")
        return "error"


async def record_claim_on_blockchain(claim_id: str, verifications: List[Dict[str, Any]], 
                                   verdict: Dict[str, Any]) -> str:
    """Record claim verification on blockchain (async wrapper)"""
    try:
        return blockchain.record_claim_verification(claim_id, verifications, verdict)
    except Exception as e:
        logging.error(f"Blockchain claim recording failed: {e}")
        return "error"


async def get_reputation_integrity(user_id: str) -> Dict[str, Any]:
    """Get reputation integrity verification from blockchain"""
    try:
        return blockchain.verify_reputation_integrity(user_id)
    except Exception as e:
        logging.error(f"Blockchain reputation verification failed: {e}")
        return {"error": str(e)}


async def get_claim_integrity(claim_id: str) -> Dict[str, Any]:
    """Get claim integrity verification from blockchain"""
    try:
        return blockchain.verify_claim_integrity(claim_id)
    except Exception as e:
        logging.error(f"Blockchain claim verification failed: {e}")
        return {"error": str(e)}


async def get_blockchain_status() -> Dict[str, Any]:
    """Get blockchain status and statistics"""
    try:
        return blockchain.get_blockchain_stats()
    except Exception as e:
        logging.error(f"Blockchain status retrieval failed: {e}")
        return {"error": str(e)}