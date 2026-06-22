'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { products as staticProducts } from './products';
import { supabase } from '@/lib/supabase';

export default function Catalog() {
  const [selectedCategory, setSelectedCategory] = useState('genel');
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState(staticProducts);
  const [filteredProducts, setFilteredProducts] = useState(staticProducts);
  const [activeProduct, setActiveProduct] = useState(null);
  
  const [categories, setCategories] = useState([]);
  const [whatsappNumber, setWhatsappNumber] = useState("905441398739");
  const [isPreview, setIsPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Drag to scroll logic for desktop
  const tabsRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - tabsRef.current.offsetLeft);
    setScrollLeft(tabsRef.current.scrollLeft);
  };
  const onMouseLeave = () => setIsDragging(false);
  const onMouseUp = () => setIsDragging(false);
  const onMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - tabsRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    tabsRef.current.scrollLeft = scrollLeft - walk;
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('preview') === 'true' || window.self !== window.top) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsPreview(true);
      }
    }

    const handleMessage = (event) => {
      if (event.data?.type === 'PREVIEW_UPDATE') {
        if (event.data.data.products) setAllProducts(event.data.data.products);
        if (event.data.data.categories) setCategories(event.data.data.categories);
        if (event.data.data.settings?.whatsapp_number) setWhatsappNumber(event.data.data.settings.whatsapp_number);
      }
    };
    window.addEventListener('message', handleMessage);

    const loadData = async () => {
      try {
        const { data: dbProducts, error: prodError } = await supabase.from('products').select('*').order('sort_order', { ascending: true });
        if (!prodError && dbProducts && dbProducts.length > 0) setAllProducts(dbProducts);

        const { data: dbCats, error: catError } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
        if (!catError && dbCats && dbCats.length > 0) {
          setCategories(dbCats);
          setSelectedCategory(dbCats[0].name);
        } else {
          setCategories([{ id: 'hepsi', name: 'Hepsi' }]);
          setSelectedCategory('Hepsi');
        }

        const { data: settingsData, error: settingsError } = await supabase.from('settings').select('*').eq('key', 'whatsapp_number').single();
        if (!settingsError && settingsData) setWhatsappNumber(settingsData.value);
      } catch (err) {
        console.warn('Supabase fetch failed. Falling back to local static catalog.', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    let result = allProducts;
    if (selectedCategory && selectedCategory.toLowerCase() !== 'hepsi' && selectedCategory.toLowerCase() !== 'tümü') {
      result = result.filter(p => p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(query) || (p.description && p.description.toLowerCase().includes(query)) || (p.code && p.code.toLowerCase().includes(query)));
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilteredProducts(result);
  }, [selectedCategory, searchQuery, allProducts]);

  const sendCommand = (cmd, id, type) => {
    window.parent.postMessage({ type: cmd, id, itemType: type }, '*');
  };

  const renderProduct = (product) => {
    const el = (
      <div 
        key={`p_${product.id}`}
        className="product-card"
        onClick={() => {
          if (isPreview) return;
          if (product.is_pdf_catalog && product.pdf_url) {
            window.open(product.pdf_url, '_blank');
          } else {
            setActiveProduct(product);
          }
        }}
        style={{ pointerEvents: isPreview ? 'none' : 'auto', height: '100%', cursor: 'pointer' }}
      >
        <div className="product-img-container">
          <span className="product-badge">{product.is_pdf_catalog ? 'KATALOG' : 'İNCELE'}</span>
          <img src={product.image} alt={product.title} className="product-img" loading="lazy" />
        </div>
        <div className="product-info">
          <h3 className="product-title">{product.title}</h3>
          {!product.is_pdf_catalog && (
            <div className="product-meta-row">
              <span className="product-weight">{product.weight}</span>
              <span style={{ fontSize: '0.65rem', border: '1px solid rgba(212,175,55,0.3)', padding: '0.1rem 0.3rem', borderRadius: '4px', color: 'var(--color-gold)' }}>{product.code}</span>
            </div>
          )}
          <button className="product-price-button" style={{ marginTop: product.is_pdf_catalog ? '1rem' : 'auto' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            {product.is_pdf_catalog ? 'PDF KATALOĞU AÇ' : 'DETAYLI BİLGİ'}
          </button>
        </div>
      </div>
    );

    if (isPreview) {
      return (
        <div key={`wrap_${product.id}`} className="visual-block-wrapper" style={{ height: '100%' }}>
          <div className="elementor-controls">
            <button className="el-btn" onClick={(e) => { e.stopPropagation(); sendCommand('MOVE_UP', product.id, 'products'); }} title="Yukarı Taşı">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
            </button>
            <button className="el-btn" onClick={(e) => { e.stopPropagation(); sendCommand('MOVE_DOWN', product.id, 'products'); }} title="Aşağı Taşı">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            <button className="el-btn" onClick={(e) => { e.stopPropagation(); sendCommand('EDIT_ITEM', product.id, 'products'); }} title="Düzenle">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </button>
          </div>
          {el}
        </div>
      );
    }
    return el;
  };

  return (
    <div className="layout-wrapper">
      {isLoading && (
        <div className="catalog-loading-overlay">
          <div className="catalog-loading-spinner"></div>
          <div className="catalog-loading-text">Katalog Yükleniyor...</div>
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
      <div className="main-container" style={{ paddingBottom: '3rem' }}>
        
        {/* Navigation & Header */}
        <div className="catalog-header-bar">
          <Link href="/" className="back-button" aria-label="Geri" style={{ pointerEvents: isPreview ? 'none' : 'auto' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </Link>
          <h2 style={{ fontFamily: 'var(--font-serif)', color: '#fff', fontSize: '1.5rem', letterSpacing: '1px', textTransform: 'uppercase' }}>ÜRÜN KATALOĞU</h2>
          <div style={{ width: '44px' }}></div>
        </div>

        {/* Search Input */}
        <div className="catalog-search-wrapper">
          <svg className="catalog-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" className="catalog-search-input" placeholder="Ürün adı, açıklama veya kod ara..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        {/* Categories Tab Bar */}
        <div 
          className="catalog-tabs"
          ref={tabsRef}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <button className={`catalog-tab ${selectedCategory.toLowerCase() === 'hepsi' ? 'catalog-tab-active' : ''}`} onClick={() => setSelectedCategory('Hepsi')}>
            Tümü
          </button>
          {categories.map(cat => (
            <button key={cat.id} className={`catalog-tab ${selectedCategory === cat.name ? 'catalog-tab-active' : ''}`} onClick={() => setSelectedCategory(cat.name)}>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map(product => renderProduct(product))}
          </div>
        ) : !isLoading ? (
          <div style={{ textAlign: 'center', margin: '4rem 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem', opacity: 0.5 }}><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            <p>Bu kategoride ürün bulunamadı.</p>
          </div>
        ) : null}

        {/* Product Detail Modal */}
        {activeProduct && !isPreview && !activeProduct.is_pdf_catalog && (
          <div className="modal-overlay" onClick={() => setActiveProduct(null)}>
            <div className="modal-content-box" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setActiveProduct(null)} aria-label="Kapat"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
              <h3 className="modal-title" style={{ fontSize: '1.25rem', paddingRight: '1.5rem' }}>{activeProduct.title}</h3>
              <div className="pdetail-img-container"><img src={activeProduct.image} alt={activeProduct.title} className="pdetail-img" /></div>
              <div className="pdetail-meta">
                <div className="pdetail-meta-item"><span className="pdetail-meta-lbl">Ayar / Malzeme</span><span className="pdetail-meta-val">{activeProduct.carat}</span></div>
                <div className="pdetail-meta-item"><span className="pdetail-meta-lbl">Ağırlık</span><span className="pdetail-meta-val">{activeProduct.weight}</span></div>
                <div className="pdetail-meta-item" style={{ gridColumn: 'span 2', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.6rem', marginTop: '0.2rem' }}><span className="pdetail-meta-lbl">Ürün Kodu</span><span className="pdetail-meta-val" style={{ color: 'var(--color-gold)' }}>{activeProduct.code}</span></div>
              </div>
              <p className="pdetail-desc">{activeProduct.description}</p>
              <a href={`https://wa.me/${whatsappNumber}?text=Merhaba`} target="_blank" rel="noopener noreferrer" className="pdetail-btn-whatsapp"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg> WHATSAPP SİPARİŞ & BİLGİ AL</a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
