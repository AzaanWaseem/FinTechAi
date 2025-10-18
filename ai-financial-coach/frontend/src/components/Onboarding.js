import React, { useState } from 'react';
import axios from 'axios';
import './Onboarding.css';

const Onboarding = ({ onComplete, user }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStartJourney = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/onboard', {
        email: user.email,
        name: user.name
      });
      
      if (response.data.customerId && response.data.accountId) {
        onComplete();
      } else {
        setError('Failed to create your financial account. Please try again.');
      }
    } catch (err) {
      console.error('Onboarding error:', err);
      setError('Failed to create your financial account. Please try again.');
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
