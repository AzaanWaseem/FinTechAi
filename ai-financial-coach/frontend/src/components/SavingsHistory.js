import React, { useState } from 'react';

const SavingsHistory = ({ savingsGoal, actualSavings }) => {
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'quarter'
  
  const getCurrentQuarter = (date) => {
    const month = date.getMonth();
    return Math.floor(month / 3);
  };

  const getQuarterRange = (date, quarterOffset) => {
    const currentDate = new Date(date);
    const currentQuarter = getCurrentQuarter(currentDate);
    
    // Adjust the date to the start of the current quarter
    currentDate.setMonth(currentQuarter * 3);
    
    // Move back by the offset
    currentDate.setMonth(currentDate.getMonth() - (quarterOffset * 3));
    
    const startMonth = currentDate.getMonth();
    const year = currentDate.getFullYear();
    
    const getMonthName = (monthIndex) => {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];
      return months[monthIndex];
    };

    const quarterMonths = [
      getMonthName(startMonth),
      getMonthName((startMonth + 1) % 12),
      getMonthName((startMonth + 2) % 12)
    ];

    return {
      name: `${quarterMonths[0]}-${quarterMonths[2]} ${year}`,
      months: quarterMonths,
      year
    };
  };

  const getTimePeriodsData = () => {
    if (viewMode === 'month') {
      const months = ['October', 'September', 'August'];
      return months.map(month => ({
        name: `${month} 2025`,
        amount: actualSavings,
        goal: savingsGoal,
        percentage: Math.min(100, (actualSavings / savingsGoal) * 100)
      }));
    } else {
      const today = new Date(2025, 9, 18); // October 18, 2025
      const quarters = [
        { name: 'July-September 2025', amount: actualSavings * 3, goal: savingsGoal * 3 },
        { name: 'April-June 2025', amount: actualSavings * 3, goal: savingsGoal * 3 },
        { name: 'January-March 2025', amount: actualSavings * 3, goal: savingsGoal * 3 },
        { name: 'October-December 2024', amount: actualSavings * 3, goal: savingsGoal * 3 }
      ];
      return quarters.map(quarter => ({
        name: quarter.name,
        amount: quarter.amount,
        goal: quarter.goal,
        percentage: Math.min(100, (quarter.amount / quarter.goal) * 100)
      }));
    }
  };

  const data = getTimePeriodsData();

  return (
    <div className="savings-history">
      <h1 className="history-title">Savings Progress</h1>
      <div className="view-selector">
        <button
          className={`view-button ${viewMode === 'month' ? 'active' : ''}`}
          onClick={() => setViewMode('month')}
        >
          Last 3 Months
        </button>
        <button
          className={`view-button ${viewMode === 'quarter' ? 'active' : ''}`}
          onClick={() => setViewMode('quarter')}
        >
          Past Year (Quarterly)
        </button>
      </div>
      {data.map((period, index) => (
        <div key={index} className="monthly-summary">
          <div className="month-label">{period.name}</div>
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${period.percentage}%`,
                  backgroundColor: period.amount >= period.goal ? '#16a34a' : '#004879'
                }}
              />
              <div 
                className="goal-line" 
                style={{ left: '100%' }}
              />
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
