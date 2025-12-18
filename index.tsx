import React, { useState, useEffect, ChangeEvent, FormEvent, DragEvent, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

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
  email?: string;
  status: 'pending' | 'contacted' | 'budgeted' | 'approved' | 'rejected' | 'completed';
  budgetValue?: number;
  isApproved?: boolean;
  executionDate?: string;
  budgetSentAt?: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
}

interface Album {
  id: number;
  title: string;
  description: string;
  main_photo_url: string;
  main_photo_width: number;
  main_photo_height: number;
  photo_count: number;
  is_featured: boolean;
  display_order: number;
}

interface AlbumPhoto {
  id: number;
  album_id: number;
  url: string;
  title: string;
  width: number;
  height: number;
  display_order: number;
}

interface NewAlbumForm {
  title: string;
  description: string;
  photos: Array<{
    url: string;
    title: string;
    width: number;
    height: number;
  }>;
  main_photo_index: number;
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

// --- API SERVICE ---
// Real API calls to PHP backend

// 🔧 Detecta automaticamente o ambiente
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:8000/api'  // Desenvolvimento
  : '/api';                        // Produção (mesmo domínio)

const APIService = {
  // Álbuns
  getAlbums: async (): Promise<Album[]> => {
    try {
      const response = await fetch(`${API_BASE}/get_albums.php`, {
        credentials: 'include'
      });
      const data = await response.json();
      return data.success ? data.albums : [];
    } catch (error) {
      console.error('Erro ao buscar álbuns:', error);
      return [];
    }
  },
  
  getAlbumPhotos: async (albumId: number): Promise<AlbumPhoto[]> => {
    try {
      const response = await fetch(`${API_BASE}/get_album_photos.php?album_id=${albumId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      return data.success ? data.photos : [];
    } catch (error) {
      console.error('Erro ao buscar fotos do álbum:', error);
      return [];
    }
  },

  addAlbum: async (album: NewAlbumForm): Promise<Album | null> => {
    try {
      const response = await fetch(`${API_BASE}/add_album.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(album)
      });
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Erro ao adicionar álbum:', error);
      return null;
    }
  },

