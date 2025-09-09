import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon,
  LinkIcon,
  PhotoIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';

export default function CreateClaim({ isAuthenticated, currentUser, onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    text: '',
    link: '',
    tags: []
  });
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const analyzeWithAI = async () => {
    if (!formData.text.trim()) return;
    
    setAnalyzing(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/analyze/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: formData.text,
          link: formData.link || null
        }),
      });

      if (response.ok) {
        const analysis = await response.json();
        setAiAnalysis(analysis);
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      onLogin();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/claims`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          author_id: currentUser?.id || 'anonymous',
          text: formData.text.trim(),
          link: formData.link.trim() || null,
          tags: formData.tags
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to create claim');
      }

      const newClaim = await response.json();
      setSuccess(true);
      
      // Redirect to the new claim after a short delay
      setTimeout(() => {
        navigate(`/claim/${newClaim.id}`);
      }, 2000);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="glass-strong rounded-2xl p-8 border border-white/20 dark:border-white/10">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Claim Created Successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your claim has been submitted and is ready for community verification.
            </p>
            <div className="spinner mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Submit New Claim
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Share a claim that needs fact-checking by the community
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="glass rounded-xl p-6 border border-white/20 dark:border-white/10">
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Claim Text */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <DocumentTextIcon className="w-4 h-4" />
                    <span>Claim Text *</span>
                  </label>
                  <textarea
                    name="text"
                    value={formData.text}
                    onChange={handleInputChange}
                    placeholder="Enter the claim you want fact-checked..."
                    rows={4}
                    className="w-full px-4 py-3 glass rounded-xl border border-white/20 dark:border-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 placeholder-gray-400 resize-none"
                    required
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {formData.text.length}/500 characters
                    </p>
                    <button
                      type="button"
                      onClick={analyzeWithAI}
                      disabled={analyzing || !formData.text.trim()}
                      className="flex items-center space-x-2 px-3 py-1 text-sm bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-500/20 transition-colors disabled:opacity-50"
                    >
                      <SparklesIcon className="w-4 h-4" />
                      <span>{analyzing ? 'Analyzing...' : 'AI Preview'}</span>
                    </button>
                  </div>
                </div>

                {/* Source Link */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <LinkIcon className="w-4 h-4" />
                    <span>Source Link (Optional)</span>
                  </label>
                  <input
                    type="url"
                    name="link"
                    value={formData.link}
                    onChange={handleInputChange}
                    placeholder="https://example.com/source"
                    className="w-full px-4 py-3 glass rounded-xl border border-white/20 dark:border-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 placeholder-gray-400"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading || !formData.text.trim()}
                    className="w-full btn-gradient text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="spinner"></div>
                        <span>Creating Claim...</span>
                      </>
                    ) : (
                      <span>Submit for Fact-Checking</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Analysis Preview */}
            {aiAnalysis && (
              <div className="glass rounded-xl p-4 border border-white/20 dark:border-white/10">
                <h3 className="font-semibold mb-3 flex items-center space-x-2">
                  <SparklesIcon className="w-5 h-5 text-purple-500" />
                  <span>AI Analysis Preview</span>
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Summary:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {aiAnalysis.summary}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Initial Classification:</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      aiAnalysis.label.includes('True') ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
                      aiAnalysis.label.includes('False') ? 'bg-red-500/20 text-red-600 dark:text-red-400' :
                      'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {aiAnalysis.label}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Confidence:</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(aiAnalysis.confidence || 0) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {Math.round((aiAnalysis.confidence || 0) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Guidelines */}
            <div className="glass rounded-xl p-4 border border-white/20 dark:border-white/10">
              <h3 className="font-semibold mb-3 flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
                <span>Submission Guidelines</span>
              </h3>
              
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Be specific and factual</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Include source links when possible</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Use clear, unbiased language</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>No personal opinions or attacks</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>No spam or duplicate content</span>
                </li>
              </ul>
            </div>

            {/* Statistics */}
            <div className="glass rounded-xl p-4 border border-white/20 dark:border-white/10">
              <h3 className="font-semibold mb-3">Platform Stats</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Claims Today</span>
                  <span className="text-sm font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Verified Claims</span>
                  <span className="text-sm font-medium">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active Verifiers</span>
                  <span className="text-sm font-medium">25</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg. Response Time</span>
                  <span className="text-sm font-medium">2.3 hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}