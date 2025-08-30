import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  ShareIcon, 
  FlagIcon,
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftIcon,
  LinkIcon,
  CalendarIcon,
  UserIcon,
  BeakerIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  GlobeAltIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../App';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';

const ClaimDetailPage = () => {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const { user, API, theme } = useApp();
  
  const [claim, setClaim] = useState(null);
  const [verifications, setVerifications] = useState([]);
  const [verdict, setVerdict] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [newVerification, setNewVerification] = useState({
    stance: 'support',
    source_url: '',
    explanation: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchClaimDetail = async () => {
      setLoading(true);
      try {
        // Use the detailed endpoint to get enhanced AI analysis
        const response = await axios.get(`${API}/claims/${claimId}/detailed`);
        setClaim(response.data.claim);
        setVerifications(response.data.verifications || []);
        setVerdict(response.data.verdict || null);
        setAiAnalysis(response.data.ai_analysis || null);
      } catch (error) {
        console.error('Failed to fetch claim details:', error);
        // Fallback to regular endpoint if detailed fails
        try {
          const fallbackResponse = await axios.get(`${API}/claims/${claimId}`);
          setClaim(fallbackResponse.data.claim);
          setVerifications(fallbackResponse.data.verifications || []);
          setVerdict(fallbackResponse.data.verdict || null);
        } catch (fallbackError) {
          setError('Failed to load claim details');
        }
      } finally {
        setLoading(false);
      }
    };

    if (claimId) {
      fetchClaimDetail();
    }
  }, [claimId, API]);

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please log in to add verification');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await axios.post(`${API}/claims/${claimId}/verify`, {
        author_id: user.id,
        stance: newVerification.stance,
        source_url: newVerification.source_url || null,
        explanation: newVerification.explanation || null,
      });

      // Refresh the claim details
      const response = await axios.get(`${API}/claims/${claimId}`);
      setVerifications(response.data.verifications || []);
      setVerdict(response.data.verdict || null);

      // Reset form
      setNewVerification({
        stance: 'support',
        source_url: '',
        explanation: ''
      });
    } catch (error) {
      console.error('Failed to add verification:', error);
      setError(error.response?.data?.detail || 'Failed to add verification');
    } finally {
      setSubmitting(false);
    }
  };

  const getVerificationIcon = (label) => {
    if (!label) return <QuestionMarkCircleIcon className="w-6 h-6 text-gray-500" />;
    
    if (label.toLowerCase().includes('true')) {
      return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
    }
    if (label.toLowerCase().includes('false')) {
      return <XCircleIcon className="w-6 h-6 text-red-500" />;
    }
    return <QuestionMarkCircleIcon className="w-6 h-6 text-yellow-500" />;
  };

  const getStanceColor = (stance) => {
    switch (stance) {
      case 'support': return 'text-green-600 bg-green-100 border-green-200';
      case 'refute': return 'text-red-600 bg-red-100 border-red-200';
      case 'unclear': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !claim) {
    return (
      <div className="text-center py-12">
        <p className={`text-lg ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const totalVerifications = (verdict?.support || 0) + (verdict?.refute || 0) + (verdict?.unclear || 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center space-x-2 p-2 rounded-lg ${
            theme === 'dark' 
              ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          } transition-colors`}
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="flex items-center space-x-2">
          <button className={`p-2 rounded-lg ${
            theme === 'dark' 
              ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          } transition-colors`}>
            <ShareIcon className="w-5 h-5" />
          </button>
          <button className={`p-2 rounded-lg ${
            theme === 'dark' 
              ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          } transition-colors`}>
            <FlagIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Claim Details */}
          <div className={`p-8 rounded-xl border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-start space-x-4 mb-6">
              {getVerificationIcon(claim?.ai_label)}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                    claim?.ai_label?.toLowerCase().includes('true') 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : claim?.ai_label?.toLowerCase().includes('false')
                      ? 'bg-red-100 text-red-800 border-red-200'
                      : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                  }`}>
                    {claim?.ai_label || 'Unverified'}
                  </span>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{new Date(claim?.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <h1 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {claim?.ai_summary || claim?.text}
                </h1>

                {claim?.text !== claim?.ai_summary && claim?.ai_summary && (
                  <div className={`p-4 rounded-lg mb-4 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <h3 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Original Claim:
                    </h3>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {claim?.text}
                    </p>
                  </div>
                )}

                {claim?.link && (
                  <div className={`p-4 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <LinkIcon className="w-4 h-4" />
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Source
                      </span>
                    </div>
                    <a 
                      href={claim.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm break-all"
                    >
                      {claim.link}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Analysis Section */}
          {aiAnalysis && (
            <div className={`p-8 rounded-xl border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center space-x-2 mb-6">
                <BeakerIcon className="w-6 h-6 text-blue-500" />
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  AI Analysis
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Confidence & Evidence Quality */}
                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Analysis Confidence
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          AI Confidence
                        </span>
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {Math.round((aiAnalysis.confidence || 0) * 100)}%
                        </span>
                      </div>
                      <div className={`w-full h-2 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${Math.round((aiAnalysis.confidence || 0) * 100)}%` }}
                        />
                      </div>
                    </div>
                    {aiAnalysis.evidence_quality && (
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          Evidence Quality
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          aiAnalysis.evidence_quality === 'high' ? 'bg-green-100 text-green-800' :
                          aiAnalysis.evidence_quality === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {aiAnalysis.evidence_quality.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bias Analysis */}
                {aiAnalysis.bias_score !== undefined && (
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Bias & Stance
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            Bias Score
                          </span>
                          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {Math.round((aiAnalysis.bias_score || 0) * 100)}%
                          </span>
                        </div>
                        <div className={`w-full h-2 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                          <div 
                            className="h-full bg-orange-500 rounded-full transition-all duration-300"
                            style={{ width: `${Math.round((aiAnalysis.bias_score || 0) * 100)}%` }}
                          />
                        </div>
                      </div>
                      {aiAnalysis.stance && (
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            Stance
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            aiAnalysis.stance.includes('positive') ? 'bg-green-100 text-green-800' :
                            aiAnalysis.stance.includes('negative') ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {aiAnalysis.stance.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* AI Reasoning */}
              {aiAnalysis.reasoning && (
                <div className="mt-6">
                  <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    AI Reasoning
                  </h3>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                    {aiAnalysis.reasoning}
                  </p>
                </div>
              )}

              {/* Entities */}
              {aiAnalysis.entities && aiAnalysis.entities.length > 0 && (
                <div className="mt-6">
                  <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Key Entities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {aiAnalysis.entities.map((entity, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm border ${
                          entity.importance === 'high' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          entity.importance === 'medium' ? 'bg-green-100 text-green-800 border-green-200' :
                          'bg-gray-100 text-gray-800 border-gray-200'
                        }`}
                      >
                        {entity.text} ({entity.type})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contradiction Flags */}
              {aiAnalysis.contradiction_flags && aiAnalysis.contradiction_flags.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Potential Issues
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {aiAnalysis.contradiction_flags.map((flag, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mt-0.5" />
                        <span className="text-red-700 text-sm">{flag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verification Suggestions */}
              {aiAnalysis.verification_suggestions && aiAnalysis.verification_suggestions.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <LightBulbIcon className="w-5 h-5 text-yellow-500" />
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Verification Suggestions
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {aiAnalysis.verification_suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className={`flex items-start space-x-2 p-3 rounded-lg ${
                          theme === 'dark' ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
                        }`}
                      >
                        <LightBulbIcon className="w-4 h-4 text-blue-500 mt-0.5" />
                        <span className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                          {suggestion}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Source Analysis */}
              {aiAnalysis.sources_analysis && aiAnalysis.sources_analysis.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <GlobeAltIcon className="w-5 h-5 text-green-500" />
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Source Analysis
                    </h3>
                  </div>
                  {aiAnalysis.sources_analysis.map((source, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border mb-3 ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {source.domain}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            source.credibility_score >= 0.8 ? 'bg-green-100 text-green-800' :
                            source.credibility_score >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {Math.round(source.credibility_score * 100)}% credible
                          </span>
                          {source.is_fact_check_source && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                              Fact-Checker
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Reputation: 
                          </span>
                          <span className={`ml-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {source.domain_reputation.replace('_', ' ')}
                          </span>
                        </div>
                        <div>
                          <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Type: 
                          </span>
                          <span className={`ml-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {source.content_type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Verifications */}
          <div className={`p-6 rounded-xl border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center space-x-2 mb-6">
              <ChatBubbleLeftIcon className="w-6 h-6" />
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Community Evidence ({verifications.length})
              </h2>
            </div>

            {verifications.length === 0 ? (
              <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                No verifications yet. Be the first to add evidence!
              </p>
            ) : (
              <div className="space-y-4">
                {verifications.map((verification) => (
                  <div
                    key={verification.id}
                    className={`p-4 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'
                        }`}>
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          getStanceColor(verification.stance)
                        }`}>
                          {verification.stance.toUpperCase()}
                        </span>
                      </div>
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(verification.created_at).toLocaleString()}
                      </span>
                    </div>

                    {verification.explanation && (
                      <p className={`mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {verification.explanation}
                      </p>
                    )}

                    {verification.source_url && (
                      <a
                        href={verification.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm break-all"
                      >
                        📎 {verification.source_url}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Verdict */}
          <div className={`p-6 rounded-xl border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Current Verdict
            </h2>
            
            {verdict ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    verdict.label?.includes('True') ? 'text-green-600' :
                    verdict.label?.includes('False') ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {Math.round((verdict.confidence || 0) * 100)}%
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Confidence
                  </div>
                </div>

                <div className={`w-full h-3 rounded-full overflow-hidden ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-300"
                    style={{ width: `${Math.round((verdict.confidence || 0) * 100)}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-center">
                  <div>
                    <div className="font-semibold text-green-600">{verdict.support}</div>
                    <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Support</div>
                  </div>
                  <div>
                    <div className="font-semibold text-yellow-600">{verdict.unclear}</div>
                    <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Unclear</div>
                  </div>
                  <div>
                    <div className="font-semibold text-red-600">{verdict.refute}</div>
                    <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Refute</div>
                  </div>
                </div>

                <div className={`text-center text-lg font-semibold ${
                  verdict.label?.includes('True') ? 'text-green-600' :
                  verdict.label?.includes('False') ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {verdict.label}
                </div>
              </div>
            ) : (
              <p className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                No verdicts yet
              </p>
            )}
          </div>

          {/* Add Verification */}
          <div className={`p-6 rounded-xl border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Add Your Verification
            </h2>

            <form onSubmit={handleVerificationSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Your stance:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'support', label: 'Support', color: 'green' },
                    { key: 'unclear', label: 'Unclear', color: 'yellow' },
                    { key: 'refute', label: 'Refute', color: 'red' },
                  ].map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setNewVerification(prev => ({ ...prev, stance: option.key }))}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                        newVerification.stance === option.key
                          ? `bg-${option.color}-100 text-${option.color}-700 border-${option.color}-300`
                          : theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Source URL (optional):
                </label>
                <input
                  type="url"
                  value={newVerification.source_url}
                  onChange={(e) => setNewVerification(prev => ({ ...prev, source_url: e.target.value }))}
                  placeholder="https://example.com/evidence"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Explanation (optional):
                </label>
                <textarea
                  value={newVerification.explanation}
                  onChange={(e) => setNewVerification(prev => ({ ...prev, explanation: e.target.value }))}
                  placeholder="Explain your reasoning..."
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border resize-none ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !user}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Verification</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimDetailPage;