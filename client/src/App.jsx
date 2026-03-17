import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import CommuterAuth from './pages/CommuterAuth';
import ExtremityAuth from './pages/ExtremityAuth';
import Navigation from './pages/Navigation';
import Emergency from './pages/Emergency';
import MapDemo from './pages/MapDemo';
import ChatbotDemo from './pages/ChatbotDemo';
import ChatApp from './pages/ChatApp';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Full-screen Chat Engine (own layout, no Navbar) */}
          <Route path="/chat" element={<ChatApp />} />

          {/* All other pages with Navbar */}
          <Route
            path="*"
            element={
              <div className="min-h-screen bg-[#0A0A0A] text-white">
                <Navbar />
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<><Home /><Footer /></>} />
                  <Route path="/auth/commuter" element={<CommuterAuth />} />
                  <Route path="/auth/responder" element={<ExtremityAuth />} />
                  <Route path="/map-demo" element={<MapDemo />} />
                  <Route path="/chatbot-demo" element={<ChatbotDemo />} />

                  {/* Protected Routes */}
                  <Route
                    path="/navigation"
                    element={
                      <ProtectedRoute requiredRole="commuter">
                        <Navigation />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/emergency"
                    element={
                      <ProtectedRoute requiredRole="responder">
                        <Emergency />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

