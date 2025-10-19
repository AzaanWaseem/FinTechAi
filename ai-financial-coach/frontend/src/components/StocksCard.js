import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StocksCard = () => {
  const [data, setData] = useState({ buys: [], sells: [], disclaimer: '' });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [selected, setSelected] = useState({}); // key: symbol, value: {symbol,name}

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/stocks-trending');
        if (!mounted) return;
        setData(res.data || { buys: [], sells: [], disclaimer: '' });
        setLoadError('');
      } catch (e) {
        if (!mounted) return;
        setLoadError('Unable to load trending stocks right now.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const toggleSelect = (s) => {
    if (actionError) setActionError('');
    setSelected((prev) => {
      const key = (s.symbol || '').toUpperCase();
      const next = { ...prev };
      if (next[key]) delete next[key]; else next[key] = { symbol: key, name: s.name || key };
      return next;
    });
  };

  const saveSelected = async () => {
    try {
      const stocks = Object.values(selected);
      if (!stocks.length) { setActionError('Select at least one stock to save.'); return; }
      setActionError('');
      await axios.post('/api/stocks/save', { stocks });
      setSelected({});
    } catch (e) {
      setActionError('Failed to save selected stocks.');
    }
  };

  return (
    <div className="card-base" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0 }}>Stocks to Buy/Sell</h3>
        <button className="btn-primary small" onClick={saveSelected}>Save</button>
      </div>
      <div className="card-scroll" style={{ marginTop: 8 }}>
        {loading && <div>Fetching market highlights…</div>}
        {loadError && <div className="error" style={{ color: '#b91c1c' }}>{loadError}</div>}
        {!loading && !loadError && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {actionError && (
              <div style={{ gridColumn: '1 / span 2', color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', padding: 8, borderRadius: 6 }}>
                {actionError}
              </div>
            )}
            <div>
              <div style={{ fontWeight: 700, color: '#0b5a37', marginBottom: 8 }}>Buy Now (Top 3)</div>
              {data.buys && data.buys.length > 0 ? (
                data.buys.map((s, idx) => {
                  const key = (s.symbol || '').toUpperCase();
                  const isSel = !!selected[key];
                  return (
                  <div key={`buy-${s.symbol}-${idx}`} onClick={() => toggleSelect(s)}
                       style={{ padding: 10, border: isSel ? '2px solid #2b6cb0' : '1px solid #e5e7eb', borderRadius: 8, marginBottom: 8, cursor: 'pointer', background: isSel ? '#e6f0fb' : '#fff' }}>
                    <div style={{ fontWeight: 600 }}>
                      {s.name} <span style={{ color: '#6b7280' }}>({s.symbol})</span>
                    </div>
                    <div style={{ color: '#374151', fontSize: 14 }}>{s.reason}</div>
                  </div>);
                })
              ) : (
                <div style={{ color: '#6b7280' }}>No data available.</div>
              )}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#7a0b0b', marginBottom: 8 }}>Sell Now (Top 3)</div>
              {data.sells && data.sells.length > 0 ? (
                data.sells.map((s, idx) => {
                  const key = (s.symbol || '').toUpperCase();
                  const isSel = !!selected[key];
                  return (
                  <div key={`sell-${s.symbol}-${idx}`} onClick={() => toggleSelect(s)}
                       style={{ padding: 10, border: isSel ? '2px solid #e11d48' : '1px solid #e5e7eb', borderRadius: 8, marginBottom: 8, cursor: 'pointer', background: isSel ? '#fdecec' : '#fff' }}>
                    <div style={{ fontWeight: 600 }}>
                      {s.name} <span style={{ color: '#6b7280' }}>({s.symbol})</span>
                    </div>
                    <div style={{ color: '#374151', fontSize: 14 }}>{s.reason}</div>
                  </div>);
                })
              ) : (
                <div style={{ color: '#6b7280' }}>No data available.</div>
              )}
            </div>
          </div>
        )}
        {data.disclaimer && (
          <div style={{ marginTop: 12, color: '#6b7280', fontSize: 12 }}>
            {data.disclaimer}
          </div>
        )}
      </div>
    </div>
  );
};

export default StocksCard;
