import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import SpendingBreakdown from './SpendingBreakdown';
import SavingsHistory from './SavingsHistory';
import Rewards from './Rewards';

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
  // totals returned by analysis (may be for all transactions)
  const needsTotal = analysisData?.needsTotal || 0;
  const wantsTotal = analysisData?.wantsTotal || 0;
  const totalSpending = analysisData?.totalSpending || (needsTotal + wantsTotal);
  const monthlyBudget = analysisData?.monthlyBudget || 0;
  const savingsGoal = analysisData?.savingsGoal || 500;
  const recommendation = analysisData?.recommendation || "No recommendation available.";
  const categorizedTransactions = analysisData?.categorizedTransactions || [];

  // Compute totals for the displayed slice (most recent 10) so the chart matches
  // the visible list, but also compute full totals for components that should
  // reflect all data (SavingsHistory, Rewards).
  const displayedTransactions = categorizedTransactions.slice(-10).reverse();
  const displayedNeedsTotal = displayedTransactions.reduce((acc, t) => acc + (t.category === 'Need' ? Number(t.amount || 0) : 0), 0);
  const displayedWantsTotal = displayedTransactions.reduce((acc, t) => acc + (t.category === 'Want' ? Number(t.amount || 0) : 0), 0);
  const displayedTotalSpending = displayedNeedsTotal + displayedWantsTotal;

  // Full totals across all transactions (not just the last 10). Use these for
  // components that expect the complete dataset.
  const fullNeedsTotal = categorizedTransactions.reduce((acc, t) => acc + (t.category === 'Need' ? Number(t.amount || 0) : 0), 0);
  const fullWantsTotal = categorizedTransactions.reduce((acc, t) => acc + (t.category === 'Want' ? Number(t.amount || 0) : 0), 0);
  const fullTotalSpending = fullNeedsTotal + fullWantsTotal;

  const pieData = [
    { name: 'Needs', value: displayedNeedsTotal, color: '#004879' },
    { name: 'Wants', value: displayedWantsTotal, color: '#d22e1e' }
  ];
  // compute progress and estimated savings
  // Progress visual uses displayed wants total so it lines up with the chart,
  // but actual savings for Rewards and SavingsHistory should consider the full
  // dataset.
  const progressPercentage = savingsGoal > 0 ? Math.min((savingsGoal - displayedWantsTotal) / savingsGoal * 100, 100) : 0;
  const actualSavingsDisplayed = Math.max(0, savingsGoal - displayedWantsTotal);
  const actualSavingsFull = Math.max(0, savingsGoal - fullWantsTotal);

  return (
    <div className="dashboard-container">
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        {error && (
          <div className="error-banner">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 600 }}>{error}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="retry-button" onClick={() => { setError(''); fetchAnalysis(); }}>Try Again</button>
                <button className="back-button" onClick={onBack}>Back to Onboarding</button>
              </div>
            </div>
          </div>
        )}

        <div className="dashboard-header">
          <h2>Your Financial Dashboard</h2>
          <div className="header-actions" style={{ display: 'flex', gap: 12 }}>
            <button onClick={handleSeedTransactions} className="btn-primary small">Add transactions</button>
            <button className={`btn-ghost ${removeMode ? 'active-remove' : ''}`} onClick={() => { setRemoveMode(!removeMode); if (removeMode) setSelectedTxIds([]); }}>
              {removeMode ? 'Cancel Remove' : 'Remove'}
            </button>
            {removeMode && (
              <button className="btn-danger" onClick={async () => {
                const displayed = categorizedTransactions.slice(-10).reverse();
                const toRemove = displayed.filter(tx => selectedTxIds.includes(tx.id));
                if (toRemove.length === 0) { setError('No transactions selected to remove.'); return; }
                try { setIsLoading(true); setError(''); await Promise.all(toRemove.map(tx => axios.post('/api/remove-transaction', { id: tx.id }))); setSelectedTxIds([]); setRemoveMode(false); await fetchAnalysis(); }
                catch (err) { console.error('Batch remove error:', err); const message = err?.response?.data?.error || err.message || 'Failed to remove selected transactions.'; setError(message); }
                finally { setIsLoading(false); }
              }}>Confirm Remove</button>
            )}
            <button onClick={onBack} className="back-button">Start Over</button>
          </div>
        </div>

        {showAddForm && (
          <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => setShowAddForm(false)}>
            <div className="modal-card card" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0 }}>Add Transaction</h3>
                <button className="btn-ghost" type="button" aria-label="Close add transaction" onClick={() => setShowAddForm(false)}>✕</button>
              </div>
              <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Description" required />
                <input value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="Amount" type="number" step="0.01" required />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn-ghost" onClick={() => setShowAddForm(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Add</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, maxWidth: 1400, margin: '0 auto', gridAutoRows: 'minmax(320px, 1fr)' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 28, flex: '1 1 auto', borderRadius: 12, background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>
              <SpendingBreakdown needsTotal={displayedNeedsTotal} wantsTotal={displayedWantsTotal} totalSpending={displayedTotalSpending} monthlyBudget={monthlyBudget} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 28, flex: '1 1 auto', borderRadius: 12, background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>
              <SavingsHistory savingsGoal={savingsGoal} actualSavings={actualSavingsFull} />
            </div>
          </div>

          <div style={{ padding: 28, borderRadius: 12, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', background: 'linear-gradient(135deg,#004977 0%,#003a5d 100%)', color: 'white' }}>
            <h3 style={{ color: 'white' }}>AI Recommendation</h3>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: 20, borderRadius: 8, borderLeft: '3px solid rgba(96,165,250,0.6)', marginTop: 8, flex: '1 1 auto' }}>
              <p style={{ margin: 0, lineHeight: 1.6 }}>{recommendation}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 28, borderRadius: 12, background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', flex: '1 1 auto' }}>
              <h3>Recent Transactions</h3>
              <div className="transactions-list" style={{ flex: '1 1 auto', overflowY: 'auto', marginTop: 12 }}>
                {categorizedTransactions.slice(-10).reverse().map((transaction, index) => {
                  const isSelected = selectedTxIds.includes(transaction.id);
                  return (
                    <div key={transaction.id || index} className={`transaction-item ${transaction.category.toLowerCase()} ${isSelected ? 'selected-for-remove' : ''}`} onClick={() => {
                      if (!removeMode) return;
                      if (!transaction.id) { setError('This transaction cannot be removed (missing id).'); return; }
                      setSelectedTxIds(prev => prev.includes(transaction.id) ? prev.filter(i => i !== transaction.id) : [...prev, transaction.id]);
                    }} role={removeMode ? 'button' : undefined} tabIndex={removeMode ? 0 : undefined} onKeyDown={(e) => { if (removeMode && (e.key === 'Enter' || e.key === ' ')) { if (!transaction.id) { setError('This transaction cannot be removed (missing id).'); return; } setSelectedTxIds(prev => prev.includes(transaction.id) ? prev.filter(i => i !== transaction.id) : [...prev, transaction.id]); } }}>
                      <div className="transaction-info">
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span className="transaction-description">{transaction.description}</span>
                        </div>
                        <span className="transaction-category">{transaction.category}</span>
                      </div>
                      <span className="transaction-amount">${transaction.amount.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 28, borderRadius: 12, background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', flex: '1 1 auto' }}>
              <Rewards actualSavings={actualSavingsFull} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
