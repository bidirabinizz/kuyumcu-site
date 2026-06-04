'use client';
import { useState } from 'react';

export default function IBANModal({ isOpen, onClose }) {
  const [copiedId, setCopiedId] = useState(null);

  if (!isOpen) return null;

  const accounts = [
    {
      id: 1,
      bank: "Garanti BBVA",
      holder: "Çapar Mücevherat San. Tic. Ltd. Şti.",
      branch: "Kırklareli Şubesi (Kod: 241)",
      iban: "TR92 0006 2000 0001 2345 6789 01"
    },
    {
      id: 2,
      bank: "Ziraat Bankası",
      holder: "Çapar Mücevherat San. Tic. Ltd. Şti.",
      branch: "Kırklareli Merkez Şubesi (Kod: 114)",
      iban: "TR58 0001 0001 1400 9876 5432 10"
    },
    {
      id: 3,
      bank: "Vakıfbank",
      holder: "Çapar Mücevherat San. Tic. Ltd. Şti.",
      branch: "Kırklareli Şubesi (Kod: 082)",
      iban: "TR12 0001 5001 5800 1122 3344 55"
    }
  ];

  const handleCopy = (iban, id) => {
    navigator.clipboard.writeText(iban.replace(/\s/g, ''));
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Kapat">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <h3 className="modal-title">BANKA HESAPLARIMIZ</h3>

        <div className="bank-cards-list">
          {accounts.map((acc) => (
            <div className="bank-card" key={acc.id}>
              <div className="bank-header">
                <span className="bank-logo-text">{acc.bank}</span>
                <div className="bank-logo-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="2" y1="10" x2="22" y2="10"></line>
                  </svg>
                </div>
              </div>

              <div className="bank-detail-label">Alıcı Adı</div>
              <div className="bank-detail-val">{acc.holder}</div>

              <div className="bank-detail-label">Şube Bilgisi</div>
              <div className="bank-detail-val">{acc.branch}</div>

              <div className="bank-detail-label">IBAN Numarası</div>
              <div className="bank-iban-row">
                <span className="bank-iban-text">{acc.iban}</span>
                <button
                  className="bank-copy-btn"
                  onClick={() => handleCopy(acc.iban, acc.id)}
                  title="Kopyala"
                >
                  {copiedId === acc.id ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#25d366" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {copiedId && (
          <div className="toast-msg">
            IBAN Kopyalandı!
          </div>
        )}
      </div>
    </div>
  );
}
