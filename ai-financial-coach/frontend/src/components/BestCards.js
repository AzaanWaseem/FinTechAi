import React, { useEffect, useState } from 'react';
import axios from 'axios';

const fallbackCards = {
  cards: [
    { name: 'Blue Cash Everyday', issuer: 'American Express', rewards: ['3% back at U.S. supermarkets', '3% back on U.S. gas', '1% back other'], why: 'Strong everyday categories for groceries and gas.', suitability: 82, categoriesMatched: ['grocery','gas'] },
    { name: 'SavorOne', issuer: 'Capital One', rewards: ['3% back dining','3% back entertainment','3% back popular streaming','3% at grocery stores'], why: 'Well-rounded dining, entertainment, streaming, and grocery rewards.', suitability: 80, categoriesMatched: ['dining','entertainment','streaming','grocery'] },
    { name: 'Citi Custom Cash', issuer: 'Citi', rewards: ['5% back top category (up to cap)','1% back other'], why: 'Automatically adapts to your highest monthly category.', suitability: 79, categoriesMatched: ['dining','gas','grocery','travel','streaming'] },
    { name: 'Discover it Cash Back', issuer: 'Discover', rewards: ['5% rotating categories (activation)','1% back other'], why: 'Quarterly rotating 5% categories can align with your spend.', suitability: 75, categoriesMatched: ['grocery','gas','online'] }
  ],
  disclaimer: 'Offline fallback: general information only. Offers and terms vary; verify current details. Not financial advice.'
};

const BestCards = () => {
  const [cards, setCards] = useState([]);
  const [disclaimer, setDisclaimer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCards = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('/api/credit-cards');
      setCards(res.data?.cards || []);
      setDisclaimer(res.data?.disclaimer || '');
    } catch (err) {
      // Use local fallback when the backend route is missing/unreachable
      setCards(fallbackCards.cards);
      setDisclaimer(fallbackCards.disclaimer);
      // Keep a small note only if a different error than 404 occurs
      const status = err?.response?.status;
      if (status && status !== 404) {
        setError(err?.response?.data?.error || err?.message || 'Failed to load recommendations. Showing offline fallback.');
      } else {
        setError('');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      await fetchCards();
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="card-base" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Best Credit Cards based on Your Spending</h3>
        <button className="btn-ghost" onClick={fetchCards} style={{ fontSize: 14 }}>Refresh</button>
      </div>
      <div className="card-scroll" style={{ marginTop: 8 }}>
        {loading && <div style={{ color: '#6b7280' }}>Loading recommendations…</div>}
        {error && <div style={{ color: '#b91c1c' }}>{error}</div>}

        {!loading && !error && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {cards.map((c, i) => (
              <div key={`${c.name}-${i}`} className="card" style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0b1f3a' }}>{c.name}</div>
                    <div style={{ color: '#6b7280', fontSize: 13 }}>{c.issuer || 'Issuer'}</div>
                  </div>
                  {typeof c.suitability === 'number' && (
                    <div style={{ fontWeight: 700, color: '#004879' }}>{c.suitability}% match</div>
                  )}
                </div>
                {Array.isArray(c.rewards) && c.rewards.length > 0 && (
                  <ul style={{ margin: '8px 0', paddingLeft: 18, color: '#0b1f3a' }}>
                    {c.rewards.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                )}
                {c.why && (
                  <div style={{ color: '#0b1f3a' }}>{c.why}</div>
                )}
                {Array.isArray(c.categoriesMatched) && c.categoriesMatched.length > 0 && (
                  <div style={{ marginTop: 6, color: '#6b7280', fontSize: 12 }}>
                    Categories matched: {c.categoriesMatched.join(', ')}
                  </div>
                )}
              </div>
            ))}

            {disclaimer && (
              <div style={{ fontSize: 12, color: '#6b7280' }}>{disclaimer}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BestCards;
