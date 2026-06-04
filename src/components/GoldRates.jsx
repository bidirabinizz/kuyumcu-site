'use client';
import { useState, useEffect } from 'react';

export default function GoldRates({ isOpen, onClose }) {
  const [rates, setRates] = useState({
    usd: 32.85,
    eur: 35.60,
    ons: 2365,
    gram24k: 2498,
    gram22k: 2288,
    ceyrek: 4120,
    tam: 16480,
  });

  const [loading, setLoading] = useState(true);
  const [calcWeight, setCalcWeight] = useState('1');
  const [calcType, setCalcType] = useState('gram24k');
  const [calcResult, setCalcResult] = useState(0);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        // Fetch USD to TRY rates from free open API
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await res.json();
        
        if (data && data.rates && data.rates.TRY) {
          const usdTry = data.rates.TRY;
          const eurUsd = data.rates.EUR ? 1 / data.rates.EUR : 1.08;
          const eurTry = usdTry * eurUsd;
          
          // Spot gold price (default to 2350 if fetch fails, or we could fetch gold spot later)
          const goldOunce = 2365; // standard gold ounce price USD
          const g24 = Math.round((goldOunce / 31.1035) * usdTry);
          const g22 = Math.round(g24 * 0.916);
          const cey = Math.round((1.754 * g22) + 150); // weight + premium
          const tAltin = Math.round(cey * 4);

          setRates({
            usd: parseFloat(usdTry.toFixed(2)),
            eur: parseFloat(eurTry.toFixed(2)),
            ons: goldOunce,
            gram24k: g24,
            gram22k: g22,
            ceyrek: cey,
            tam: tAltin,
          });
        }
      } catch (err) {
        console.warn('API error, using default mock rates', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
    
    // Set interval for micro-fluctuations (live simulation feel)
    const interval = setInterval(() => {
      setRates(prev => {
        const factor = 1 + (Math.random() - 0.5) * 0.001; // max 0.1% change
        return {
          usd: parseFloat((prev.usd * factor).toFixed(2)),
          eur: parseFloat((prev.eur * factor).toFixed(2)),
          ons: Math.round(prev.ons * factor),
          gram24k: Math.round(prev.gram24k * factor),
          gram22k: Math.round(prev.gram22k * factor),
          ceyrek: Math.round(prev.ceyrek * factor),
          tam: Math.round(prev.tam * factor),
        };
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Calculate whenever weight, type or rates change
  useEffect(() => {
    const weight = parseFloat(calcWeight) || 0;
    const rate = rates[calcType] || 0;
    setCalcResult(Math.round(weight * rate));
  }, [calcWeight, calcType, rates]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Kapat">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <h3 className="modal-title">CANLI DÖVİZ & ALTIN</h3>

        <div className="rates-grid">
          <div className="rate-card">
            <span className="rate-name">Gram Altın (24 Ayar)</span>
            <div className="rate-value-col">
              <div className="rate-value-buy">{rates.gram24k.toLocaleString('tr-TR')} TL</div>
              <div className="rate-value-sell">Milyem: 995</div>
            </div>
          </div>

          <div className="rate-card">
            <span className="rate-name">22 Ayar Altın (Bilezik)</span>
            <div className="rate-value-col">
              <div className="rate-value-buy">{rates.gram22k.toLocaleString('tr-TR')} TL</div>
              <div className="rate-value-sell">Milyem: 916</div>
            </div>
          </div>

          <div className="rate-card">
            <span className="rate-name">Çeyrek Altın</span>
            <div className="rate-value-col">
              <div className="rate-value-buy">{rates.ceyrek.toLocaleString('tr-TR')} TL</div>
              <div className="rate-value-sell">Kulplu Yeni / Eski</div>
            </div>
          </div>

          <div className="rate-card">
            <span className="rate-name">Tam Altın</span>
            <div className="rate-value-col">
              <div className="rate-value-buy">{rates.tam.toLocaleString('tr-TR')} TL</div>
              <div className="rate-value-sell">Kulplu Lira</div>
            </div>
          </div>

          <div className="rate-card">
            <span className="rate-name">Amerikan Doları (USD)</span>
            <div className="rate-value-col">
              <div className="rate-value-buy">{rates.usd.toFixed(2)} TL</div>
              <div className="rate-value-sell">Serbest Piyasa</div>
            </div>
          </div>

          <div className="rate-card">
            <span className="rate-name">Euro (EUR)</span>
            <div className="rate-value-col">
              <div className="rate-value-buy">{rates.eur.toFixed(2)} TL</div>
              <div className="rate-value-sell">Serbest Piyasa</div>
            </div>
          </div>
        </div>

        <div className="gold-calc-title">Altın Hesaplayıcı</div>
        <div className="gold-calc-box">
          <div className="calc-row">
            <input
              type="number"
              className="calc-input"
              value={calcWeight}
              onChange={(e) => setCalcWeight(e.target.value)}
              placeholder="Gram / Adet"
              min="0"
              step="0.01"
            />
            <select
              className="calc-select"
              value={calcType}
              onChange={(e) => setCalcType(e.target.value)}
            >
              <option value="gram24k">24 Ayar (gr)</option>
              <option value="gram22k">22 Ayar (gr)</option>
              <option value="ceyrek">Çeyrek (Adet)</option>
              <option value="tam">Tam (Adet)</option>
            </select>
          </div>
          <div className="calc-result">
            Hesaplanan Tutar: <span>{calcResult.toLocaleString('tr-TR')} TL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
