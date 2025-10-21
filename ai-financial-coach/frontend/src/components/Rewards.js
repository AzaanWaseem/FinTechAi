import React, { useState } from 'react';
import './Rewards.css';

// Correlate points directly to dollars saved: 0.01 point per $1 saved
const POINTS_PER_DOLLAR = 0.01; // 1 point per $100 saved
// Threshold: 10 points (effectively $1000 saved) earns a $50 reward
const POINTS_PER_REWARD = 10;
const REWARD_VALUE = 50;

const popularRetailers = [
  { name: 'Amazon', key: 'amazon', emoji: '📦', color: '#FF9900' },
  { name: 'Target', key: 'target', emoji: '🎯', color: '#CC0000' },
  { name: 'Walmart', key: 'walmart', emoji: '🛒', color: '#0071CE' },
  { name: 'Starbucks', key: 'starbucks', emoji: '☕', color: '#00704A' },
  { name: 'Chipotle', key: 'chipotle', emoji: '🌯', color: '#A81612' },
  { name: "McDonald's", key: 'mcdonalds', emoji: '🍟', color: '#FFC72C' },
  { name: 'DoorDash', key: 'doordash', emoji: '🚗', color: '#FF3008' },
  { name: 'Best Buy', key: 'bestbuy', emoji: '💻', color: '#0046BE' }
];

const Rewards = ({ actualSavings }) => {
  const [selectedRetailer, setSelectedRetailer] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [page, setPage] = useState(0);
  const [imageErrors, setImageErrors] = useState(new Set());

  // Defensive: coerce actualSavings to a finite number (fallback to 0).
  const safeSavings = Number(actualSavings) || 0;
  const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
  // Track points to 2 decimal places
  const totalPoints = Number.isFinite(safeSavings) ? Math.max(0, round2(safeSavings * POINTS_PER_DOLLAR)) : 0;
  const availableRewards = Math.floor(totalPoints / POINTS_PER_REWARD);
  const remainingPoints = POINTS_PER_REWARD > 0 ? round2(totalPoints - (availableRewards * POINTS_PER_REWARD)) : 0;

  const canRedeem = availableRewards > 0;

  const ITEMS_PER_PAGE = 4;
  const totalPages = Math.ceil(popularRetailers.length / ITEMS_PER_PAGE);
  const start = page * ITEMS_PER_PAGE;
  const pagedRetailers = popularRetailers.slice(start, start + ITEMS_PER_PAGE);

  const handleRewardRedeem = () => {
    if (!canRedeem) return; // guard
    if (!selectedRetailer) {
      alert('Please select a retailer first');
      return;
    }
    setShowConfirmation(true);
  };

  // How many dollars needed to reach next reward (use safe math)
  const pointsNeededForNext = round2(Math.max(POINTS_PER_REWARD - remainingPoints, 0));
  const dollarsToNextReward = POINTS_PER_DOLLAR > 0 ? Math.ceil(pointsNeededForNext / POINTS_PER_DOLLAR) : 0;

  return (
    <div className="rewards-card">
      <h3>Rewards</h3>
      <div className="rewards-summary">
        <div className="points-info">
          <div className="points-total">
            <span className="points-number">{Number.isFinite(totalPoints) ? totalPoints.toFixed(2) : '0.00'}</span>
            <span className="points-label">Total Points</span>
          </div>
          <div className="points-rate">
            <p>{POINTS_PER_DOLLAR} point{POINTS_PER_DOLLAR === 1 ? '' : 's'} per $1 saved</p>
            <p>{availableRewards > 0 ? `${availableRewards} rewards available!` : `${pointsNeededForNext.toFixed(2)} more points needed for your next reward!`}</p>
          </div>
        </div>

  {/* Removed the large 'no points yet' message to keep the card concise */}

        {/* Always show retailers, but disable selection when user cannot redeem yet */}
        <div className="redeem-section">
          <h4>Redeem Your Rewards</h4>
          <p className="reward-description">
            Get a ${REWARD_VALUE} gift card for every {POINTS_PER_REWARD} points!
          </p>

          <div className="retailers-wrapper">
            <button
              className="page-arrow"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              aria-label="Previous"
              disabled={page === 0}
            >
              ‹
            </button>

            <div className="retailers-grid">
              {pagedRetailers.map((retailer) => {
                const label = retailer.name;
                return (
                  <button
                    key={retailer.key}
                    className={`retailer-button ${selectedRetailer === label ? 'selected' : ''} ${!canRedeem ? 'disabled' : ''}`}
                    onClick={() => {
                      if (!canRedeem) return;
                      setSelectedRetailer(label);
                    }}
                    aria-disabled={!canRedeem}
                    tabIndex={!canRedeem ? -1 : 0}
                    style={{
                      borderColor: selectedRetailer === label ? retailer.color : undefined
                    }}
                  >
                    <div 
                      className="retailer-logo"
                      style={{
                        backgroundColor: retailer.color,
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        marginBottom: '8px'
                      }}
                    >
                      {retailer.emoji}
                    </div>
                    <span className="retailer-name">{label}</span>
                  </button>
                );
              })}
            </div>

            <button
              className="page-arrow"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              aria-label="Next"
              disabled={page >= totalPages - 1}
            >
              ›
            </button>
          </div>
          <div className="page-indicator">
            Page {page + 1} of {totalPages}
          </div>

          <button
            className="redeem-button"
            onClick={handleRewardRedeem}
            disabled={!canRedeem || !selectedRetailer}
            aria-disabled={!canRedeem || !selectedRetailer}
            style={{opacity: (!canRedeem || !selectedRetailer) ? 0.6 : 1}}
          >
            {canRedeem ? (selectedRetailer ? `Redeem $${REWARD_VALUE} ${selectedRetailer} Gift Card` : 'Select a retailer to redeem') : `No rewards available yet`}
          </button>
        </div>

        <div className="progress-to-next">
          <p style={{ marginTop: 0, marginBottom: 8 }}>
            0.01 point per $1 saved. You currently have <strong>{Number.isFinite(totalPoints) ? totalPoints.toFixed(2) : '0.00'}</strong> point{(Number.isFinite(totalPoints) ? totalPoints : 0) === 1 ? '' : 's'}.
          </p>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${POINTS_PER_REWARD > 0 ? (remainingPoints / POINTS_PER_REWARD) * 100 : 0}%` }}
            />
          </div>
          <p>
            {pointsNeededForNext.toFixed(2)} more point{pointsNeededForNext === 1 ? '' : 's'} needed for a ${REWARD_VALUE} gift card
            ({POINTS_PER_REWARD > 0 ? ((remainingPoints / POINTS_PER_REWARD) * 100).toFixed(1) : '0.0'}% to next reward; about ${dollarsToNextReward} more in savings)
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