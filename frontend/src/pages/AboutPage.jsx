import React from 'react';
import { 
  ShieldCheckIcon, 
  UsersIcon, 
  GlobeAltIcon, 
  SparklesIcon,
  HeartIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../App';

const AboutPage = () => {
  const { theme } = useApp();

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'AI-Powered Analysis',
      description: 'Advanced AI helps analyze claims and provide initial assessments to guide community verification.',
      color: 'blue'
    },
    {
      icon: UsersIcon,
      title: 'Community Driven',
      description: 'Real people verify claims with evidence, building a reputation system based on accuracy.',
      color: 'green'
    },
    {
      icon: GlobeAltIcon,
      title: 'Global Impact',
      description: 'Fighting misinformation worldwide with transparent, democratic fact-checking.',
      color: 'purple'
    },
    {
      icon: SparklesIcon,
      title: 'Reputation System',
      description: 'Users build reputation through accurate verifications, creating trust and accountability.',
      color: 'yellow'
    }
  ];

  const team = [
    { name: 'Alex Chen', role: 'Founder & CEO', avatar: '👨‍💻' },
    { name: 'Sarah Johnson', role: 'Lead Developer', avatar: '👩‍🔬' },
    { name: 'Mike Rodriguez', role: 'AI Engineer', avatar: '🧠' },
    { name: 'Emma Davis', role: 'Community Manager', avatar: '🤝' },
  ];

  const stats = [
    { label: 'Claims Verified', value: '50,000+' },
    { label: 'Active Users', value: '10,000+' },
    { label: 'Countries', value: '75+' },
    { label: 'Accuracy Rate', value: '94.2%' },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
            theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'
          } shadow-lg`}>
            <ShieldCheckIcon className="w-10 h-10 text-white" />
          </div>
        </div>
        
        <h1 className={`text-5xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          About PeerFact
        </h1>
        
        <p className={`text-xl max-w-3xl mx-auto leading-relaxed ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          We're building the world's most reliable fact-checking platform, powered by AI and driven by community. 
          Our mission is to combat misinformation through transparent, democratic verification.
        </p>
      </div>

      {/* Mission Statement */}
      <div className={`p-12 rounded-2xl ${
        theme === 'dark' 
          ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/30' 
          : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'
      }`}>
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <HeartIcon className={`w-12 h-12 ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`} />
          </div>
          
          <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Our Mission
          </h2>
          
          <p className={`text-lg max-w-4xl mx-auto leading-relaxed ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            In an era of information overload, we believe that truth should be democratic, transparent, and accessible. 
            PeerFact combines the power of artificial intelligence with human expertise to create a platform where 
            facts are verified by the community, for the community. Every claim is analyzed, every source is checked, 
            and every verification contributes to a more informed world.
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`text-center p-8 rounded-xl border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } hover:shadow-lg transition-shadow`}
          >
            <div className={`text-4xl font-bold mb-2 ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`}>
              {stat.value}
            </div>
            <div className={`text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="space-y-12">
        <div className="text-center">
          <h2 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            How We're Different
          </h2>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Combining AI intelligence with human wisdom for unparalleled fact-checking
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`p-8 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-${feature.color}-100 flex items-center justify-center`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                </div>
                <div>
                  <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {feature.title}
                  </h3>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="space-y-12">
        <div className="text-center">
          <h2 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            How It Works
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '1',
              title: 'Submit Claims',
              description: 'Users submit claims that need fact-checking with optional source links.',
              icon: '📝'
            },
            {
              step: '2', 
              title: 'AI Analysis',
              description: 'Our AI provides initial analysis and classification to guide human verification.',
              icon: '🤖'
            },
            {
              step: '3',
              title: 'Community Verification',
              description: 'Community members verify with evidence, building consensus and reputation.',
              icon: '👥'
            }
          ].map((step, index) => (
            <div
              key={index}
              className={`text-center p-8 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="text-6xl mb-4">{step.icon}</div>
              <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mb-4 ${
                theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'
              }`}>
                {step.step}
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {step.title}
              </h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="space-y-12">
        <div className="text-center">
          <h2 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Meet Our Team
          </h2>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Passionate individuals working to make truth accessible to everyone
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <div
              key={index}
              className={`text-center p-6 rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              } hover:shadow-lg transition-shadow`}
            >
              <div className="text-6xl mb-4">{member.avatar}</div>
              <h3 className={`text-lg font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {member.name}
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className={`text-center p-12 rounded-2xl ${
        theme === 'dark' 
          ? 'bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-800/30' 
          : 'bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200'
      }`}>
        <div className="flex justify-center mb-6">
          <LightBulbIcon className={`w-12 h-12 ${
            theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'
          }`} />
        </div>
        
        <h2 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Join the Fight Against Misinformation
        </h2>
        
        <p className={`text-lg mb-8 max-w-2xl mx-auto ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Every verification you make, every claim you submit, every source you check contributes to a more 
          informed world. Be part of the solution.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl">
            Start Fact-Checking
          </button>
          <button className={`px-8 py-3 rounded-lg font-medium transition-colors border ${
            theme === 'dark' 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }`}>
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;