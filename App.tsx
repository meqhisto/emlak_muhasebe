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

  console.log("AppContent Render", { isAuthenticated, loading, path: location.pathname });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
        <Route path="/print-transaction" element={<PrintTransaction />} />
        <Route path="*" element={<Navigate to="/" replace />} />
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