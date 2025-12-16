# Guia de Implementação - Sistema de Álbuns com PhotoSwipe

## ✅ Concluído

### 1. Migração do Banco de Dados
- ✅ Tabelas criadas: `albums`, `album_photos`  
- ✅ View criada: `v_albums_with_main_photo`
- ✅ Stored Procedure: `sp_create_album`
- ✅ Dados migrados de `gallery_items_old`

### 2. APIs Backend (PHP)
- ✅ `get_albums.php` - Lista álbuns com foto principal
- ✅ `get_album_photos.php?album_id=X` - Fotos de um álbum
- ✅ `add_album.php` - Criar álbum com múltiplas fotos
- ✅ `delete_album.php` - Deletar álbum (CASCADE fotos)

### 3. Dependências Frontend
- ✅ PhotoSwipe instalado (`npm install photoswipe`)

## 🔧 Alterações Necessárias no Frontend (index.tsx)

### 1. Importar PhotoSwipe (no topo do arquivo)

```typescript
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';
```

### 2. Atualizar Types

```typescript
interface Album {
  id: number;
  title: string;
  description: string;
  main_photo_url: string;
  main_photo_width: number;
  main_photo_height: number;
  photo_count: number;
  display_order: number;
  is_featured: boolean;
  created_at: string;
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
  photos: {
    url: string;
    title: string;
    width: number;
    height: number;
  }[];
  main_photo_index: number;
}
```

### 3. Atualizar APIService

```typescript
const APIService = {
  // ... mantém login, logout, checkSession, requests

  // ATUALIZAR getGallery para getAlbums
  async getAlbums() {
    const response = await fetch(`${API_BASE}/get_albums.php`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data.albums || [];
  },

  async getAlbumPhotos(albumId: number) {
    const response = await fetch(`${API_BASE}/get_album_photos.php?album_id=${albumId}`, {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  },

  async addAlbum(album: NewAlbumForm) {
    const response = await fetch(`${API_BASE}/add_album.php`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(album)
    });
    return await response.json();
  },

  async deleteAlbum(id: number) {
    const response = await fetch(`${API_BASE}/delete_album.php`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    return await response.json();
  }
};
```

### 4. Componente Home - Galeria com PhotoSwipe

```typescript
function Home({ onNavigate }: { onNavigate: (view: ViewState) => void }) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const lightboxRef = useRef<PhotoSwipeLightbox | null>(null);

  useEffect(() => {
    loadAlbums();
  }, []);

  useEffect(() => {
    // Inicializar PhotoSwipe
    if (!lightboxRef.current && albums.length > 0) {
      lightboxRef.current = new PhotoSwipeLightbox({
        gallery: '.albums-grid',
        children: '.album-item',
        pswpModule: () => import('photoswipe'),
      });

      // Evento customizado para carregar fotos do álbum
      lightboxRef.current.on('contentLoad', (e) => {
        const albumId = parseInt(e.content.data.element.dataset.albumId);
        loadAlbumPhotosForLightbox(albumId, e.content.data.index);
      });

      lightboxRef.current.init();
    }

    return () => {
      if (lightboxRef.current) {
        lightboxRef.current.destroy();
        lightboxRef.current = null;
      }
    };
  }, [albums]);

  async function loadAlbums() {
    try {
      setLoading(true);
      const data = await APIService.getAlbums();
      setAlbums(data);
    } catch (error) {
      console.error('Erro ao carregar álbuns:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadAlbumPhotosForLightbox(albumId: number, startIndex: number) {
    try {
      const { photos } = await APIService.getAlbumPhotos(albumId);
      
      if (lightboxRef.current) {
        // Criar slides das fotos do álbum
        const slides = photos.map((photo: AlbumPhoto) => ({
          src: photo.url,
          width: photo.width || 1200,
          height: photo.height || 800,
          alt: photo.title
        }));

        lightboxRef.current.loadAndOpen(startIndex, { gallery: slides });
      }
    } catch (error) {
      console.error('Erro ao carregar fotos do álbum:', error);
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header... mantém igual */}

      {/* Hero... mantém igual */}

      {/* Seção de Álbuns */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '60px 20px'
      }}>
        <h2 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '48px',
          color: '#1a1a1a'
        }}>
          Nossos Trabalhos
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Carregando álbuns...</p>
          </div>
        ) : albums.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#666' }}>Nenhum álbum encontrado</p>
          </div>
        ) : (
          <div className="albums-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {albums.map((album, index) => (
              <a
                key={album.id}
                href={album.main_photo_url}
                className="album-item"
                data-album-id={album.id}
                data-pswp-width={album.main_photo_width || 1200}
                data-pswp-height={album.main_photo_height || 800}
                target="_blank"
                rel="noreferrer"
                style={{
                  position: 'relative',
                  aspectRatio: '4/3',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  display: 'block'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                }}
              >
                <img
                  src={album.main_photo_url}
                  alt={album.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                  padding: '24px 16px 16px',
                  color: 'white'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    marginBottom: '4px'
                  }}>
                    {album.title}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    opacity: 0.9
                  }}>
                    {album.photo_count} {album.photo_count === 1 ? 'foto' : 'fotos'}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* Footer... mantém igual */}
    </div>
  );
}
```

