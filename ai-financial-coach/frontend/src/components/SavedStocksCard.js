import React, { useEffect, useState } from 'react';
import axios from 'axios';

const verdictColor = (v) => {
  switch ((v || '').toLowerCase()) {
    case 'buy': return '#16a34a';
    case 'sell': return '#e11d48';
    default: return '#374151';
  }
};

const SavedStocksCard = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addSymbol, setAddSymbol] = useState('');
  const [addName, setAddName] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/stocks/saved');
      const saved = res.data?.saved || [];
      const ratings = res.data?.ratings || [];
      const bySym = Object.fromEntries(ratings.map(r => [String(r.symbol).toUpperCase(), r]));
      const merged = saved.map(s => ({
        symbol: String(s.symbol).toUpperCase(),
        name: s.name || s.symbol,
        verdict: bySym[String(s.symbol).toUpperCase()]?.verdict || 'hold',
        reason: bySym[String(s.symbol).toUpperCase()]?.reason || ''
      }));
      setRows(merged);
      setError('');
    } catch (e) {
      setError('Unable to load saved stocks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onAdd = async () => {
    try {
      setAddError('');
      const sym = (addSymbol || '').trim().toUpperCase();
      const name = (addName || '').trim();
      if (!sym) {
        setAddError('Enter a stock symbol (e.g., AAPL)');
        return;
      }
      setAdding(true);
      await axios.post('/api/stocks/save', { stocks: [{ symbol: sym, name: name || sym }] });
      setAddSymbol('');
      setAddName('');
      await load();
    } catch (e) {
      setAddError('Unable to add this stock right now.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="card-base" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0 }}>Your Saved Stocks</h3>
        <button className="btn-ghost" onClick={load}>Refresh</button>
      </div>
      <div className="card-scroll" style={{ marginTop: 8 }}>
        {/* Add/Search Row */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <input
            type="text"
            placeholder="Symbol (e.g., AAPL)"
            value={addSymbol}
            onChange={(e) => setAddSymbol(e.target.value)}
            style={{ flex: '0 0 140px', padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: 6 }}
          />
          <input
            type="text"
            placeholder="Optional Name (Apple Inc.)"
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            style={{ flex: '1 1 auto', padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: 6 }}
          />
          <button className="btn-primary" disabled={adding} onClick={onAdd}>
            {adding ? 'Adding…' : 'Add'}
          </button>
        </div>
        {addError && <div style={{ color: '#b91c1c', marginBottom: 8 }}>{addError}</div>}
        {loading && <div>Loading your saved list…</div>}
        {error && <div style={{ color: '#b91c1c' }}>{error}</div>}
        {!loading && !error && (
          <div>
            {rows.length === 0 ? (
              <div style={{ color: '#6b7280' }}>No saved stocks yet. Use Save on the Stocks card.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '6px 4px' }}>Symbol</th>
                    <th style={{ padding: '6px 4px' }}>Name</th>
                    <th style={{ padding: '6px 4px' }}>Verdict</th>
                    <th style={{ padding: '6px 4px' }}>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={`${r.symbol}-${i}`} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '8px 4px', fontWeight: 700 }}>{r.symbol}</td>
                      <td style={{ padding: '8px 4px' }}>{r.name}</td>
                      <td style={{ padding: '8px 4px', color: verdictColor(r.verdict), fontWeight: 700, textTransform: 'capitalize' }}>{r.verdict}</td>
                      <td style={{ padding: '8px 4px', color: '#374151' }}>{r.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedStocksCard;
