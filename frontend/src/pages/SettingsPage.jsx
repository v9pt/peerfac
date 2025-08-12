import React, { useState } from 'react';
import { 
  UserIcon, 
  BellIcon, 
  EyeIcon, 
  ShieldCheckIcon,
  MoonIcon,
  SunIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../App';

const SettingsPage = () => {
  const { user, theme, setTheme } = useApp();
  const [activeSection, setActiveSection] = useState('profile');
  const [settings, setSettings] = useState({
    username: user?.username || '',
    email: '',
    notifications: {
      claims: true,
      verifications: true,
      mentions: true,
      newsletter: false,
    },
    privacy: {
      profileVisible: true,
      showActivity: true,
      showStats: true,
    },
    appearance: {
      theme: theme,
      compactMode: false,
    }
  });

  const sections = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'privacy', name: 'Privacy', icon: EyeIcon },
    { id: 'appearance', name: 'Appearance', icon: theme === 'dark' ? MoonIcon : SunIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
  ];

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    handleSettingChange('appearance', 'theme', newTheme);
  };

  const handleSave = () => {
    // Save settings logic here
    console.log('Settings saved:', settings);
  };

  const ToggleSwitch = ({ enabled, onToggle }) => (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-blue-600' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Settings
        </h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Manage your account preferences and privacy settings
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : theme === 'dark'
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <section.icon className="w-5 h-5" />
                <span className="font-medium">{section.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className={`rounded-xl border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } p-6`}>
            
            {/* Profile Settings */}
            {activeSection === 'profile' && (
              <div className="space-y-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Profile Information
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Username
                    </label>
                    <input
                      type="text"
                      value={settings.username}
                      onChange={(e) => handleSettingChange('profile', 'username', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
                      placeholder="your@email.com"
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Bio
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className={`w-full px-3 py-2 rounded-lg border resize-none ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Notification Preferences
                </h2>
                
                <div className="space-y-4">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-3">
                      <div>
                        <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {key === 'claims' && 'Get notified when someone interacts with your claims'}
                          {key === 'verifications' && 'Get notified about verification updates'}
                          {key === 'mentions' && 'Get notified when someone mentions you'}
                          {key === 'newsletter' && 'Receive our weekly newsletter'}
                        </p>
                      </div>
                      <ToggleSwitch
                        enabled={value}
                        onToggle={() => handleSettingChange('notifications', key, !value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeSection === 'privacy' && (
              <div className="space-y-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Privacy Settings
                </h2>
                
                <div className="space-y-4">
                  {Object.entries(settings.privacy).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-3">
                      <div>
                        <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {key === 'profileVisible' && 'Allow others to view your profile'}
                          {key === 'showActivity' && 'Show your recent activity to others'}
                          {key === 'showStats' && 'Display your statistics publicly'}
                        </p>
                      </div>
                      <ToggleSwitch
                        enabled={value}
                        onToggle={() => handleSettingChange('privacy', key, !value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeSection === 'appearance' && (
              <div className="space-y-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Appearance
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Theme
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => handleThemeChange('light')}
                        className={`p-4 rounded-lg border-2 flex items-center space-x-3 transition-colors ${
                          theme === 'light'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <SunIcon className="w-6 h-6 text-yellow-500" />
                        <div className="text-left">
                          <div className="font-medium text-gray-900">Light</div>
                          <div className="text-sm text-gray-500">Clean and bright</div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => handleThemeChange('dark')}
                        className={`p-4 rounded-lg border-2 flex items-center space-x-3 transition-colors ${
                          theme === 'dark'
                            ? 'border-blue-500 bg-gray-800'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <MoonIcon className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-gray-600'}`} />
                        <div className="text-left">
                          <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Dark</div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Easy on the eyes</div>
                        </div>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Compact Mode
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Show more content in less space
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.appearance.compactMode}
                      onToggle={() => handleSettingChange('appearance', 'compactMode', !settings.appearance.compactMode)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Security
                </h2>
                
                <div className="space-y-4">
                  <button className={`w-full p-4 rounded-lg border text-left ${
                    theme === 'dark' 
                      ? 'border-gray-600 hover:bg-gray-700' 
                      : 'border-gray-200 hover:bg-gray-50'
                  } transition-colors`}>
                    <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Change Password
                    </div>
                    <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Update your account password
                    </div>
                  </button>
                  
                  <button className={`w-full p-4 rounded-lg border text-left ${
                    theme === 'dark' 
                      ? 'border-gray-600 hover:bg-gray-700' 
                      : 'border-gray-200 hover:bg-gray-50'
                  } transition-colors`}>
                    <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Two-Factor Authentication
                    </div>
                    <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Add an extra layer of security
                    </div>
                  </button>
                  
                  <button className={`w-full p-4 rounded-lg border text-left ${
                    theme === 'dark' 
                      ? 'border-red-600 hover:bg-red-900/20' 
                      : 'border-red-200 hover:bg-red-50'
                  } transition-colors`}>
                    <div className="font-medium text-red-600">
                      Delete Account
                    </div>
                    <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Permanently delete your account and data
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700 mt-8">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;