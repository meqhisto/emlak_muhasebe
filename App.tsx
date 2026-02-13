import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Consultants from './pages/Consultants';
import Transactions from './pages/Transactions';
import Expenses from './pages/Expenses';
import PersonnelPage from './pages/Personnel';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { User } from './types';

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  
  // Navigation State
  const [currentPage, setCurrentPage] = useState('/');

  // Check for stored session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('emlak_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('emlak_user');
      }
    }
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('emlak_user', JSON.stringify(newUser));
    setCurrentPage('/');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('emlak_user');
    setCurrentPage('/');
  };

  const renderPage = () => {
    if (!user) return <Login onLogin={handleLogin} />;

    switch (currentPage) {
      case '/':
        return <Dashboard user={user} />;
      case '/consultants':
        return <Consultants currentUser={user} />;
      case '/personnel':
        return <PersonnelPage currentUser={user} />;
      case '/transactions':
        return <Transactions currentUser={user} />;
      case '/expenses':
        return <Expenses currentUser={user} />;
      case '/reports':
        return <Reports />;
      case '/settings':
        return <Settings currentUser={user} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout}
      currentPage={currentPage}
      onNavigate={setCurrentPage}
    >
      {renderPage()}
    </Layout>
  );
};

export default App;