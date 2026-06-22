'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import IBANModal from '@/components/IBANModal';
import GoldRates from '@/components/GoldRates';
import { supabase } from '@/lib/supabase';

// Local static fallbacks in case Supabase is not configured/accessible
const defaultLinks = [
  { id: '1', title: 'DİJİTAL KATALOG', url: '/catalog', is_featured: true, is_active: true },
  { id: '2', title: 'WHATSAPP SİPARİŞ', url: 'whatsapp-siparis', is_featured: false, is_active: true },
  { id: '3', title: 'CANLI DÖVİZ & ALTIN', url: 'canli-doviz', is_featured: false, is_active: true },
  { id: '4', title: 'IBAN BİLGİLERİMİZ', url: 'iban-bilgileri', is_featured: false, is_active: true },
  { id: '5', title: 'MAĞAZA SHOWROOM', url: 'https://share.google/7twxxNF1WEA2hylQG', is_featured: false, is_active: true },
  { id: '6', title: 'TOPTAN BİLGİ AL', url: 'https://share.google/SdKPha71l8JnpTRsC', is_featured: false, is_active: true },
  { id: '7', title: 'INSTAGRAM', url: 'https://www.instagram.com/cantekinkuyumculuk', is_featured: false, is_active: true },
  { id: '8', title: 'MÜŞTERİ YORUMLARI', url: 'https://j1.web.tr/id/cantekinkuyumculuk', is_featured: false, is_active: true },
  { id: '9', title: 'İLETİŞİM: SHOWROOM', url: 'tel:+905441398739', is_featured: false, is_active: true },
  { id: '10', title: 'İLETİŞİM: TOPTAN', url: 'tel:+902882141427', is_featured: false, is_active: true },
  { id: '11', title: 'E-POSTA İLETİŞİM', url: 'mailto:caparkuyumculuk@gmail.com', is_featured: false, is_active: true }
];

const defaultSettings = {
  whatsapp_number: "905441398739",
  address: "Karaca İbrahim Mahallesi, Cumhuriyet Caddesi, No: 23/B, Merkez / Kırklareli",
  working_hours: "09:00 - 19:00 (Pazar Günleri Kapalıdır)",
  bg_video_url: "https://linki.ax/uploads/backgrounds/9ffec930f2decea4d7b82a3349c53ef7.mp4"
};

