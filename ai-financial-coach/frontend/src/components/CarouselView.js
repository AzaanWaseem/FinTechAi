import React, { useEffect, useRef, useState } from 'react';

const CarouselView = ({ spendingBreakdown, savingsHistory, recommendation, transactionsList, rewards }) => {
  const slides = [
    { key: 'spend', content: spendingBreakdown },
    { key: 'savings', content: savingsHistory },
    { key: 'rec', content: recommendation },
    { key: 'tx', content: transactionsList },
    { key: 'rewards', content: rewards }
  ];

  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    startTimer();
    return () => stopTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const startTimer = () => {
    stopTimer();
    timerRef.current = setTimeout(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const goTo = (i) => {
    stopTimer();
    setIndex(i);
  };

  return (
    <div className="carousel-root">
      <div className="carousel-window">
        <div className="carousel-track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {slides.map((s, i) => (
            <div className="carousel-slide" key={s.key} onClick={() => goTo((i + 1) % slides.length)}>
              <div className="carousel-card">
                {s.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="carousel-controls">
        <div className="dots">
          {slides.map((s, i) => (
            <button key={s.key} className={`dot ${i === index ? 'active' : ''}`} onClick={() => goTo(i)} aria-label={`Show slide ${i + 1}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CarouselView;
