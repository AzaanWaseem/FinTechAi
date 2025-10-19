import React, { useState } from 'react';

const SavingsHistory = ({ savingsGoal, actualSavings, monthlyBudget = 0, displayedSpent = 0 }) => {
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'quarter'

  const monthsNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const getCurrentQuarter = (date) => Math.floor(date.getMonth() / 3);

  const getQuarterLabelFromDate = (date) => {
    const q = getCurrentQuarter(date);
    const startMonthIdx = q * 3;
    const endMonthIdx = startMonthIdx + 2;
    return `${monthsNames[startMonthIdx]}-${monthsNames[endMonthIdx]} ${date.getFullYear()}`;
  };

  const safePercent = (amount, goal) => {
    if (!goal || goal <= 0) return 0;
    return Math.min(100, (amount / goal) * 100);
  };

  const getTimePeriodsData = () => {
    const today = new Date();
    if (viewMode === 'month') {
      // Last 3 months including current
      const periods = [];
      for (let i = 0; i < 3; i++) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const name = `${monthsNames[d.getMonth()]} ${d.getFullYear()}`;
        // For the current month, align with dashboard Remaining = monthlyBudget - displayedSpent
        let amount = actualSavings;
        if (i === 0 && monthlyBudget > 0) {
          const remaining = Math.max(0, monthlyBudget - (displayedSpent || 0));
          amount = remaining;
        }
        const goal = savingsGoal;
        periods.push({
          name,
          amount,
          goal,
          percentage: safePercent(amount, goal),
        });
      }
      return periods;
    } else {
      // Past 4 quarters including current quarter
      const periods = [];
      const startDate = new Date(today);
      for (let i = 0; i < 4; i++) {
        const d = new Date(startDate.getFullYear(), startDate.getMonth() - i * 3, 1);
        const name = getQuarterLabelFromDate(d);
        let amount = (actualSavings || 0) * 3; // default approximation for a quarter
        const goal = (savingsGoal || 0) * 3;

        // For the current quarter (i === 0), approximate progress using a
        // 'quarterly remaining' concept similar to the monthly view, so the
        // bar moves in sync with the Remaining stat.
        if (i === 0 && monthlyBudget > 0) {
          // Align with the dashboard Remaining chip: do NOT triple the budget here,
          // just reuse the same monthly remaining value to avoid inflation.
          const remaining = Math.max(0, monthlyBudget - (displayedSpent || 0));
          amount = remaining;
        }
        periods.push({
          name,
          amount,
          goal,
          percentage: safePercent(amount, goal),
        });
      }
      return periods;
    }
  };

  const data = getTimePeriodsData();

  return (
    <div className="savings-history">
      <h1 className="history-title">Savings Progress</h1>
      <div className="view-selector" role="tablist" aria-label="Savings progress views">
        <button
          className={`view-button ${viewMode === 'month' ? 'active' : ''}`}
          onClick={() => setViewMode('month')}
          role="tab"
          aria-selected={viewMode === 'month'}
        >
          Last 3 Months
        </button>
        <button
          className={`view-button ${viewMode === 'quarter' ? 'active' : ''}`}
          onClick={() => setViewMode('quarter')}
          role="tab"
          aria-selected={viewMode === 'quarter'}
        >
          Past Year (Quarterly)
        </button>
      </div>
      {data.map((period, index) => (
        <div key={index} className="monthly-summary" aria-label={`${period.name} progress`}>
          <div className="month-label">{period.name}</div>
          <div className="progress-container">
            <div className="progress-bar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Number(period.percentage.toFixed(1))} role="progressbar">
              <div
                className="progress-fill"
                style={{
                  width: `${period.percentage}%`,
                  backgroundColor: period.amount >= period.goal ? '#16a34a' : '#004879',
                }}
              />
              <div className="goal-line" style={{ left: '100%' }} />
            </div>
            <div className="progress-text">
              <span>${period.amount.toFixed(2)} / ${period.goal.toFixed(2)}</span>
              <span>{period.percentage.toFixed(1)}% Complete</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SavingsHistory;
