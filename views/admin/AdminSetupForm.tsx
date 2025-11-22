
import React, { useState } from 'react';

interface AdminSetupFormProps {
    onAdminSetup: (name: string, email: string, pass: string) => Promise<string | null>;
}

const AdminSetupForm: React.FC<AdminSetupFormProps> = ({ onAdminSetup }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name || !email || !password) {
            setError('Please fill in all fields.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setIsLoading(true);
        const errorMessage = await onAdminSetup(name, email, password);
        setIsLoading(false);

        if (errorMessage) {
            setError(errorMessage);
        }
    };

    return (
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md border-t-4 border-green-600">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800">System Setup</h1>
                <p className="mt-2 text-gray-600">Create the first Administrator account.</p>
                <p className="mt-2 text-sm text-yellow-700 bg-yellow-100 p-3 rounded-md">This screen will only appear once. After the first admin is created, all other users must be managed from the admin dashboard.</p>
            </div>
            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
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
                        {isLoading ? 'Creating Account...' : 'Create Administrator'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminSetupForm;