  deleteAlbum: async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/delete_album.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id })
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Erro ao deletar álbum:', error);
      return false;
    }
  },

  // Solicitações
  getRequests: async (): Promise<BudgetRequest[]> => {
    try {
      const response = await fetch(`${API_BASE}/get_requests.php`, {
        credentials: 'include'
      });
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
      return [];
    }
  },

  addRequest: async (formData: FormData): Promise<BudgetRequest | null> => {
    try {
      const response = await fetch(`${API_BASE}/add_request.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        return {
          ...formData,
          id: data.data.id,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
      }
      return null;
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
      return null;
    }
  },

  updateRequestStatus: async (id: number, status: 'pending' | 'contacted'): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/update_request.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, status })
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      return false;
    }
  },

  // Orçamentos
  updateBudget: async (id: number, budgetData: Partial<BudgetRequest>): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/update_budget.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, ...budgetData })
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
      return false;
    }
  },

  approveBudget: async (id: number, isApproved: boolean): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/approve_budget.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, is_approved: isApproved })
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Erro ao aprovar/rejeitar orçamento:', error);
      return false;
    }
  },

  resendBudgetNotification: async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/resend_budget_notification.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id })
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Erro ao reenviar notificação:', error);
      return false;
    }
  },

  deleteBudget: async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/delete_budget.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id })
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Erro ao deletar orçamento:', error);
      return false;
    }
  },

  // Autenticação
  login: async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return false;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await fetch(`${API_BASE}/logout.php`, { 
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  },

  checkSession: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/check_session.php`, {
        credentials: 'include'
      });
      const data = await response.json();
      return data.authenticated || false;
    } catch (error) {
      return false;
    }
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
              <button 
                onClick={() => setView('login')} 
                style={{ background: 'none', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '8px', color: '#666', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                title="Área Administrativa"
              >
                <IconLock /> Admin
              </button>
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
              <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }} onClick={() => { setIsMenuOpen(false); setView('login'); }}>
                <IconLock /> Área Administrativa
              </button>
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
             <a 
               href="https://www.instagram.com/solinelsonmaridodealuguel_/" 
               target="_blank" 
               rel="noopener noreferrer"
               style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.3s ease' }}
               onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
               onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
             >
               <IconInstagram />
             </a>
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
        <p>&copy; {new Date().getFullYear()} Solinelson - Marido de Aluguel. Todos os direitos reservados.</p>
        
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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await APIService.login(username, password);
      if (success) {
        setView('admin');
      } else {
        setError('Usuário ou senha incorretos.');
      }
    } catch (err) {
      setError('Erro ao conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '80px 20px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '400px', width: '100%', backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: 'var(--shadow)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--primary)' }}> <IconLock /> Admin Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Usuário</label>
            <input 
              type="text" 
              className="form-control" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite o usuário"
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Senha</label>
            <input 
              type="password" 
              className="form-control" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha"
              required
              disabled={loading}
            />
          </div>
          {error && <p style={{ color: 'var(--error)', marginBottom: '15px' }}>{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'budgets' | 'albums'>('requests');
  const [requests, setRequests] = useState<BudgetRequest[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Budget editing state
  const [editingBudget, setEditingBudget] = useState<number | null>(null);
  const [budgetForm, setBudgetForm] = useState<Partial<BudgetRequest>>({});
  
  // Album Form State
  const [newAlbum, setNewAlbum] = useState<NewAlbumForm>({
    title: '',
    description: '',
    photos: [],
    main_photo_index: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [requestsData, albumsData] = await Promise.all([
        APIService.getRequests(),
        APIService.getAlbums()
      ]);
      setRequests(requestsData || []);
      setAlbums(albumsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setRequests([]);
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'pending' ? 'contacted' : 'pending';
    const success = await APIService.updateRequestStatus(id, newStatus as any);
    if (success) {
      loadData();
    } else {
      alert('Erro ao atualizar status');
    }
  };

  // --- Budget Management ---
  
  const handleEditBudget = (request: BudgetRequest) => {
    setEditingBudget(request.id);
    setBudgetForm({
      email: request.email || '',
      budget_value: request.budgetValue || 0,
      execution_date: request.executionDate || '',
      notes: request.notes || '',
      status: request.status
    });
  };

  const handleSaveBudget = async (id: number) => {
    const success = await APIService.updateBudget(id, {
      email: budgetForm.email,
      budgetValue: budgetForm.budget_value,
      executionDate: budgetForm.execution_date,
      notes: budgetForm.notes,
      status: budgetForm.status as any
    });
    
    if (success) {
      setEditingBudget(null);
      setBudgetForm({});
      loadData();
      alert('Orçamento atualizado com sucesso!');
    } else {
      alert('Erro ao atualizar orçamento');
    }
  };

  const handleApproveBudget = async (id: number, approve: boolean) => {
    if (approve && !confirm('Aprovar este orçamento? Um email será enviado ao cliente e ao admin.')) {
      return;
    }
    
    const success = await APIService.approveBudget(id, approve);
    if (success) {
      loadData();
      alert(approve ? 'Orçamento aprovado!' : 'Orçamento rejeitado');
    } else {
      alert('Erro ao processar aprovação');
    }
  };

  const handleResendEmail = async (id: number) => {
    if (!confirm('Reenviar email de orçamento para o cliente?')) return;
    
    const success = await APIService.resendBudgetNotification(id);
    if (success) {
      alert('Email reenviado com sucesso!');
    } else {
      alert('Erro ao reenviar email. Verifique os logs.');
    }
  };

  const handleDeleteBudget = async (id: number) => {
    if (!confirm('Tem certeza que deseja DELETAR este orçamento? Esta ação não pode ser desfeita!')) {
      return;
    }
    
    const success = await APIService.deleteBudget(id);
    if (success) {
      loadData();
      alert('Orçamento deletado com sucesso!');
    } else {
      alert('Erro ao deletar orçamento');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'status-pending',
      'contacted': 'status-contacted',
      'budgeted': 'status-budgeted',
      'approved': 'status-approved',
      'rejected': 'status-rejected',
      'completed': 'status-completed'
    };
    return statusMap[status] || 'status-pending';
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'pending': 'Pendente',
      'contacted': 'Contatado',
      'budgeted': 'Orçado',
      'approved': 'Aprovado',
      'rejected': 'Rejeitado',
      'completed': 'Concluído'
    };
    return labels[status] || status;
  };

  // --- Album Logic ---

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    await processFiles(files);
  };

  const processFiles = async (files: FileList) => {
    const photosWithDimensions: Array<{ url: string; title: string; width: number; height: number }> = [];

    const processFile = (file: File): Promise<{ url: string; title: string; width: number; height: number }> => {
      return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
          reject('Arquivo não é uma imagem');
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            resolve({
              url: event.target?.result as string,
              title: file.name.split('.')[0],
              width: img.width,
              height: img.height
            });
          };
          img.onerror = () => reject('Erro ao carregar imagem');
          img.src = event.target?.result as string;
        };
        reader.onerror = () => reject('Erro ao ler arquivo');
        reader.readAsDataURL(file);
      });
    };

    try {
      for (let i = 0; i < files.length; i++) {
        const photo = await processFile(files[i]);
        photosWithDimensions.push(photo);
      }

      setNewAlbum(prev => ({
        ...prev,
        photos: [...prev.photos, ...photosWithDimensions]
      }));
    } catch (error) {
      alert('Erro ao processar imagens: ' + error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFiles(files);
    }
  };

  const removePhoto = (index: number) => {
    setNewAlbum(prev => {
      const newPhotos = prev.photos.filter((_, i) => i !== index);
      return {
        ...prev,
        photos: newPhotos,
        main_photo_index: prev.main_photo_index >= newPhotos.length ? 0 : prev.main_photo_index
      };
    });
  };

  const handleAddAlbum = async (e: FormEvent) => {
    e.preventDefault();
    if (!newAlbum.title || newAlbum.photos.length === 0) {
      alert('Preencha o título e adicione pelo menos uma foto');
      return;
    }

    const result = await APIService.addAlbum(newAlbum);
    if (result) {
      loadData();
      setNewAlbum({ title: '', description: '', photos: [], main_photo_index: 0 });
      alert('Álbum criado com sucesso!');
    } else {
      alert('Erro ao adicionar álbum');
    }
  };

  const handleDeleteAlbum = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este álbum? Todas as fotos serão removidas.')) {
      const success = await APIService.deleteAlbum(id);
      if (success) {
        loadData();
        alert('Álbum excluído com sucesso!');
      } else {
        alert('Erro ao excluir álbum');
      }
    }
  };

  return (
    <div className="admin-layout animate-fade-in">
      <div className="admin-content">
        {/* Menu Tabs */}
        <div className="admin-tabs">
          <div 
            className={`admin-tab ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <span className="tab-icon">📋</span>
            <span className="tab-text">Solicitações</span>
          </div>
          <div 
            className={`admin-tab ${activeTab === 'budgets' ? 'active' : ''}`}
            onClick={() => setActiveTab('budgets')}
          >
            <span className="tab-icon">💰</span>
            <span className="tab-text">Orçamentos</span>
          </div>
          <div 
            className={`admin-tab ${activeTab === 'albums' ? 'active' : ''}`}
            onClick={() => setActiveTab('albums')}
          >
            <span className="tab-icon">📸</span>
            <span className="tab-text">Álbuns</span>
          </div>
        </div>
        
        {/* Content */}
        <div className="admin-content-area">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <div className="loading" style={{ margin: '0 auto 20px' }}></div>
            <p style={{ color: '#666' }}>Carregando dados...</p>
          </div>
        ) : (
          <>
        {activeTab === 'requests' && (
          <div>
            <h2 style={{ marginBottom: '20px', color: 'var(--primary)' }}>Solicitações de Orçamento</h2>
            {!requests || requests.length === 0 ? (
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

        {activeTab === 'budgets' && (
          <div>
            <h2 style={{ marginBottom: '20px', color: 'var(--primary)' }}>Gerenciamento de Orçamentos</h2>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              Gerencie os orçamentos das solicitações: defina valores, datas de execução e envie notificações por email.
            </p>
            
            {!requests || requests.length === 0 ? (
              <p>Nenhuma solicitação encontrada.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {requests.map(req => (
                  <div key={req.id} style={{ 
                    backgroundColor: 'white', 
                    padding: '20px', 
                    borderRadius: '8px', 
                    boxShadow: 'var(--shadow)',
                    border: req.isApproved ? '2px solid #4CAF50' : '1px solid #ddd'
                  }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 5px 0', color: 'var(--primary)' }}>
                          #{req.id} - {req.name}
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
                          📅 {new Date(req.createdAt).toLocaleDateString('pt-BR')} | 
                          📱 {req.phone} | 
                          📧 {req.email || 'Não informado'}
                        </p>
                      </div>
                      <span className={`status-badge ${getStatusBadgeClass(req.status)}`}>
                        {getStatusLabel(req.status)}
                      </span>
                    </div>

                    {/* Service Info */}
                    <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
                      <p style={{ margin: '0 0 5px 0' }}><strong>Serviço:</strong> {req.serviceType}</p>
                      {req.description && (
                        <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#666' }}>
                          {req.description}
                        </p>
                      )}
                      <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>
                        <strong>Endereço:</strong> {req.address.street}, {req.address.number} - {req.address.neighborhood}, {req.address.city}/{req.address.state}
                      </p>
                    </div>

                    {/* Budget Form */}
                    {editingBudget === req.id ? (
                      <div style={{ border: '2px solid var(--primary)', padding: '15px', borderRadius: '8px', backgroundColor: '#fffef0' }}>
                        <h4 style={{ marginTop: 0 }}>Editar Orçamento</h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                          <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Email do Cliente</label>
                            <input 
                              type="email"
                              className="form-control"
                              value={budgetForm.email || ''}
                              onChange={e => setBudgetForm(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="cliente@email.com"
                            />
                          </div>
                          
                          <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Valor do Orçamento (R$)</label>
                            <input 
                              type="number"
                              step="0.01"
                              className="form-control"
                              value={budgetForm.budget_value || ''}
                              onChange={e => setBudgetForm(prev => ({ ...prev, budget_value: parseFloat(e.target.value) }))}
                              placeholder="0.00"
                            />
                          </div>
                          
                          <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Data de Execução</label>
                            <input 
                              type="date"
                              className="form-control"
                              value={budgetForm.execution_date || ''}
                              onChange={e => setBudgetForm(prev => ({ ...prev, execution_date: e.target.value }))}
                            />
                          </div>
                          
                          <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Status</label>
                            <select 
                              className="form-control"
                              value={budgetForm.status || req.status}
                              onChange={e => setBudgetForm(prev => ({ ...prev, status: e.target.value }))}
                            >
                              <option value="pending">Pendente</option>
                              <option value="contacted">Contatado</option>
                              <option value="budgeted">Orçado</option>
                              <option value="approved">Aprovado</option>
                              <option value="rejected">Rejeitado</option>
                              <option value="completed">Concluído</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label">Observações Internas</label>
                          <textarea 
                            className="form-control"
                            rows={3}
                            value={budgetForm.notes || ''}
                            onChange={e => setBudgetForm(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Anotações sobre o orçamento..."
                          />
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                          <button 
                            className="btn btn-primary"
                            onClick={() => handleSaveBudget(req.id)}
                          >
                            💾 Salvar Orçamento
                          </button>
                          <button 
                            className="btn btn-outline"
                            onClick={() => { setEditingBudget(null); setBudgetForm({}); }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Budget Info Display */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '15px', padding: '10px', backgroundColor: '#f0f7ff', borderRadius: '5px' }}>
                          <div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>Valor do Orçamento</p>
                            <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: req.budgetValue ? 'var(--primary)' : '#999' }}>
                              {req.budgetValue ? `R$ ${req.budgetValue.toFixed(2).replace('.', ',')}` : 'Não definido'}
                            </p>
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>Data de Execução</p>
                            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>
                              {req.executionDate ? new Date(req.executionDate).toLocaleDateString('pt-BR') : 'Não definida'}
                            </p>
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>Aprovação</p>
                            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', color: req.isApproved ? '#4CAF50' : '#999' }}>
                              {req.isApproved ? '✅ Aprovado' : '⏳ Pendente'}
                            </p>
                          </div>
                          {req.budgetSentAt && (
                            <div>
                              <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>Email Enviado</p>
                              <p style={{ margin: 0, fontSize: '0.9rem' }}>
                                {new Date(req.budgetSentAt).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {req.notes && (
                          <div style={{ padding: '10px', backgroundColor: '#fff3cd', borderRadius: '5px', marginBottom: '15px' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#856404' }}>
                              <strong>📝 Observações:</strong> {req.notes}
                            </p>
                          </div>
                        )}
                        
                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <button 
                            className="btn btn-primary"
                            onClick={() => handleEditBudget(req)}
                          >
                            ✏️ Editar Orçamento
                          </button>
                          
                          {req.budgetValue && req.budgetValue > 0 && req.email && !req.isApproved && (
                            <button 
                              className="btn"
                              style={{ backgroundColor: '#4CAF50', color: 'white' }}
                              onClick={() => handleApproveBudget(req.id, true)}
                            >
                              ✅ Aprovar
                            </button>
                          )}
                          
                          {!req.isApproved && (
                            <button 
                              className="btn"
                              style={{ backgroundColor: '#f44336', color: 'white' }}
                              onClick={() => handleApproveBudget(req.id, false)}
                            >
                              ❌ Rejeitar
                            </button>
                          )}
                          
                          {req.budgetValue && req.budgetValue > 0 && req.email && (
                            <button 
                              className="btn btn-outline"
                              onClick={() => handleResendEmail(req.id)}
                            >
                              📧 Reenviar Email
                            </button>
                          )}
                          
                          <button 
                            className="btn"
                            style={{ backgroundColor: '#757575', color: 'white' }}
                            onClick={() => handleDeleteBudget(req.id)}
                            title="Deletar orçamento permanentemente"
                          >
                            🗑️ Deletar
                          </button>
                          
                          <a 
                            href={`https://wa.me/${req.phone.replace(/\D/g, '')}?text=Olá ${req.name}! Sobre o orçamento #${req.id}...`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn"
                            style={{ backgroundColor: '#25D366', color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
                          >
                            💬 WhatsApp
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'albums' && (
          <div>
            <h2 style={{ marginBottom: '20px', color: 'var(--primary)' }}>Gestão de Álbuns</h2>
            
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: 'var(--shadow)' }}>
              <h4>Criar Novo Álbum</h4>
              
              <form onSubmit={handleAddAlbum}>
                <div className="form-group">
                  <label className="form-label">Título do Álbum *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Ex: Reforma em Alvenaria"
                    value={newAlbum.title}
                    onChange={e => setNewAlbum(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Descrição</label>
                  <textarea 
                    className="form-control" 
                    placeholder="Descreva o projeto..."
                    rows={3}
                    value={newAlbum.description}
                    onChange={e => setNewAlbum(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Fotos *</label>
                  <div 
                    className={`dropzone ${isDragging ? 'dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                    />
                    <div className="dropzone-content">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <p style={{ margin: '10px 0 5px', fontSize: '1rem', fontWeight: '500' }}>
                        {isDragging ? 'Solte as imagens aqui' : 'Arraste imagens aqui'}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
                        ou clique para selecionar arquivos
                      </p>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '10px' }}>
                    Selecione múltiplas fotos (JPG, PNG, WEBP). Clique em uma foto abaixo para defini-la como principal.
                  </p>
                </div>

                {newAlbum.photos.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <label className="form-label">Fotos Selecionadas ({newAlbum.photos.length})</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
                      {newAlbum.photos.map((photo, index) => (
                        <div 
                          key={index} 
                          style={{ 
                            position: 'relative', 
                            border: index === newAlbum.main_photo_index ? '3px solid var(--primary)' : '1px solid #ddd',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            cursor: 'pointer'
                          }}
                          onClick={() => setNewAlbum(prev => ({ ...prev, main_photo_index: index }))}
                        >
                          <img 
                            src={photo.url} 
                            alt={photo.title} 
                            style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                          />
                          {index === newAlbum.main_photo_index && (
                            <div style={{
                              position: 'absolute',
                              top: 5,
                              left: 5,
                              backgroundColor: 'var(--primary)',
                              color: 'white',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold'
                            }}>
                              PRINCIPAL
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removePhoto(index); }}
                            style={{
                              position: 'absolute',
                              top: 5,
                              right: 5,
                              background: 'rgba(255,255,255,0.9)',
                              border: 'none',
                              borderRadius: '50%',
                              width: 28,
                              height: 28,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--error)'
                            }}
                          >
                            <IconTrash />
                          </button>
                          <p style={{ padding: '5px', fontSize: '0.75rem', textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                            {photo.width}x{photo.height}px
                          </p>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '10px' }}>
                      ✨ Clique em uma foto para defini-la como principal
                    </p>
                  </div>
                )}

                <button type="submit" className="btn btn-primary" disabled={newAlbum.photos.length === 0}>
                  Criar Álbum ({newAlbum.photos.length} {newAlbum.photos.length === 1 ? 'foto' : 'fotos'})
                </button>
              </form>
            </div>

            <h3 style={{ marginBottom: '15px' }}>Álbuns Existentes</h3>
            <div className="gallery-grid">
              {albums.map(album => (
                <div key={album.id} className="gallery-item">
                  <img src={album.main_photo_url} alt={album.title} className="gallery-img" />
                  <div className="gallery-caption" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold' }}>{album.title}</span>
                      <button 
                        onClick={() => handleDeleteAlbum(album.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}
                      >
                        <IconTrash />
                      </button>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: '#666', width: '100%', textAlign: 'left' }}>
                      📸 {album.photo_count} {album.photo_count === 1 ? 'foto' : 'fotos'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {albums.length === 0 && <p style={{ textAlign: 'center', color: '#666' }}>Nenhum álbum criado ainda.</p>}
          </div>
        )}
          </>
        )}
        </div>
      </div>
    </div>
  );
};

// --- Pages ---

const Home = ({ setView }: { setView: (v: ViewState) => void }) => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const lightboxRef = useRef<PhotoSwipeLightbox | null>(null);

  useEffect(() => {
    const loadAlbums = async () => {
      const data = await APIService.getAlbums();
      setAlbums(data);
    };
    loadAlbums();
  }, []);

  useEffect(() => {
    if (albums.length === 0) return;

    let clickedAlbumIndex = 0;

    lightboxRef.current = new PhotoSwipeLightbox({
      gallery: '#gallery-grid',
      children: 'a',
      pswpModule: () => import('photoswipe'),
      dataSource: []
    });

    lightboxRef.current.on('uiRegister', function() {
      lightboxRef.current!.pswp!.ui!.registerElement({
        name: 'custom-caption',
        order: 9,
        isButton: false,
        appendTo: 'root',
        html: 'Caption text',
        onInit: (el: HTMLElement) => {
          lightboxRef.current!.pswp!.on('change', () => {
            const currentSlide = lightboxRef.current!.pswp!.currSlide;
            el.innerHTML = currentSlide?.data?.caption || '';
          });
        }
      });
    });

    // Capturar clique antes de abrir
    lightboxRef.current.on('itemData', (e: any) => {
      const element = e.element as HTMLElement;
      if (element) {
        const index = element.getAttribute('data-album-index');
        if (index !== null) {
          clickedAlbumIndex = parseInt(index);
        }
      }
    });

    lightboxRef.current.on('beforeOpen', async () => {
      try {
        if (!albums[clickedAlbumIndex]) {
          console.error('Álbum não encontrado no índice:', clickedAlbumIndex);
          return;
        }

        const albumId = albums[clickedAlbumIndex].id;
        const photos = await APIService.getAlbumPhotos(albumId);
        
        if (photos.length === 0) {
          console.warn('Nenhuma foto encontrada para o álbum:', albumId);
          return;
        }

        if (lightboxRef.current?.pswp) {
          lightboxRef.current.pswp.options.dataSource = photos.map(photo => ({
            src: photo.url,
            width: photo.width,
            height: photo.height,
            caption: photo.title || albums[clickedAlbumIndex].title
          }));
        }
      } catch (error) {
        console.error('Erro ao carregar fotos do álbum:', error);
      }
    });

    lightboxRef.current.init();

    return () => {
      if (lightboxRef.current) {
        lightboxRef.current.destroy();
        lightboxRef.current = null;
      }
    };
  }, [albums]);

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
            <p>Confira alguns dos nossos trabalhos realizados com excelência. Clique para ver todas as fotos.</p>
          </div>
          
          <div id="gallery-grid" className="gallery-grid">
            {albums.map((album, index) => (
              <a
                key={album.id} 
                href={album.main_photo_url}
                className="album-card gallery-item"
                style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
                data-album-index={index}
                data-pswp-width={album.main_photo_width}
                data-pswp-height={album.main_photo_height}
              >
                <img 
                  src={album.main_photo_url} 
                  alt={album.title} 
                  className="gallery-img" 
                  loading="lazy" 
                />
                <div className="gallery-caption" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <span style={{ fontWeight: 'bold' }}>{album.title}</span>
                  <span style={{ fontSize: '0.85rem', color: '#666' }}>
                    📸 {album.photo_count} {album.photo_count === 1 ? 'foto' : 'fotos'}
                  </span>
                </div>
              </a>
            ))}
          </div>
          {albums.length === 0 && (
            <p style={{ textAlign: 'center', color: '#666' }}>Nenhum álbum disponível no momento.</p>
          )}
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

  const handleCepChange = async (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    
    // Mask 00000-000
    if (value.length > 5) value = `${value.slice(0,5)}-${value.slice(5)}`;
    
    setFormData(prev => ({ ...prev, address: { ...prev.address, cep: value } }));
    setCepError('');
    
    // Buscar CEP automaticamente quando completo (8 dígitos)
    if (value.replace(/\D/g, '').length === 8) {
      const rawCep = value.replace(/\D/g, '');
      setLoadingCep(true);
      
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
              cep: value,
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
    }
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. Save to Database via API
    const success = await APIService.addRequest(formData);
    
    if (!success) {
      alert('Erro ao registrar solicitação. Tente novamente.');
      setIsSubmitting(false);
      return;
    }

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
    
    setIsSubmitting(false);
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '60px 20px', maxWidth: '800px' }}>
      <div className="section-title">
        <h2>Solicitar Orçamento</h2>
        <p>Preencha o formulário abaixo e entraremos em contato.</p>
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
            <label className="form-label">CEP * {loadingCep && <span style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>Buscando...</span>}</label>
            <input 
              type="text" 
              className="form-control" 
              required 
              placeholder="00000-000"
              value={formData.address.cep}
              onChange={handleCepChange}
            />
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
  // Ler hash inicial da URL para definir view
  const getInitialView = (): ViewState => {
    const hash = window.location.hash.slice(1); // Remove o #
    const validViews: ViewState[] = ['home', 'contact', 'admin', 'login'];
    return validViews.includes(hash as ViewState) ? (hash as ViewState) : 'home';
  };

  const [view, setView] = useState<ViewState>(getInitialView);

  // Atualizar hash quando view muda
  useEffect(() => {
    window.location.hash = view;
  }, [view]);

  // Listener para mudanças no hash (botão voltar/avançar do navegador)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      const validViews: ViewState[] = ['home', 'contact', 'admin', 'login'];
      if (validViews.includes(hash as ViewState)) {
        setView(hash as ViewState);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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