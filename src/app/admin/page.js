'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

// Helper component for draggable list item
function DraggableListItem({ item, index, type, isActive, onDragStart, onDragEnter, onDragEnd, onClick, onRemove }) {
  return (
    <div 
      draggable
      onDragStart={() => onDragStart(index, type)}
      onDragEnter={() => onDragEnter(index, type)}
      onDragEnd={() => onDragEnd(type)}
      onDragOver={(e) => e.preventDefault()}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.8rem', background: isActive ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.03)',
        border: isActive ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.05)',
        borderRadius: '8px', marginBottom: '0.5rem', cursor: 'pointer',
        borderLeft: isActive ? '3px solid var(--color-gold)' : '3px solid transparent',
        transition: 'all 0.2s ease'
      }}
      onClick={() => onClick(item)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <div style={{ cursor: 'grab', color: 'var(--color-text-muted)' }} onClick={(e) => e.stopPropagation()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '600' }}>{item.title}</span>
          {type === 'products' && <span style={{ fontSize: '0.65rem', color: 'var(--color-gold)' }}>{item.category} • {item.is_pdf_catalog ? 'PDF KATALOG' : item.code}</span>}
          {type === 'links' && <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{item.url}</span>}
          {type === 'bank_accounts' && <span style={{ fontSize: '0.65rem', color: 'var(--color-gold)' }}>{item.bank}</span>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.4rem' }}>
         <button onClick={(e) => { e.stopPropagation(); onRemove(item.id); }} style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '0.2rem' }}>
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
         </button>
      </div>
    </div>
  );
}

// Icon Picker Component
const IconPicker = ({ selectedIcon, onSelect }) => {
  const icons = [
    { id: 'globe', name: 'Web', svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg> },
    { id: 'whatsapp', name: 'WhatsApp', svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg> },
    { id: 'instagram', name: 'Instagram', svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg> },
    { id: 'phone', name: 'Telefon', svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> },
    { id: 'map', name: 'Konum', svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> },
    { id: 'mail', name: 'E-Posta', svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> },
    { id: 'star', name: 'Yıldız', svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> },
    { id: 'catalog', name: 'Katalog', svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg> },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '0.5rem' }}>
      {icons.map(icon => (
        <div 
          key={icon.id}
          onClick={() => onSelect(icon.id)}
          title={icon.name}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '0.5rem', cursor: 'pointer', borderRadius: '8px',
            background: selectedIcon === icon.id ? 'var(--color-gold)' : 'rgba(255,255,255,0.05)',
            color: selectedIcon === icon.id ? '#000' : '#fff',
            border: selectedIcon === icon.id ? '1px solid var(--color-gold)' : '1px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          {icon.svg}
          <span style={{ fontSize: '0.6rem', marginTop: '0.3rem', textAlign: 'center' }}>{icon.name}</span>
        </div>
      ))}
    </div>
  );
};

