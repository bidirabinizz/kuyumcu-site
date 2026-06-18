'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminPanel() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [user, setUser] = useState(null);
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Panel State
  const [activeTab, setActiveTab] = useState('links');
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({
    whatsapp_number: '',
    address: '',
    working_hours: '',
    bg_video_url: '',
    show_video: 'true',
    video_opacity: '0.35',
  });

  // Action forms state
  const [editingLink, setEditingLink] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Drag and Drop State
  const [draggedLinkIndex, setDraggedLinkIndex] = useState(null);
  const [draggedProductIndex, setDraggedProductIndex] = useState(null);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleEditLink = (link) => {
    setEditingLink(link);
  };

  const handleEditProduct = (prod) => {
    setEditingProduct(prod);
  };

  // Check auth session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session?.user ?? null);
      setSessionChecked(true);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fetch data if user is logged in
  useEffect(() => {
    if (user) {
      fetchLinks();
      fetchProducts();
      fetchSettings();
    }
  }, [user]);

  // Data Fetching Functions
  const fetchLinks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error) console.error('Links fetch error:', error);
    else setLinks(data || []);
    setLoading(false);
  };

  const fetchProducts = async () => {
    // Make sure we order by sort_order
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error) console.error('Products fetch error:', error);
    else setProducts(data || []);
  };

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('settings')
      .select('*');
    
    if (error) {
      console.error('Settings fetch error:', error);
    } else if (data) {
      const sObj = {};
      data.forEach(item => {
        sObj[item.key] = item.value;
      });
      setSettings({
        whatsapp_number: sObj.whatsapp_number || '',
        address: sObj.address || '',
        working_hours: sObj.working_hours || '',
        bg_video_url: sObj.bg_video_url || '',
        show_video: sObj.show_video !== undefined ? sObj.show_video : 'true',
        video_opacity: sObj.video_opacity !== undefined ? sObj.video_opacity : '0.35',
      });
    }
  };

  // HTML5 Drag and Drop - LINKS
  const handleLinkDragStart = (index) => {
    setDraggedLinkIndex(index);
  };

  const handleLinkDragEnter = (index) => {
    if (draggedLinkIndex === null || draggedLinkIndex === index) return;
    const newList = [...links];
    const item = newList[draggedLinkIndex];
    newList.splice(draggedLinkIndex, 1);
    newList.splice(index, 0, item);
    setDraggedLinkIndex(index);
    setLinks(newList);
  };

  const handleLinkDragEnd = async () => {
    setDraggedLinkIndex(null);
    const updates = links.map((link, idx) => ({
      ...link,
      sort_order: idx * 10
    }));
    setLinks(updates);
    
    // Silently update database
    for (const l of updates) {
      await supabase.from('links').update({ sort_order: l.sort_order }).eq('id', l.id);
    }
    triggerToast('✅ Link sıralaması güncellendi!');
  };

  // HTML5 Drag and Drop - PRODUCTS
  const handleProductDragStart = (index) => {
    setDraggedProductIndex(index);
  };

  const handleProductDragEnter = (index) => {
    if (draggedProductIndex === null || draggedProductIndex === index) return;
    const newList = [...products];
    const item = newList[draggedProductIndex];
    newList.splice(draggedProductIndex, 1);
    newList.splice(index, 0, item);
    setDraggedProductIndex(index);
    setProducts(newList);
  };

  const handleProductDragEnd = async () => {
    setDraggedProductIndex(null);
    const updates = products.map((prod, idx) => ({
      ...prod,
      sort_order: idx * 10
    }));
    setProducts(updates);
    
    // Silently update database
    for (const p of updates) {
      await supabase.from('products').update({ sort_order: p.sort_order }).eq('id', p.id);
    }
    triggerToast('✅ Ürün sıralaması güncellendi!');
  };


  // Auth Handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message === 'Invalid login credentials' ? 'Geçersiz e-posta veya şifre!' : error.message);
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Links CRUD
  const saveLink = async (e) => {
    e.preventDefault();
    const form = e.target;
    const title = form.title.value;
    const url = form.url.value;
    const is_featured = form.is_featured.checked;
    const is_active = form.is_active.checked;
    const sort_order = links.length * 10; // Default append to bottom

    const payload = { title, url, is_featured, is_active };

    if (editingLink && editingLink.id) {
      const { error } = await supabase.from('links').update(payload).eq('id', editingLink.id);
      if (error) triggerToast('Güncelleme hatası: ' + error.message);
      else {
        triggerToast('Link başarıyla güncellendi.');
        setEditingLink(null);
        fetchLinks();
      }
    } else {
      payload.sort_order = sort_order;
      const { error } = await supabase.from('links').insert([payload]);
      if (error) triggerToast('Kayıt hatası: ' + error.message);
      else {
        triggerToast('Yeni link eklendi.');
        setEditingLink(null);
        fetchLinks();
      }
    }
  };

  const deleteLink = async (id) => {
    if (confirm('Bu linki silmek istediğinize emin misiniz?')) {
      const { error } = await supabase.from('links').delete().eq('id', id);
      if (error) triggerToast('Silme hatası: ' + error.message);
      else {
        triggerToast('Link silindi.');
        fetchLinks();
      }
    }
  };

  // Products CRUD
  const saveProduct = async (e) => {
    e.preventDefault();
    const form = e.target;
    const title = form.title.value;
    const category = form.category.value;
    const weight = form.weight.value;
    const carat = form.carat.value;
    const code = form.code.value;
    const image = form.image.value;
    const description = form.description.value;
    const sort_order = products.length * 10;

    const payload = { title, category, weight, carat, code, image, description };

    if (editingProduct && editingProduct.id) {
      const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
      if (error) triggerToast('Güncelleme hatası: ' + error.message);
      else {
        triggerToast('Ürün başarıyla güncellendi.');
        setEditingProduct(null);
        fetchProducts();
      }
    } else {
      payload.sort_order = sort_order;
      const { error } = await supabase.from('products').insert([payload]);
      if (error) triggerToast('Kayıt hatası: ' + error.message);
      else {
        triggerToast('Yeni ürün kataloğa eklendi.');
        setEditingProduct(null);
        fetchProducts();
      }
    }
  };

  const deleteProduct = async (id) => {
    if (confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) triggerToast('Silme hatası: ' + error.message);
      else {
        triggerToast('Ürün silindi.');
        fetchProducts();
      }
    }
  };

  // Settings CRUD
  const saveSettings = async (e) => {
    e.preventDefault();
    
    const updates = Object.keys(settings).map(key => {
      return supabase.from('settings').upsert({ key, value: settings[key] });
    });

    const results = await Promise.all(updates);
    const hasError = results.some(res => res.error);

    if (hasError) {
      triggerToast('Ayarlar kaydedilirken hata oluştu.');
    } else {
      triggerToast('Ayarlar başarıyla kaydedildi.');
      fetchSettings();
    }
  };

  // Guard for initial session check
  if (!sessionChecked) {
    return (
      <div className="layout-wrapper" style={{ alignItems: 'center' }}>
        <div style={{ color: 'var(--color-gold)', fontSize: '1.2rem', fontWeight: 'bold' }}>Panel yükleniyor...</div>
      </div>
    );
  }

  // LOGIN SCREEN
  if (!user) {
    return (
      <div className="layout-wrapper" style={{ alignItems: 'center' }}>
        <div className="modal-content-box" style={{ animation: 'none', position: 'static' }}>
          <h3 className="modal-title">YÖNETİCİ GİRİŞİ</h3>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.4rem' }}>E-posta</label>
              <input type="email" className="calc-input" style={{ width: '100%' }} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.4rem' }}>Şifre</label>
              <input type="password" className="calc-input" style={{ width: '100%' }} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {authError && (
              <div style={{ color: '#ff4d4d', fontSize: '0.8rem', fontWeight: 'bold', textAlign: 'center' }}>{authError}</div>
            )}
            <button type="submit" className="product-price-button" style={{ padding: '0.9rem', fontSize: '0.85rem' }} disabled={authLoading}>
              {authLoading ? 'GİRİŞ YAPILIYOR...' : 'GİRİŞ YAP'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <a href="/" style={{ color: 'var(--color-gold)', fontSize: '0.8rem', textDecoration: 'underline' }}>Siteye Dön</a>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN PANEL DASHBOARD (WORDPRESS STYLE LEFT SIDEBAR)
  return (
    <div className="admin-layout">
      {/* Left Sidebar Menu */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-gold)', fontSize: '1.4rem', letterSpacing: '1px' }}>ÇAPAR CMS</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>Dinamik Yönetim Paneli</p>
        </div>

        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div 
            className={`admin-menu-item ${activeTab === 'links' ? 'active' : ''}`}
            onClick={() => { setActiveTab('links'); setEditingLink(null); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            Linkleri Yönet
          </div>

          <div 
            className={`admin-menu-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => { setActiveTab('products'); setEditingProduct(null); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            Katalog Ürünleri
          </div>

          <div 
            className={`admin-menu-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Genel Ayarlar
          </div>
        </div>

        <button 
          onClick={handleLogout} 
          className="calc-select" 
          style={{ border: '1px solid rgba(255, 0, 0, 0.25)', color: '#ff4d4d', padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Güvenli Çıkış
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="admin-content">
        <div className="admin-content-inner">
          <header style={{ marginBottom: '2.5rem' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#fff', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '0.8rem' }}>
              {activeTab === 'links' && 'Link Yönetimi'}
              {activeTab === 'products' && 'Katalog Ürünleri Yönetimi'}
              {activeTab === 'settings' && 'Genel Site Ayarları'}
            </h1>
            {(activeTab === 'links' || activeTab === 'products') && (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>
                Öğeleri farenizle tutup sürükleyerek sırasını değiştirebilirsiniz. (Sürükle - Bırak)
              </p>
            )}
          </header>

          {/* ====================================================
              TAB 1: LINKS MANAGEMENT
          ==================================================== */}
          {activeTab === 'links' && (
            <div style={{ width: '100%' }}>
              {editingLink ? (
                <div className="bank-card" style={{ marginBottom: '2rem' }}>
                  <h4 style={{ color: 'var(--color-gold)', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>
                    {editingLink === 'new' ? 'YENİ LİNK EKLE' : 'LİNKİ DÜZENLE'}
                  </h4>
                  <form key={editingLink.id || 'new'} onSubmit={saveLink} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="calc-row" style={{ flexDirection: 'column', gap: '0.4rem', marginBottom: 0 }}>
                      <span className="bank-detail-label">Link Başlığı</span>
                      <input type="text" name="title" className="calc-input" defaultValue={editingLink !== 'new' ? editingLink.title : ''} required />
                    </div>

                    <div className="calc-row" style={{ flexDirection: 'column', gap: '0.4rem', marginBottom: 0 }}>
                      <span className="bank-detail-label">Yönlendirme Adresi (URL)</span>
                      <input type="text" name="url" className="calc-input" placeholder="/catalog, tel:+905..., mailto:..., veya https://..." defaultValue={editingLink !== 'new' ? editingLink.url : ''} required />
                    </div>

                    <div className="calc-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.5rem 0', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input type="checkbox" name="is_featured" defaultChecked={editingLink !== 'new' ? editingLink.is_featured : false} style={{ width: '16px', height: '16px' }} />
                        Öne Çıkar (Altın Işıma Efekti)
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input type="checkbox" name="is_active" defaultChecked={editingLink !== 'new' ? editingLink.is_active : true} style={{ width: '16px', height: '16px' }} />
                        Sitede Görünsün
                      </label>
                    </div>

                    <div className="calc-row" style={{ marginTop: '1rem', gap: '1rem' }}>
                      <button type="submit" className="product-price-button" style={{ flexGrow: 1, padding: '1rem' }}>KAYDET</button>
                      <button type="button" onClick={() => setEditingLink(null)} className="calc-select" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>İPTAL</button>
                    </div>
                  </form>
                </div>
              ) : (
                <button 
                  onClick={() => handleEditLink('new')} 
                  className="product-price-button" 
                  style={{ width: '100%', padding: '1rem', marginBottom: '2rem', background: 'linear-gradient(135deg, #1b3a1b, #25d366)', color: '#fff', fontSize: '0.95rem' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  YENİ LİNK EKLE
                </button>
              )}

              {/* Links Drag-and-Drop List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {links.map((link, index) => (
                  <div 
                    key={link.id} 
                    className={`bank-card dnd-item ${draggedLinkIndex === index ? 'dnd-item-dragging' : ''}`} 
                    style={{ padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    draggable
                    onDragStart={() => handleLinkDragStart(index)}
                    onDragEnter={() => handleLinkDragEnter(index)}
                    onDragEnd={handleLinkDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {/* Drag Handle Icon */}
                      <div className="drag-handle">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>
                      </div>
                      <div>
                        <h5 style={{ color: '#fff', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {link.title} 
                          {link.is_featured && <span style={{ fontSize: '0.65rem', background: 'rgba(212,175,55,0.2)', color: 'var(--color-gold)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>Öne Çıkan</span>}
                          {!link.is_active && <span style={{ fontSize: '0.65rem', background: 'rgba(255,0,0,0.15)', color: '#ff4d4d', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>Gizli</span>}
                        </h5>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '0.2rem', fontFamily: 'monospace' }}>{link.url}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleEditLink(link)} className="calc-select" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', border: '1px solid rgba(212,175,55,0.3)', color: 'var(--color-gold)' }}>Düzenle</button>
                      <button onClick={() => deleteLink(link.id)} className="calc-select" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', border: '1px solid rgba(255,0,0,0.2)', color: '#ff4d4d' }}>Sil</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ====================================================
              TAB 2: PRODUCTS CATALOG MANAGEMENT
          ==================================================== */}
          {activeTab === 'products' && (
            <div style={{ width: '100%' }}>
              {editingProduct ? (
                <div className="bank-card" style={{ marginBottom: '2rem' }}>
                  <h4 style={{ color: 'var(--color-gold)', marginBottom: '1.2rem', fontFamily: 'var(--font-serif)' }}>
                    {editingProduct === 'new' ? 'YENİ ÜRÜN EKLE' : 'ÜRÜNÜ DÜZENLE'}
                  </h4>
                  <form key={editingProduct.id || 'new'} onSubmit={saveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="calc-row" style={{ flexDirection: 'column', gap: '0.4rem', marginBottom: 0 }}>
                      <span className="bank-detail-label">Ürün Adı</span>
                      <input type="text" name="title" className="calc-input" defaultValue={editingProduct !== 'new' ? editingProduct.title : ''} required />
                    </div>

                    <div className="calc-row" style={{ gap: '1rem', marginBottom: 0 }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <span className="bank-detail-label">Kategori</span>
                        <select name="category" className="calc-select" style={{ width: '100%' }} defaultValue={editingProduct !== 'new' ? editingProduct.category : 'yüzükler'}>
                          <option value="yüzükler">Yüzükler</option>
                          <option value="bilezikler">Bilezikler</option>
                          <option value="kolyeler">Kolyeler</option>
                          <option value="küpeler">Küpeler</option>
                          <option value="setler">Setler</option>
                        </select>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <span className="bank-detail-label">Ürün Kodu</span>
                        <input type="text" name="code" className="calc-input" defaultValue={editingProduct !== 'new' ? editingProduct.code : ''} placeholder="CPR-Y101" required />
                      </div>
                    </div>

                    <div className="calc-row" style={{ gap: '1rem', marginBottom: 0 }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <span className="bank-detail-label">Ağırlık (Gram)</span>
                        <input type="text" name="weight" className="calc-input" placeholder="3.50 gr" defaultValue={editingProduct !== 'new' ? editingProduct.weight : ''} />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <span className="bank-detail-label">Ayar / Malzeme</span>
                        <input type="text" name="carat" className="calc-input" placeholder="22 Ayar Altın / 14K Pırlanta" defaultValue={editingProduct !== 'new' ? editingProduct.carat : ''} />
                      </div>
                    </div>

                    <div className="calc-row" style={{ flexDirection: 'column', gap: '0.4rem', marginBottom: 0 }}>
                      <span className="bank-detail-label">Görsel Dosya Yolu veya URL</span>
                      <input type="text" name="image" className="calc-input" placeholder="/images/baget_yuzuk.png veya harici URL" defaultValue={editingProduct !== 'new' ? editingProduct.image : ''} required />
                    </div>

                    <div className="calc-row" style={{ flexDirection: 'column', gap: '0.4rem', marginBottom: 0 }}>
                      <span className="bank-detail-label">Ürün Açıklaması</span>
                      <textarea name="description" className="calc-input" rows="4" style={{ resize: 'vertical', width: '100%', fontFamily: 'inherit' }} defaultValue={editingProduct !== 'new' ? editingProduct.description : ''} />
                    </div>

                    <div className="calc-row" style={{ marginTop: '1rem', gap: '1rem' }}>
                      <button type="submit" className="product-price-button" style={{ flexGrow: 1, padding: '1rem' }}>KAYDET</button>
                      <button type="button" onClick={() => setEditingProduct(null)} className="calc-select" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>İPTAL</button>
                    </div>
                  </form>
                </div>
              ) : (
                <button 
                  onClick={() => handleEditProduct('new')} 
                  className="product-price-button" 
                  style={{ width: '100%', padding: '1rem', marginBottom: '2rem', background: 'linear-gradient(135deg, #1b3a1b, #25d366)', color: '#fff', fontSize: '0.95rem' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  YENİ ÜRÜN EKLE
                </button>
              )}

              {/* Products Drag-and-Drop List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {products.map((prod, index) => (
                  <div 
                    key={prod.id} 
                    className={`bank-card dnd-item ${draggedProductIndex === index ? 'dnd-item-dragging' : ''}`} 
                    style={{ padding: '0.8rem 1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}
                    draggable
                    onDragStart={() => handleProductDragStart(index)}
                    onDragEnter={() => handleProductDragEnter(index)}
                    onDragEnd={handleProductDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <div className="drag-handle">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>
                    </div>
                    <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: '#111', flexShrink: 0, border: '1px solid rgba(212,175,55,0.2)' }}>
                      <img src={prod.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <h5 style={{ color: '#fff', fontSize: '0.95rem' }}>{prod.title}</h5>
                      <p style={{ color: 'var(--color-gold)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
                        {prod.code} • {prod.category.toUpperCase()}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{prod.weight} | {prod.carat}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                      <button onClick={() => handleEditProduct(prod)} className="calc-select" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', border: '1px solid rgba(212,175,55,0.3)', color: 'var(--color-gold)' }}>Düzenle</button>
                      <button onClick={() => deleteProduct(prod.id)} className="calc-select" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', border: '1px solid rgba(255,0,0,0.2)', color: '#ff4d4d' }}>Sil</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ====================================================
              TAB 3: SETTINGS MANAGEMENT
          ==================================================== */}
          {activeTab === 'settings' && (
            <div className="bank-card" style={{ padding: '2rem' }}>
              <h4 style={{ color: 'var(--color-gold)', marginBottom: '1.5rem', fontFamily: 'var(--font-serif)', fontSize: '1.2rem' }}>SİTE GENEL AYARLARI</h4>
              <form onSubmit={saveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                
                <div>
                  <label className="bank-detail-label">WhatsApp Hızlı Sipariş Numarası</label>
                  <input type="text" className="calc-input" style={{ width: '100%' }} value={settings.whatsapp_number} onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })} placeholder="Örn: 905441398739" required />
                </div>

                <div>
                  <label className="bank-detail-label">Mağaza Showroom Adresi</label>
                  <textarea className="calc-input" style={{ width: '100%', resize: 'vertical' }} rows="2" value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} placeholder="Mağaza adresi..." required />
                </div>

                <div>
                  <label className="bank-detail-label">Çalışma Saatleri</label>
                  <input type="text" className="calc-input" style={{ width: '100%' }} value={settings.working_hours} onChange={(e) => setSettings({ ...settings, working_hours: e.target.value })} placeholder="Örn: 09:00 - 19:00 (Pazar Günleri Kapalıdır)" required />
                </div>

                <div>
                  <label className="bank-detail-label">Arka Plan Videosu URL'i (.mp4)</label>
                  <input type="text" className="calc-input" style={{ width: '100%' }} value={settings.bg_video_url} onChange={(e) => setSettings({ ...settings, bg_video_url: e.target.value })} placeholder="Göz alıcı .mp4 video bağlantısı" required />
                </div>

                <div>
                  <label className="bank-detail-label">Arka Plan Videosunu Göster</label>
                  <select className="calc-select" style={{ width: '100%' }} value={settings.show_video} onChange={(e) => setSettings({ ...settings, show_video: e.target.value })}>
                    <option value="true">Evet (Videolu Arka Plan)</option>
                    <option value="false">Hayır (Siyah Düz Renk Arka Plan)</option>
                  </select>
                </div>

                {settings.show_video === 'true' && (
                  <div>
                    <label className="bank-detail-label">Arka Plan Videosu Opaklığı (Parlaklık)</label>
                    <select className="calc-select" style={{ width: '100%' }} value={settings.video_opacity} onChange={(e) => setSettings({ ...settings, video_opacity: e.target.value })}>
                      <option value="0.1">Çok Düşük (%10)</option>
                      <option value="0.2">Düşük (%20)</option>
                      <option value="0.35">Normal (%35 - Varsayılan)</option>
                      <option value="0.5">Belirgin (%50)</option>
                      <option value="0.7">Yüksek (%70)</option>
                      <option value="0.9">Çok Yüksek (%90)</option>
                    </select>
                  </div>
                )}

                <button type="submit" className="product-price-button" style={{ padding: '1.2rem', fontSize: '0.95rem', marginTop: '1rem' }}>
                  AYARLARI KAYDET
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Global Toast Alert */}
      {toastMsg && (
        <div className="toast-msg">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
