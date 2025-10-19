import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Converted to Tailwind utilities; removed Onboarding.css

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
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h1 className="text-2xl font-semibold text-[#0b1f3a] mb-2">Welcome to AI Financial Coach</h1>
        <p className="text-gray-600 mb-4">We'll create a demo account and analyze your spending to provide personalized insights.</p>

        {/* Nessie health banner */}
        {nessieStatus && !nessieStatus.ok && (
          <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-100">{nessieStatus.message}</div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-100">{error}</div>
        )}

        <button 
          className="w-full bg-[#004897] hover:bg-[#00356a] text-white font-medium py-3 rounded-lg mb-6 disabled:opacity-60"
          onClick={handleStartJourney}
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Start Your Journey'}
        </button>

        <div className="features text-sm text-gray-700">
          <h3 className="font-medium mb-2">What you'll get:</h3>
          <ul className="space-y-2">
            <li className="flex items-start"><span className="text-[#16a34a] mr-2">✓</span> AI-powered spending analysis</li>
            <li className="flex items-start"><span className="text-[#16a34a] mr-2">✓</span> Personalized savings recommendations</li>
            <li className="flex items-start"><span className="text-[#16a34a] mr-2">✓</span> Interactive financial dashboard</li>
            <li className="flex items-start"><span className="text-[#16a34a] mr-2">✓</span> Investment education when you reach your goals</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
