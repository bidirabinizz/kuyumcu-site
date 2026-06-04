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
  const [editingLink, setEditingLink] = useState(null); // { id, title, url, is_featured, is_active, sort_order } or 'new'
  const [editingProduct, setEditingProduct] = useState(null); // { id, title, category, weight, carat, code, image, description } or 'new'
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2000);
  };

  const handleEditLink = (link) => {
    setEditingLink(link);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditProduct = (prod) => {
    setEditingProduct(prod);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
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
    const sort_order = parseInt(form.sort_order.value) || 0;

    const payload = { title, url, is_featured, is_active, sort_order };

    if (editingLink && editingLink.id) {
      // Update
      const { error } = await supabase
        .from('links')
        .update(payload)
        .eq('id', editingLink.id);
      
      if (error) triggerToast('Güncelleme hatası: ' + error.message);
      else {
        triggerToast('Link başarıyla güncellendi.');
        setEditingLink(null);
        fetchLinks();
      }
    } else {
      // Insert
      const { error } = await supabase
        .from('links')
        .insert([payload]);
      
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
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id);
      
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

    const payload = { title, category, weight, carat, code, image, description };

    if (editingProduct && editingProduct.id) {
      // Update
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', editingProduct.id);
      
      if (error) triggerToast('Güncelleme hatası: ' + error.message);
      else {
        triggerToast('Ürün başarıyla güncellendi.');
        setEditingProduct(null);
        fetchProducts();
      }
    } else {
      // Insert
      const { error } = await supabase
        .from('products')
        .insert([payload]);
      
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
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
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
      return supabase
        .from('settings')
        .upsert({ key, value: settings[key] });
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

  // ----------------------------------------------------
  // LOGIN SCREEN
  // ----------------------------------------------------
  if (!user) {
    return (
      <div className="layout-wrapper" style={{ alignItems: 'center' }}>
        <div className="modal-content-box" style={{ animation: 'none', position: 'static' }}>
          <h3 className="modal-title">YÖNETİCİ GİRİŞİ</h3>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.4rem' }}>E-posta</label>
              <input
                type="email"
                className="calc-input"
                style={{ width: '100%' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.4rem' }}>Şifre</label>
              <input
                type="password"
                className="calc-input"
                style={{ width: '100%' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {authError && (
              <div style={{ color: '#ff4d4d', fontSize: '0.8rem', fontWeight: 'bold', textAlign: 'center' }}>
                {authError}
              </div>
            )}

            <button 
              type="submit" 
              className="product-price-button" 
              style={{ padding: '0.9rem', fontSize: '0.85rem' }}
              disabled={authLoading}
            >
              {authLoading ? 'GİRİŞ YAPILIYOR...' : 'GİRİŞ YAP'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <a href="/" style={{ color: 'var(--color-gold)', fontSize: '0.8rem', textDecoration: 'underline' }}>Sanal Siteden Çık</a>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // ADMIN PANEL DASHBOARD
  // ----------------------------------------------------
  return (
    <div className="layout-wrapper">
      <main className="main-container" style={{ maxWidth: '640px', paddingBottom: '4rem' }}>
        
        {/* Admin Header */}
        <header className="brand-header" style={{ marginBottom: '1.5rem' }}>
          <h1 className="brand-title" style={{ fontSize: '1.6rem' }}>ÇAPAR YÖNETİMİ</h1>
          <p className="brand-subtitle" style={{ fontSize: '0.8rem' }}>Dinamik İçerik Düzenleme</p>
          <button 
            onClick={handleLogout} 
            className="calc-select" 
            style={{ marginTop: '1rem', border: '1px solid rgba(255, 0, 0, 0.25)', color: '#ff4d4d', padding: '0.4rem 1rem' }}
          >
            Güvenli Çıkış
          </button>
        </header>

        {/* Tab Controls */}
        <div className="catalog-tabs" style={{ justifyContent: 'center' }}>
          <button 
            className={`catalog-tab ${activeTab === 'links' ? 'catalog-tab-active' : ''}`}
            onClick={() => { setActiveTab('links'); setEditingLink(null); }}
          >
            Linkleri Yönet
          </button>
          <button 
            className={`catalog-tab ${activeTab === 'products' ? 'catalog-tab-active' : ''}`}
            onClick={() => { setActiveTab('products'); setEditingProduct(null); }}
          >
            Katalog Ürünleri
          </button>
          <button 
            className={`catalog-tab ${activeTab === 'settings' ? 'catalog-tab-active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Genel Ayarlar
          </button>
        </div>

        {/* ====================================================
            TAB 1: LINKS MANAGEMENT
        ==================================================== */}
        {activeTab === 'links' && (
          <div style={{ width: '100%' }}>
            
            {editingLink ? (
              <div className="bank-card" style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: 'var(--color-gold)', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>
                  {editingLink === 'new' ? 'YENİ LİNK EKLE' : 'LİNKİ DÜZENLE'}
                </h4>
                <form key={editingLink.id || 'new'} onSubmit={saveLink} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div className="calc-row" style={{ flexDirection: 'column', gap: '0.2rem', marginBottom: 0 }}>
                    <span className="bank-detail-label">Link Başlığı</span>
                    <input 
                      type="text" 
                      name="title" 
                      className="calc-input" 
                      defaultValue={editingLink !== 'new' ? editingLink.title : ''} 
                      required 
                    />
                  </div>

                  <div className="calc-row" style={{ flexDirection: 'column', gap: '0.2rem', marginBottom: 0 }}>
                    <span className="bank-detail-label">Yönlendirme Adresi (URL)</span>
                    <input 
                      type="text" 
                      name="url" 
                      className="calc-input" 
                      placeholder="/catalog, tel:+905..., mailto:..., veya https://..."
                      defaultValue={editingLink !== 'new' ? editingLink.url : ''} 
                      required 
                    />
                  </div>

                  <div className="calc-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.5rem 0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                      <input 
                        type="checkbox" 
                        name="is_featured" 
                        defaultChecked={editingLink !== 'new' ? editingLink.is_featured : false} 
                      />
                      Öne Çıkar (Kesikli Çerçeve + Altın Işıma)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                      <input 
                        type="checkbox" 
                        name="is_active" 
                        defaultChecked={editingLink !== 'new' ? editingLink.is_active : true} 
                      />
                      Aktif / Sitede Göster
                    </label>
                  </div>

                  <div className="calc-row" style={{ flexDirection: 'column', gap: '0.2rem', marginBottom: 0 }}>
                    <span className="bank-detail-label">Sıralama Değeri (Küçük olan üstte görünür)</span>
                    <input 
                      type="number" 
                      name="sort_order" 
                      className="calc-input" 
                      defaultValue={editingLink !== 'new' ? editingLink.sort_order : 10} 
                      required 
                    />
                  </div>

                  <div className="calc-row" style={{ marginTop: '0.8rem' }}>
                    <button type="submit" className="product-price-button" style={{ flexGrow: 1 }}>KAYDET</button>
                    <button type="button" onClick={() => setEditingLink(null)} className="calc-select" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>İPTAL</button>
                  </div>
                </form>
              </div>
            ) : (
              <button 
                onClick={() => handleEditLink('new')} 
                className="product-price-button" 
                style={{ width: '100%', padding: '0.9rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #1b3a1b, #25d366)', color: '#fff' }}
              >
                + YENİ LİNK EKLE
              </button>
            )}

            {/* Links List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {links.map((link) => (
                <div key={link.id} className="bank-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h5 style={{ color: '#fff', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {link.title} 
                      {link.is_featured && <span style={{ fontSize: '0.65rem', background: 'rgba(212,175,55,0.2)', color: 'var(--color-gold)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>Öne Çıkan</span>}
                      {!link.is_active && <span style={{ fontSize: '0.65rem', background: 'rgba(255,0,0,0.15)', color: '#ff4d4d', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>Gizli</span>}
                    </h5>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '0.2rem', fontFamily: 'monospace' }}>{link.url}</p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Sıra: {link.sort_order}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button 
                      onClick={() => handleEditLink(link)} 
                      className="calc-select" 
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', border: '1px solid rgba(212,175,55,0.3)', color: 'var(--color-gold)' }}
                    >
                      Düzenle
                    </button>
                    <button 
                      onClick={() => deleteLink(link.id)} 
                      className="calc-select" 
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', border: '1px solid rgba(255,0,0,0.2)', color: '#ff4d4d' }}
                    >
                      Sil
                    </button>
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
              <div className="bank-card" style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: 'var(--color-gold)', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>
                  {editingProduct === 'new' ? 'YENİ ÜRÜN EKLE' : 'ÜRÜNÜ DÜZENLE'}
                </h4>
                <form key={editingProduct.id || 'new'} onSubmit={saveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div className="calc-row" style={{ flexDirection: 'column', gap: '0.2rem', marginBottom: 0 }}>
                    <span className="bank-detail-label">Ürün Adı</span>
                    <input 
                      type="text" 
                      name="title" 
                      className="calc-input" 
                      defaultValue={editingProduct !== 'new' ? editingProduct.title : ''} 
                      required 
                    />
                  </div>

                  <div className="calc-row" style={{ gap: '0.8rem', marginBottom: 0 }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span className="bank-detail-label">Kategori</span>
                      <select 
                        name="category" 
                        className="calc-select" 
                        style={{ width: '100%' }}
                        defaultValue={editingProduct !== 'new' ? editingProduct.category : 'yüzükler'}
                      >
                        <option value="yüzükler">Yüzükler</option>
                        <option value="bilezikler">Bilezikler</option>
                        <option value="kolyeler">Kolyeler</option>
                        <option value="küpeler">Küpeler</option>
                        <option value="setler">Setler</option>
                      </select>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span className="bank-detail-label">Ürün Kodu</span>
                      <input 
                        type="text" 
                        name="code" 
                        className="calc-input" 
                        defaultValue={editingProduct !== 'new' ? editingProduct.code : ''} 
                        placeholder="CPR-Y101"
                        required 
                      />
                    </div>
                  </div>

                  <div className="calc-row" style={{ gap: '0.8rem', marginBottom: 0 }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span className="bank-detail-label">Ağırlık (Gram)</span>
                      <input 
                        type="text" 
                        name="weight" 
                        className="calc-input" 
                        placeholder="3.50 gr"
                        defaultValue={editingProduct !== 'new' ? editingProduct.weight : ''} 
                      />
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span className="bank-detail-label">Ayar / Malzeme</span>
                      <input 
                        type="text" 
                        name="carat" 
                        className="calc-input" 
                        placeholder="22 Ayar Altın / 14K Pırlanta"
                        defaultValue={editingProduct !== 'new' ? editingProduct.carat : ''} 
                      />
                    </div>
                  </div>

                  <div className="calc-row" style={{ flexDirection: 'column', gap: '0.2rem', marginBottom: 0 }}>
                    <span className="bank-detail-label">Görsel Dosya Yolu veya URL</span>
                    <input 
                      type="text" 
                      name="image" 
                      className="calc-input" 
                      placeholder="/images/baget_yuzuk.png veya harici URL"
                      defaultValue={editingProduct !== 'new' ? editingProduct.image : ''} 
                      required 
                    />
                  </div>

                  <div className="calc-row" style={{ flexDirection: 'column', gap: '0.2rem', marginBottom: 0 }}>
                    <span className="bank-detail-label">Ürün Açıklaması</span>
                    <textarea 
                      name="description" 
                      className="calc-input" 
                      rows="3" 
                      style={{ resize: 'vertical', width: '100%', fontFamily: 'inherit' }}
                      defaultValue={editingProduct !== 'new' ? editingProduct.description : ''} 
                    />
                  </div>

                  <div className="calc-row" style={{ marginTop: '0.8rem' }}>
                    <button type="submit" className="product-price-button" style={{ flexGrow: 1 }}>KAYDET</button>
                    <button type="button" onClick={() => setEditingProduct(null)} className="calc-select" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>İPTAL</button>
                  </div>
                </form>
              </div>
            ) : (
              <button 
                onClick={() => handleEditProduct('new')} 
                className="product-price-button" 
                style={{ width: '100%', padding: '0.9rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #1b3a1b, #25d366)', color: '#fff' }}
              >
                + YENİ ÜRÜN EKLE
              </button>
            )}

            {/* Products List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {products.map((prod) => (
                <div key={prod.id} className="bank-card" style={{ padding: '0.8rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: '#111', flexShrink: 0 }}>
                    <img src={prod.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <h5 style={{ color: '#fff', fontSize: '0.9rem' }}>{prod.title}</h5>
                    <p style={{ color: 'var(--color-gold)', fontSize: '0.75rem', marginTop: '0.15rem' }}>
                      {prod.code} • {prod.category.toUpperCase()}
                    </p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{prod.weight} | {prod.carat}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                    <button 
                      onClick={() => handleEditProduct(prod)} 
                      className="calc-select" 
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', border: '1px solid rgba(212,175,55,0.3)', color: 'var(--color-gold)' }}
                    >
                      Düzenle
                    </button>
                    <button 
                      onClick={() => deleteProduct(prod.id)} 
                      className="calc-select" 
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', border: '1px solid rgba(255,0,0,0.2)', color: '#ff4d4d' }}
                    >
                      Sil
                    </button>
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
          <div className="bank-card">
            <h4 style={{ color: 'var(--color-gold)', marginBottom: '1.2rem', fontFamily: 'var(--font-serif)' }}>SİTE GENEL AYARLARI</h4>
            <form onSubmit={saveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div>
                <label className="bank-detail-label">WhatsApp Hızlı Sipariş Numarası</label>
                <input 
                  type="text" 
                  className="calc-input" 
                  style={{ width: '100%' }}
                  value={settings.whatsapp_number}
                  onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                  placeholder="Örn: 905441398739"
                  required
                />
              </div>

              <div>
                <label className="bank-detail-label">Mağaza Showroom Adresi</label>
                <textarea 
                  className="calc-input" 
                  style={{ width: '100%', resize: 'vertical' }}
                  rows="2"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  placeholder="Mağaza adresi..."
                  required
                />
              </div>

              <div>
                <label className="bank-detail-label">Çalışma Saatleri</label>
                <input 
                  type="text" 
                  className="calc-input" 
                  style={{ width: '100%' }}
                  value={settings.working_hours}
                  onChange={(e) => setSettings({ ...settings, working_hours: e.target.value })}
                  placeholder="Örn: 09:00 - 19:00 (Pazar Günleri Kapalıdır)"
                  required
                />
              </div>

              <div>
                <label className="bank-detail-label">Arka Plan Videosu URL'i (.mp4)</label>
                <input 
                  type="text" 
                  className="calc-input" 
                  style={{ width: '100%' }}
                  value={settings.bg_video_url}
                  onChange={(e) => setSettings({ ...settings, bg_video_url: e.target.value })}
                  placeholder="Göz alıcı .mp4 video bağlantısı"
                  required
                />
              </div>

              <div>
                <label className="bank-detail-label">Arka Plan Videosunu Göster</label>
                <select
                  className="calc-select"
                  style={{ width: '100%' }}
                  value={settings.show_video}
                  onChange={(e) => setSettings({ ...settings, show_video: e.target.value })}
                >
                  <option value="true">Evet (Videolu Arka Plan)</option>
                  <option value="false">Hayır (Siyah Düz Renk Arka Plan)</option>
                </select>
              </div>

              {settings.show_video === 'true' && (
                <div>
                  <label className="bank-detail-label">Arka Plan Videosu Opaklığı (Parlaklık)</label>
                  <select
                    className="calc-select"
                    style={{ width: '100%' }}
                    value={settings.video_opacity}
                    onChange={(e) => setSettings({ ...settings, video_opacity: e.target.value })}
                  >
                    <option value="0.1">Çok Düşük (%10)</option>
                    <option value="0.2">Düşük (%20)</option>
                    <option value="0.35">Normal (%35 - Varsayılan)</option>
                    <option value="0.5">Belirgin (%50)</option>
                    <option value="0.7">Yüksek (%70)</option>
                    <option value="0.9">Çok Yüksek (%90)</option>
                  </select>
                </div>
              )}

              <button 
                type="submit" 
                className="product-price-button" 
                style={{ padding: '0.9rem', fontSize: '0.85rem', marginTop: '0.5rem' }}
              >
                AYARLARI KAYDET
              </button>
            </form>
          </div>
        )}

        {/* Global Toast Alert */}
        {toastMsg && (
          <div className="toast-msg">
            {toastMsg}
          </div>
        )}

      </main>
    </div>
  );
}
