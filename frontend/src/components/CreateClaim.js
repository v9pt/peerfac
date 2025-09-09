import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  LinkIcon, 
  PhotoIcon,
  DocumentTextIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';

export default function CreateClaim({ isAuthenticated, currentUser, onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    text: '',
    link: '',
    media_base64: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear analysis when text changes
    if (name === 'text') {
      setAnalysisResult(null);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Only image files are supported');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          media_base64: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to upload file');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!formData.text.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError('');

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

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('AI analysis failed. You can still submit your claim.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      onLogin();
      return;
    }

    if (!formData.text.trim()) {
      setError('Please enter a claim to submit');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BACKEND_URL}/api/claims`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify({
          author_id: currentUser?.id || 'anonymous',
          text: formData.text,
          link: formData.link || null,
          media_base64: formData.media_base64
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create claim');
      }

      const newClaim = await response.json();
      setSuccess('Claim created successfully!');
      
      // Reset form
      setFormData({ text: '', link: '', media_base64: null });
      setAnalysisResult(null);
      
      // Navigate to the new claim
      setTimeout(() => {
        navigate(`/claim/${newClaim.id}`);
      }, 1500);

    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'Failed to create claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, media_base64: null }));
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="heading-primary">Create New Claim</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Share a claim that needs fact-checking. Our AI will analyze it, and the community can verify it.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="glass-card">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Text Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <DocumentTextIcon className="h-4 w-4 inline mr-2" />
                    Claim Text *
                  </label>
                  <textarea
                    name="text"
                    value={formData.text}
                    onChange={handleInputChange}
                    placeholder="Enter the claim you want fact-checked... (e.g., 'Scientists have discovered a new planet in our solar system')"
                    className="glass-textarea"
                    rows={6}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.text.length}/1000 characters
                  </p>
                </div>

                {/* Link Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <LinkIcon className="h-4 w-4 inline mr-2" />
                    Source Link (Optional)
                  </label>
                  <input
                    type="url"
                    name="link"
                    value={formData.link}
                    onChange={handleInputChange}
                    placeholder="https://example.com/article"
                    className="glass-input"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <PhotoIcon className="h-4 w-4 inline mr-2" />
                    Image Evidence (Optional)
                  </label>
                  
                  {!formData.media_base64 ? (
                    <div
                      className={`glass border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                        dragActive 
                          ? 'border-blue-500 bg-blue-500/10' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('file-upload').click()}
                    >
                      <PhotoIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        Drag and drop an image, or <span className="text-blue-500">click to browse</span>
                      </p>
                      <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e.target.files[0])}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="glass rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-green-600 dark:text-green-400">
                          ✅ Image uploaded successfully
                        </span>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="text-red-500 hover:text-red-400"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                      <img
                        src={formData.media_base64}
                        alt="Uploaded evidence"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={!formData.text.trim() || isAnalyzing}
                    className="glass-button flex items-center justify-center space-x-2 gradient-secondary text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <SparklesIcon className="h-4 w-4" />
                    )}
                    <span>{isAnalyzing ? 'Analyzing...' : 'AI Analysis'}</span>
                  </button>

                  <button
                    type="submit"
                    disabled={!formData.text.trim() || isSubmitting}
                    className="glass-button flex items-center justify-center space-x-2 gradient-primary text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <PlusIcon className="h-4 w-4" />
                    )}
                    <span>{isSubmitting ? 'Creating...' : 'Create Claim'}</span>
                  </button>
                </div>

                {/* Status Messages */}
                {error && (
                  <div className="glass rounded-lg p-4 border border-red-500/30 bg-red-500/10">
                    <div className="flex items-center space-x-2 text-red-400">
                      <ExclamationTriangleIcon className="h-5 w-5" />
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="glass rounded-lg p-4 border border-green-500/30 bg-green-500/10">
                    <div className="flex items-center space-x-2 text-green-400">
                      <CheckCircleIcon className="h-5 w-5" />
                      <span>{success}</span>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Analysis Results */}
            {analysisResult && (
              <div className="glass-card border border-blue-500/30">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <SparklesIcon className="h-5 w-5 mr-2 text-blue-500" />
                  AI Analysis
                </h3>
                
                <div className="space-y-4">
                  <div className="p-3 glass rounded-lg">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Classification:
                    </p>
                    <span className={`status-badge ${
                      analysisResult.label?.toLowerCase().includes('true') ? 'status-true' :
                      analysisResult.label?.toLowerCase().includes('false') ? 'status-false' :
                      'status-unclear'
                    }`}>
                      {analysisResult.label}
                    </span>
                  </div>

                  {analysisResult.summary && (
                    <div className="p-3 glass rounded-lg">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Summary:
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {analysisResult.summary}
                      </p>
                    </div>
                  )}

                  {analysisResult.confidence && (
                    <div className="p-3 glass rounded-lg">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confidence:
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                            style={{ width: `${(analysisResult.confidence * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round(analysisResult.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="glass-card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                💡 Tips for Better Claims
              </h3>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Be specific and clear in your claim</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Include reliable source links when possible</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Add visual evidence if available</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Use AI analysis to get initial insights</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}