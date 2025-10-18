import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import SpendingBreakdown from './SpendingBreakdown';
import SavingsHistory from './SavingsHistory';
import Rewards from './Rewards';
import './Dashboard.css';

const Dashboard = ({ onBack }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [removeMode, setRemoveMode] = useState(false);
  const [selectedTxIds, setSelectedTxIds] = useState([]);

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

  const handleSeedTransactions = async () => {
    // Deprecated: use add single transaction form
    setShowAddForm(true);
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      await axios.post('/api/add-transaction', {
        description: newDescription,
        amount: parseFloat(newAmount)
      });
      setNewDescription('');
      setNewAmount('');
      setShowAddForm(false);
      await fetchAnalysis();
    } catch (err) {
      console.error('Add transaction error:', err);
  const message = err?.response?.data?.error || err.message || 'Failed to add transaction.';
  setError(message);
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

  // Note: show errors as a banner so the user can still interact with the dashboard

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

  const totalSpending = needsTotal + wantsTotal;
  const savingsGoal = analysisData?.savingsGoal || 500; // fallback to 500
  const progressPercentage = savingsGoal > 0 ? Math.min((savingsGoal - wantsTotal) / savingsGoal * 100, 100) : 0;

  return (
    <div className="dashboard-container">
      {error && (
        <div className="error-banner">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div style={{fontWeight:600}}>{error}</div>
            <div style={{display:'flex', gap:8}}>
              <button className="retry-button" onClick={() => { setError(''); fetchAnalysis(); }}>Try Again</button>
              <button className="back-button" onClick={onBack}>Back to Onboarding</button>
            </div>
          </div>
        </div>
      )}
      <div className="dashboard-header">
  <h2>Your Financial Dashboard</h2>
        <div style={{display:'flex', gap:12}}>
          <button onClick={handleSeedTransactions} className="btn-primary small">Add transactions</button>
          <button
            className={`btn-ghost ${removeMode ? 'active-remove' : ''}`}
            onClick={() => {
              setRemoveMode(!removeMode);
              // clear previous selections when toggling off
              if (removeMode) setSelectedTxIds([]);
            }}
          >
            {removeMode ? 'Cancel Remove' : 'Remove'}
          </button>

          {removeMode && (
            <button
              className="btn-danger"
              onClick={async () => {
                // Confirm removal of all selected
                  const displayed = categorizedTransactions.slice(-10).reverse();
                  const toRemove = displayed.filter(tx => selectedTxIds.includes(tx.id));
                  if (toRemove.length === 0) {
                    setError('No transactions selected to remove.');
                    return;
                  }
                  try {
                    setIsLoading(true);
                    setError('');
                    // call remove endpoint for each selected transaction; send only id
                    await Promise.all(toRemove.map(tx => axios.post('/api/remove-transaction', { id: tx.id })));
                    setSelectedTxIds([]);
                    setRemoveMode(false);
                    await fetchAnalysis();
                  } catch (err) {
                    console.error('Batch remove error:', err);
                    const message = err?.response?.data?.error || err.message || 'Failed to remove selected transactions.';
                    setError(message);
                  } finally {
                    setIsLoading(false);
                  }
              }}
            >Confirm Remove</button>
          )}

          <button onClick={onBack} className="back-button">
             Start Over
          </button>
        </div>
      </div>
      {showAddForm && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowAddForm(false)}
        >
          <div
            className="modal-card card"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
              <h3 style={{margin:0}}>Add Transaction</h3>
              <button
                className="btn-ghost"
                type="button"
                aria-label="Close add transaction"
                onClick={() => setShowAddForm(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTransaction} style={{display:'flex', flexDirection:'column', gap:12}}>
              <input value={newDescription} onChange={(e)=>setNewDescription(e.target.value)} placeholder="Description" required />
              <input value={newAmount} onChange={(e)=>setNewAmount(e.target.value)} placeholder="Amount" type="number" step="0.01" required />
              <div style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
                <button type="button" className="btn-ghost" onClick={()=>setShowAddForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Spending Breakdown Chart */}
        <SpendingBreakdown 
          needsTotal={needsTotal}
          wantsTotal={wantsTotal}
          totalSpending={totalSpending}
          monthlyBudget={monthlyBudget}
        />

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
              <span>Goal: ${savingsGoal}</span>
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
            {categorizedTransactions.slice(-10).reverse().map((transaction, index) => {
              const isSelected = selectedTxIds.includes(transaction.id);
              return (
              <div
                key={transaction.id || index}
                className={`transaction-item ${transaction.category.toLowerCase()} ${isSelected ? 'selected-for-remove' : ''}`}
                onClick={() => {
                  if (!removeMode) return;
                  // toggle id in selectedTxIds
                  if (!transaction.id) {
                    // if no id, ignore selection and show error
                    setError('This transaction cannot be removed (missing id).');
                    return;
                  }
                  setSelectedTxIds(prev => prev.includes(transaction.id) ? prev.filter(i => i !== transaction.id) : [...prev, transaction.id]);
                }}
                role={removeMode ? 'button' : undefined}
                tabIndex={removeMode ? 0 : undefined}
                onKeyDown={(e) => { if (removeMode && (e.key === 'Enter' || e.key === ' ')) {
                    if (!transaction.id) { setError('This transaction cannot be removed (missing id).'); return; }
                    setSelectedTxIds(prev => prev.includes(transaction.id) ? prev.filter(i => i !== transaction.id) : [...prev, transaction.id]);
                  } }}
              >
                <div className="transaction-info">
                  <div style={{display:'flex', gap:8, alignItems:'center'}}>
                    <span className="transaction-description">{transaction.description}</span>
                  </div>
                  <span className="transaction-category">{transaction.category}</span>
                </div>
                <span className="transaction-amount">${transaction.amount.toFixed(2)}</span>
              </div>
              )
            })}
          </div>
        </div>

        {/* Rewards Section */}
        <Rewards actualSavings={actualSavings} />
      </div>
    </div>
  );
};

export default Dashboard;
