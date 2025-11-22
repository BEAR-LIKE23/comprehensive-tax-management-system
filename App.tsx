
import React, { useState, useEffect } from 'react';
import { User, Role, TaxpayerType } from './types';
import { signIn, signOut, getCurrentUser, getUserProfile, signUp } from './services/apiService';
import { supabase } from './services/supabaseClient';
import Auth from './views/Auth';
import LandingPage from './views/LandingPage'; // Import the new Landing Page
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TaxpayerDashboard from './views/taxpayer/TaxpayerDashboard';
import OfficerDashboard from './views/officer/OfficerDashboard';
import AdminDashboard from './views/admin/AdminDashboard';
import Chatbot from './components/Chatbot';
import { useToast } from './context/ToastContext';

// Import taxpayer views
import Profile from './views/taxpayer/Profile';
import Notifications from './views/taxpayer/Notifications';
import MyAssessments from './views/taxpayer/MyAssessments';
import MyDocuments from './views/taxpayer/MyDocuments';
import PaymentHistory from './views/taxpayer/PaymentHistory';
import TccRequest from './views/taxpayer/TccRequest';
import FileReturn from './views/taxpayer/FileReturn';

// Import officer views
import ReviewDocuments from './views/officer/ReviewDocuments';
import ManageAssessments from './views/officer/ManageAssessments';
import ViewTaxpayers from './views/officer/ViewTaxpayers';
import ReviewTcc from './views/officer/ReviewTcc';

// Import admin views
import ManageUsers from './views/admin/ManageUsers';
import SystemReports from './views/admin/SystemReports';
import Settings from './views/admin/Settings';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('Dashboard');
  const [session, setSession] = useState<any | null>(null);
  const [showLanding, setShowLanding] = useState(true); // New state for landing page
  const { showToast } = useToast();

  useEffect(() => {
    const fetchSession = async () => {
        const currentSession = await getCurrentUser();
        setSession(currentSession);
        if (currentSession) {
            setShowLanding(false); // If user has a session, don't show landing page on refresh
            const profile = await getUserProfile(currentSession.id);
            if (profile) {
                setCurrentUser(profile);
            }
        }
        setLoading(false);
    };

    fetchSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session?.user) {
            setShowLanding(false);
            getUserProfile(session.user.id).then(profile => {
                if(profile) setCurrentUser(profile);
            })
        } else {
            setCurrentUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);


  const handleLogin = async (email: string, pass: string) => {
    const { user: userProfile, error } = await signIn(email, pass);
    if (userProfile) {
      setCurrentUser(userProfile);
      setCurrentView('Dashboard');
      setShowLanding(false);
      showToast(`Welcome back, ${userProfile.name}!`, 'success');
    } else {
      if (error && error.includes('Email not confirmed')) {
          showToast('Email not confirmed. Please verify your account.', 'error');
      } else {
          showToast(error || 'Invalid email or password', 'error');
      }
    }
  };
  
  const handleSignUp = async (name: string, tin: string, email: string, pass: string, taxpayer_type: TaxpayerType): Promise<string | null> => {
      const result = await signUp(name, tin, email, pass, taxpayer_type);
      if(result.success) {
          showToast("Sign up successful! Please check your email to confirm your account.", 'success');
          return null;
      } else {
          showToast(result.error || "Sign up failed", 'error');
          return result.error || "An unknown sign-up error occurred.";
      }
  }

  const handleLogout = async () => {
    await signOut();
    setCurrentUser(null);
    setCurrentView('Dashboard');
    setShowLanding(true); // Return to landing page on logout
    showToast("Logged out successfully", 'info');
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
  };
  
  const handleUserUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    showToast("Profile updated successfully", 'success');
  }

  const renderView = () => {
    if (!currentUser) return null;

    if (currentView === 'Dashboard') {
        switch (currentUser.role) {
            case Role.TAXPAYER:
                return <TaxpayerDashboard user={currentUser} />;
            case Role.OFFICER:
                return <OfficerDashboard user={currentUser} />;
            case Role.ADMIN:
                return <AdminDashboard user={currentUser} onNavigate={handleNavigate} />;
            default:
                return <div>Invalid user role.</div>;
        }
    }

    if(currentUser.role === Role.TAXPAYER) {
        switch (currentView) {
            case 'Profile':
                return <Profile user={currentUser} onUserUpdate={handleUserUpdate} />;
            case 'Notifications':
                return <Notifications user={currentUser} />;
            case 'My Assessments':
                return <MyAssessments user={currentUser} />;
            case 'File a Return':
                return <FileReturn user={currentUser} onFilingSuccess={() => setCurrentView('My Assessments')} />;
            case 'My Documents':
                return <MyDocuments user={currentUser} />;
            case 'Payment History':
                return <PaymentHistory user={currentUser} />;
            case 'TCC Request':
                return <TccRequest user={currentUser} />;
            default:
                return <TaxpayerDashboard user={currentUser} />;
        }
    }
    
    if(currentUser.role === Role.OFFICER) {
        switch(currentView) {
            case 'Review Documents':
                return <ReviewDocuments user={currentUser} />;
            case 'Review TCC':
                return <ReviewTcc user={currentUser} />;
            case 'Manage Assessments':
                return <ManageAssessments user={currentUser} />;
            case 'View Taxpayers':
                return <ViewTaxpayers user={currentUser} />;
            case 'Profile':
                return <Profile user={currentUser} onUserUpdate={handleUserUpdate} />;
            case 'Notifications':
                return <Notifications user={currentUser} />;
            default:
                return <OfficerDashboard user={currentUser} />;
        }
    }
    
    if(currentUser.role === Role.ADMIN) {
        switch(currentView) {
            case 'Manage Users':
                return <ManageUsers user={currentUser} />;
            case 'System Reports':
                return <SystemReports user={currentUser} />;
            case 'Settings':
                return <Settings user={currentUser} />;
            case 'Profile':
                 return <Profile user={currentUser} onUserUpdate={handleUserUpdate} />;
            case 'Notifications':
                 return <Notifications user={currentUser} />;
            default:
                return <AdminDashboard user={currentUser} onNavigate={handleNavigate} />
        }
    }

    return <TaxpayerDashboard user={currentUser} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-2xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    if (showLanding) {
        return <LandingPage onGetStarted={() => setShowLanding(false)} />;
    }
    return <Auth onLogin={handleLogin} onSignUp={handleSignUp} />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userRole={currentUser.role} onNavigate={handleNavigate} activeView={currentView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={currentUser} onLogout={handleLogout} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-8">
          {renderView()}
        </main>
      </div>
      <Chatbot />
    </div>
  );
};

export default App;
