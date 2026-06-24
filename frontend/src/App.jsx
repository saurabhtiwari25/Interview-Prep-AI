import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom'
import ResumeParserPage from './pages/ResumeAnalysis'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { AuthProvider, useAuth } from './context/AuthContext'
import './index.css'
import Header from './components/Header'
import Footer from './components/Footer'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const PageLayout = () => (
  <div className="container" style={{ paddingTop: 0 }}>
    <Outlet />
  </div>
);

function App() {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <AuthProvider>
      <Router>
        <div className="app-layout">
          <Header theme={theme} toggleTheme={toggleTheme} />

          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <div className="hero-wrapper">
                  <div className="hero-container">
                    <div className="hero-overlay">
                      <h2 className="hero-title">Welcome to InterviewPrep AI</h2>
                      <p className="hero-subtitle">Upload your resume and get personalized interview prep guidance and questions.</p>
                    </div>  
                  </div>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/resume" element={
              <ProtectedRoute>
                <div className="hero-wrapper">
                  <div className="hero-container" style={{ minHeight: 'auto', padding: '40px 20px' }}>
                    <ResumeParserPage />
                  </div>
                </div>
              </ProtectedRoute>
            } />

            {/* Catch-all: redirect unknown routes to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