### 5. AdminPanel - Upload de Múltiplas Fotos

```typescript
function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [requests, setRequests] = useState<BudgetRequest[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [activeTab, setActiveTab] = useState<'requests' | 'albums'>('requests');
  const [showAddAlbum, setShowAddAlbum] = useState(false);
  const [newAlbum, setNewAlbum] = useState<NewAlbumForm>({
    title: '',
    description: '',
    photos: [],
    main_photo_index: 0
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  async function loadData() {
    if (activeTab === 'requests') {
      const data = await APIService.getRequests();
      setRequests(data);
    } else {
      const data = await APIService.getAlbums();
      setAlbums(data);
    }
  }

  function handlePhotoUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    setUploadingPhoto(true);

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setNewAlbum(prev => ({
            ...prev,
            photos: [...prev.photos, {
              url: event.target!.result as string,
              title: file.name.replace(/\.[^/.]+$/, ''),
              width: img.width,
              height: img.height
            }]
          }));
          setUploadingPhoto(false);
        };
        img.src = event.target!.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  function removePhoto(index: number) {
    setNewAlbum(prev => {
      const newPhotos = prev.photos.filter((_, i) => i !== index);
      const newMainIndex = prev.main_photo_index > newPhotos.length - 1 
        ? 0 
        : prev.main_photo_index;
      return {
        ...prev,
        photos: newPhotos,
        main_photo_index: newMainIndex
      };
    });
  }

  async function handleAddAlbum(e: FormEvent) {
    e.preventDefault();
    if (newAlbum.photos.length === 0) {
      alert('Adicione pelo menos uma foto');
      return;
    }

    try {
      await APIService.addAlbum(newAlbum);
      setShowAddAlbum(false);
      setNewAlbum({ title: '', description: '', photos: [], main_photo_index: 0 });
      loadData();
    } catch (error) {
      console.error('Erro ao adicionar álbum:', error);
      alert('Erro ao adicionar álbum');
    }
  }

  async function handleDeleteAlbum(id: number) {
    if (!confirm('Tem certeza que deseja deletar este álbum?')) return;

    try {
      await APIService.deleteAlbum(id);
      loadData();
    } catch (error) {
      console.error('Erro ao deletar álbum:', error);
      alert('Erro ao deletar álbum');
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '20px' }}>
      {/* Header Admin */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>
          Painel Administrativo
        </h1>
        <button onClick={onLogout} style={{
          padding: '10px 20px',
          background: '#c0aa88',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          Sair
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 20px',
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={() => setActiveTab('requests')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'requests' ? '#c0aa88' : 'white',
            color: activeTab === 'requests' ? 'white' : '#666',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Solicitações ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('albums')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'albums' ? '#c0aa88' : 'white',
            color: activeTab === 'albums' ? 'white' : '#666',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Álbuns ({albums.length})
        </button>
      </div>

      {/* Conteúdo */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {activeTab === 'requests' ? (
          // ... mantém igual
        ) : (
          /* Tab Álbuns */
          <div>
            {/* Botão Adicionar Álbum */}
            <div style={{ marginBottom: '20px' }}>
              <button
                onClick={() => setShowAddAlbum(true)}
                style={{
                  padding: '12px 24px',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                + Adicionar Álbum
              </button>
            </div>

            {/* Modal Adicionar Álbum */}
            {showAddAlbum && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px'
              }}>
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '30px',
                  maxWidth: '800px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflowY: 'auto'
                }}>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    marginBottom: '20px'
                  }}>
                    Adicionar Álbum
                  </h2>

                  <form onSubmit={handleAddAlbum}>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '600'
                      }}>
                        Título do Álbum *
                      </label>
                      <input
                        type="text"
                        value={newAlbum.title}
                        onChange={(e) => setNewAlbum({...newAlbum, title: e.target.value})}
                        required
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #ddd',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '600'
                      }}>
                        Descrição
                      </label>
                      <textarea
                        value={newAlbum.description}
                        onChange={(e) => setNewAlbum({...newAlbum, description: e.target.value})}
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #ddd',
                          borderRadius: '8px',
                          fontSize: '14px',
                          resize: 'vertical'
                        }}
                      />
                    </div>

                    {/* Upload de Fotos */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '600'
                      }}>
                        Fotos * (selecione múltiplas fotos)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        style={{
                          display: 'block',
                          marginBottom: '16px'
                        }}
                      />

                      {/* Preview das Fotos */}
                      {newAlbum.photos.length > 0 && (
                        <div>
                          <p style={{ marginBottom: '12px', color: '#666', fontSize: '14px' }}>
                            {newAlbum.photos.length} foto(s) adicionada(s). 
                            Clique em uma foto para defini-la como principal.
                          </p>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                            gap: '12px'
                          }}>
                            {newAlbum.photos.map((photo, index) => (
                              <div
                                key={index}
                                style={{
                                  position: 'relative',
                                  aspectRatio: '4/3',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  border: newAlbum.main_photo_index === index 
                                    ? '3px solid #4CAF50' 
                                    : '2px solid #ddd',
                                  cursor: 'pointer'
                                }}
                                onClick={() => setNewAlbum({...newAlbum, main_photo_index: index})}
                              >
                                <img
                                  src={photo.url}
                                  alt={photo.title}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                />
                                {newAlbum.main_photo_index === index && (
                                  <div style={{
                                    position: 'absolute',
                                    top: '8px',
                                    left: '8px',
                                    background: '#4CAF50',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                  }}>
                                    PRINCIPAL
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removePhoto(index);
                                  }}
                                  style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    background: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '28px',
                                    height: '28px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Botões */}
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      justifyContent: 'flex-end'
                    }}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddAlbum(false);
                          setNewAlbum({ title: '', description: '', photos: [], main_photo_index: 0 });
                        }}
                        style={{
                          padding: '12px 24px',
                          background: '#666',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={uploadingPhoto || newAlbum.photos.length === 0}
                        style={{
                          padding: '12px 24px',
                          background: uploadingPhoto ? '#ccc' : '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        {uploadingPhoto ? 'Processando...' : 'Salvar Álbum'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Lista de Álbuns */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {albums.map(album => (
                <div
                  key={album.id}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <img
                    src={album.main_photo_url}
                    alt={album.title}
                    style={{
                      width: '100%',
                      aspectRatio: '4/3',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{ padding: '16px' }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>
                      {album.title}
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#666',
                      marginBottom: '12px'
                    }}>
                      {album.photo_count} {album.photo_count === 1 ? 'foto' : 'fotos'}
                    </p>
                    <button
                      onClick={() => handleDeleteAlbum(album.id)}
                      style={{
                        padding: '8px 16px',
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        width: '100%'
                      }}
                    >
                      Deletar Álbum
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
}
```

