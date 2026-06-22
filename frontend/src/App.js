/* eslint-disable */
import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const AuthContext = createContext(null);
function useAuth() { return useContext(AuthContext); }

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    }
    setLoading(false);
  }, []);
  const login = async (username, password) => {
    const res = await axios.post(API_URL + '/auth/login', { username, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    setUser(user);
    return user;
  };
  const logout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };
  if (loading) return <div className='loading'><div className='spinner'></div></div>;
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(username, password); navigate('/dashboard'); }
    catch (err) { setError(err.response?.data?.message || 'Username atau password salah'); }
    finally { setLoading(false); }
  };
  return (
    <div className='login-page'>
      <div className='login-card'>
        <div className='login-logo'>
          <div className='logo-icon'>SA</div>
          <h1>SQLACC</h1>
          <p>Sistem Perakaunan Online</p>
        </div>
        {error && <div className='alert alert-error'>{error}</div>}
        <form onSubmit={handleSubmit} className='login-form'>
          <div className='form-group'>
            <label>Username</label>
            <input type='text' value={username} onChange={e=>setUsername(e.target.value)} placeholder='Masukkan username' required />
          </div>
          <div className='form-group'>
            <label>Password</label>
            <input type='password' value={password} onChange={e=>setPassword(e.target.value)} placeholder='Masukkan password' required />
          </div>
          <button type='submit' className='btn-login' disabled={loading}>{loading ? 'Log masuk...' : 'Log Masuk'}</button>
        </form>
        <p className='login-hint'>Admin: admin / admin123</p>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color, sub }) {
  return (
    <div className={'stat-card ' + color}>
      <div className='stat-icon'>{icon}</div>
      <div className='stat-info'><h3>{value}</h3><p>{title}</p>{sub && <small>{sub}</small>}</div>
    </div>
  );
}

