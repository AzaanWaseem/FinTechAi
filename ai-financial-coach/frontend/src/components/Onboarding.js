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
  <div className="center-screen">
    {/* Decorative mark placed behind the welcome card. Put the image at frontend/public/capitalone-mark.png */}
    <div className="decorative-mark" style={{ backgroundImage: "url('/capitalone-mark.png')" }} />

    <div className="welcome-box">
        <h1 className="text-3xl font-bold text-center text-[#0b1f3a] mb-3">Capital One's AI Financial Advisor</h1>
        <p className="text-gray-600 text-center mb-6">We'll create a demo account and analyze your spending to provide personalized insights.</p>

        {/* Nessie health banner */}
        {nessieStatus && !nessieStatus.ok && (
          <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-100">{nessieStatus.message}</div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-100">{error}</div>
        )}

        <div className="features text-sm">
          <h3 className="font-medium mb-2 text-center">What you'll get:</h3>
          <div className="features-text text-center text-base leading-7">
            <p><span className="feature-check">✓</span> AI-powered spending analysis</p>
            <p><span className="feature-check">✓</span> Personalized savings recommendations</p>
            <p><span className="feature-check">✓</span> Interactive financial dashboard</p>
            <p><span className="feature-check">✓</span> Investment education when you reach your goals</p>
          </div>
        </div>

        <div className="mt-6">
          <button
            className="btn btn-primary w-full"
            onClick={handleStartJourney}
            disabled={isLoading}
            aria-disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Start Your Journey'}
          </button>
        </div>
        </div>
      </div>
  );
};

export default Onboarding;
