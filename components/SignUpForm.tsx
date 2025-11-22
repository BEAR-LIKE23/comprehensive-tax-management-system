
import React, { useState } from 'react';
import { TaxpayerType } from '../types';

interface SignUpFormProps {
    onSignUp: (name: string, tin: string, email: string, pass: string, taxpayer_type: TaxpayerType) => Promise<string | null>;
    onSwitchToLogin: () => void;
    onSignUpSuccess: (email: string) => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSignUp, onSwitchToLogin, onSignUpSuccess }) => {
    const [name, setName] = useState('');
    const [tin, setTin] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [taxpayerType, setTaxpayerType] = useState<TaxpayerType>(TaxpayerType.INDIVIDUAL);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name || !tin || !email || !password) {
            setError('Please fill in all fields.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setIsLoading(true);
        const errorMessage = await onSignUp(name, tin, email, password, taxpayerType);
        setIsLoading(false);

        if (errorMessage === null) {
            // On success, pass the user's email to the parent to switch to the verify view
            onSignUpSuccess(email);
        } else {
            setError(errorMessage);
        }
    };

    return (
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
                <p className="mt-2 text-gray-600">Join the Tax Management System</p>
            </div>
            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">I am a/an:</label>
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                            <input type="radio" name="taxpayerType" value={TaxpayerType.INDIVIDUAL} checked={taxpayerType === TaxpayerType.INDIVIDUAL} onChange={(e) => setTaxpayerType(e.target.value as TaxpayerType)} className="form-radio text-green-600"/>
                            <span className="ml-2">Individual</span>
                        </label>
                        <label className="flex items-center">
                            <input type="radio" name="taxpayerType" value={TaxpayerType.ORGANIZATION} checked={taxpayerType === TaxpayerType.ORGANIZATION} onChange={(e) => setTaxpayerType(e.target.value as TaxpayerType)} className="form-radio text-green-600"/>
                            <span className="ml-2">Organization</span>
                        </label>
                    </div>
                </div>

                <input
                    type="text"
                    placeholder={taxpayerType === TaxpayerType.INDIVIDUAL ? "Full Name" : "Organization Name"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
                <div>
                  <input
                      type="text"
                      placeholder="Taxpayer Identification Number (TIN)"
                      value={tin}
                      onChange={(e) => setTin(e.target.value)}
                      required
                      className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Don't have a TIN? Register for one at the
                    <a href="https://tin.jtb.gov.ng" target="_blank" rel="noopener noreferrer" className="font-medium text-green-600 hover:text-green-500">
                        &nbsp;official JTB portal
                    </a>.
                  </p>
                </div>
                <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
                <input
                    type="password"
                    placeholder="Password (min. 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="relative flex justify-center w-full px-4 py-2 mt-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md group hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400"
                    >
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </div>
            </form>
            <div className="text-sm text-center">
                <button onClick={onSwitchToLogin} className="font-medium text-green-600 hover:text-green-500">
                    Already have an account? Sign In
                </button>
            </div>
        </div>
    );
};

export default SignUpForm;