## 📱 Recursos do PhotoSwipe

- ✅ **Responsivo**: Funciona perfeitamente em mobile e desktop
- ✅ **Gestos**: Swipe, pinch-to-zoom, arrastar
- ✅ **Teclado**: Setas para navegar, ESC para fechar
- ✅ **Performance**: Virtual scrolling, lazy loading
- ✅ **Acessibilidade**: ARIA labels, focus trap
- ✅ **Histórico**: Integração com navegador (voltar/avançar)

## 🎨 Estilos Adicionais (opcional)

Adicione no `<style>` do documento ou em arquivo CSS separado:

```css
/* Melhorias no card do álbum */
.album-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.album-item:hover {
  transform: translateY(-8px) !important;
  box-shadow: 0 12px 24px rgba(0,0,0,0.2) !important;
}

/* Badge de número de fotos */
.photo-count-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  backdrop-filter: blur(4px);
}

/* Customização do PhotoSwipe (opcional) */
.pswp__button--arrow--left,
.pswp__button--arrow--right {
  background-color: rgba(0,0,0,0.5) !important;
}

.pswp__counter {
  font-size: 16px !important;
  font-weight: 600 !important;
}
```

## 🚀 Próximos Passos

1. Implemente as alterações no `index.tsx` seguindo os exemplos acima
2. Teste o upload de múltiplas fotos
3. Teste o PhotoSwipe clicando nos álbuns
4. Ajuste estilos conforme necessário
5. Teste responsividade (mobile + desktop)

## 📸 Testando o Sistema

```bash
# 1. Reiniciar dev.sh
./dev.sh

# 2. Acessar admin
http://localhost:3000 → Login

# 3. Criar álbum
- Ir em "Álbuns"
- Clicar "Adicionar Álbum"
- Upload de 3-5 fotos
- Selecionar foto principal
- Salvar

# 4. Ver resultado
- Ir para Home
- Clicar no álbum
- PhotoSwipe abre com todas as fotos
- Navegar com setas/swipe/mouse
```

## ⚠️ Observações Importantes

- PhotoSwipe requer dimensões (`width` e `height`) das imagens
- Upload converte para base64 e detecta dimensões automaticamente
- Foto principal é exibida na grid da Home
- Todas as fotos aparecem no lightbox ao clicar
- DELETE CASCADE remove álbum e todas as fotos
- Sistema é 100% responsivo (mobile + desktop)

## 🔗 Documentação

- PhotoSwipe: https://photoswipe.com/
- Demo: https://photoswipe.com/demos/
