'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { products as staticProducts } from './products';
import { supabase } from '@/lib/supabase';

export default function Catalog() {
  const [selectedCategory, setSelectedCategory] = useState('hepsi');
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState(staticProducts);
  const [filteredProducts, setFilteredProducts] = useState(staticProducts);
  const [activeProduct, setActiveProduct] = useState(null);
  
  // Settings state (to fetch WhatsApp number dynamically)
  const [whatsappNumber, setWhatsappNumber] = useState("905441398739");

  const categories = [
    { id: 'hepsi', name: 'Hepsi' },
    { id: 'yüzükler', name: 'Yüzükler' },
    { id: 'bilezikler', name: 'Bilezikler' },
    { id: 'kolyeler', name: 'Kolyeler' },
    { id: 'küpeler', name: 'Küpeler' },
    { id: 'setler', name: 'Setler' }
  ];

  // Fetch dynamic products on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch products
        const { data: dbProducts, error: prodError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!prodError && dbProducts && dbProducts.length > 0) {
          setAllProducts(dbProducts);
        }

        // Fetch WhatsApp number
        const { data: settingsData, error: settingsError } = await supabase
          .from('settings')
          .select('*')
          .eq('key', 'whatsapp_number')
          .single();
        
        if (!settingsError && settingsData) {
          setWhatsappNumber(settingsData.value);
        }
      } catch (err) {
        console.warn('Supabase fetch failed. Falling back to local static catalog.', err);
      }
    };

    loadData();
  }, []);

  // Filter products when selectedCategory, searchQuery or allProducts changes
  useEffect(() => {
    let result = allProducts;

    // Category filter
    if (selectedCategory !== 'hepsi') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(query) || 
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.code && p.code.toLowerCase().includes(query))
      );
    }

    setFilteredProducts(result);
  }, [selectedCategory, searchQuery, allProducts]);

  return (
    <div className="layout-wrapper">
      <div className="main-container" style={{ paddingBottom: '3rem' }}>
        
        {/* Navigation & Header */}
        <div className="catalog-header-bar">
          <Link href="/" className="back-button" aria-label="Geri">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </Link>
          <h2 style={{ fontFamily: 'var(--font-serif)', color: '#fff', fontSize: '1.5rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
            ÜRÜN KATALOĞU
          </h2>
          <div style={{ width: '44px' }}></div> {/* Spacer to center title */}
        </div>

        {/* Search Input */}
        <div className="catalog-search-wrapper">
          <svg className="catalog-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="catalog-search-input"
            placeholder="Ürün adı, açıklama veya kod ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories Tab Bar */}
        <div className="catalog-tabs">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`catalog-tab ${selectedCategory === cat.id ? 'catalog-tab-active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                className="product-card"
                onClick={() => setActiveProduct(product)}
              >
                <div className="product-img-container">
                  <span className="product-badge">İNCELE</span>
                  <img 
                    src={product.image} 
                    alt={product.title} 
                    className="product-img" 
                    loading="lazy"
                  />
                </div>
                <div className="product-info">
                  <h3 className="product-title">{product.title}</h3>
                  <div className="product-meta-row">
                    <span className="product-weight">{product.weight}</span>
                    <span style={{ fontSize: '0.65rem', border: '1px solid rgba(212,175,55,0.3)', padding: '0.1rem 0.3rem', borderRadius: '4px', color: 'var(--color-gold)' }}>
                      {product.code}
                    </span>
                  </div>
                  <button className="product-price-button">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    DETAYLI BİLGİ
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', margin: '4rem 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem', opacity: 0.5 }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            <p>Aradığınız kriterlere uygun ürün bulunamadı.</p>
          </div>
        )}

        {/* Product Detail Modal */}
        {activeProduct && (
          <div className="modal-overlay" onClick={() => setActiveProduct(null)}>
            <div className="modal-content-box" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setActiveProduct(null)} aria-label="Kapat">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              <h3 className="modal-title" style={{ fontSize: '1.25rem', paddingRight: '1.5rem' }}>
                {activeProduct.title}
              </h3>

              <div className="pdetail-img-container">
                <img 
                  src={activeProduct.image} 
                  alt={activeProduct.title} 
                  className="pdetail-img"
                />
              </div>

              <div className="pdetail-meta">
                <div className="pdetail-meta-item">
                  <span className="pdetail-meta-lbl">Ayar / Malzeme</span>
                  <span className="pdetail-meta-val">{activeProduct.carat}</span>
                </div>
                <div className="pdetail-meta-item">
                  <span className="pdetail-meta-lbl">Ağırlık</span>
                  <span className="pdetail-meta-val">{activeProduct.weight}</span>
                </div>
                <div className="pdetail-meta-item" style={{ gridColumn: 'span 2', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.6rem', marginTop: '0.2rem' }}>
                  <span className="pdetail-meta-lbl">Ürün Kodu</span>
                  <span className="pdetail-meta-val" style={{ color: 'var(--color-gold)' }}>{activeProduct.code}</span>
                </div>
              </div>

              <p className="pdetail-desc">
                {activeProduct.description}
              </p>

              <a 
                href={`https://wa.me/${whatsappNumber}?text=Merhaba%20Çapar%20Kuyumculuk,%20katalogdaki%20"${encodeURIComponent(activeProduct.title)}"%20(${activeProduct.code})%20ürünü%20hakkında%20detaylı%20bilgi%20almak%20istiyorum.`}
                target="_blank"
                rel="noopener noreferrer"
                className="pdetail-btn-whatsapp"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                WHATSAPP SİPARİŞ & BİLGİ AL
              </a>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
