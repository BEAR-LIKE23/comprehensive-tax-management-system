
import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="flex flex-col items-center p-6 text-center bg-white rounded-lg shadow-lg transform transition duration-500 hover:scale-105">
    <div className="p-4 text-white bg-green-600 rounded-full">
      {icon}
    </div>
    <h3 className="mt-4 text-xl font-bold text-gray-800">{title}</h3>
    <p className="mt-2 text-gray-600">{description}</p>
  </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="bg-white text-gray-800">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-700">TaxSys</h1>
          <button
            onClick={onGetStarted}
            className="px-6 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition"
          >
            Login / Sign Up
          </button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-green-50 pt-32 pb-20 text-center">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight text-gray-900">
              Modernizing Tax Management
            </h2>
            <p className="mt-4 text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
              A seamless, transparent, and efficient platform for taxpayers and revenue authorities. Manage your tax obligations with ease and confidence.
            </p>
            <button
              onClick={onGetStarted}
              className="mt-8 px-8 py-4 text-lg font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transform transition duration-300 hover:scale-110 shadow-lg"
            >
              Get Started
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-100">
          <div className="container mx-auto px-6">
            <h3 className="text-3xl font-bold text-center mb-12">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <FeatureCard
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3m0-10V6a2 2 0 012-2h2a2 2 0 012 2v1m-6 10h6" /></svg>}
                title="Easy Self-Assessment"
                description="File your tax returns quickly and accurately with our intuitive self-assessment tool. No more paperwork."
              />
              <FeatureCard
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
                title="Secure Online Payments"
                description="Pay your tax liabilities securely through our integrated payment system. Receive instant digital receipts."
              />
               <FeatureCard
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
                title="AI Tax Assistant"
                description="Have questions? Our AI-powered chatbot is available 24/7 to provide instant answers to common tax-related queries."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; {new Date().getFullYear()} TaxSys. All Rights Reserved.</p>
          <p className="text-sm text-gray-400 mt-2">A Comprehensive Tax Management System</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
