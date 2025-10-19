import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Onboarding.css';

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
    <div className="onboarding-container">
      <div className="onboarding-card">
        <h1>Welcome to AI Financial Coach</h1>
        <p className="subtitle">
          We'll create a demo account and analyze your spending to provide personalized insights.
        </p>
        
        {/* Nessie health banner */}
        {nessieStatus && !nessieStatus.ok && (
          <div className="error-message">
            {nessieStatus.message}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <button 
          className="start-button"
          onClick={handleStartJourney}
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Start Your Journey'}
        </button>
        
        <div className="features">
          <h3>What you'll get:</h3>
          <ul>
            <li>AI-powered spending analysis</li>
            <li>Personalized savings recommendations</li>
            <li>Interactive financial dashboard</li>
            <li>Investment education when you reach your goals</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
