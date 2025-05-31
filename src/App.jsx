import React from 'react';
    import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
    import { Toaster } from '@/components/ui/toaster';
    import HomePage from '@/pages/HomePage';
    import ListingsPage from '@/pages/ListingsPage';
    import PostAdPage from '@/pages/PostAdPage';
    import PaymentsPage from '@/pages/PaymentsPage';
    import NewsPage from '@/pages/NewsPage';
    import BuyTokensPage from '@/pages/BuyTokensPage';
    import PaymentStatusPage from '@/pages/PaymentStatusPage';
    import UserDashboardPage from '@/pages/UserDashboardPage';
    import AdminDashboardPage from '@/pages/AdminDashboardPage';
    import LoginPage from '@/pages/LoginPage';
    import RegisterPage from '@/pages/RegisterPage';
    import NotFoundPage from '@/pages/NotFoundPage';
    import Navbar from '@/components/Navbar';
    import Footer from '@/components/Footer';
    import { AuthProvider, useAuth } from '@/contexts/AuthContext';
    import { motion } from 'framer-motion'; // Changed from require to import

    // ProtectedRoute component
    const ProtectedRoute = ({ children, adminOnly = false }) => {
      const { isAuthenticated, isAdmin, loading } = useAuth();

      if (loading) {
        return (
          <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
            />
          </div>
        );
      }

      if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
      }

      if (adminOnly && !isAdmin) {
        return <Navigate to="/dashboard" replace />; // Redirect non-admins to user dashboard
      }
      
      if (!adminOnly && isAdmin && window.location.pathname === "/dashboard"){
         // If admin tries to access user dashboard, redirect to admin dashboard
         return <Navigate to="/admin-dashboard" replace />;
      }


      return children;
    };
    
    // PublicRouteOnly component (for login/register, redirect if already logged in)
    const PublicRouteOnly = ({ children }) => {
        const { isAuthenticated, isAdmin, loading } = useAuth();

        if (loading) {
            return (
                <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
                    <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
                    />
                </div>
            );
        }

        if (isAuthenticated) {
            return <Navigate to={isAdmin ? "/admin-dashboard" : "/dashboard"} replace />;
        }
        return children;
    };


    function AppContent() {
      return (
        <Router>
          <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-slate-900 to-orange-900/50 text-foreground">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<HomePage />} />
                
                <Route path="/login" element={<PublicRouteOnly><LoginPage /></PublicRouteOnly>} />
                <Route path="/register" element={<PublicRouteOnly><RegisterPage /></PublicRouteOnly>} />
                
                <Route path="/pasang-iklan" element={<ListingsPage />} />
                <Route path="/berita" element={<NewsPage />} />
                
                <Route path="/buat-iklan" element={<ProtectedRoute><PostAdPage /></ProtectedRoute>} />
                <Route path="/pembayaran" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
                <Route path="/beli-token" element={<ProtectedRoute><BuyTokensPage /></ProtectedRoute>} />
                <Route path="/payment-status" element={<ProtectedRoute><PaymentStatusPage /></ProtectedRoute>} />
                
                <Route path="/dashboard" element={<ProtectedRoute><UserDashboardPage /></ProtectedRoute>} />
                <Route path="/admin-dashboard" element={<ProtectedRoute adminOnly={true}><AdminDashboardPage /></ProtectedRoute>} />
                
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
            <Toaster />
          </div>
        </Router>
      );
    }
    
    function App() {
      return (
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      );
    }

    export default App;