import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SpendingBreakdown from './SpendingBreakdown';
import SavingsHistory from './SavingsHistory';
import Rewards from './Rewards';
import StocksCard from './StocksCard';
import SavedStocksCard from './SavedStocksCard';
import BestCards from './BestCards';

// Helper to generate a random date between July 1 and October 31, 2025
function randomDateJulyToOctober() {
  const start = new Date('2025-07-01T00:00:00Z').getTime();
  const end = new Date('2025-10-31T23:59:59Z').getTime();
  const date = new Date(start + Math.random() * (end - start));
  return date;
}
const Dashboard = ({ onBack }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [removeMode, setRemoveMode] = useState(false);
  // store ids as strings to avoid number/string mismatches from API
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
  const monthlyBudget = analysisData?.monthlyBudget || 0;
  const savingsGoal = analysisData?.savingsGoal || 500;
  let categorizedTransactions = analysisData?.categorizedTransactions || [];
  // Assign a stable random date in the past 4 months (July to October 2025) to each transaction if not present, and persist in localStorage
  // Also, always categorize groceries as 'Need'
  const txDateKey = 'txDateMap2025';
  let txDateMap = {};
  try {
    txDateMap = JSON.parse(localStorage.getItem(txDateKey)) || {};
  } catch (e) { txDateMap = {}; }

  function getStableDate(tx) {
    // Use a stable hash to assign a month (July, Aug, Sep, Oct)
    let seed = String(tx.id || tx.description || '') + String(tx.amount);
    let hash = 0;
    for (let j = 0; j < seed.length; j++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(j);
      hash |= 0;
    }
    // There are 4 months: July (6), Aug (7), Sep (8), Oct (9)
    const months = [6, 7, 8, 9];
    const monthIdx = Math.abs(hash) % months.length;
    const year = 2025;
    // Random day in month (1-28 for safety)
    const day = 1 + (Math.abs(hash) % 28);
    return new Date(year, months[monthIdx], day, 12, 0, 0, 0);
  }

  categorizedTransactions = categorizedTransactions.map((tx, i) => {
    // Always categorize groceries as 'Need'
    let category = tx.category;
    if (tx.description && tx.description.toLowerCase().includes('grocer')) {
      category = 'Need';
    }
    // Assign stable date and persist in localStorage
    let date = tx.date;
    const txKey = String(tx.id || tx.description || '') + String(tx.amount);
    if (!date) {
      if (txDateMap[txKey]) {
        date = new Date(txDateMap[txKey]);
      } else {
        date = getStableDate(tx);
        txDateMap[txKey] = date.toISOString();
        try { localStorage.setItem(txDateKey, JSON.stringify(txDateMap)); } catch (e) {}
      }
    } else {
      date = new Date(date);
    }
    return { ...tx, date, category };
  });


  // Sort transactions in reverse chronological order by date
  const displayedTransactions = categorizedTransactions.slice().sort((a, b) => b.date - a.date);
  const displayedNeedsTotal = displayedTransactions.reduce((acc, t) => acc + (t.category === 'Need' ? Number(t.amount || 0) : 0), 0);
  const displayedWantsTotal = displayedTransactions.reduce((acc, t) => acc + (t.category === 'Want' ? Number(t.amount || 0) : 0), 0);
  const displayedTotalSpending = displayedNeedsTotal + displayedWantsTotal;
  // For compatibility, keep these as aliases
  const fullNeedsTotal = displayedNeedsTotal;
  const fullWantsTotal = displayedWantsTotal;
  const fullTotalSpending = displayedTotalSpending;
  const progressPercentage = savingsGoal > 0 ? Math.min((savingsGoal - displayedWantsTotal) / savingsGoal * 100, 100) : 0;
  const actualSavingsDisplayed = Math.max(0, savingsGoal - displayedWantsTotal);
  const actualSavingsFull = actualSavingsDisplayed;

  // Generate personalized AI recommendation based on budget status
  const generatePersonalizedRecommendation = () => {
    // IMPORTANT: Use current-month totals to match the header chips and spending breakdown
    const today = new Date();
    const currentMonthTx = displayedTransactions.filter(tx => {
      const txDate = tx.date instanceof Date ? tx.date : new Date(tx.date);
      return txDate.getMonth() === today.getMonth() && txDate.getFullYear() === today.getFullYear();
    });

    const needsTotal = currentMonthTx
      .filter(t => t.category === 'Need')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);
    const wantsTotal = currentMonthTx
      .filter(t => t.category === 'Want')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);
    const totalSpent = needsTotal + wantsTotal;

    const isOverBudget = monthlyBudget > 0 && totalSpent > monthlyBudget;
    const budgetRemaining = monthlyBudget - totalSpent;
    
    if (isOverBudget) {
      // Find recent "Want" transactions for overspending recommendations (current month only)
      const recentWants = currentMonthTx
        .filter(t => t.category === 'Want')
        .sort((a, b) => b.amount - a.amount) // Sort by amount descending
        .slice(0, 2); // Take top 2 expensive wants

      const overAmount = Math.abs(budgetRemaining);
      let recommendation = `🚨 You're $${overAmount.toFixed(2)} over your monthly budget! `;
      
      if (recentWants.length > 0) {
        recommendation += `Here's how to get back on track:\n\n`;
        
        recentWants.forEach((want, index) => {
          const description = want.description.toLowerCase();
          const amount = want.amount.toFixed(2);
          
          if (description.includes('coffee') || description.includes('starbucks') || description.includes('cafe')) {
            recommendation += `☕ Break up with that $${amount} coffee habit! Instead of buying coffee out, invest in a quality coffee maker or French press. You'll save hundreds while still getting your caffeine fix - and you can make it exactly how you like it!`;
          } else if (description.includes('restaurant') || description.includes('dining') || description.includes('food') || description.includes('takeout') || description.includes('delivery')) {
            recommendation += `🍳 Transform that $${amount} dining expense into a culinary adventure! Start meal prepping on Sundays or challenge yourself to recreate your favorite restaurant dishes at home. You'll save money AND become a better cook!`;
          } else if (description.includes('gap') || description.includes('clothes') || description.includes('clothing') || description.includes('shirt') || description.includes('pants') || description.includes('dress') || description.includes('fashion')) {
            recommendation += `� Instead of spending $${amount} on new clothes, go thrifting! You'll find unique pieces at a fraction of the cost, help the environment, and discover vintage gems you can't find anywhere else!`;
          } else if (description.includes('shopping') || description.includes('retail') || description.includes('amazon') || description.includes('target') || description.includes('walmart')) {
            recommendation += `🛍️ That $${amount} shopping spree can wait! Try the 24-hour rule: wait a full day before buying anything non-essential. Check if you already own something similar, or see if you can borrow it first!`;
          } else if (description.includes('uber') || description.includes('lyft') || description.includes('taxi') || description.includes('rideshare')) {
            recommendation += `🚶‍♀️ Turn that $${amount} ride expense into free exercise! Walk, bike, or use public transit when possible. Your wallet AND your health will thank you!`;
          } else if (description.includes('movie') || description.includes('cinema') || description.includes('theater')) {
            recommendation += `🎬 Instead of spending $${amount} at the movies, host a movie night at home! Make popcorn, invite friends, and create your own cinema experience for a fraction of the cost!`;
          } else if (description.includes('netflix') || description.includes('spotify') || description.includes('streaming') || description.includes('subscription')) {
            recommendation += `📺 Reconsider that $${amount} subscription! Share accounts with family, use free alternatives like YouTube or library streaming services, or rotate subscriptions monthly instead of keeping them all active!`;
          } else if (description.includes('book') || description.includes('bookstore') || description.includes('kindle')) {
            recommendation += `📚 Instead of buying $${amount} worth of books, visit your local library! You can borrow books for free, discover new authors, and even attend free events and book clubs!`;
          } else if (description.includes('gas') || description.includes('fuel') && description.includes('station')) {
            recommendation += `⛽ Save on that $${amount} gas expense by combining errands into one trip, carpooling with friends, or using apps to find the cheapest gas stations nearby!`;
          } else if (description.includes('beauty') || description.includes('makeup') || description.includes('cosmetics') || description.includes('skincare')) {
            recommendation += `💄 Instead of spending $${amount} on beauty products, try DIY skincare with natural ingredients, swap products with friends, or look for drugstore dupes of expensive brands!`;
          } else {
            recommendation += `💪 Instead of spending $${amount} on ${want.description}, try organizing a fun activity with friends like a potluck dinner, game night, or free outdoor adventure! You'll save money while creating amazing memories that last way longer than any purchase!`;
          }
          
          if (index < recentWants.length - 1) recommendation += `\n\n`;
        });
      } else {
        recommendation += `💡 Review your recent purchases and identify areas where you can cut back next month. Every small change adds up to big savings!`;
      }
      
      return recommendation;
    } else if (budgetRemaining > 0) {
      // Under budget — offer restaurant and tourist attraction ideas
      const pick = (arr, n) => arr.slice().sort(() => 0.5 - Math.random()).slice(0, Math.min(n, arr.length));

      const restaurantRecs = [
        'Grab street tacos at a local taqueria (under $12)',
        'Cozy ramen night — a rich tonkotsu bowl (~$15)',
        'Share an Ethiopian injera platter (~$18 per person)',
        'Wood-fired margherita pizza to split (~$10 each)',
        'Thai green curry + jasmine rice (~$14)',
        'Mediterranean bowl with falafel and hummus (~$13)',
        'Korean bibimbap or bulgogi bowl (~$16)',
      ];

      const attractionRecs = [
        'Visit the city art or science museum (look for free days)',
        'Walk a botanical garden at golden hour',
        'Self-guided tour of the historic district',
        'Sunset at a scenic overlook or waterfront',
        'Check out a local market or food hall',
        'Ride rental bikes or scooters through a park loop',
        'Catch a free community concert or outdoor movie',
      ];

      const pickedRestaurants = pick(restaurantRecs, 3).join('; ');
      const pickedAttractions = pick(attractionRecs, 3).join('; ');

      return `🎉 Amazing—you’ve got $${budgetRemaining.toFixed(2)} left this month! Treat yourself thoughtfully:
🍽️ Restaurants: ${pickedRestaurants}.
🗺️ Attractions: ${pickedAttractions}.
Pro tip: go on a weekday for shorter lines and better deals, or use student/local discounts when available.`;
    } else {
      // Exactly on budget
      return `💯 Incredible! You've spent exactly your monthly budget. You're a financial management superstar! 🌟`;
    }
  };

  // Compute AI recommendation on each render so it's always up to date
  const personalizedRecommendation = generatePersonalizedRecommendation();
  const remainingBudget = monthlyBudget - displayedTotalSpending;

  // Compute current-month savings to align Rewards points with the visible savings progress
  const today = new Date();
  const currentMonthTx = (categorizedTransactions || []).filter(tx => {
    const txDate = tx.date instanceof Date ? tx.date : new Date(tx.date);
    return txDate.getMonth() === today.getMonth() && txDate.getFullYear() === today.getFullYear();
  });
  const cmNeeds = currentMonthTx.filter(t => t.category === 'Need').reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const cmWants = currentMonthTx.filter(t => t.category === 'Want').reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const cmTotal = cmNeeds + cmWants;
  const currentMonthSavings = Math.max(0, (Number(monthlyBudget) || 0) - cmTotal);

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

        <div className="dashboard-header" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <h2 style={{ margin: 0 }}>Your Financial Dashboard</h2>
          {/* Stat chips: Budget / Spent / Remaining */}
          {/* Stat chips: Budget / Spent / Remaining (use only current month transactions) */}
          <div className="stat-chips">
            <div className="chip chip-budget" title="Monthly Budget">
              <span className="dot" /> Budget
              <span style={{ marginLeft: 8 }}>${monthlyBudget.toFixed(2)}</span>
            </div>
            {(() => {
              const today = new Date();
              const currentMonthTx = displayedTransactions.filter(tx => {
                const txDate = tx.date instanceof Date ? tx.date : new Date(tx.date);
                return txDate.getMonth() === today.getMonth() && txDate.getFullYear() === today.getFullYear();
              });
              const needsTotal = currentMonthTx.filter(t => t.category === 'Need').reduce((acc, t) => acc + Number(t.amount || 0), 0);
              const wantsTotal = currentMonthTx.filter(t => t.category === 'Want').reduce((acc, t) => acc + Number(t.amount || 0), 0);
              const totalSpending = needsTotal + wantsTotal;
              const remainingBudget = monthlyBudget - totalSpending;
              return (
                <>
                  <div className="chip chip-spent" title="Spent (matches chart)">
                    <span className="dot" /> Spent
                    <span style={{ marginLeft: 8 }}>${totalSpending.toFixed(2)}</span>
                  </div>
                  <div className={`chip chip-remaining ${remainingBudget < 0 ? 'negative' : ''}`} title="Remaining vs budget">
                    <span className="dot" /> {remainingBudget < 0 ? 'Over' : 'Remaining'}
                    <span style={{ marginLeft: 8 }}>${Math.abs(remainingBudget).toFixed(2)}</span>
                  </div>
                </>
              );
            })()}
          </div>
          <div className="header-actions" style={{ display: 'flex', gap: 12, justifyContent: 'center', width: '100%' }}>
            <button onClick={handleSeedTransactions} className="btn-primary small">Add transactions</button>
            <button className={`btn-ghost ${removeMode ? 'active-remove' : ''}`} onClick={() => { setRemoveMode(!removeMode); }}>
              {removeMode ? 'Cancel Remove' : 'Remove'}
            </button>
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

        <div className="dashboard-grid">
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="card-base">
              <div className="card-scroll">
                {/* Only use transactions from the current month for breakdown */}
                {(() => {
                  const today = new Date();
                  const currentMonthTx = displayedTransactions.filter(tx => {
                    const txDate = tx.date instanceof Date ? tx.date : new Date(tx.date);
                    return txDate.getMonth() === today.getMonth() && txDate.getFullYear() === today.getFullYear();
                  });
                  const needsTotal = currentMonthTx.filter(t => t.category === 'Need').reduce((acc, t) => acc + Number(t.amount || 0), 0);
                  const wantsTotal = currentMonthTx.filter(t => t.category === 'Want').reduce((acc, t) => acc + Number(t.amount || 0), 0);
                  const totalSpending = needsTotal + wantsTotal;
                  return (
                    <SpendingBreakdown
                      needsTotal={needsTotal}
                      wantsTotal={wantsTotal}
                      totalSpending={totalSpending}
                      monthlyBudget={monthlyBudget}
                    />
                  );
                })()}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="card-base">
              <div className="card-scroll">
                {/* Pass prop to SavingsHistory to show last 3 months excluding current month */}
                <SavingsHistory
                  savingsGoal={savingsGoal}
                  actualSavings={actualSavingsFull}
                  monthlyBudget={monthlyBudget}
                  displayedSpent={displayedTotalSpending}
                  transactions={displayedTransactions}
                  excludeCurrentMonth={true}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="card-base" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ color: '#0b1f3a' }}>AI Recommendation</h3>
              <div className="card-scroll" style={{ marginTop: 8 }}>
                <div style={{ background: 'rgba(0,72,151,0.05)', padding: 20, borderRadius: 8, borderLeft: '3px solid rgba(0,72,151,0.3)' }}>
                  <p style={{ margin: 0, lineHeight: 1.6, color: '#0b1f3a' }}>{personalizedRecommendation}</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <BestCards />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="card-base" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3>Recent Transactions</h3>
              <div className="transactions-list card-scroll" style={{ marginTop: 12 }}>
                {(() => {
                  // Sort all transactions in reverse chronological order by date
                  const allTransactions = categorizedTransactions.slice().sort((a, b) => b.date - a.date);
                  const needs = allTransactions.filter(t => t.category === 'Need');
                  const wants = allTransactions.filter(t => t.category === 'Want');
                  
                  return (
                    <>
                      {needs.length > 0 && (
                        <>
                          <div className="transactions-section-header needs">💙 Needs ({needs.length})</div>
                          {needs.map((transaction, index) => {
                            // Format date as 'MMM DD, YYYY'
                            const txDate = transaction.date instanceof Date ? transaction.date : new Date(transaction.date);
                            const dateStr = txDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                            return (
                              <div key={`need-${transaction.id || index}`} className={`transaction-item ${transaction.category.toLowerCase()}`} onClick={async () => {
                                if (!removeMode) return;
                                if (!transaction.id) { setError('This transaction cannot be removed (missing id).'); return; }
                                try {
                                  setIsLoading(true);
                                  setError('');
                                  await axios.post('/api/remove-transaction', { id: transaction.id });
                                  setRemoveMode(false);
                                  await fetchAnalysis();
                                } catch (err) {
                                  console.error('Remove error:', err);
                                  const message = err?.response?.data?.error || err.message || 'Failed to remove transaction.';
                                  setError(message);
                                } finally {
                                  setIsLoading(false);
                                }
                              }} role={removeMode ? 'button' : undefined} tabIndex={removeMode ? 0 : undefined} onKeyDown={async (e) => { if (removeMode && (e.key === 'Enter' || e.key === ' ')) { if (!transaction.id) { setError('This transaction cannot be removed (missing id).'); return; } try { setIsLoading(true); setError(''); await axios.post('/api/remove-transaction', { id: transaction.id }); setRemoveMode(false); await fetchAnalysis(); } catch (err) { console.error('Remove error:', err); const message = err?.response?.data?.error || err.message || 'Failed to remove transaction.'; setError(message); } finally { setIsLoading(false); } } }}>
                                <div className="transaction-info">
                                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <span className="transaction-description">{transaction.description}</span>
                                  </div>
                                  <span className="transaction-category">{transaction.category}</span>
                                  <span className="transaction-date" style={{ color: '#6b7280', fontSize: '0.95em', marginLeft: 4 }}>{dateStr}</span>
                                </div>
                                <span className="transaction-amount">${transaction.amount.toFixed(2)}</span>
                              </div>
                            );
                          })}
                        </>
                      )}
                      
                      {wants.length > 0 && (
                        <>
                          <div className="transactions-section-header wants" style={{ marginTop: needs.length > 0 ? 16 : 4 }}>🧡 Wants ({wants.length})</div>
                          {wants.map((transaction, index) => {
                            // Format date as 'MMM DD, YYYY'
                            const txDate = transaction.date instanceof Date ? transaction.date : new Date(transaction.date);
                            const dateStr = txDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                            return (
                              <div key={`want-${transaction.id || index}`} className={`transaction-item ${transaction.category.toLowerCase()}`} onClick={async () => {
                                if (!removeMode) return;
                                if (!transaction.id) { setError('This transaction cannot be removed (missing id).'); return; }
                                try {
                                  setIsLoading(true);
                                  setError('');
                                  await axios.post('/api/remove-transaction', { id: transaction.id });
                                  setRemoveMode(false);
                                  await fetchAnalysis();
                                } catch (err) {
                                  console.error('Remove error:', err);
                                  const message = err?.response?.data?.error || err.message || 'Failed to remove transaction.';
                                  setError(message);
                                } finally {
                                  setIsLoading(false);
                                }
                              }} role={removeMode ? 'button' : undefined} tabIndex={removeMode ? 0 : undefined} onKeyDown={async (e) => { if (removeMode && (e.key === 'Enter' || e.key === ' ')) { if (!transaction.id) { setError('This transaction cannot be removed (missing id).'); return; } try { setIsLoading(true); setError(''); await axios.post('/api/remove-transaction', { id: transaction.id }); setRemoveMode(false); await fetchAnalysis(); } catch (err) { console.error('Remove error:', err); const message = err?.response?.data?.error || err.message || 'Failed to remove transaction.'; setError(message); } finally { setIsLoading(false); } } }}>
                                <div className="transaction-info">
                                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <span className="transaction-description">{transaction.description}</span>
                                  </div>
                                  <span className="transaction-category">{transaction.category}</span>
                                  <span className="transaction-date" style={{ color: '#6b7280', fontSize: '0.95em', marginLeft: 4 }}>{dateStr}</span>
                                </div>
                                <span className="transaction-amount">${transaction.amount.toFixed(2)}</span>
                              </div>
                            );
                          })}
                        </>
                      )}
                      
                      {needs.length === 0 && wants.length === 0 && (
                        <div style={{ textAlign: 'center', color: '#6b7280', fontStyle: 'italic', marginTop: '20px' }}>
                          No recent transactions to display
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <StocksCard />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <SavedStocksCard />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="card-base">
              <div className="card-scroll">
                <Rewards actualSavings={currentMonthSavings} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
