
import React, { useState, useEffect } from 'react';
import { verifyEmailOtp, resendSignUpCode } from '../services/apiService';

interface VerifyEmailProps {
    email: string;
    onVerificationSuccess: () => void;
    onSwitchToLogin: () => void;
}

const VerifyEmail: React.FC<VerifyEmailProps> = ({ email, onVerificationSuccess, onSwitchToLogin }) => {
    const [token, setToken] = useState('');
    const [localEmail, setLocalEmail] = useState(email);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if(email) setLocalEmail(email);
    }, [email]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!localEmail) {
            setError('Please enter your email address.');
            return;
        }

        if (token.length !== 6) {
            setError('Please enter the 6-digit code from your email.');
            return;
        }

        setIsLoading(true);
        const result = await verifyEmailOtp(localEmail, token);
        setIsLoading(false);

        if (result.success) {
            onVerificationSuccess();
        } else {
            setError(result.error || 'Verification failed. Please check your code and try again.');
        }
    };

    const handleResend = async () => {
        setError('');
        setMessage('');
        
        if (!localEmail) {
            setError('Please enter your email address to resend the code.');
            return;
        }

        const result = await resendSignUpCode(localEmail);
        if (result.success) {
            setMessage('A new verification code has been sent to your email.');
        } else {
            setError(result.error || 'Failed to resend code. Please try again later.');
        }
    };

    return (
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800">Verify Your Account</h1>
                <p className="mt-2 text-gray-600">
                   Enter the 6-digit verification code sent to your email.
                </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                {/* If email is provided via props (signup flow), show it. Otherwise show input (manual flow) */}
                {email ? (
                    <div className="text-center">
                        <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium mb-2">
                            {email}
                        </span>
                    </div>
                ) : (
                     <div>
                        <label htmlFor="email" className="sr-only">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your Email Address"
                            value={localEmail}
                            onChange={(e) => setLocalEmail(e.target.value)}
                            required
                            className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm mb-4"
                        />
                    </div>
                )}

                <input
                    type="text"
                    placeholder="123456"
                    value={token}
                    onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    maxLength={6}
                    required
                    className="relative block w-full px-3 py-2 text-center text-2xl tracking-widest font-mono text-gray-900 placeholder-gray-400 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-green-500 focus:border-green-500"
                />

                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                {message && <p className="text-sm text-green-600 text-center">{message}</p>}

                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="relative flex justify-center w-full px-4 py-2 mt-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md group hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400"
                    >
                        {isLoading ? 'Verifying...' : 'Verify Account'}
                    </button>
                </div>
            </form>
            <div className="text-sm text-center">
                <button onClick={handleResend} className="font-medium text-green-600 hover:text-green-500">
                    Didn't receive a code? Resend
                </button>
            </div>
             <div className="text-sm text-center mt-4">
                <button onClick={onSwitchToLogin} className="font-medium text-gray-600 hover:text-gray-500">
                    Back to Login
                </button>
            </div>
        </div>
    );
};

export default VerifyEmail;