export default function Home() {
  const [ibanOpen, setIbanOpen] = useState(false);
  const [goldOpen, setGoldOpen] = useState(false);

  // Dynamic States
  const [links, setLinks] = useState(defaultLinks);
  const [settings, setSettings] = useState(defaultSettings);
  const [isPreview, setIsPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we are inside the admin panel preview
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('preview') === 'true' || window.self !== window.top) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsPreview(true);
      }
      if (params.get('openIban') === 'true') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIbanOpen(true);
      }
    }

    const handleMessage = (event) => {
      if (event.data?.type === 'PREVIEW_UPDATE') {
        if (event.data.data.links) {
           setLinks(event.data.data.links.filter(l => l.is_active !== false)); // only show active in preview
        }
        if (event.data.data.settings) setSettings(event.data.data.settings);
      }
    };
    window.addEventListener('message', handleMessage);

    const loadData = async () => {
      try {
        // Fetch Settings
        const { data: settingsData, error: settingsError } = await supabase.from('settings').select('*');
        if (!settingsError && settingsData && settingsData.length > 0) {
          const sObj = {};
          settingsData.forEach(item => { sObj[item.key] = item.value; });
          setSettings(prev => ({ ...prev, ...sObj }));
        }

        // Fetch Links
        const { data: linksData, error: linksError } = await supabase
          .from('links').select('*').eq('is_active', true).order('sort_order', { ascending: true });
        if (!linksError && linksData && linksData.length > 0) {
          setLinks(linksData);
        }
      } catch (err) {
        console.warn('Supabase fetch failed, displaying default local settings.', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const sendCommand = (cmd, id, type) => {
    window.parent.postMessage({ type: cmd, id, itemType: type }, '*');
  };

  // Helper to render appropriate SVGs based on database icon_name OR semantic analysis
  const getIcon = (link) => {
    const iconName = link.icon_name;
    
    if (iconName === 'whatsapp') return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>;
    if (iconName === 'globe') return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;
    if (iconName === 'instagram') return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
    if (iconName === 'map') return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
    if (iconName === 'phone') return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
    if (iconName === 'mail') return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
    if (iconName === 'star') return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
    if (iconName === 'catalog') return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;

    // Fallback: semantic analysis of title
    const t = link.title.toUpperCase();
    if (t.includes('KATALOG')) return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;
    if (t.includes('WHATSAPP')) return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>;
    if (t.includes('DÖVİZ') || t.includes('ALTIN') || t.includes('KURLAR')) return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
    if (t.includes('IBAN') || t.includes('BANKA') || t.includes('HESAP')) return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
    if (t.includes('SHOWROOM') || t.includes('MAĞAZA') || t.includes('ADRES') || t.includes('KONUM')) return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
    if (t.includes('TOPTAN')) return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>;
    if (t.includes('INSTAGRAM')) return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
    if (t.includes('YORUM')) return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
    if (t.includes('TELEFON') || t.includes('İLETİŞİM') || t.includes('ARAT') || t.includes('ARA:')) return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
    if (t.includes('E-POSTA') || t.includes('MAİL')) return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>;
  };

  const withElementorWrapper = (link, element) => {
    if (!isPreview) return element;
    return (
      <div key={`wrap_${link.id}`} className="visual-block-wrapper">
        <div className="elementor-controls">
          <button className="el-btn" onClick={(e) => { e.stopPropagation(); sendCommand('MOVE_UP', link.id, 'links'); }} title="Yukarı Taşı">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
          </button>
          <button className="el-btn" onClick={(e) => { e.stopPropagation(); sendCommand('MOVE_DOWN', link.id, 'links'); }} title="Aşağı Taşı">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          <button className="el-btn" onClick={(e) => { e.stopPropagation(); sendCommand('EDIT_ITEM', link.id, 'links'); }} title="Düzenle">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          </button>
        </div>
        <div style={{ pointerEvents: 'none' }}>
          {element}
        </div>
      </div>
    );
  };

  const renderLinkButton = (link) => {
    const classes = `link-item ${link.is_featured ? 'link-item-featured' : ''}`;
    let el = null;

    if (link.url === 'whatsapp-siparis') {
      el = (
        <a key={link.id} href={`https://wa.me/${settings.whatsapp_number}?text=Merhaba`} target="_blank" rel="noopener noreferrer" className={classes}>
          <div className="link-icon-wrapper">{getIcon(link)}</div><span className="link-text">{link.title}</span><span className="link-chevron">→</span>
        </a>
      );
    } else if (link.url === 'canli-doviz') {
      el = (
        <button key={link.id} onClick={(e) => { e.preventDefault(); setGoldOpen(true); }} className={classes}>
          <div className="link-icon-wrapper">{getIcon(link)}</div><span className="link-text">{link.title}</span><span className="link-chevron">→</span>
        </button>
      );
    } else if (link.url === 'iban-bilgileri') {
      el = (
        <button key={link.id} onClick={(e) => { e.preventDefault(); setIbanOpen(true); }} className={classes}>
          <div className="link-icon-wrapper">{getIcon(link)}</div><span className="link-text">{link.title}</span><span className="link-chevron">→</span>
        </button>
      );
    } else if (link.url === '/catalog') {
      el = (
        <Link key={link.id} href="/catalog" className={classes}>
          <div className="link-icon-wrapper">{getIcon(link)}</div><span className="link-text">{link.title}</span><span className="link-chevron">→</span>
        </Link>
      );
    } else {
      el = (
        <a key={link.id} href={link.url} target={link.url.startsWith('http') ? "_blank" : "_self"} rel="noopener noreferrer" className={classes}>
          <div className="link-icon-wrapper">{getIcon(link)}</div><span className="link-text">{link.title}</span><span className="link-chevron">→</span>
        </a>
      );
    }

    return withElementorWrapper(link, el);
  };

  let buttonOp = 0.75;
  if (settings.button_opacity !== undefined) {
    let val = parseFloat(settings.button_opacity);
    buttonOp = val > 1 ? val / 100 : val;
  }

  const hoverOp = Math.min(1, buttonOp + 0.1);
  const featuredGradient = `linear-gradient(135deg, rgba(212, 175, 55, 0.15), transparent), linear-gradient(rgba(7, 7, 8, ${buttonOp}), rgba(7, 7, 8, ${buttonOp}))`;
  const featuredHoverGradient = `linear-gradient(135deg, rgba(212, 175, 55, 0.25), transparent), linear-gradient(rgba(20, 20, 24, ${hoverOp}), rgba(20, 20, 24, ${hoverOp}))`;
  const hoverBg = `rgba(20, 20, 24, ${hoverOp})`;

  return (
    <div className="layout-wrapper" style={{ 
      '--color-bg-card': `rgba(13, 13, 15, ${buttonOp})`,
      '--bg-featured': featuredGradient,
      '--bg-featured-hover': featuredHoverGradient,
      '--bg-hover': hoverBg
    }}>
      {isLoading && (
        <div className="catalog-loading-overlay">
          <div className="catalog-loading-spinner"></div>
          <div className="catalog-loading-text">ÇAPAR KUYUMCULUK</div>
          <style dangerouslySetInnerHTML={{ __html: `
            .catalog-loading-overlay {
              position: fixed;
              top: 0; left: 0; width: 100%; height: 100%;
              background: rgba(7, 7, 8, 0.7);
              backdrop-filter: blur(8px);
              -webkit-backdrop-filter: blur(8px);
              z-index: 9999;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              color: var(--color-gold);
            }
            .catalog-loading-spinner {
              width: 54px;
              height: 54px;
              border: 3px solid rgba(212, 175, 55, 0.15);
              border-top-color: var(--color-gold);
              border-radius: 50%;
              animation: spinner-spin 1s linear infinite;
              margin-bottom: 1.2rem;
              box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
            }
            @keyframes spinner-spin {
              to { transform: rotate(360deg); }
            }
            .catalog-loading-text {
              font-family: var(--font-serif);
              font-size: 1.1rem;
              letter-spacing: 3px;
              text-transform: uppercase;
              animation: pulse-text 1.5s ease-in-out infinite;
            }
            @keyframes pulse-text {
              0%, 100% { opacity: 0.5; }
              50% { opacity: 1; text-shadow: 0 0 10px rgba(212, 175, 55, 0.5); }
            }
          ` }} />
        </div>
      )}
      <main className="main-container">
        
        {/* Header Section */}
        <header className="brand-header animate__animated animate__fadeInDown">
          <div className="brand-logo-wrapper">
            <img src={settings.logo_url || "/caparkuyumculuklogo.jpeg"} alt={settings.site_name || "Logo"} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          </div>
          <h1 className="brand-title">{settings.site_name || "ÇAPAR KUYUMCULUK"}</h1>
        </header>

        {/* Dynamic Bio Links Feed */}
        <div className="links-feed">
          {links.map(link => renderLinkButton(link))}
        </div>

        {/* Dynamic WhatsApp Big Banner at the bottom */}
        <a 
          href={`https://wa.me/${settings.whatsapp_number}?text=Merhaba`}
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-banner"
          onClick={(e) => { if (isPreview) e.preventDefault(); }}
        >
          <div style={{
            width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a1a24 0%, #0d0d12 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', border: '1px solid rgba(212,175,55,0.25)'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#25d366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            <div style={{ marginTop: '0.8rem', textAlign: 'center' }}>
              <span style={{ color: '#d4af37', fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '1px' }}>HIZLI SİPARİŞ HATI</span>
              <p style={{ color: '#ffffff', fontSize: '0.75rem', marginTop: '0.2rem', opacity: 0.8 }}>7/24 WhatsApp Üzerinden Sipariş ve Bilgi Alın</p>
            </div>
          </div>
        </a>

        {/* Dynamic Address and Info footer */}
        <section className="bottom-info-section">
          <h4 className="info-title">ÇAPAR KUYUMCULUK</h4>
          <p className="info-text">{settings.address}</p>
          <p className="info-text">Çalışma Saatleri: <span className="info-hours">{settings.working_hours}</span></p>
        </section>

        <footer className="branding-footer">
          © {new Date().getFullYear()} Çapar Kuyumculuk. Tüm Hakları Saklıdır.
        </footer>

        {/* Modals */}
        <IBANModal isOpen={ibanOpen} onClose={() => setIbanOpen(false)} />
        <GoldRates isOpen={goldOpen} onClose={() => setGoldOpen(false)} />

      </main>
    </div>
  );
}
