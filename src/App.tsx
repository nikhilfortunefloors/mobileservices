import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Auth/Login';
import { SignUp } from './components/Auth/SignUp';
import { ForgotPassword } from './components/Auth/ForgotPassword';
import { CustomerPortal } from './components/Customer/CustomerPortal';
import { RepairmanDashboard } from './components/Repairman/Dashboard';
import { AdminDashboard } from './components/Admin/Dashboard';
import { LogOut, User } from 'lucide-react';

type AuthView = 'login' | 'signup' | 'forgot-password';

function AppContent() {
  const { user, profile, loading, signOut } = useAuth();
  const [authView, setAuthView] = useState<AuthView>('login');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        {authView === 'login' && (
          <Login
            onForgotPassword={() => setAuthView('forgot-password')}
            onSignUp={() => setAuthView('signup')}
          />
        )}
        {authView === 'signup' && <SignUp onLogin={() => setAuthView('login')} />}
        {authView === 'forgot-password' && (
          <ForgotPassword onBack={() => setAuthView('login')} />
        )}
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Device Repair Services</h1>
              <p className="text-sm text-gray-600">
                {profile.role === 'customer' && 'Customer Portal'}
                {profile.role === 'repairman' && 'Repairman Dashboard'}
                {profile.role === 'admin' && 'Admin Panel'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                <User className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-800">{profile.full_name}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {profile.role === 'customer' && <CustomerPortal />}
        {profile.role === 'repairman' && <RepairmanDashboard />}
        {profile.role === 'admin' && <AdminDashboard />}
      </main>
    </div>
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
