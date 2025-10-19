import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

const SpendingBreakdown = ({ needsTotal, wantsTotal, totalSpending, monthlyBudget }) => {
  const data = [
    {
      name: 'Needs',
      amount: needsTotal,
      color: '#004879'
    },
    {
      name: 'Wants', 
      amount: wantsTotal,
      color: '#d22e1e'
    },
    {
      name: 'Total',
      amount: totalSpending,
      color: '#666'
    }
  ];

  // Compute a safe max from the data and budget, then round up to a nice tick
  const dataMax = Math.max(
    totalSpending || 0,
    monthlyBudget || 0,
    needsTotal || 0,
    wantsTotal || 0
  );
  // pad 10% and round up to nearest 100 for cleaner axis labels
  const maxValue = Math.ceil((dataMax * 1.1 || 0) / 100) * 100;

  return (
    <div className="spending-breakdown">
      <h3>Spending Breakdown</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} background={{ fill: '#fff' }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, maxValue]} />
            <Tooltip 
              formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']}
              labelFormatter={(label) => `${label} Spending`}
              contentStyle={{ backgroundColor: '#fff' }}
            />
            <Bar dataKey="amount" fill={data[0].color}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
            {/* Budget reference line removed to avoid cluttered label */}
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="breakdown-summary">
        <div className="summary-item">
          <span className="label">Needs:</span>
          <span className="amount">${needsTotal.toFixed(2)}</span>
        </div>
        <div className="summary-item">
          <span className="label">Wants:</span>
          <span className="amount">${wantsTotal.toFixed(2)}</span>
        </div>
        <div className="summary-item total">
          <span className="label">Total:</span>
          <span className="amount">${totalSpending.toFixed(2)}</span>
        </div>
  {/* Budget amount removed from summary to keep the card clean */}
      </div>
      
      {monthlyBudget > 0 && (
        <div className="budget-status">
          {totalSpending > monthlyBudget ? (
            <div className="over-budget">
              <span className="status-icon">⚠️</span>
              <span>You're ${(totalSpending - monthlyBudget).toFixed(2)} over budget</span>
            </div>
          ) : (
            <div className="under-budget">
              <span className="status-icon">✅</span>
              <span>You're ${(monthlyBudget - totalSpending).toFixed(2)} under budget</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SpendingBreakdown;
