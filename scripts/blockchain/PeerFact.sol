// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Minimal on-chain log for PeerFact claim verdicts & reputation changes
contract PeerFactLog {
    event ClaimLogged(bytes32 indexed claimHash, string verdict, uint256 timestamp, string[] topSources);
    event ReputationUpdated(address indexed user, int256 delta, uint256 newScore, uint256 timestamp);

    struct Entry {
        bytes32 claimHash;
        string verdict;
        uint256 timestamp;
        string[] topSources;
    }

    Entry[] public entries;

    function logClaim(bytes32 claimHash, string memory verdict, string[] memory topSources) external {
        entries.push(Entry({claimHash: claimHash, verdict: verdict, timestamp: block.timestamp, topSources: topSources}));
        emit ClaimLogged(claimHash, verdict, block.timestamp, topSources);
    }

    function entriesCount() external view returns (uint256) {
        return entries.length;
    }
}