import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Consultants from './pages/Consultants';
import Transactions from './pages/Transactions';
import Expenses from './pages/Expenses';
import PersonnelPage from './pages/Personnel';
import Vendors from './pages/Vendors';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import PrintTransaction from './pages/PrintTransaction'; // Yeni print sayfası
// import { User } from './types'; // User type is now handled by AuthContext

function AppContent() {
  const { currentUser, isAuthenticated, login, logout, loading } = useAuth();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState('/'); // Keep for print mode logic

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  useEffect(() => {
    // Check for print mode in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('print') === 'true') {
      setCurrentPage('print-transaction');
      return;
    }
    // If not in print mode, update currentPage based on router location
    setCurrentPage(location.pathname);
  }, [location.pathname]);

  // const handleLogin = (newUser: User) => { // This is now handled by AuthContext's login function
  //   setUser(newUser);
  //   localStorage.setItem('emlak_user', JSON.stringify(newUser));
  //   setCurrentPage('/');
  // };

  // const handleLogout = () => { // This is now handled by AuthContext's logout function
  //   setUser(null);
  //   localStorage.removeItem('emlak_user');
  //   setCurrentPage('/');
  // };

  // Print page doesn't need auth or layout
  // if (currentPage === 'print-transaction') { // This logic will now be handled by a route
  //   return <PrintTransaction />;
  // }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/consultants" element={<Consultants />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/personnel" element={<PersonnelPage />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/print-transaction" element={<PrintTransaction />} /> {/* Add route for print page */}
        <Route path="*" element={<Navigate to="/" replace />} /> {/* Redirect any unknown routes to dashboard */}
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;