// File Upload Component
const FileInput = ({ label, currentUrl, onUpload, accept }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('assets').upload(filePath, file);
    if (uploadError) {
      alert('Yükleme hatası: ' + uploadError.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from('assets').getPublicUrl(filePath);
    onUpload(data.publicUrl);
    setUploading(false);
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label className="bank-detail-label">{label}</label>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
        {currentUrl && accept.includes('image') && (
          <img src={currentUrl} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
        )}
        {currentUrl && accept.includes('pdf') && (
          <a href={currentUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-gold)', fontSize: '0.8rem', textDecoration: 'underline' }}>Mevcut PDF'i Gör</a>
        )}
        <label style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', border: '1px dashed var(--color-gold)', color: 'var(--color-gold)', display: 'inline-block' }}>
          {uploading ? 'Yükleniyor...' : 'Dosya Seç / Değiştir'}
          <input type="file" style={{ display: 'none' }} accept={accept} onChange={handleFileChange} disabled={uploading} />
        </label>
      </div>
    </div>
  );
};

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
  
  // Data State (Local unsaved changes)
  const [links, setLinks] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [settings, setSettings] = useState({
    whatsapp_number: '', address: '', working_hours: '', bg_video_url: '', show_video: 'true', video_opacity: 35, button_opacity: 75,
    logo_url: '/caparkuyumculuklogo.jpeg', site_name: 'ÇAPAR KUYUMCULUK'
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Editor State
  const [selectedItem, setSelectedItem] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const iframeRef = useRef(null);

  // Preview Mode State
  const [previewMode, setPreviewMode] = useState('mobile');

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session?.user ?? null);
      setSessionChecked(true);
    };
    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchLinks();
      fetchProducts();
      fetchCategories();
      fetchBankAccounts();
      fetchSettings();
    }
  }, [user]);

  const fetchLinks = async () => {
    const { data } = await supabase.from('links').select('*').order('sort_order', { ascending: true });
    setLinks(data || []);
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('sort_order', { ascending: true });
    setProducts(data || []);
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
      if (error) throw error;
      setCategories(data || []);
    } catch (e) {
      console.warn("Categories fetch failed, maybe table doesn't exist yet.");
      setCategories([]);
    }
  };

  const fetchBankAccounts = async () => {
    try {
      const { data, error } = await supabase.from('bank_accounts').select('*').order('sort_order', { ascending: true });
      if (error) throw error;
      setBankAccounts(data || []);
    } catch (e) {
      console.warn("Bank accounts fetch failed, maybe table doesn't exist yet.");
      setBankAccounts([]);
    }
  };

  const fetchSettings = async () => {
    const { data } = await supabase.from('settings').select('*');
    if (data) {
      const sObj = {};
      data.forEach(item => sObj[item.key] = item.value);
      setSettings({
        whatsapp_number: sObj.whatsapp_number || '', address: sObj.address || '', working_hours: sObj.working_hours || '',
        bg_video_url: sObj.bg_video_url || '', show_video: sObj.show_video || 'true', 
        video_opacity: sObj.video_opacity ? Math.round(parseFloat(sObj.video_opacity) * 100) : 35,
        button_opacity: sObj.button_opacity ? Math.round(parseFloat(sObj.button_opacity) * 100) : 75,
        logo_url: sObj.logo_url || '/caparkuyumculuklogo.jpeg', site_name: sObj.site_name || 'ÇAPAR KUYUMCULUK'
      });
    }
  };

  // BROADCAST TO IFRAME WHENEVER STATE CHANGES
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      let previewLinks = [...links];
      let previewProducts = [...products];
      let previewCategories = [...categories];
      let previewBankAccounts = [...bankAccounts];

      if (selectedItem) {
        if (activeTab === 'links') {
          const idx = previewLinks.findIndex(l => l.id === selectedItem.id);
          if (idx !== -1) previewLinks[idx] = selectedItem;
          else if (selectedItem.id === 'new') previewLinks.push({...selectedItem, id: 'temp_preview'});
        } else if (activeTab === 'products') {
          const idx = previewProducts.findIndex(p => p.id === selectedItem.id);
          if (idx !== -1) previewProducts[idx] = selectedItem;
          else if (selectedItem.id === 'new') previewProducts.push({...selectedItem, id: 'temp_preview'});
        } else if (activeTab === 'categories') {
          const idx = previewCategories.findIndex(c => c.id === selectedItem.id);
          if (idx !== -1) previewCategories[idx] = selectedItem;
          else if (selectedItem.id === 'new') previewCategories.push({...selectedItem, id: 'temp_preview'});
        } else if (activeTab === 'bank_accounts') {
          const idx = previewBankAccounts.findIndex(b => b.id === selectedItem.id);
          if (idx !== -1) previewBankAccounts[idx] = selectedItem;
          else if (selectedItem.id === 'new') previewBankAccounts.push({...selectedItem, id: 'temp_preview'});
        }
      }

      iframeRef.current.contentWindow.postMessage({
        type: 'PREVIEW_UPDATE',
        data: { 
          links: previewLinks, 
          products: previewProducts, 
          settings, 
          categories: previewCategories, 
          bankAccounts: previewBankAccounts 
        }
      }, '*');
    }
  }, [links, products, settings, categories, bankAccounts, activeTab, selectedItem]);

  // LISTEN TO MESSAGES FROM IFRAME
  useEffect(() => {
    const handleMessage = (e) => {
      if (!e.data || !e.data.type) return;
      const { type, id, itemType } = e.data;

      if (type === 'EDIT_ITEM') {
        if (itemType === 'links') {
          const item = links.find(l => l.id === id);
          if (item) { setActiveTab('links'); setSelectedItem(item); }
        } else if (itemType === 'products') {
          const item = products.find(p => p.id === id);
          if (item) { setActiveTab('products'); setSelectedItem(item); }
        }
      } 
      else if (type === 'MOVE_UP' || type === 'MOVE_DOWN') {
        const arr = itemType === 'links' ? [...links] : [...products];
        const idx = arr.findIndex(i => i.id === id);
        if (idx === -1) return;

        if (type === 'MOVE_UP' && idx > 0) {
          const temp = arr[idx - 1]; arr[idx - 1] = arr[idx]; arr[idx] = temp;
        } else if (type === 'MOVE_DOWN' && idx < arr.length - 1) {
          const temp = arr[idx + 1]; arr[idx + 1] = arr[idx]; arr[idx] = temp;
        } else return;

        if (itemType === 'links') setLinks(arr);
        else setProducts(arr);
        setHasUnsavedChanges(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [links, products]);


  // Drag Logic
  const handleDragStart = (index) => setDraggedIndex(index);
  const handleDragEnter = (index, type) => {
    if (draggedIndex === null || draggedIndex === index) return;
    if (type === 'links') {
      const newList = [...links]; const item = newList[draggedIndex];
      newList.splice(draggedIndex, 1); newList.splice(index, 0, item);
      setDraggedIndex(index); setLinks(newList); setHasUnsavedChanges(true);
    } else if (type === 'products') {
      const newList = [...products]; const item = newList[draggedIndex];
      newList.splice(draggedIndex, 1); newList.splice(index, 0, item);
      setDraggedIndex(index); setProducts(newList); setHasUnsavedChanges(true);
    } else if (type === 'categories') {
      const newList = [...categories]; const item = newList[draggedIndex];
      newList.splice(draggedIndex, 1); newList.splice(index, 0, item);
      setDraggedIndex(index); setCategories(newList); setHasUnsavedChanges(true);
    } else if (type === 'bank_accounts') {
      const newList = [...bankAccounts]; const item = newList[draggedIndex];
      newList.splice(draggedIndex, 1); newList.splice(index, 0, item);
      setDraggedIndex(index); setBankAccounts(newList); setHasUnsavedChanges(true);
    }
  };
  const handleDragEnd = () => setDraggedIndex(null);

  // Field Updates
  const updateLinkField = (field, value) => { setSelectedItem({ ...selectedItem, [field]: value }); setHasUnsavedChanges(true); };
  const updateProductField = (field, value) => { setSelectedItem({ ...selectedItem, [field]: value }); setHasUnsavedChanges(true); };
  const updateCategoryField = (field, value) => { setSelectedItem({ ...selectedItem, [field]: value }); setHasUnsavedChanges(true); };
  const updateBankAccountField = (field, value) => { setSelectedItem({ ...selectedItem, [field]: value }); setHasUnsavedChanges(true); };
  const updateSettingField = (field, value) => { setSettings(prev => ({ ...prev, [field]: value })); setHasUnsavedChanges(true); };

  const applyItemToLocalState = () => {
    if (activeTab === 'links') {
      if (selectedItem.id === 'new') setLinks([...links, { ...selectedItem, id: 'temp_' + Date.now() }]);
      else setLinks(links.map(l => l.id === selectedItem.id ? selectedItem : l));
    } else if (activeTab === 'products') {
      if (selectedItem.id === 'new') setProducts([...products, { ...selectedItem, id: 'temp_' + Date.now(), category: selectedItem.category || (categories[0]?.name || 'Genel') }]);
      else setProducts(products.map(p => p.id === selectedItem.id ? selectedItem : p));
    } else if (activeTab === 'categories') {
      if (selectedItem.id === 'new') setCategories([...categories, { ...selectedItem, id: 'temp_' + Date.now() }]);
      else setCategories(categories.map(c => c.id === selectedItem.id ? selectedItem : c));
    } else if (activeTab === 'bank_accounts') {
      if (selectedItem.id === 'new') setBankAccounts([...bankAccounts, { ...selectedItem, id: 'temp_' + Date.now() }]);
      else setBankAccounts(bankAccounts.map(b => b.id === selectedItem.id ? selectedItem : b));
    }
    setSelectedItem(null);
    setHasUnsavedChanges(true);
  };

  const handleRemoveItem = (id, type) => {
    if (confirm('Bunu kaldırmak istediğinize emin misiniz?')) {
      if (type === 'links') {
        if (!id.startsWith('temp_')) supabase.from('links').delete().eq('id', id).then();
        setLinks(links.filter(l => l.id !== id));
      } else if (type === 'products') {
        if (!id.startsWith('temp_')) supabase.from('products').delete().eq('id', id).then();
        setProducts(products.filter(p => p.id !== id));
      } else if (type === 'categories') {
        if (!id.startsWith('temp_')) supabase.from('categories').delete().eq('id', id).then();
        setCategories(categories.filter(c => c.id !== id));
      } else if (type === 'bank_accounts') {
        if (!id.startsWith('temp_')) supabase.from('bank_accounts').delete().eq('id', id).then();
        setBankAccounts(bankAccounts.filter(b => b.id !== id));
      }
      setSelectedItem(null);
      setHasUnsavedChanges(true);
    }
  };

  const handleGlobalSave = async () => {
    setIsSaving(true);
    
    const linkUpdates = links.map((l, idx) => {
       const payload = { title: l.title, url: l.url, is_featured: l.is_featured, is_active: l.is_active, icon_name: l.icon_name, sort_order: idx * 10 };
       if (l.id && !l.id.startsWith('temp_')) return supabase.from('links').update(payload).eq('id', l.id);
       else return supabase.from('links').insert([payload]);
    });

    const prodUpdates = products.map((p, idx) => {
       const payload = { title: p.title, category: p.category, weight: p.weight, carat: p.carat, code: p.code, image: p.image, description: p.description, is_pdf_catalog: p.is_pdf_catalog, pdf_url: p.pdf_url, sort_order: idx * 10 };
       if (p.id && !p.id.startsWith('temp_')) return supabase.from('products').update(payload).eq('id', p.id);
       else return supabase.from('products').insert([payload]);
    });

    const catUpdates = categories.map((c, idx) => {
       const payload = { name: c.name, sort_order: idx * 10 };
       if (c.id && !c.id.startsWith('temp_')) return supabase.from('categories').update(payload).eq('id', c.id);
       else return supabase.from('categories').insert([payload]);
    });

    const bankUpdates = bankAccounts.map((b, idx) => {
       const payload = { bank: b.bank, holder: b.holder, branch: b.branch, iban: b.iban, sort_order: idx * 10 };
       if (b.id && !b.id.startsWith('temp_')) return supabase.from('bank_accounts').update(payload).eq('id', b.id);
       else return supabase.from('bank_accounts').insert([payload]);
    });

    const settingUpdates = Object.keys(settings).map(key => {
      let val = settings[key];
      if (key === 'video_opacity' || key === 'button_opacity') val = (val / 100).toString();
      return supabase.from('settings').upsert({ key, value: val });
    });

    await Promise.all([...linkUpdates, ...prodUpdates, ...catUpdates, ...bankUpdates, ...settingUpdates]);

    await fetchLinks();
    await fetchProducts();
    await fetchCategories();
    await fetchBankAccounts();

    setHasUnsavedChanges(false);
    setIsSaving(false);
    triggerToast('Tüm değişiklikler başarıyla yayınlandı!');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true); setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message === 'Invalid login credentials' ? 'Geçersiz e-posta veya şifre!' : error.message);
    setAuthLoading(false);
  };

  const handleLogout = async () => await supabase.auth.signOut();

  if (!sessionChecked) return <div className="layout-wrapper" style={{ alignItems: 'center' }}><div style={{ color: 'var(--color-gold)', fontWeight: 'bold' }}>Yükleniyor...</div></div>;

  if (!user) {
    return (
      <div className="layout-wrapper" style={{ alignItems: 'center' }}>
        <div className="modal-content-box" style={{ animation: 'none', position: 'static' }}>
          <h3 className="modal-title">YÖNETİCİ GİRİŞİ</h3>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div><label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.4rem' }}>E-posta</label><input type="email" className="calc-input" style={{ width: '100%' }} value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div><label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.4rem' }}>Şifre</label><input type="password" className="calc-input" style={{ width: '100%' }} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            {authError && <div style={{ color: '#ff4d4d', fontSize: '0.8rem', fontWeight: 'bold', textAlign: 'center' }}>{authError}</div>}
            <button type="submit" className="product-price-button" style={{ padding: '0.9rem', fontSize: '0.85rem' }} disabled={authLoading}>{authLoading ? 'GİRİŞ YAPILIYOR...' : 'GİRİŞ YAP'}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#070708', overflow: 'hidden' }}>
      
      {/* LEFT SIDEBAR (CONTROL PANEL) */}
      <aside style={{ width: '400px', backgroundColor: '#0f0f12', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', zIndex: 50, boxShadow: '5px 0 25px rgba(0,0,0,0.8)', flexShrink: 0 }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-gold)', fontSize: '1.2rem', letterSpacing: '1px', margin: 0 }}>ÇAPAR CMS</h2>
            <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}>Çıkış Yap</button>
          </div>
          <button 
            onClick={handleGlobalSave} disabled={!hasUnsavedChanges || isSaving} className="product-price-button"
            style={{ 
              width: '100%', padding: '0.8rem', fontSize: '0.85rem', 
              background: hasUnsavedChanges ? 'linear-gradient(135deg, #1b3a1b, #25d366)' : '#222', color: hasUnsavedChanges ? '#fff' : '#888',
              boxShadow: hasUnsavedChanges ? '0 4px 15px rgba(37,211,102,0.3)' : 'none', cursor: hasUnsavedChanges ? 'pointer' : 'not-allowed'
            }}
          >
            {isSaving ? 'YAYINLANIYOR...' : (hasUnsavedChanges ? 'KAYDET VE YAYINLA' : 'DEĞİŞİKLİK YOK')}
          </button>
        </div>

        {/* Tab Navigation */}
        {!selectedItem && (
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' }}>
            <button onClick={() => setActiveTab('links')} style={{ flex: '1 0 33%', padding: '0.8rem 0', background: 'transparent', border: 'none', color: activeTab === 'links' ? 'var(--color-gold)' : 'var(--color-text-muted)', borderBottom: activeTab === 'links' ? '2px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.05)', fontWeight: activeTab === 'links' ? '700' : '500', cursor: 'pointer', fontSize: '0.85rem' }}>Linkler</button>
            <button onClick={() => setActiveTab('products')} style={{ flex: '1 0 33%', padding: '0.8rem 0', background: 'transparent', border: 'none', color: activeTab === 'products' ? 'var(--color-gold)' : 'var(--color-text-muted)', borderBottom: activeTab === 'products' ? '2px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.05)', fontWeight: activeTab === 'products' ? '700' : '500', cursor: 'pointer', fontSize: '0.85rem' }}>Katalog</button>
            <button onClick={() => setActiveTab('categories')} style={{ flex: '1 0 33%', padding: '0.8rem 0', background: 'transparent', border: 'none', color: activeTab === 'categories' ? 'var(--color-gold)' : 'var(--color-text-muted)', borderBottom: activeTab === 'categories' ? '2px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.05)', fontWeight: activeTab === 'categories' ? '700' : '500', cursor: 'pointer', fontSize: '0.85rem' }}>Kategoriler</button>
            <button onClick={() => setActiveTab('bank_accounts')} style={{ flex: '1 0 50%', padding: '0.8rem 0', background: 'transparent', border: 'none', color: activeTab === 'bank_accounts' ? 'var(--color-gold)' : 'var(--color-text-muted)', borderBottom: activeTab === 'bank_accounts' ? '2px solid var(--color-gold)' : '2px solid transparent', fontWeight: activeTab === 'bank_accounts' ? '700' : '500', cursor: 'pointer', fontSize: '0.85rem' }}>Hesaplar (IBAN)</button>
            <button onClick={() => setActiveTab('settings')} style={{ flex: '1 0 50%', padding: '0.8rem 0', background: 'transparent', border: 'none', color: activeTab === 'settings' ? 'var(--color-gold)' : 'var(--color-text-muted)', borderBottom: activeTab === 'settings' ? '2px solid var(--color-gold)' : '2px solid transparent', fontWeight: activeTab === 'settings' ? '700' : '500', cursor: 'pointer', fontSize: '0.85rem' }}>Site Ayarları</button>
          </div>
        )}

        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem' }}>
          
          {/* ----- ITEM EDIT FORM OVERLAY ----- */}
          {selectedItem && (
             <div style={{ animation: 'modal-slide 0.2s ease-out' }}>
               <button onClick={() => setSelectedItem(null)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> Listeye Dön</button>
               <h4 style={{ color: 'var(--color-gold)', marginBottom: '1.2rem', fontFamily: 'var(--font-serif)' }}>{selectedItem.id === 'new' ? 'YENİ ÖĞE' : 'ÖĞEYİ DÜZENLE'}</h4>
               
               {activeTab === 'links' && (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div><label className="bank-detail-label">İkon Seçin</label><IconPicker selectedIcon={selectedItem.icon_name} onSelect={(val) => updateLinkField('icon_name', val)} /></div>
                    <div><label className="bank-detail-label">Link Başlığı</label><input type="text" className="calc-input" style={{ width: '100%' }} value={selectedItem.title || ''} onChange={(e) => updateLinkField('title', e.target.value)} /></div>
                    <div><label className="bank-detail-label">Bağlantı (URL)</label><input type="text" className="calc-input" style={{ width: '100%' }} value={selectedItem.url || ''} onChange={(e) => updateLinkField('url', e.target.value)} /></div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '0.8rem', color: '#fff' }}><input type="checkbox" checked={selectedItem.is_featured || false} onChange={(e) => updateLinkField('is_featured', e.target.checked)} style={{ width: '16px', height: '16px' }} /> Öne Çıkar (Altın Işıma Efekti)</label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', color: '#fff' }}><input type="checkbox" checked={selectedItem.is_active ?? true} onChange={(e) => updateLinkField('is_active', e.target.checked)} style={{ width: '16px', height: '16px' }} /> Sitede Görünsün</label>
                    </div>
                    <button onClick={applyItemToLocalState} className="product-price-button" style={{ padding: '0.9rem', marginTop: '0.5rem' }}>BİTTİ (Listeye Dön)</button>
                 </div>
               )}

               {activeTab === 'products' && (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    <div style={{ background: 'rgba(212,175,55,0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.3)', marginBottom: '0.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', color: '#fff', fontWeight: 'bold' }}>
                        <input type="checkbox" checked={selectedItem.is_pdf_catalog || false} onChange={(e) => updateProductField('is_pdf_catalog', e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--color-gold)' }} />
                        Bu Bir Dijital/PDF Katalog
                      </label>
                      <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.4rem', marginLeft: '1.8rem' }}>Eğer bu işaretliyse, ürüne tıklandığında detay penceresi yerine doğrudan yüklediğiniz PDF dosyası açılır.</p>
                    </div>

                    <div><label className="bank-detail-label">{selectedItem.is_pdf_catalog ? 'Katalog / Koleksiyon Adı' : 'Ürün Adı'}</label><input type="text" className="calc-input" style={{ width: '100%' }} value={selectedItem.title || ''} onChange={(e) => updateProductField('title', e.target.value)} /></div>
                    
                    <div>
                      <label className="bank-detail-label">Kategori</label>
                      <select className="calc-select" style={{ width: '100%' }} value={selectedItem.category || ''} onChange={(e) => updateProductField('category', e.target.value)}>
                        {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                        {categories.length === 0 && <option value="genel">Önce kategori ekleyin</option>}
                      </select>
                    </div>

                    <FileInput label={selectedItem.is_pdf_catalog ? "Katalog Kapak Görseli" : "Ürün Görseli"} currentUrl={selectedItem.image} onUpload={(url) => updateProductField('image', url)} accept="image/*" />

                    {selectedItem.is_pdf_catalog && (
                      <FileInput label="PDF Kataloğu Yükle" currentUrl={selectedItem.pdf_url} onUpload={(url) => updateProductField('pdf_url', url)} accept=".pdf" />
                    )}

                    {!selectedItem.is_pdf_catalog && (
                      <>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <div style={{ flex: 1 }}><label className="bank-detail-label">Ürün Kodu</label><input type="text" className="calc-input" style={{ width: '100%' }} value={selectedItem.code || ''} onChange={(e) => updateProductField('code', e.target.value)} /></div>
                          <div style={{ flex: 1 }}><label className="bank-detail-label">Ağırlık</label><input type="text" className="calc-input" style={{ width: '100%' }} value={selectedItem.weight || ''} onChange={(e) => updateProductField('weight', e.target.value)} /></div>
                        </div>
                        <div><label className="bank-detail-label">Ayar / Malzeme</label><input type="text" className="calc-input" style={{ width: '100%' }} value={selectedItem.carat || ''} onChange={(e) => updateProductField('carat', e.target.value)} /></div>
                        <div><label className="bank-detail-label">Açıklama</label><textarea className="calc-input" rows="3" style={{ resize: 'vertical', width: '100%' }} value={selectedItem.description || ''} onChange={(e) => updateProductField('description', e.target.value)} /></div>
                      </>
                    )}
                    
                    <button onClick={applyItemToLocalState} className="product-price-button" style={{ padding: '0.9rem', marginTop: '0.5rem' }}>BİTTİ (Listeye Dön)</button>
                 </div>
               )}

               {activeTab === 'categories' && (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div><label className="bank-detail-label">Kategori Adı</label><input type="text" className="calc-input" style={{ width: '100%' }} value={selectedItem.name || ''} onChange={(e) => updateCategoryField('name', e.target.value)} /></div>
                    <button onClick={applyItemToLocalState} className="product-price-button" style={{ padding: '0.9rem', marginTop: '0.5rem' }}>BİTTİ (Listeye Dön)</button>
                 </div>
               )}

               {activeTab === 'bank_accounts' && (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div><label className="bank-detail-label">Banka Adı (örn: Ziraat Bankası)</label><input type="text" className="calc-input" style={{ width: '100%' }} value={selectedItem.bank || ''} onChange={(e) => updateBankAccountField('bank', e.target.value)} /></div>
                    <div><label className="bank-detail-label">Alıcı Adı / Hesap Sahibi</label><input type="text" className="calc-input" style={{ width: '100%' }} value={selectedItem.holder || ''} onChange={(e) => updateBankAccountField('holder', e.target.value)} /></div>
                    <div><label className="bank-detail-label">Şube Bilgisi (Opsiyonel)</label><input type="text" className="calc-input" style={{ width: '100%' }} value={selectedItem.branch || ''} onChange={(e) => updateBankAccountField('branch', e.target.value)} /></div>
                    <div><label className="bank-detail-label">IBAN Numarası</label><input type="text" className="calc-input" style={{ width: '100%' }} value={selectedItem.iban || ''} onChange={(e) => updateBankAccountField('iban', e.target.value)} placeholder="TR..." /></div>
                    <button onClick={applyItemToLocalState} className="product-price-button" style={{ padding: '0.9rem', marginTop: '0.5rem' }}>BİTTİ (Listeye Dön)</button>
                 </div>
               )}
             </div>
          )}

          {/* ----- LISTS VIEW ----- */}
          {!selectedItem && activeTab === 'links' && (
            <div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginBottom: '1rem' }}>Sürükleyerek sıralarını değiştirebilirsiniz.</p>
              {links.map((link, idx) => <DraggableListItem key={link.id} item={link} index={idx} type="links" isActive={false} onDragStart={handleDragStart} onDragEnter={handleDragEnter} onDragEnd={handleDragEnd} onClick={setSelectedItem} onRemove={(id) => handleRemoveItem(id, 'links')} />)}
              <button onClick={() => setSelectedItem({ id: 'new', title: '', url: '', is_featured: false, is_active: true, icon_name: 'globe' })} className="product-price-button" style={{ width: '100%', padding: '0.8rem', marginTop: '1rem', background: 'transparent', border: '1px dashed var(--color-gold)', color: 'var(--color-gold)' }}>+ YENİ LİNK EKLE</button>
            </div>
          )}

          {!selectedItem && activeTab === 'products' && (
            <div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginBottom: '1rem' }}>Sürükleyerek sıralarını değiştirebilirsiniz.</p>
              {products.map((prod, idx) => <DraggableListItem key={prod.id} item={prod} index={idx} type="products" isActive={false} onDragStart={handleDragStart} onDragEnter={handleDragEnter} onDragEnd={handleDragEnd} onClick={setSelectedItem} onRemove={(id) => handleRemoveItem(id, 'products')} />)}
              <button onClick={() => setSelectedItem({ id: 'new', title: '', category: categories[0]?.name || '', code: '', weight: '', carat: '', image: '', description: '', is_pdf_catalog: false, pdf_url: '' })} className="product-price-button" style={{ width: '100%', padding: '0.8rem', marginTop: '1rem', background: 'transparent', border: '1px dashed var(--color-gold)', color: 'var(--color-gold)' }}>+ YENİ ÜRÜN / KATALOG EKLE</button>
            </div>
          )}

          {!selectedItem && activeTab === 'categories' && (
            <div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginBottom: '1rem' }}>Kategorileri sürükleyerek katalogdaki tab sırasını belirleyebilirsiniz.</p>
              {categories.map((cat, idx) => <DraggableListItem key={cat.id} item={{...cat, title: cat.name}} index={idx} type="categories" isActive={false} onDragStart={handleDragStart} onDragEnter={handleDragEnter} onDragEnd={handleDragEnd} onClick={(item) => setSelectedItem({...item, id: item.id, name: item.title})} onRemove={(id) => handleRemoveItem(id, 'categories')} />)}
              <button onClick={() => setSelectedItem({ id: 'new', name: '' })} className="product-price-button" style={{ width: '100%', padding: '0.8rem', marginTop: '1rem', background: 'transparent', border: '1px dashed var(--color-gold)', color: 'var(--color-gold)' }}>+ YENİ KATEGORİ EKLE</button>
            </div>
          )}

          {!selectedItem && activeTab === 'bank_accounts' && (
            <div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginBottom: '1rem' }}>Banka hesaplarını sürükleyerek IBAN penceresindeki sırasını belirleyebilirsiniz.</p>
              {bankAccounts.map((bank, idx) => <DraggableListItem key={bank.id} item={{...bank, title: bank.holder}} index={idx} type="bank_accounts" isActive={false} onDragStart={handleDragStart} onDragEnter={handleDragEnter} onDragEnd={handleDragEnd} onClick={(item) => setSelectedItem({...item, id: item.id})} onRemove={(id) => handleRemoveItem(id, 'bank_accounts')} />)}
              <button onClick={() => setSelectedItem({ id: 'new', bank: '', holder: '', branch: '', iban: '' })} className="product-price-button" style={{ width: '100%', padding: '0.8rem', marginTop: '1rem', background: 'transparent', border: '1px dashed var(--color-gold)', color: 'var(--color-gold)' }}>+ YENİ BANKA HESABI EKLE</button>
            </div>
          )}

          {!selectedItem && activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div><label className="bank-detail-label">Site Başlığı / Marka Adı</label><input type="text" className="calc-input" style={{ width: '100%' }} value={settings.site_name || ''} onChange={(e) => updateSettingField('site_name', e.target.value)} /></div>
              
              <FileInput label="Site Logosu" currentUrl={settings.logo_url} onUpload={(url) => updateSettingField('logo_url', url)} accept="image/*" />
              
              <div><label className="bank-detail-label">WhatsApp Sipariş Numarası</label><input type="text" className="calc-input" style={{ width: '100%' }} value={settings.whatsapp_number} onChange={(e) => updateSettingField('whatsapp_number', e.target.value)} /></div>
              <div><label className="bank-detail-label">Mağaza Showroom Adresi</label><textarea className="calc-input" style={{ width: '100%', resize: 'vertical' }} rows="2" value={settings.address} onChange={(e) => updateSettingField('address', e.target.value)} /></div>
              <div><label className="bank-detail-label">Çalışma Saatleri</label><input type="text" className="calc-input" style={{ width: '100%' }} value={settings.working_hours} onChange={(e) => updateSettingField('working_hours', e.target.value)} /></div>
              
              <FileInput label="Arka Plan Videosu (.mp4)" currentUrl={settings.bg_video_url} onUpload={(url) => updateSettingField('bg_video_url', url)} accept="video/mp4" />

              <div>
                <label className="bank-detail-label">Arka Plan Videosunu Göster</label>
                <select className="calc-select" style={{ width: '100%' }} value={settings.show_video} onChange={(e) => updateSettingField('show_video', e.target.value)}>
                  <option value="true">Evet (Videolu Arka Plan)</option>
                  <option value="false">Hayır (Siyah Düz Renk Arka Plan)</option>
                </select>
              </div>
              {settings.show_video === 'true' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><label className="bank-detail-label">Video Opaklığı</label><span style={{ fontSize: '0.75rem', color: 'var(--color-gold)' }}>%{settings.video_opacity}</span></div>
                  <input type="range" min="0" max="100" value={settings.video_opacity} onChange={(e) => updateSettingField('video_opacity', e.target.value)} style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--color-gold)' }} />
                </div>
              )}
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><label className="bank-detail-label">Menü Butonları Opaklığı</label><span style={{ fontSize: '0.75rem', color: 'var(--color-gold)' }}>%{settings.button_opacity}</span></div>
                <input type="range" min="0" max="100" value={settings.button_opacity} onChange={(e) => updateSettingField('button_opacity', e.target.value)} style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--color-gold)' }} />
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* RIGHT SIDE (LIVE IFRAME PREVIEW) */}
      <main style={{ flexGrow: 1, backgroundColor: '#000', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '50px', background: '#0a0a0c', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <button onClick={() => setPreviewMode('mobile')} style={{ background: previewMode === 'mobile' ? 'rgba(212,175,55,0.1)' : 'transparent', color: previewMode === 'mobile' ? 'var(--color-gold)' : 'var(--color-text-muted)', border: previewMode === 'mobile' ? '1px solid var(--color-gold)' : '1px solid transparent', padding: '0.4rem 1rem', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg> Mobil</button>
          <button onClick={() => setPreviewMode('desktop')} style={{ background: previewMode === 'desktop' ? 'rgba(212,175,55,0.1)' : 'transparent', color: previewMode === 'desktop' ? 'var(--color-gold)' : 'var(--color-text-muted)', border: previewMode === 'desktop' ? '1px solid var(--color-gold)' : '1px solid transparent', padding: '0.4rem 1rem', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg> Bilgisayar</button>
        </div>

        <div style={{ flexGrow: 1, padding: previewMode === 'mobile' ? '1.5rem' : '0', display: 'flex', justifyContent: 'center', transition: 'all 0.3s ease' }}>
           <div style={{ width: '100%', maxWidth: previewMode === 'mobile' ? '480px' : '100%', height: '100%', borderRadius: previewMode === 'mobile' ? '30px' : '0', overflow: 'hidden', border: previewMode === 'mobile' ? '10px solid #1a1a1f' : 'none', boxShadow: previewMode === 'mobile' ? '0 0 40px rgba(0,0,0,0.5)' : 'none', backgroundColor: '#070708', position: 'relative', transition: 'all 0.3s ease' }}>
              {hasUnsavedChanges && <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(212,175,55,0.95)', color: '#000', padding: '0.5rem 1.2rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', zIndex: 9999, boxShadow: '0 4px 15px rgba(212,175,55,0.3)', pointerEvents: 'none' }}>Değişiklikleri görmek için KAYDET'e basın</div>}
              <iframe ref={iframeRef} src={activeTab === 'products' || activeTab === 'categories' ? '/catalog?preview=true' : (activeTab === 'bank_accounts' ? '/?preview=true&openIban=true' : '/?preview=true')} style={{ width: '100%', height: '100%', border: 'none' }} title="Live Preview" />
           </div>
        </div>
      </main>

      {toastMsg && <div className="toast-msg">{toastMsg}</div>}
    </div>
  );
}
