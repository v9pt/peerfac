import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PhotoIcon, LinkIcon, TagIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useApp } from '../App';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';

const CreateClaimPage = () => {
  const navigate = useNavigate();
  const { API, theme, fetchClaims } = useApp();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    text: '',
    link: '',
    tags: [],
  });
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiPreview, setAiPreview] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const analyzeWithAI = async () => {
    if (!formData.text.trim()) return;
    
    setLoading(true);
    try {
      // Use the comprehensive analysis endpoint for detailed insights
      const response = await axios.post(`${API}/analyze/comprehensive`, {
        text: formData.text,
        link: formData.link.trim() || null
      });
      setAiPreview(response.data);
      setShowPreview(true);
    } catch (error) {
      console.error('AI analysis failed:', error);
      setError('AI analysis failed. You can still submit your claim.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please log in to create a claim');
      return;
    }

    if (!formData.text.trim()) {
      setError('Please enter a claim');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API}/claims`, {
        author_id: user?.id, // For backward compatibility with anonymous users
        text: formData.text.trim(),
        link: formData.link.trim() || null,
        media_base64: null,
        tags: formData.tags,
      });

      // Refresh claims list
      await fetchClaims();
      
      // Navigate to the new claim
      navigate(`/claim/${response.data.id}`);
    } catch (error) {
      console.error('Failed to create claim:', error);
      setError(error.response?.data?.detail || 'Failed to create claim');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className={`p-2 rounded-lg ${
            theme === 'dark' 
              ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          } transition-colors`}
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Create New Claim
          </h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Share a statement that needs verification from the community
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Claim Text */}
            <div className={`p-6 rounded-xl border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                What's the claim you want verified?
              </label>
              <textarea
                name="text"
                value={formData.text}
                onChange={handleInputChange}
                placeholder="Enter the claim that needs fact-checking. Be specific and clear about what you're asserting..."
                rows={6}
                className={`w-full p-4 rounded-lg border resize-none ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                required
              />
              
              <div className="flex justify-between items-center mt-3">
                <span className={`text-sm ${
                  formData.text.length > 500 ? 'text-red-500' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {formData.text.length}/1000 characters
                </span>
                
                <button
                  type="button"
                  onClick={analyzeWithAI}
                  disabled={!formData.text.trim() || loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  <SparklesIcon className="w-4 h-4" />
                  <span>{loading ? 'Analyzing...' : 'AI Preview'}</span>
                </button>
              </div>
            </div>

            {/* Source Link */}
            <div className={`p-6 rounded-xl border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Source Link (Optional)
              </label>
              <div className="relative">
                <LinkIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  placeholder="https://example.com/source-of-claim"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
              <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Add a link to where you found this claim or its source
              </p>
            </div>

            {/* Tags */}
            <div className={`p-6 rounded-xl border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Tags (Optional)
              </label>
              <div className="flex space-x-2 mb-3">
                <div className="relative flex-1">
                  <TagIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add a tag (politics, science, health...)"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Add
                </button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  theme === 'dark' 
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.text.trim()}
                className="flex items-center space-x-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Claim</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Preview */}
          {showPreview && aiPreview && (
            <div className={`p-6 rounded-xl border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center space-x-2 mb-4">
                <SparklesIcon className="w-5 h-5 text-purple-500" />
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  AI Analysis Preview
                </h3>
              </div>
              
              <div className="space-y-4">
                {/* Summary */}
                <div>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Summary:
                  </p>
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {aiPreview.summary}
                  </p>
                </div>

                {/* Assessment & Confidence */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Assessment:
                    </p>
                    <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
                      aiPreview.label?.toLowerCase().includes('true') 
                        ? 'bg-green-100 text-green-800'
                        : aiPreview.label?.toLowerCase().includes('false')
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {aiPreview.label}
                    </span>
                  </div>
                  
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Confidence:
                    </p>
                    <div className="mt-1">
                      <div className={`w-full h-2 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.round((aiPreview.confidence || 0) * 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {Math.round((aiPreview.confidence || 0) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Evidence Quality & Bias */}
                {aiPreview.evidence_quality && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Evidence:
                      </p>
                      <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
                        aiPreview.evidence_quality === 'high' ? 'bg-green-100 text-green-800' :
                        aiPreview.evidence_quality === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {aiPreview.evidence_quality.toUpperCase()}
                      </span>
                    </div>
                    
                    {aiPreview.bias_score !== undefined && (
                      <div>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Bias:
                        </p>
                        <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
                          aiPreview.bias_score < 0.3 ? 'bg-green-100 text-green-800' :
                          aiPreview.bias_score < 0.7 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {aiPreview.bias_score < 0.3 ? 'LOW' : aiPreview.bias_score < 0.7 ? 'MEDIUM' : 'HIGH'}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Key Entities */}
                {aiPreview.entities && aiPreview.entities.length > 0 && (
                  <div>
                    <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Key Entities:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {aiPreview.entities.slice(0, 4).map((entity, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                        >
                          {entity.text}
                        </span>
                      ))}
                      {aiPreview.entities.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{aiPreview.entities.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Red Flags */}
                {aiPreview.contradiction_flags && aiPreview.contradiction_flags.length > 0 && (
                  <div>
                    <p className={`text-sm font-medium text-red-600 mb-2`}>
                      ⚠️ Potential Issues:
                    </p>
                    <div className="space-y-1">
                      {aiPreview.contradiction_flags.slice(0, 2).map((flag, index) => (
                        <div key={index} className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                          {flag}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Source Analysis */}
                {aiPreview.sources_analysis && aiPreview.sources_analysis.length > 0 && (
                  <div>
                    <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Source Analysis:
                    </p>
                    {aiPreview.sources_analysis[0] && (
                      <div className={`p-2 rounded text-xs ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {aiPreview.sources_analysis[0].domain}
                          </span>
                          <span className={`px-2 py-1 rounded ${
                            aiPreview.sources_analysis[0].credibility_score >= 0.8 
                              ? 'bg-green-100 text-green-800' 
                              : aiPreview.sources_analysis[0].credibility_score >= 0.6 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {Math.round(aiPreview.sources_analysis[0].credibility_score * 100)}% credible
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Top Verification Suggestion */}
                {aiPreview.verification_suggestions && aiPreview.verification_suggestions.length > 0 && (
                  <div>
                    <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      💡 Suggestion:
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'} bg-blue-50 p-2 rounded`}>
                      {aiPreview.verification_suggestions[0]}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Guidelines */}
          <div className={`p-6 rounded-xl border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Claim Guidelines
            </h3>
            <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              <li className="flex items-start space-x-2">
                <span className="text-green-500">✓</span>
                <span>Be specific and factual</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500">✓</span>
                <span>Include sources when possible</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-500">✓</span>
                <span>Use clear, neutral language</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-red-500">✗</span>
                <span>Don't post opinions as facts</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-red-500">✗</span>
                <span>Avoid inflammatory language</span>
              </li>
            </ul>
          </div>

          {/* Popular Tags */}
          <div className={`p-6 rounded-xl border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Popular Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {['politics', 'science', 'health', 'technology', 'climate', 'economy'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    if (!formData.tags.includes(tag)) {
                      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                    }
                  }}
                  className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors border"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateClaimPage;