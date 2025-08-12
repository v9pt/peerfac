import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Import Pages
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import CreateClaimPage from './pages/CreateClaimPage';
import ClaimDetailPage from './pages/ClaimDetailPage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';

// Import Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoadingSpinner from './components/LoadingSpinner';

// Context
const AppContext = createContext();
export const useApp = () => useContext(AppContext);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [claims, setClaims] = useState([]);
  const [theme, setTheme] = useState('dark');

  // Bootstrap user on app start
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const existing = localStorage.getItem('peerfact_user');
        if (existing) {
          setUser(JSON.parse(existing));
        } else {
          const response = await axios.post(`${API}/users/bootstrap`, { username: null });
          setUser(response.data);
          localStorage.setItem('peerfact_user', JSON.stringify(response.data));
        }
      } catch (error) {
        console.error('Failed to bootstrap user:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  // Fetch claims
  const fetchClaims = async () => {
    try {
      const response = await axios.get(`${API}/claims`);
      setClaims(response.data || []);
    } catch (error) {
      console.error('Failed to fetch claims:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchClaims();
    }
  }, [user]);

  const contextValue = {
    user,
    setUser,
    claims,
    setClaims,
    fetchClaims,
    API,
    theme,
    setTheme,
    sidebarOpen,
    setSidebarOpen,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      <Router>
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
          <Navbar />
          
          <div className="flex">
            <Sidebar />
            
            <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'} pt-16`}>
              <div className="container mx-auto px-4 py-6 max-w-7xl">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/explore" element={<ExplorePage />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  <Route path="/profile/:userId?" element={<ProfilePage />} />
                  <Route path="/create" element={<CreateClaimPage />} />
                  <Route path="/claim/:claimId" element={<ClaimDetailPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </Router>
    </AppContext.Provider>
  );
}

export default App;