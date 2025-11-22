
import React, { useState } from 'react';

interface LoginFormProps {
  onLogin: (email: string, pass: string) => void;
  onSwitchToSignUp?: () => void;
  onBackToSelector: () => void;
  onVerifyClick?: () => void;
  title: string;
  subtitle: string;
  showSignUpLink: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onSwitchToSignUp, onBackToSelector, onVerifyClick, title, subtitle, showSignUpLink }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    await onLogin(email, password);
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md relative">
       <button onClick={onBackToSelector} className="absolute top-4 left-4 text-gray-500 hover:text-gray-800" aria-label="Go back">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
        </button>
      <div className="text-center pt-4">
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        <p className="mt-2 text-gray-600">{subtitle}</p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <label htmlFor="email" className="sr-only">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md group hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>
       <div className="flex flex-col items-center space-y-2 text-sm">
         {showSignUpLink && onSwitchToSignUp && (
              <button onClick={onSwitchToSignUp} className="font-medium text-green-600 hover:text-green-500">
                  Don't have an account? Sign Up
              </button>
        )}
        {onVerifyClick && (
             <button onClick={onVerifyClick} className="font-medium text-gray-600 hover:text-gray-500">
                 Have a verification code? Verify Account
             </button>
        )}
       </div>
    </div>
  );
};

export default LoginForm;
