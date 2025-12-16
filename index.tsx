import React, { useState, useEffect, ChangeEvent, FormEvent, DragEvent, useRef } from 'react';
import { createRoot } from 'react-dom/client';

// --- Constants ---
const PHONE_DISPLAY = "(31) 97214-4254";
const PHONE_WHATSAPP = "5531972144254";

// --- Types ---
type ViewState = 'home' | 'contact' | 'admin' | 'login';

interface Address {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface FormData {
  name: string;
  phone: string;
  serviceType: string;
  description: string;
  date: string;
  address: Address;
}

interface BudgetRequest extends FormData {
  id: number;
  status: 'pending' | 'contacted';
  createdAt: string;
}

interface GalleryItem {
  id: number;
  url: string;
  title: string;
}

// --- Icons ---
const IconMenu = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;
const IconX = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconPhone = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
const IconMapPin = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const IconInstagram = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
const IconFacebook = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
const IconTrash = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const IconCheck = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconLock = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const IconUpload = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>;

// --- MOCK API SERVICE ---
// In a real scenario, these would be fetch() calls to PHP files (e.g., api/get_requests.php, api/add_gallery.php)
// Since we don't have a backend here, we use localStorage to simulate the PHP/MySQL behavior.

const MockService = {
  getGallery: (): GalleryItem[] => {
    const stored = localStorage.getItem('solinelson_gallery');
    if (stored) return JSON.parse(stored);
    return [
      { id: 1, title: 'Instalação Hidráulica', url: 'https://images.unsplash.com/photo-1581094794329-cd8119608f84?auto=format&fit=crop&w=400&q=80' },
      { id: 2, title: 'Reforma de Banheiro', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80' },
      { id: 3, title: 'Pintura Residencial', url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80' },
      { id: 4, title: 'Reparo Elétrico', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80' },
    ];
  },
  
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => {
    const current = MockService.getGallery();
    const newItem = { ...item, id: Date.now() };
    localStorage.setItem('solinelson_gallery', JSON.stringify([...current, newItem]));
    return newItem;
  },

  deleteGalleryItem: (id: number) => {
    const current = MockService.getGallery();
    localStorage.setItem('solinelson_gallery', JSON.stringify(current.filter(i => i.id !== id)));
  },

  getRequests: (): BudgetRequest[] => {
    const stored = localStorage.getItem('solinelson_requests');
    if (stored) return JSON.parse(stored);
    return [];
  },

  addRequest: (data: FormData) => {
    const current = MockService.getRequests();
    const newRequest: BudgetRequest = {
      ...data,
      id: Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('solinelson_requests', JSON.stringify([newRequest, ...current]));
    return newRequest;
  },

  updateRequestStatus: (id: number, status: 'pending' | 'contacted') => {
    const current = MockService.getRequests();
    const updated = current.map(r => r.id === id ? { ...r, status } : r);
    localStorage.setItem('solinelson_requests', JSON.stringify(updated));
  }
};

// --- Components ---

const Header = ({ setView, currentView }: { setView: (v: ViewState) => void, currentView: ViewState }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simple admin logout helper
  const handleLogout = () => {
    setView('home');
  };

  return (
    <header className={isScrolled ? 'scrolled' : ''} style={{
      position: 'sticky', top: 0, zIndex: 1000, backgroundColor: isScrolled ? 'rgba(255,255,255,0.85)' : 'white', 
      boxShadow: isScrolled ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px' }}>
        <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => setView('home')}>
          <img 
            src="https://img.codigo1615.com.br/uploads/images/solinelson/img_69404f28a5cc39.27517907.webp" 
            alt="Solinelson Logo" 
            style={{ height: '50px', objectFit: 'contain' }}
          />
        </div>

        {/* Desktop Nav */}
        <nav style={{ display: 'none', gap: '30px', alignItems: 'center' }} className="desktop-nav">
          {currentView === 'admin' ? (
            <>
               <span style={{fontWeight: 600, color: 'var(--primary)'}}>Painel Administrativo</span>
               <button className="btn btn-outline" style={{borderColor: '#333', color: '#333', padding: '8px 16px'}} onClick={handleLogout}>Sair</button>
            </>
          ) : (
            <>
              <a href="#" onClick={(e) => { e.preventDefault(); setView('home'); }} style={{ color: currentView === 'home' ? 'var(--primary)' : 'var(--text)', fontWeight: 600 }}>Início</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setView('home'); setTimeout(() => document.getElementById('servicos')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Serviços</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setView('home'); setTimeout(() => document.getElementById('galeria')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Galeria</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setView('home'); setTimeout(() => document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Sobre</a>
              <button className="btn btn-primary" onClick={() => setView('contact')}>Solicitar Orçamento</button>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          style={{ display: 'block', background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }} 
          className="mobile-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <IconX /> : <IconMenu />}
        </button>

        {/* Styles for responsive nav */}
        <style>{`
          @media (min-width: 768px) {
            .desktop-nav { display: flex !important; }
            .mobile-toggle { display: none !important; }
          }
        `}</style>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          backgroundColor: 'white', padding: '20px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          display: 'flex', flexDirection: 'column', gap: '15px'
        }}>
          {currentView === 'admin' ? (
             <button className="btn btn-outline" style={{borderColor: '#333', color: '#333'}} onClick={() => { setIsMenuOpen(false); handleLogout(); }}>Sair do Admin</button>
          ) : (
            <>
              <a href="#" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); setView('home'); }}>Início</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); setView('home'); setTimeout(() => document.getElementById('servicos')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Serviços</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); setView('home'); setTimeout(() => document.getElementById('galeria')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Galeria</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setIsMenuOpen(false); setView('home'); setTimeout(() => document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>Sobre</a>
              <button className="btn btn-primary" onClick={() => { setIsMenuOpen(false); setView('contact'); }}>Solicitar Orçamento</button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

const Footer = ({ setView }: { setView: (v: ViewState) => void }) => (
  <footer style={{ backgroundColor: '#1a1a1a', color: '#ffffff', paddingTop: '60px', paddingBottom: '30px' }}>
    <div className="container">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', marginBottom: '40px' }}>
        <div>
          <h3 style={{ color: 'var(--primary)', marginBottom: '20px', fontSize: '1.5rem' }}>Solinelson</h3>
          <p style={{ color: '#cccccc', marginBottom: '20px' }}>
            Soluções profissionais de manutenção e construção para sua residência ou empresa. Qualidade e confiança garantidas.
          </p>
          <div style={{ display: 'flex', gap: '15px' }}>
             {/* Social Icons Placeholder */}
             <div style={{ width: 36, height: 36, background: '#333', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconInstagram /></div>
             <div style={{ width: 36, height: 36, background: '#333', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconFacebook /></div>
          </div>
        </div>
        
        <div>
          <h4 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Links Rápidos</h4>
          <ul style={{ listStyle: 'none' }}>
            <li style={{ marginBottom: '10px' }}><a href="#" onClick={(e) => { e.preventDefault(); setView('home'); }} style={{ color: '#ccc' }}>Início</a></li>
            <li style={{ marginBottom: '10px' }}><a href="#" onClick={(e) => { e.preventDefault(); setView('home'); setTimeout(() => document.getElementById('servicos')?.scrollIntoView({ behavior: 'smooth' }), 100); }} style={{ color: '#ccc' }}>Serviços</a></li>
            <li style={{ marginBottom: '10px' }}><a href="#" onClick={(e) => { e.preventDefault(); setView('contact'); }} style={{ color: '#ccc' }}>Solicitar Orçamento</a></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Contato</h4>
          <ul style={{ listStyle: 'none' }}>
             <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', color: '#ccc' }}>
               <IconPhone />
               <span>{PHONE_DISPLAY}</span>
             </li>
             <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ccc' }}>
                <IconMapPin />
               <span>Pedro Leopoldo - MG</span>
             </li>
          </ul>
        </div>
      </div>
      
      <div style={{ borderTop: '1px solid #333', paddingTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', color: '#888', fontSize: '0.9rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <p>&copy; {new Date().getFullYear()} Solinelson - Marido de Aluguel.</p>
            <button 
            onClick={() => setView('login')} 
            style={{ background: 'none', border: 'none', color: '#444', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
            Área Administrativa
            </button>
        </div>
        
        <div style={{ textAlign: 'center' }}>
            <a href="https://www.codigo1615.com.br" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>Código 1615</a>
            <span style={{ margin: '0 8px' }}>-</span>
            <span>Desenvolvido com <span style={{ color: '#e25555' }}>❤</span> e <strong style={{ color: '#fff' }}>Excelência</strong></span>
        </div>
      </div>
    </div>
  </footer>
);

// --- Admin Components ---

const Login = ({ setView }: { setView: (v: ViewState) => void }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (password === 'admin') {
      setView('admin');
    } else {
      setError('Senha incorreta.');
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '80px 20px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '400px', width: '100%', backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: 'var(--shadow)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--primary)' }}> <IconLock /> Admin Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Senha</label>
            <input 
              type="password" 
              className="form-control" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha (admin)"
            />
          </div>
          {error && <p style={{ color: 'var(--error)', marginBottom: '15px' }}>{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Entrar</button>
        </form>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'gallery'>('requests');
  const [requests, setRequests] = useState<BudgetRequest[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  
  // Gallery Form State
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRequests(MockService.getRequests());
    setGallery(MockService.getGallery());
  }, []);

  const handleStatusChange = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'contacted' : 'pending';
    MockService.updateRequestStatus(id, newStatus as any);
    setRequests(MockService.getRequests());
  };

  // --- Gallery Logic (Drag and Drop) ---

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
        alert("Por favor, selecione apenas arquivos de imagem.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const result = e.target?.result as string;
        setNewPhotoUrl(result);
        if(!newPhotoTitle) {
             setNewPhotoTitle(file.name.split('.')[0]);
        }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        processFile(e.target.files[0]);
    }
  };

  const handleAddPhoto = (e: FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl || !newPhotoTitle) return;
    
    MockService.addGalleryItem({ title: newPhotoTitle, url: newPhotoUrl });
    setGallery(MockService.getGallery());
    setNewPhotoUrl('');
    setNewPhotoTitle('');
  };

  const handleDeletePhoto = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta foto?')) {
      MockService.deleteGalleryItem(id);
      setGallery(MockService.getGallery());
    }
  };

  return (
    <div className="admin-layout animate-fade-in">
      <div className="admin-sidebar">
        <h3 style={{ marginBottom: '20px', color: '#ccc' }}>Gerenciamento</h3>
        <div 
          className={`admin-menu-item ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Solicitações de Orçamento
        </div>
        <div 
          className={`admin-menu-item ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          Galeria de Fotos
        </div>
      </div>
      
      <div className="admin-content">
        {activeTab === 'requests' && (
          <div>
            <h2 style={{ marginBottom: '20px', color: 'var(--primary)' }}>Solicitações de Orçamento</h2>
            {requests.length === 0 ? (
              <p>Nenhuma solicitação encontrada.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Cliente</th>
                      <th>Serviço</th>
                      <th>WhatsApp</th>
                      <th>Status</th>
                      <th>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map(req => (
                      <tr key={req.id}>
                        <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                        <td>{req.name}</td>
                        <td>{req.serviceType}</td>
                        <td>{req.phone}</td>
                        <td>
                          <span className={`status-badge status-${req.status}`}>
                            {req.status === 'pending' ? 'Pendente' : 'Contatado'}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-outline" 
                            style={{ padding: '5px 10px', fontSize: '0.8rem', color: req.status === 'pending' ? 'var(--success)' : '#666', borderColor: req.status === 'pending' ? 'var(--success)' : '#ccc' }}
                            onClick={() => handleStatusChange(req.id, req.status)}
                          >
                            <IconCheck />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'gallery' && (
          <div>
            <h2 style={{ marginBottom: '20px', color: 'var(--primary)' }}>Gestão da Galeria</h2>
            
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: 'var(--shadow)' }}>
              <h4>Adicionar Nova Foto</h4>
              
              <div 
                className={`dropzone ${isDragging ? 'active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                  <div style={{ pointerEvents: 'none' }}>
                      <IconUpload />
                      <p style={{ marginTop: '10px', fontWeight: 600 }}>
                          Arraste e solte uma imagem aqui ou clique para selecionar
                      </p>
                      <p style={{ fontSize: '0.85rem', color: '#999' }}>Suporta JPG, PNG, WEBP</p>
                  </div>
              </div>

              {newPhotoUrl && (
                  <div style={{ marginBottom: '15px', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.9rem', marginBottom: '5px', color: '#666' }}>Pré-visualização:</p>
                      <img src={newPhotoUrl} alt="Preview" style={{ maxHeight: '150px', borderRadius: '8px', border: '1px solid #ddd' }} />
                  </div>
              )}

              <form onSubmit={handleAddPhoto} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Título da foto"
                  style={{ flex: 1, minWidth: '200px' }}
                  value={newPhotoTitle}
                  onChange={e => setNewPhotoTitle(e.target.value)}
                  required
                />
                {/* Replaced URL input with hidden field or just logic, since we use the file reader now */}
                <button type="submit" className="btn btn-primary" disabled={!newPhotoUrl}>Adicionar Foto</button>
              </form>
            </div>

            <div className="gallery-grid">
              {gallery.map(item => (
                <div key={item.id} className="gallery-item">
                  <img src={item.url} alt={item.title} className="gallery-img" />
                  <div className="gallery-caption" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{item.title}</span>
                    <button 
                      onClick={() => handleDeletePhoto(item.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--error)' }}
                    >
                      <IconTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Pages ---

const Home = ({ setView }: { setView: (v: ViewState) => void }) => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    setGalleryItems(MockService.getGallery());
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(171, 91, 13, 0.9), rgba(227, 129, 48, 0.9)), url("https://images.unsplash.com/photo-1581094794329-cd8119608f84?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        padding: '120px 0',
        color: 'white',
        textAlign: 'center'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '20px', fontWeight: 700 }}>Soluções Profissionais para Sua Casa e Empresa</h1>
          <p style={{ fontSize: '1.25rem', marginBottom: '40px', maxWidth: '800px', margin: '0 auto 40px', opacity: 0.9 }}>
            Qualidade, rapidez e confiança em serviços de hidráulica, construção civil e manutenção geral.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              className="btn" 
              style={{ backgroundColor: 'white', color: 'var(--primary)' }}
              onClick={() => setView('contact')}
            >
              Solicitar Serviço
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => document.getElementById('servicos')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Conheça Nossos Serviços
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicos" style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="section-title">
            <h2>Nossos Serviços</h2>
            <p>Atendemos diversas necessidades com excelência profissional</p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '30px' 
          }}>
            {/* Hydraulic */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '30px', 
              borderRadius: '12px', 
              boxShadow: 'var(--shadow)',
              transition: 'transform 0.3s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔧</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: 'var(--primary)' }}>Serviços Hidráulicos</h3>
              <ul style={{ listStyle: 'none', color: '#666' }}>
                <li style={{ marginBottom: '8px' }}>• Instalações de torneiras</li>
                <li style={{ marginBottom: '8px' }}>• Reparos de vazamentos</li>
                <li style={{ marginBottom: '8px' }}>• Desentupimento</li>
                <li style={{ marginBottom: '8px' }}>• Instalação de chuveiros</li>
                <li style={{ marginBottom: '8px' }}>• Manutenção de caixas d'água</li>
              </ul>
            </div>

            {/* Construction */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '30px', 
              borderRadius: '12px', 
              boxShadow: 'var(--shadow)',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🏗️</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: 'var(--primary)' }}>Construção Civil</h3>
              <ul style={{ listStyle: 'none', color: '#666' }}>
                <li style={{ marginBottom: '8px' }}>• Alvenaria profissional</li>
                <li style={{ marginBottom: '8px' }}>• Assentamento de porcelanato</li>
                <li style={{ marginBottom: '8px' }}>• Revestimentos em geral</li>
                <li style={{ marginBottom: '8px' }}>• Construção de muros</li>
                <li style={{ marginBottom: '8px' }}>• Reformas e ampliações</li>
              </ul>
            </div>

            {/* General Maintenance */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '30px', 
              borderRadius: '12px', 
              boxShadow: 'var(--shadow)',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🛠️</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: 'var(--primary)' }}>Manutenção Geral</h3>
              <ul style={{ listStyle: 'none', color: '#666' }}>
                <li style={{ marginBottom: '8px' }}>• Instalação de portas e janelas</li>
                <li style={{ marginBottom: '8px' }}>• Pintura residencial</li>
                <li style={{ marginBottom: '8px' }}>• Montagem de móveis</li>
                <li style={{ marginBottom: '8px' }}>• Instalação de prateleiras</li>
                <li style={{ marginBottom: '8px' }}>• Pequenos reparos gerais</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="galeria" style={{ backgroundColor: '#f5f5f5', padding: '80px 0' }}>
        <div className="container">
          <div className="section-title">
            <h2>Galeria de Serviços</h2>
            <p>Confira alguns dos nossos trabalhos realizados com excelência</p>
          </div>
          
          <div className="gallery-grid">
            {galleryItems.map(item => (
              <div key={item.id} className="gallery-item">
                <img src={item.url} alt={item.title} className="gallery-img" loading="lazy" />
                <div className="gallery-caption">
                  {item.title}
                </div>
              </div>
            ))}
          </div>
          {galleryItems.length === 0 && <p style={{textAlign: 'center'}}>Nenhuma foto disponível no momento.</p>}
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="sobre" style={{ backgroundColor: 'white', padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '50px', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', color: 'var(--primary)' }}>Por Que Escolher a Solinelson?</h2>
              <p style={{ color: '#666', marginBottom: '30px', fontSize: '1.1rem' }}>
                Com anos de experiência no mercado, oferecemos um serviço diferenciado focado na satisfação total do cliente. 
                Nossa equipe é treinada para resolver seus problemas com eficiência e limpeza.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'green', fontSize: '1.2rem', fontWeight: 'bold' }}>✓</span> Profissionais Qualificados
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'green', fontSize: '1.2rem', fontWeight: 'bold' }}>⏰</span> Pontualidade
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'green', fontSize: '1.2rem', fontWeight: 'bold' }}>💰</span> Preços Justos
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'green', fontSize: '1.2rem', fontWeight: 'bold' }}>🛡️</span> Garantia dos Serviços
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <img 
                src="https://img.codigo1615.com.br/uploads/images/solinelson/img_69404f28a5cc39.27517907.webp" 
                alt="Solinelson Logo Large"
                style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, var(--secondary), var(--primary))', 
        padding: '80px 0',
        textAlign: 'center',
        color: 'white'
      }}>
        <div className="container">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Precisa de um orçamento?</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '30px', maxWidth: '700px', margin: '0 auto 30px' }}>
            Não perca tempo com problemas em casa. Entre em contato agora mesmo e resolva tudo com rapidez e economia.
          </p>
          <button 
            className="btn" 
            style={{ backgroundColor: 'white', color: 'var(--primary)', fontSize: '1.1rem', padding: '15px 40px' }}
            onClick={() => setView('contact')}
          >
            SOLICITAR ORÇAMENTO GRÁTIS
          </button>
        </div>
      </section>
    </div>
  );
};

const Contact = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    serviceType: '',
    description: '',
    date: '',
    address: {
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: ''
    }
  });

  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Masks and Input Handlers
  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    // Mask (00) 00000-0000
    if (value.length > 2) value = `(${value.slice(0,2)}) ${value.slice(2)}`;
    if (value.length > 9) value = `${value.slice(0,10)}-${value.slice(10)}`;
    
    setFormData(prev => ({ ...prev, phone: value }));
  };

  const handleCepChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    
    // Mask 00000-000
    if (value.length > 5) value = `${value.slice(0,5)}-${value.slice(5)}`;
    
    setFormData(prev => ({ ...prev, address: { ...prev.address, cep: value } }));
    setCepError('');
  };

  const fetchCep = async () => {
    const rawCep = formData.address.cep.replace(/\D/g, '');
    if (rawCep.length !== 8) {
      setCepError('CEP inválido. Digite 8 números.');
      return;
    }

    setLoadingCep(true);
    setCepError('');

    try {
      const response = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        setCepError('CEP não encontrado.');
      } else {
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf
          }
        }));
      }
    } catch (err) {
      setCepError('Erro ao buscar CEP. Tente novamente.');
    } finally {
      setLoadingCep(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. Save to "Database" (Mock API)
    MockService.addRequest(formData);

    // 2. Prepare WhatsApp Message
    const message = `
🔧 *NOVA SOLICITAÇÃO DE SERVIÇO* 🔧

👤 *DADOS DO CLIENTE*
━━━━━━━━━━━━━━━━━━━━
📝 Nome: ${formData.name}
📱 WhatsApp: ${formData.phone}

🛠️ *INFORMAÇÕES DO SERVIÇO*
━━━━━━━━━━━━━━━━━━━━
🔹 Tipo: ${formData.serviceType}
📋 Descrição: ${formData.description}

📅 *AGENDAMENTO*
━━━━━━━━━━━━━━━━━━━━
📆 Data/Hora: ${new Date(formData.date).toLocaleString('pt-BR')}

📍 *ENDEREÇO DO SERVIÇO*
━━━━━━━━━━━━━━━━━━━━
${formData.address.street}, ${formData.address.number} ${formData.address.complement ? `- ${formData.address.complement}` : ''}
${formData.address.neighborhood}, ${formData.address.city}/${formData.address.state}
CEP: ${formData.address.cep}

━━━━━━━━━━━━━━━━━━━━
✅ Aguardo seu retorno!
    `.trim();

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${PHONE_WHATSAPP}?text=${encodedMessage}`;
    
    // Simulate API delay then redirect
    setTimeout(() => {
        setIsSubmitting(false);
        window.open(whatsappUrl, '_blank');
    }, 1000);
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '60px 20px', maxWidth: '800px' }}>
      <div className="section-title">
        <h2>Solicitar Orçamento</h2>
        <p>Preencha o formulário abaixo e entraremos em contato.</p>
        <p style={{ marginTop: '10px', fontWeight: 'bold', color: 'var(--primary)' }}>
           Ou contate-nos diretamente: {PHONE_DISPLAY}
        </p>
      </div>

      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: 'var(--shadow)' }}>
        <form onSubmit={handleSubmit}>
          
          <h3 style={{ marginBottom: '20px', color: 'var(--secondary)', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>1. Dados do Cliente</h3>
          <div className="form-group">
            <label className="form-label">Nome Completo *</label>
            <input 
              type="text" 
              className="form-control" 
              required 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">WhatsApp *</label>
            <input 
              type="tel" 
              className="form-control" 
              required 
              placeholder="(00) 00000-0000"
              value={formData.phone}
              onChange={handlePhoneChange}
            />
          </div>

          <h3 style={{ margin: '30px 0 20px', color: 'var(--secondary)', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>2. Informações do Serviço</h3>
          <div className="form-group">
            <label className="form-label">Tipo de Serviço *</label>
            <select 
              className="form-control" 
              required
              value={formData.serviceType}
              onChange={e => setFormData({...formData, serviceType: e.target.value})}
            >
              <option value="">Selecione uma opção...</option>
              <option value="Hidráulica">Hidráulica</option>
              <option value="Construção Civil">Construção Civil</option>
              <option value="Manutenção Geral">Manutenção Geral</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Descrição Detalhada *</label>
            <textarea 
              className="form-control" 
              required 
              placeholder="Descreva o que precisa ser feito..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>
          <div className="form-group">
            <label className="form-label">Data e Horário de Preferência *</label>
            <input 
              type="datetime-local" 
              className="form-control" 
              required
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>

          <h3 style={{ margin: '30px 0 20px', color: 'var(--secondary)', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>3. Endereço do Serviço</h3>
          <div className="form-group">
            <label className="form-label">CEP *</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                className="form-control" 
                required 
                placeholder="00000-000"
                value={formData.address.cep}
                onChange={handleCepChange}
              />
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={fetchCep}
                disabled={loadingCep}
              >
                {loadingCep ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
            {cepError && <p style={{ color: 'var(--error)', fontSize: '0.9rem', marginTop: '5px' }}>{cepError}</p>}
          </div>

          <div className="form-row form-row-address">
            <div className="form-group">
              <label className="form-label">Rua</label>
              <input 
                type="text" 
                className="form-control" 
                readOnly
                style={{ backgroundColor: '#f5f5f5' }}
                value={formData.address.street}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Número *</label>
              <input 
                type="text" 
                className="form-control" 
                required
                value={formData.address.number}
                onChange={e => setFormData(prev => ({ ...prev, address: { ...prev.address, number: e.target.value } }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Complemento</label>
            <input 
              type="text" 
              className="form-control"
              value={formData.address.complement}
              onChange={e => setFormData(prev => ({ ...prev, address: { ...prev.address, complement: e.target.value } }))}
            />
          </div>

          <div className="form-row form-row-location">
            <div className="form-group">
              <label className="form-label">Bairro</label>
              <input 
                type="text" 
                className="form-control" 
                readOnly
                style={{ backgroundColor: '#f5f5f5' }}
                value={formData.address.neighborhood}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Cidade</label>
              <input 
                type="text" 
                className="form-control" 
                readOnly
                style={{ backgroundColor: '#f5f5f5' }}
                value={formData.address.city}
              />
            </div>
            <div className="form-group">
              <label className="form-label">UF</label>
              <input 
                type="text" 
                className="form-control" 
                readOnly
                style={{ backgroundColor: '#f5f5f5' }}
                value={formData.address.state}
              />
            </div>
          </div>

          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', maxWidth: '400px', fontSize: '1.2rem', padding: '15px' }} disabled={isSubmitting}>
              {isSubmitting ? 'Registrando e Enviando...' : 'ENVIAR SOLICITAÇÃO VIA WHATSAPP'}
            </button>
            <p style={{ marginTop: '15px', color: '#888', fontSize: '0.9rem' }}>
              Ao clicar, seu pedido será registrado em nosso sistema e você será redirecionado para o WhatsApp.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
};

// --- App ---

const App = () => {
  const [view, setView] = useState<ViewState>('home');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  return (
    <>
      <Header setView={setView} currentView={view} />
      <main style={{ minHeight: 'calc(100vh - 300px)' }}>
        {view === 'home' && <Home setView={setView} />}
        {view === 'contact' && <Contact />}
        {view === 'login' && <Login setView={setView} />}
        {view === 'admin' && <AdminPanel />}
      </main>
      <Footer setView={setView} />
    </>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);