function Sidebar({ currentPage, onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const handleLogout = () => { logout(); navigate('/login'); };
  const menus = [
    { id: 'dashboard', icon: 'dashb', label: 'Dashboard' },
    { id: 'pelanggan', icon: 'peng', label: 'Pelanggan' },
    { id: 'invois', icon: 'inv', label: 'Invois' },
    { id: 'pembayaran', icon: 'bayar', label: 'Pembayaran' },
    { id: 'laporan', icon: 'lap', label: 'Laporan' },
    { id: 'pengguna', icon: 'usr', label: 'Pengguna', adminOnly: true },
  ];
  return (
    <div className={'sidebar' + (collapsed ? ' collapsed' : '')}>
      <div className='sidebar-header'>
        <div className='sidebar-logo'><span className='logo-icon-sm'>SA</span>{!collapsed && <span>SQLACC</span>}</div>
        <button className='collapse-btn' onClick={() => setCollapsed(!collapsed)}>{collapsed ? '>' : '<'}</button>
      </div>
      <nav className='sidebar-nav'>
        {menus.filter(m => !m.adminOnly || user?.role === 'admin').map(menu => (
          <button key={menu.id} className={'nav-item' + (currentPage===menu.id?' active':'')} onClick={() => onNavigate(menu.id)}>
            <span className='nav-icon'>{menu.icon}</span>
            {!collapsed && <span className='nav-label'>{menu.label}</span>}
          </button>
        ))}
      </nav>
      <div className='sidebar-footer'>
        <div className='user-info'>
          <div className='user-avatar'>{(user?.nama?.[0] || 'U').toUpperCase()}</div>
          {!collapsed && <div><span className='user-name'>{user?.nama || user?.username}</span><br/><span className='user-role'>{user?.role}</span></div>}
        </div>
        <button className='logout-btn' onClick={handleLogout}>Keluar</button>
      </div>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState({ pelanggan:0, invois:0, jumlahHasil:0, belumBayar:0 });
  const [invoisTerkini, setInvoisTerkini] = useState([]);
  useEffect(() => {
    Promise.all([
      axios.get(API_URL + '/dashboard/stats').catch(() => ({data:{pelanggan:0,invois:0,jumlahHasil:0,belumBayar:0}})),
      axios.get(API_URL + '/invois?limit=5').catch(() => ({data:[]})),
    ]).then(([s,inv]) => {
      setStats(s.data);
      setInvoisTerkini(Array.isArray(inv.data) ? inv.data.slice(0,5) : []);
    });
  }, []);
  return (
    <div className='page'>
      <div className='page-header'><h2>Dashboard</h2><p>Selamat datang ke SQLACC</p></div>
      <div className='stats-grid'>
        <StatCard icon='👥' title='Pelanggan' value={stats.pelanggan||0} color='blue' />
        <StatCard icon='📄' title='Invois' value={stats.invois||0} color='green' />
        <StatCard icon='💰' title='Hasil (RM)' value={'RM '+Number(stats.jumlahHasil||0).toFixed(2)} color='purple' />
        <StatCard icon='⚠️' title='Belum Bayar' value={stats.belumBayar||0} color='orange' />
      </div>
      <div className='recent-section'>
        <h3>Invois Terkini</h3>
        {invoisTerkini.length === 0 ? <p>Tiada invois lagi.</p> : (
          <table className='data-table'>
            <thead><tr><th>No. Invois</th><th>Pelanggan</th><th>Jumlah</th><th>Status</th></tr></thead>
            <tbody>{invoisTerkini.map(inv => (
              <tr key={inv.id}><td>{inv.no_invois}</td><td>{inv.nama_pelanggan||'-'}</td><td>RM {Number(inv.jumlah_total||0).toFixed(2)}</td><td><span className={'badge '+inv.status}>{inv.status}</span></td></tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function PelangganPage() {
  const [list, setList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nama:'', telefon:'', emel:'', alamat:'' });
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');
  const fetch = async () => { const r = await axios.get(API_URL+'/pelanggan').catch(()=>({data:[]})); setList(Array.isArray(r.data)?r.data:[]); };
  useEffect(() => { fetch(); }, []);
  const save = async (e) => {
    e.preventDefault();
    try { await axios.post(API_URL+'/pelanggan', form); setMsg('Berjaya!'); setShowForm(false); setForm({nama:'',telefon:'',emel:'',alamat:''}); fetch(); setTimeout(()=>setMsg(''),3000); }
    catch(err) { setMsg('Ralat: '+(err.response?.data?.message||'Gagal')); }
  };
  const filtered = list.filter(p => (p.nama||'').toLowerCase().includes(search.toLowerCase()));
  return (
    <div className='page'>
      <div className='page-header'><div><h2>Pelanggan</h2></div><button className='btn-primary' onClick={()=>setShowForm(!showForm)}>+ Tambah</button></div>
      {msg && <div className={'alert '+(msg.startsWith('Ralat')?'alert-error':'alert-success')}>{msg}</div>}
      {showForm && (
        <div className='form-card'><h3>Pelanggan Baru</h3><form onSubmit={save}>
          <div className='form-row'>
            <div className='form-group'><label>Nama *</label><input value={form.nama} onChange={e=>setForm({...form,nama:e.target.value})} required /></div>
            <div className='form-group'><label>Telefon</label><input value={form.telefon} onChange={e=>setForm({...form,telefon:e.target.value})} /></div>
          </div>
          <div className='form-row'>
            <div className='form-group'><label>Emel</label><input type='email' value={form.emel} onChange={e=>setForm({...form,emel:e.target.value})} /></div>
            <div className='form-group'><label>Alamat</label><input value={form.alamat} onChange={e=>setForm({...form,alamat:e.target.value})} /></div>
          </div>
          <div className='form-actions'><button type='submit' className='btn-primary'>Simpan</button><button type='button' className='btn-secondary' onClick={()=>setShowForm(false)}>Batal</button></div>
        </form></div>
      )}
      <div className='search-bar'><input placeholder='Cari pelanggan...' value={search} onChange={e=>setSearch(e.target.value)} /></div>
      {filtered.length===0 ? <div className='empty-state'><p>Tiada pelanggan.</p></div> : (
        <table className='data-table'><thead><tr><th>#</th><th>Nama</th><th>Telefon</th><th>Emel</th></tr></thead>
        <tbody>{filtered.map((p,i)=>(<tr key={p.id}><td>{i+1}</td><td>{p.nama}</td><td>{p.telefon||'-'}</td><td>{p.emel||'-'}</td></tr>))}</tbody></table>
      )}
    </div>
  );
}

function InvoisPage() {
  const [list, setList] = useState([]);
  const [pelanggan, setPelanggan] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ pelanggan_id:'', catatan:'', items:[{penerangan:'',kuantiti:1,harga:0}] });
  const [msg, setMsg] = useState('');
  const fetchAll = async () => {
    const [r,p] = await Promise.all([axios.get(API_URL+'/invois').catch(()=>({data:[]})), axios.get(API_URL+'/pelanggan').catch(()=>({data:[]}))]);
    setList(Array.isArray(r.data)?r.data:[]); setPelanggan(Array.isArray(p.data)?p.data:[]);
  };
  useEffect(()=>{ fetchAll(); },[]);
  const addItem = () => setForm({...form,items:[...form.items,{penerangan:'',kuantiti:1,harga:0}]});
  const updateItem = (i,f,v) => { const items=[...form.items]; items[i]={...items[i],[f]:v}; setForm({...form,items}); };
  const total = form.items.reduce((s,it)=>s+Number(it.kuantiti)*Number(it.harga),0);
  const save = async (e) => {
    e.preventDefault();
    try { await axios.post(API_URL+'/invois',form); setMsg('Invois dicipta!'); setShowForm(false); setForm({pelanggan_id:'',catatan:'',items:[{penerangan:'',kuantiti:1,harga:0}]}); fetchAll(); setTimeout(()=>setMsg(''),3000); }
    catch(err) { setMsg('Ralat: '+(err.response?.data?.message||'Gagal')); }
  };
  return (
    <div className='page'>
      <div className='page-header'><div><h2>Invois</h2></div><button className='btn-primary' onClick={()=>setShowForm(!showForm)}>+ Buat Invois</button></div>
      {msg && <div className={'alert '+(msg.startsWith('Ralat')?'alert-error':'alert-success')}>{msg}</div>}
      {showForm && (
        <div className='form-card'><h3>Invois Baru</h3><form onSubmit={save}>
          <div className='form-row'>
            <div className='form-group'><label>Pelanggan *</label><select value={form.pelanggan_id} onChange={e=>setForm({...form,pelanggan_id:e.target.value})} required><option value=''>-- Pilih --</option>{pelanggan.map(p=><option key={p.id} value={p.id}>{p.nama}</option>)}</select></div>
            <div className='form-group'><label>Catatan</label><input value={form.catatan} onChange={e=>setForm({...form,catatan:e.target.value})} /></div>
          </div>
          <h4>Item</h4>
          {form.items.map((it,i)=>(
            <div key={i} className='item-row'>
              <input placeholder='Penerangan' value={it.penerangan} onChange={e=>updateItem(i,'penerangan',e.target.value)} required />
              <input type='number' placeholder='Qty' value={it.kuantiti} onChange={e=>updateItem(i,'kuantiti',e.target.value)} min='1' />
              <input type='number' placeholder='Harga' value={it.harga} onChange={e=>updateItem(i,'harga',e.target.value)} min='0' step='0.01' />
              <span>RM {(Number(it.kuantiti)*Number(it.harga)).toFixed(2)}</span>
            </div>
          ))}
          <button type='button' className='btn-secondary btn-sm' onClick={addItem}>+ Item</button>
          <div className='total-row'><strong>Jumlah: RM {total.toFixed(2)}</strong></div>
          <div className='form-actions'><button type='submit' className='btn-primary'>Simpan</button><button type='button' className='btn-secondary' onClick={()=>setShowForm(false)}>Batal</button></div>
        </form></div>
      )}
      {list.length===0 ? <div className='empty-state'><p>Tiada invois.</p></div> : (
        <table className='data-table'><thead><tr><th>No.</th><th>Pelanggan</th><th>Jumlah</th><th>Status</th><th>Tarikh</th></tr></thead>
        <tbody>{list.map(inv=>(<tr key={inv.id}><td>{inv.no_invois}</td><td>{inv.nama_pelanggan||'-'}</td><td>RM {Number(inv.jumlah_total||0).toFixed(2)}</td><td><span className={'badge '+(inv.status||'pending')}>{inv.status||'pending'}</span></td><td>{inv.tarikh?new Date(inv.tarikh).toLocaleDateString('ms-MY'):'-'}</td></tr>))}</tbody>
        </table>
      )}
    </div>
  );
}

function PembayaranPage() {
  const [list, setList] = useState([]);
  const [invois, setInvois] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ invois_id:'', jumlah:'', kaedah:'tunai', catatan:'' });
  const [msg, setMsg] = useState('');
  const fetchAll = async () => {
    const [p,i] = await Promise.all([axios.get(API_URL+'/pembayaran').catch(()=>({data:[]})),axios.get(API_URL+'/invois').catch(()=>({data:[]}))]);
    setList(Array.isArray(p.data)?p.data:[]); setInvois(Array.isArray(i.data)?i.data:[]);
  };
  useEffect(()=>{ fetchAll(); },[]);
  const save = async (e) => {
    e.preventDefault();
    try { await axios.post(API_URL+'/pembayaran',form); setMsg('Berjaya!'); setShowForm(false); setForm({invois_id:'',jumlah:'',kaedah:'tunai',catatan:''}); fetchAll(); setTimeout(()=>setMsg(''),3000); }
    catch(err) { setMsg('Ralat: '+(err.response?.data?.message||'Gagal')); }
  };
  return (
    <div className='page'>
      <div className='page-header'><div><h2>Pembayaran</h2></div><button className='btn-primary' onClick={()=>setShowForm(!showForm)}>+ Rekod Bayaran</button></div>
      {msg && <div className={'alert '+(msg.startsWith('Ralat')?'alert-error':'alert-success')}>{msg}</div>}
      {showForm && (
        <div className='form-card'><h3>Rekod Pembayaran</h3><form onSubmit={save}>
          <div className='form-row'>
            <div className='form-group'><label>Invois *</label><select value={form.invois_id} onChange={e=>setForm({...form,invois_id:e.target.value})} required><option value=''>-- Pilih --</option>{invois.map(i=><option key={i.id} value={i.id}>{i.no_invois}</option>)}</select></div>
            <div className='form-group'><label>Jumlah (RM) *</label><input type='number' value={form.jumlah} onChange={e=>setForm({...form,jumlah:e.target.value})} required min='0.01' step='0.01' /></div>
          </div>
          <div className='form-row'>
            <div className='form-group'><label>Kaedah</label><select value={form.kaedah} onChange={e=>setForm({...form,kaedah:e.target.value})}><option value='tunai'>Tunai</option><option value='transfer'>Transfer</option><option value='kad'>Kad</option></select></div>
            <div className='form-group'><label>Catatan</label><input value={form.catatan} onChange={e=>setForm({...form,catatan:e.target.value})} /></div>
          </div>
          <div className='form-actions'><button type='submit' className='btn-primary'>Simpan</button><button type='button' className='btn-secondary' onClick={()=>setShowForm(false)}>Batal</button></div>
        </form></div>
      )}
      {list.length===0 ? <div className='empty-state'><p>Tiada rekod pembayaran.</p></div> : (
        <table className='data-table'><thead><tr><th>Invois</th><th>Pelanggan</th><th>Jumlah</th><th>Kaedah</th><th>Tarikh</th></tr></thead>
        <tbody>{list.map(p=>(<tr key={p.id}><td>{p.no_invois||'-'}</td><td>{p.nama_pelanggan||'-'}</td><td>RM {Number(p.jumlah||0).toFixed(2)}</td><td>{p.kaedah||'-'}</td><td>{p.tarikh?new Date(p.tarikh).toLocaleDateString('ms-MY'):'-'}</td></tr>))}</tbody>
        </table>
      )}
    </div>
  );
}

function LaporanPage() {
  const [lap, setLap] = useState(null);
  useEffect(()=>{ axios.get(API_URL+'/laporan/ringkasan').catch(()=>({data:{jumlahHasil:0,jumlahInvois:0,jumlahPelanggan:0,belumBayar:0,bulan:[]}})).then(r=>setLap(r.data)); },[]);
  return (
    <div className='page'>
      <div className='page-header'><h2>Laporan</h2></div>
      <div className='stats-grid'>
        <StatCard icon='💰' title='Hasil' value={'RM '+Number(lap?.jumlahHasil||0).toFixed(2)} color='green' />
        <StatCard icon='📄' title='Invois' value={lap?.jumlahInvois||0} color='blue' />
        <StatCard icon='👥' title='Pelanggan' value={lap?.jumlahPelanggan||0} color='purple' />
        <StatCard icon='⚠️' title='Belum Bayar' value={lap?.belumBayar||0} color='orange' />
      </div>
    </div>
  );
}

function PenggunaPage() {
  const [list, setList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username:'', nama:'', password:'', role:'pengguna' });
  const [msg, setMsg] = useState('');
  const fetch = async () => { const r = await axios.get(API_URL+'/pengguna').catch(()=>({data:[]})); setList(Array.isArray(r.data)?r.data:[]); };
  useEffect(()=>{ fetch(); },[]);
  const save = async (e) => {
    e.preventDefault();
    try { await axios.post(API_URL+'/pengguna',form); setMsg('Berjaya!'); setShowForm(false); setForm({username:'',nama:'',password:'',role:'pengguna'}); fetch(); setTimeout(()=>setMsg(''),3000); }
    catch(err) { setMsg('Ralat: '+(err.response?.data?.message||'Gagal')); }
  };
  return (
    <div className='page'>
      <div className='page-header'><div><h2>Pengguna</h2></div><button className='btn-primary' onClick={()=>setShowForm(!showForm)}>+ Tambah</button></div>
      {msg && <div className={'alert '+(msg.startsWith('Ralat')?'alert-error':'alert-success')}>{msg}</div>}
      {showForm && (
        <div className='form-card'><h3>Pengguna Baru</h3><form onSubmit={save}>
          <div className='form-row'>
            <div className='form-group'><label>Username *</label><input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} required /></div>
            <div className='form-group'><label>Nama *</label><input value={form.nama} onChange={e=>setForm({...form,nama:e.target.value})} required /></div>
          </div>
          <div className='form-row'>
            <div className='form-group'><label>Password *</label><input type='password' value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required /></div>
            <div className='form-group'><label>Role</label><select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value='pengguna'>Pengguna</option><option value='admin'>Admin</option></select></div>
          </div>
          <div className='form-actions'><button type='submit' className='btn-primary'>Simpan</button><button type='button' className='btn-secondary' onClick={()=>setShowForm(false)}>Batal</button></div>
        </form></div>
      )}
      {list.length===0 ? <div className='empty-state'><p>Tiada pengguna lain.</p></div> : (
        <table className='data-table'><thead><tr><th>#</th><th>Username</th><th>Nama</th><th>Role</th></tr></thead>
        <tbody>{list.map((p,i)=>(<tr key={p.id}><td>{i+1}</td><td>{p.username}</td><td>{p.nama}</td><td><span className={'badge '+p.role}>{p.role}</span></td></tr>))}</tbody>
        </table>
      )}
    </div>
  );
}

function MainLayout() {
  const [page, setPage] = useState('dashboard');
  const { user } = useAuth();
  const pages = { dashboard:<Dashboard />, pelanggan:<PelangganPage />, invois:<InvoisPage />, pembayaran:<PembayaranPage />, laporan:<LaporanPage />, pengguna:user?.role==='admin'?<PenggunaPage />:<Dashboard /> };
  return (
    <div className='app-layout'>
      <Sidebar currentPage={page} onNavigate={setPage} />
      <main className='main-content'>{pages[page] || <Dashboard />}</main>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to='/login' replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path='/login' element={<LoginPage />} />
          <Route path='/dashboard' element={<ProtectedRoute><MainLayout /></ProtectedRoute>} />
          <Route path='/' element={<Navigate to='/dashboard' replace />} />
          <Route path='*' element={<Navigate to='/dashboard' replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
