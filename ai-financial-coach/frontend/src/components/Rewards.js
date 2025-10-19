import React, { useState } from 'react';
import './Rewards.css';

// Correlate points directly to dollars saved: 1 point per $1 saved
const POINTS_PER_DOLLAR = 1;
// Reasonable threshold: every 100 points ($100 saved) earns a $50 reward
const POINTS_PER_REWARD = 100;
const REWARD_VALUE = 50;

const popularRetailers = [
  { name: 'Amazon', key: 'amazon' },
  { name: 'Target', key: 'target' },
  { name: 'Walmart', key: 'walmart' },
  { name: 'Starbucks', key: 'starbucks' },
  { name: 'Chipotle', key: 'chipotle' },
  { name: "McDonald's", key: 'mcdonalds' },
  { name: 'DoorDash', key: 'doordash' },
  { name: 'Best Buy', key: 'bestbuy' }
];

const Rewards = ({ actualSavings }) => {
  const [selectedRetailer, setSelectedRetailer] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [page, setPage] = useState(0);

  // Defensive: coerce actualSavings to a finite number (fallback to 0).
  const safeSavings = Number(actualSavings) || 0;
  const totalPoints = Number.isFinite(safeSavings) ? Math.max(0, Math.floor(safeSavings * POINTS_PER_DOLLAR)) : 0;
  const availableRewards = Math.floor(totalPoints / POINTS_PER_REWARD);
  const remainingPoints = POINTS_PER_REWARD > 0 ? totalPoints % POINTS_PER_REWARD : 0;

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
  const pointsNeededForNext = Math.max(POINTS_PER_REWARD - remainingPoints, 0);
  const dollarsToNextReward = POINTS_PER_DOLLAR > 0 ? Math.ceil(pointsNeededForNext / POINTS_PER_DOLLAR) : 0;

  return (
    <div className="rewards-card">
      <h3>Rewards</h3>
      <div className="rewards-summary">
        <div className="points-info">
          <div className="points-total">
            <span className="points-number">{Number.isFinite(totalPoints) ? totalPoints : 0}</span>
            <span className="points-label">Total Points</span>
          </div>
          <div className="points-rate">
            <p>{POINTS_PER_DOLLAR} point{POINTS_PER_DOLLAR === 1 ? '' : 's'} per $1 saved</p>
            <p>{availableRewards > 0 ? `${availableRewards} rewards available!` : `${Math.max(POINTS_PER_REWARD - remainingPoints, 0)} more points needed for your next reward!`}</p>
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
                // Prefer PNGs if they exist (designer replaced folder with PNGs); fall back to SVG
                const pngPath = `${process.env.PUBLIC_URL}/assets/logos/${retailer.key}.png`;
                const svgPath = `${process.env.PUBLIC_URL}/assets/logos/${retailer.key}.svg`;
                // Use PNG by default; the browser will 404 if missing and then the SVG will be used via onError
                const logoSrc = pngPath;
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
                  >
                    <img
                      className="retailer-logo"
                      src={logoSrc}
                      alt={`${label} logo`}
                      onError={(e) => {
                        // fallback to svg if png not present
                        if (e && e.currentTarget) e.currentTarget.src = svgPath;
                      }}
                    />
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
            1 point per $1 saved. You currently have <strong>{Number.isFinite(totalPoints) ? totalPoints : 0}</strong> point{(Number.isFinite(totalPoints) ? totalPoints : 0) === 1 ? '' : 's'}.
          </p>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${POINTS_PER_REWARD > 0 ? (remainingPoints / POINTS_PER_REWARD) * 100 : 0}%` }}
            />
          </div>
          <p>
            {Math.max(POINTS_PER_REWARD - remainingPoints, 0)} more point{Math.max(POINTS_PER_REWARD - remainingPoints, 0) === 1 ? '' : 's'} needed for a ${REWARD_VALUE} gift card
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