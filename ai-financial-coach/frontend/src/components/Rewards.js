import React, { useState } from 'react';
import './Rewards.css';

const POINTS_PER_DOLLAR = 0.01;
const POINTS_PER_REWARD = 10;
const REWARD_VALUE = 50;

const popularRetailers = [
  { name: 'Amazon', icon: '🛒' },
  { name: 'Target', icon: '🎯' },
  { name: 'Walmart', icon: '🏪' },
  { name: 'Starbucks', icon: '☕' },
  { name: 'Chipotle', icon: '🌯' },
  { name: "McDonald's", icon: '🍔' },
  { name: 'DoorDash', icon: '🚗' },
  { name: 'Best Buy', icon: '🎮' }
];

const Rewards = ({ actualSavings }) => {
  const [selectedRetailer, setSelectedRetailer] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const totalPoints = Math.floor(actualSavings * POINTS_PER_DOLLAR);
  const availableRewards = Math.floor(totalPoints / POINTS_PER_REWARD);
  const remainingPoints = totalPoints % POINTS_PER_REWARD;

  const handleRewardRedeem = () => {
    if (!selectedRetailer) {
      alert('Please select a retailer first');
      return;
    }
    setShowConfirmation(true);
  };

  return (
    <div className="rewards-card">
      <h3>Rewards</h3>
      <div className="rewards-summary">
        <div className="points-info">
          <div className="points-total">
            <span className="points-number">{totalPoints}</span>
            <span className="points-label">Total Points</span>
          </div>
          <div className="points-rate">
            <p>{POINTS_PER_DOLLAR} points per $1 saved</p>
            <p>{availableRewards > 0 ? `${availableRewards} rewards available!` : `${POINTS_PER_REWARD - remainingPoints} more points needed for your next reward!`}</p>
          </div>
        </div>

        {availableRewards > 0 && (
          <div className="redeem-section">
            <h4>Redeem Your Rewards</h4>
            <p className="reward-description">
              Get a ${REWARD_VALUE} gift card for every {POINTS_PER_REWARD} points!
            </p>
            
            <div className="retailers-grid">
              {popularRetailers.map((retailer) => (
                <button
                  key={retailer.name}
                  className={`retailer-button ${selectedRetailer === retailer.name ? 'selected' : ''}`}
                  onClick={() => setSelectedRetailer(retailer.name)}
                >
                  <span className="retailer-icon">{retailer.icon}</span>
                  <span className="retailer-name">{retailer.name}</span>
                </button>
              ))}
            </div>

            {selectedRetailer && (
              <button 
                className="redeem-button"
                onClick={handleRewardRedeem}
              >
                Redeem ${REWARD_VALUE} {selectedRetailer} Gift Card
              </button>
            )}
          </div>
        )}

        <div className="progress-to-next">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${(remainingPoints / POINTS_PER_REWARD) * 100}%` }}
            />
          </div>
          <p>
            {POINTS_PER_REWARD - remainingPoints} more points needed for a ${REWARD_VALUE} gift card
            ({(remainingPoints / POINTS_PER_REWARD * 100).toFixed(1)}% complete)
          </p>
        </div>
      </div>

      {showConfirmation && (
        <div className="confirmation-overlay">
          <div className="confirmation-modal">
            <h4>Congratulations! 🎉</h4>
            <p>Your ${REWARD_VALUE} {selectedRetailer} gift card is on its way!</p>
            <button 
              className="close-button"
              onClick={() => {
                setShowConfirmation(false);
                setSelectedRetailer('');
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rewards;