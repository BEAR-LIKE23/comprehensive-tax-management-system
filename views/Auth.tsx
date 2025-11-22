
import React, { useState, useEffect } from 'react';
import LoginForm from '../components/LoginForm';
import SignUpForm from '../components/SignUpForm';
import VerifyEmail from './VerifyEmail';
import LoginSelector from './LoginSelector';
import AdminSetupForm from './admin/AdminSetupForm';
import { TaxpayerType } from '../types';
import { hasAdminAccount, createInitialAdmin } from '../services/apiService';
import { useToast } from '../context/ToastContext';

interface AuthProps {
    onLogin: (email: string, pass: string) => void;
    onSignUp: (name: string, tin: string, email: string, pass: string, taxpayer_type: TaxpayerType) => Promise<string | null>;
}

type AuthView = 'loading' | 'admin_setup' | 'selector' | 'login' | 'signup' | 'verify';

const Auth: React.FC<AuthProps> = ({ onLogin, onSignUp }) => {
    const [view, setView] = useState<AuthView>('loading');
    const [loginType, setLoginType] = useState<'user' | 'admin'>('user');
    const [emailForVerification, setEmailForVerification] = useState('');
    const { showToast } = useToast();

    useEffect(() => {
        const checkAdmin = async () => {
            const exists = await hasAdminAccount();
            if (exists) {
                setView('selector');
            } else {
                setView('admin_setup');
            }
        };
        if (view === 'loading') {
            checkAdmin();
        }
    }, [view]);

    const handleAdminSetup = async (name: string, email: string, pass: string): Promise<string | null> => {
        const result = await createInitialAdmin(name, email, pass);
        if (result.success) {
            setEmailForVerification(email);
            setView('verify');
            return null;
        } else {
            return result.error || "An unknown error occurred during admin setup.";
        }
    };

    const handleSignUpSuccess = (email: string) => {
        setEmailForVerification(email);
        setView('verify');
    };
    
    const handleVerificationSuccess = () => {
        showToast('Account verified! Please sign in to continue.', 'success');
        setView('selector');
    };

    const handleSelectLoginType = (type: 'user' | 'admin') => {
        setLoginType(type);
        setView('login');
    };
    
    const handleVerifyClick = () => {
        setEmailForVerification(''); // Clear it so they have to type it
        setView('verify');
    }

    const renderCurrentView = () => {
        switch(view) {
            case 'loading':
                 return <div className="text-center">
                    <h1 className="text-2xl font-semibold text-gray-700">Checking system configuration...</h1>
                 </div>
            case 'admin_setup':
                return <AdminSetupForm onAdminSetup={handleAdminSetup} />;
            case 'selector':
                return <LoginSelector onSelect={handleSelectLoginType} />;
            case 'login':
                const isUser = loginType === 'user';
                return (
                    <LoginForm 
                        onLogin={onLogin} 
                        onSwitchToSignUp={isUser ? () => setView('signup') : undefined}
                        onBackToSelector={() => setView('selector')}
                        onVerifyClick={handleVerifyClick}
                        title={isUser ? "Taxpayer / Officer Login" : "Administrator Login"}
                        subtitle={isUser ? "Please sign in to your account" : "Enter your administrator credentials"}
                        showSignUpLink={isUser}
                    />
                );
            case 'signup':
                return (
                    <SignUpForm 
                        onSignUp={onSignUp} 
                        onSwitchToLogin={() => setView('selector')} 
                        onSignUpSuccess={handleSignUpSuccess} 
                    />
                );
            case 'verify':
                return (
                    <VerifyEmail 
                        email={emailForVerification} 
                        onVerificationSuccess={handleVerificationSuccess} 
                        onSwitchToLogin={() => setView('selector')} 
                    />
                );
            default:
                return <LoginSelector onSelect={handleSelectLoginType} />;
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            {renderCurrentView()}
        </div>
    );
};

export default Auth;
