import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import SpendingBreakdown from './SpendingBreakdown';
import SavingsHistory from './SavingsHistory';
import Rewards from './Rewards';
import './Dashboard.css';

const Dashboard = ({ onBack, user, onLogout }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/analysis');
      setAnalysisData(response.data);
      setError('');
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to load your financial analysis. Please try again.');
      // Set default data to prevent crashes
      setAnalysisData({
        needsTotal: 0,
        wantsTotal: 0,
        recommendation: "Unable to load analysis data.",
        categorizedTransactions: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading">
          <h2>Analyzing Your Finances... 📊</h2>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-state">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={fetchAnalysis} className="retry-button">
            Try Again
          </button>
          <button onClick={onBack} className="back-button">
            Back to Onboarding
          </button>
        </div>
      </div>
    );
  }

  // Safely destructure with defaults
  const needsTotal = analysisData?.needsTotal || 0;
  const wantsTotal = analysisData?.wantsTotal || 0;
  const totalSpending = analysisData?.totalSpending || (needsTotal + wantsTotal);
  const monthlyBudget = analysisData?.monthlyBudget || 0;
  const savingsGoal = analysisData?.savingsGoal || 500;
  const recommendation = analysisData?.recommendation || "No recommendation available.";
  const categorizedTransactions = analysisData?.categorizedTransactions || [];

  const pieData = [
    { name: 'Needs', value: needsTotal, color: '#004879' },
    { name: 'Wants', value: wantsTotal, color: '#d22e1e' }
  ];
  
  // Calculate actual savings (budget - total spending)
  const actualSavings = Math.max(0, monthlyBudget - totalSpending);
  const savingsData = [
    {
      name: 'Savings',
      amount: actualSavings,
      color: actualSavings >= savingsGoal ? '#16a34a' : '#004897'
    }
  ];
  const maxValue = Math.max(actualSavings, savingsGoal) * 1.2;

  <div className="dashboard-header">
    <div className="header-left">
      <h2>Your Financial Dashboard</h2>
      {user && <p className="user-welcome">Welcome back, {user.name}!</p>}
    </div>
    <div className="header-right">
      <button onClick={onLogout} className="logout-button">
        Logout
      </button>
      <button onClick={onBack} className="back-button">
        ← Start Over
      </button>
    </div>
  </div>

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
  <h2>Your Financial Dashboard</h2>
        <button onClick={onBack} className="back-button">
          ← Start Over
        </button>
      </div>

      <div className="dashboard-grid">
        {/* Spending Breakdown Chart */}
        <SpendingBreakdown 
          needsTotal={needsTotal}
          wantsTotal={wantsTotal}
          totalSpending={totalSpending}
          monthlyBudget={monthlyBudget}
        />

        {/* Savings History */}
        <SavingsHistory 
          savingsGoal={savingsGoal}
          actualSavings={actualSavings}
        />

        {/* AI Recommendation */}
        <div className="recommendation-card">
          <h3>AI Recommendation</h3>
          <div className="recommendation-content">
            <p>{recommendation}</p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="transactions-card">
          <h3>Recent Transactions</h3>
          <div className="transactions-list">
            {categorizedTransactions.slice(0, 10).map((transaction, index) => (
              <div key={index} className={`transaction-item ${transaction.category.toLowerCase()}`}>
                <div className="transaction-info">
                  <span className="transaction-description">{transaction.description}</span>
                  <span className="transaction-category">{transaction.category}</span>
                </div>
                <span className="transaction-amount">${transaction.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rewards Section */}
        <Rewards actualSavings={actualSavings} />
      </div>
    </div>
  );
};

export default Dashboard;
