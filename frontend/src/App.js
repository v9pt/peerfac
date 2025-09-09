import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './components/Dashboard';
import ClaimDetail from './components/ClaimDetail';
import CreateClaim from './components/CreateClaim';
import Analytics from './components/Analytics';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';
import Settings from './components/Settings';
import AuthModal from './components/AuthModal';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ThemeProvider from './components/ThemeProvider';
import RealtimeProvider from './components/RealtimeProvider';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check for existing authentication
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    
    if (token && user) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleLogin = (user, token) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <RealtimeProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 transition-all duration-500">
              {/* Enhanced Background Pattern */}
              <div className="fixed inset-0 opacity-30 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.1),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(168,85,247,0.1),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_24%,rgba(59,130,246,0.03)_25%,rgba(59,130,246,0.03)_26%,transparent_27%,transparent_74%,rgba(59,130,246,0.03)_75%,rgba(59,130,246,0.03)_76%,transparent_77%),linear-gradient(-45deg,transparent_24%,rgba(168,85,247,0.03)_25%,rgba(168,85,247,0.03)_26%,transparent_27%,transparent_74%,rgba(168,85,247,0.03)_75%,rgba(168,85,247,0.03)_76%,transparent_77%)] bg-[length:30px_30px]"></div>
                
                {/* Floating Elements */}
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/20 rounded-full floating-animation"></div>
                <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-purple-400/20 rounded-full floating-animation" style={{animationDelay: '2s'}}></div>
                <div className="absolute top-1/2 left-3/4 w-1 h-1 bg-pink-400/20 rounded-full floating-animation" style={{animationDelay: '4s'}}></div>
              </div>

              <Navbar 
                isAuthenticated={isAuthenticated}
                currentUser={currentUser}
                onLogin={() => setShowAuthModal(true)}
                onLogout={handleLogout}
                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              />

              <div className="flex relative">
                <Sidebar 
                  isOpen={sidebarOpen}
                  onClose={() => setSidebarOpen(false)}
                  isAuthenticated={isAuthenticated}
                  currentUser={currentUser}
                />

                <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
                  <div className="relative z-10">
                    <Routes>
                      <Route path="/" element={
                        <Dashboard 
                          isAuthenticated={isAuthenticated}
                          currentUser={currentUser}
                          onLogin={() => setShowAuthModal(true)}
                        />
                      } />
                      <Route path="/claim/:id" element={
                        <ClaimDetail 
                          isAuthenticated={isAuthenticated}
                          currentUser={currentUser}
                          onLogin={() => setShowAuthModal(true)}
                        />
                      } />
                      <Route path="/create" element={
                        <CreateClaim 
                          isAuthenticated={isAuthenticated}
                          currentUser={currentUser}
                          onLogin={() => setShowAuthModal(true)}
                        />
                      } />
                      <Route path="/analytics" element={
                        <Analytics 
                          isAuthenticated={isAuthenticated}
                          currentUser={currentUser}
                        />
                      } />
                      <Route path="/leaderboard" element={
                        <Leaderboard />
                      } />
                      <Route path="/profile" element={
                        <Profile 
                          isAuthenticated={isAuthenticated}
                          currentUser={currentUser}
                          onLogin={() => setShowAuthModal(true)}
                        />
                      } />
                      <Route path="/settings" element={
                        <Settings 
                          isAuthenticated={isAuthenticated}
                          currentUser={currentUser}
                          onLogin={() => setShowAuthModal(true)}
                        />
                      } />
                    </Routes>
                  </div>
                </main>
              </div>

              {showAuthModal && (
                <AuthModal
                  onClose={() => setShowAuthModal(false)}
                  onLogin={handleLogin}
                />
              )}

              {/* Global Loading State */}
              <div id="global-loading-container"></div>
            </div>
          </Router>
        </RealtimeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;