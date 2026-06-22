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
        const res = await fetch('https://altin-tunnel.siper2710.workers.dev/');
        const json = await res.json();
        
        if (json && json.data) {
          const dataMap = {};
          json.data.forEach(item => {
            dataMap[item.symbol] = item;
          });

          const getVal = (sym) => dataMap[sym] ? dataMap[sym].ask : null;

          setRates(prev => ({
            usd: getVal('USDTRY') || prev.usd,
            eur: getVal('EURTRY') || prev.eur,
            ons: getVal('XAUUSD') || prev.ons,
            gram24k: getVal('ALTIN') || prev.gram24k,
            gram22k: getVal('AYAR22') || prev.gram22k,
            ceyrek: getVal('CEYREK_YENI') || prev.ceyrek,
            tam: getVal('TEK_YENI') || prev.tam,
          }));
        }
      } catch (err) {
        console.warn('API error, using default mock rates', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
    
    // Canlı güncellemeler için her 5 saniyede bir istek at
    const interval = setInterval(fetchRates, 5000);

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
