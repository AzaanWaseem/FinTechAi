import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Onboarding = ({ onComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [nessieStatus, setNessieStatus] = useState(null);

  useEffect(() => {
    // Check Nessie health on load so we can show a helpful message
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get('/api/nessie-health');
        if (!mounted) return;
        setNessieStatus({ ok: true, message: res.data.message || 'Nessie reachable' });
      } catch (err) {
        if (!mounted) return;
        const msg = err?.response?.data?.message || err.message || 'Nessie unreachable';
        setNessieStatus({ ok: false, message: msg });
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleStartJourney = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/onboard', {});

      if (response.data && response.data.customerId && response.data.accountId) {
        onComplete();
      } else if (response.data && response.data.error) {
        setError(response.data.error);
      } else if (response.data && response.data.warning) {
        // account created but seeding failed
        setError(response.data.warning);
        onComplete();
      } else {
        setError('Failed to create your financial account. Please try again.');
      }
    } catch (err) {
      console.error('Onboarding error:', err);
      const message = err?.response?.data?.error || err?.message || 'Failed to create your financial account. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-[#004977] mb-3 text-center">
          Welcome to AI Financial Coach
        </h1>
        <p className="text-gray-600 text-center mb-6">
          We'll create a demo account and analyze your spending to provide personalized insights.
        </p>
        
        {/* Nessie health banner */}
        {nessieStatus && !nessieStatus.ok && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
            {nessieStatus.message}
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        )}
        
        <button 
          className="w-full bg-[#004977] text-white py-4 rounded-lg font-semibold text-lg hover:bg-[#003a5d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-8"
          onClick={handleStartJourney}
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Start Your Journey'}
        </button>
        
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">What you'll get:</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-500 mr-3 text-xl">✓</span>
              <span className="text-gray-700">AI-powered spending analysis</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-3 text-xl">✓</span>
              <span className="text-gray-700">Personalized savings recommendations</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-3 text-xl">✓</span>
              <span className="text-gray-700">Interactive financial dashboard</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-3 text-xl">✓</span>
              <span className="text-gray-700">Investment education when you reach your goals</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
