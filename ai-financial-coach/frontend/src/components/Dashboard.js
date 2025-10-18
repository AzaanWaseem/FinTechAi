import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
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
  const recommendation = analysisData?.recommendation || "No recommendation available.";
  const categorizedTransactions = analysisData?.categorizedTransactions || [];

  const pieData = [
    { name: 'Needs', value: needsTotal, color: '#4CAF50' },
    { name: 'Wants', value: wantsTotal, color: '#FF9800' }
  ];

  const totalSpending = needsTotal + wantsTotal;
  const savingsGoal = 500; // This would come from the backend in a real app
  const progressPercentage = Math.min((savingsGoal - wantsTotal) / savingsGoal * 100, 100);

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
        <div className="chart-card">
          <h3>Spending Breakdown</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#4CAF50' }}></div>
              <span>Needs: ${needsTotal.toFixed(2)}</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#FF9800' }}></div>
              <span>Wants: ${wantsTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Savings Progress */}
        <div className="progress-card">
          <h3>Savings Progress</h3>
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.max(0, progressPercentage)}%` }}
              ></div>
            </div>
            <div className="progress-text">
              <span>Goal: $500</span>
              <span>{Math.max(0, progressPercentage).toFixed(1)}% Complete</span>
            </div>
          </div>
          <div className="savings-summary">
            <p>Total Spending: ${totalSpending.toFixed(2)}</p>
            <p>Wants Spending: ${wantsTotal.toFixed(2)}</p>
          </div>
        </div>

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
      </div>
    </div>
  );
};

export default Dashboard;
