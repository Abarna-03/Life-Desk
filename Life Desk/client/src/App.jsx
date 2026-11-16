import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Clock, 
  FileText, 
  CreditCard, 
  Wrench, 
  Plus, 
  AlertTriangle, 
  ShieldCheck, 
  DollarSign, 
  Calendar, 
  CheckCircle,
  Tag,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Building,
  Car,
  Home,
  Tv,
  Smartphone,
  Cpu,
  RefreshCw,
  X,
  AlertCircle,
  BarChart2,
  ArrowRight,
  User,
  Phone,
  Sparkles,
  Lock,
  Database
} from 'lucide-react';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

// Initial realistic default state (can be saved/synced to PostgreSQL)
const initialAssets = [
  {
    id: 'a1',
    name: 'MacBook Pro 16" M3 Max',
    category: 'Electronics',
    brand: 'Apple',
    model_number: 'A2991',
    serial_number: 'W88401231MX',
    purchase_date: '2024-01-15',
    purchase_price: 2499,
    store_vendor: 'Apple Store',
    location_room: 'Home Office',
    warranty_expiry_date: '2027-01-15',
    status: 'Active',
    notes: 'Liquid Retina XDR, 36GB RAM, 1TB SSD. Enrolled in AppleCare+.'
  },
  {
    id: 'a2',
    name: 'LG French Door Smart Refrigerator',
    category: 'Home Appliances',
    brand: 'LG',
    model_number: 'LRFCS25D3S',
    serial_number: 'LG9841203',
    purchase_date: '2023-05-10',
    purchase_price: 1850,
    store_vendor: 'Best Buy',
    location_room: 'Kitchen',
    warranty_expiry_date: '2024-11-20',
    status: 'Active',
    notes: 'Dual ice maker, Wi-Fi smart diagnostics. Warranty expiring in 7 days!'
  },
  {
    id: 'a3',
    name: 'Honda City ZX CVT',
    category: 'Vehicles',
    brand: 'Honda',
    model_number: '2023 ZX',
    serial_number: 'MAK382901',
    purchase_date: '2023-02-01',
    purchase_price: 18000,
    store_vendor: 'Honda Authorized Dealer',
    location_room: 'Garage',
    warranty_expiry_date: '2026-02-01',
    status: 'Active',
    notes: 'Sedan with Honda Sensing ADAS. Serviced on schedule.'
  },
  {
    id: 'a4',
    name: 'Worcester Bosch Greenstar 4000 Boiler',
    category: 'Home Hardware',
    brand: 'Bosch',
    model_number: 'Greenstar 4000 25kW',
    serial_number: 'WB-4000-882',
    purchase_date: '2023-10-30',
    purchase_price: 3200,
    store_vendor: 'BOXT',
    location_room: 'Utility Room',
    warranty_expiry_date: '2025-10-30',
    status: 'Active',
    notes: 'Includes 2-year BOXT installation guarantee and CP1 Gas Safety cert.'
  }
];

const initialSubscriptions = [
  {
    id: 's1',
    name: 'Auto Comprehensive Insurance (Nationwide)',
    category: 'Insurance',
    cost: 450,
    billing_cycle: 'Annually',
    next_renewal_date: '2024-12-01',
    asset_id: 'a3',
    asset_name: 'Honda City ZX CVT',
    auto_renew: true
  },
  {
    id: 's2',
    name: 'LG Extended AMC Protection',
    category: 'AMC',
    cost: 90,
    billing_cycle: 'Annually',
    next_renewal_date: '2024-11-25',
    asset_id: 'a2',
    asset_name: 'LG French Door Smart Refrigerator',
    auto_renew: false
  },
  {
    id: 's3',
    name: 'Fiber Broadband 500Mbps High Speed',
    category: 'Utility',
    cost: 50,
    billing_cycle: 'Monthly',
    next_renewal_date: '2024-12-05',
    asset_id: null,
    asset_name: 'Home Wide',
    auto_renew: true
  },
  {
    id: 's4',
    name: 'AppleCare+ Protection Plan',
    category: 'AMC',
    cost: 149,
    billing_cycle: 'Annually',
    next_renewal_date: '2025-01-15',
    asset_id: 'a1',
    asset_name: 'MacBook Pro 16" M3 Max',
    auto_renew: true
  }
];

const initialRepairs = [
  {
    id: 'r1',
    asset_id: 'a3',
    asset_name: 'Honda City ZX CVT',
    title: 'Brake Pad & Rotor Replacement',
    service_type: 'Repair',
    status: 'Completed',
    service_date: '2024-07-20',
    service_provider_name: 'Honda Authorized Care',
    labor_cost: 70,
    parts_cost: 50,
    total_cost: 120,
    technician_notes: 'Replaced front ceramic brake pads and resurfaced rotors.'
  },
  {
    id: 'r2',
    asset_id: 'a2',
    asset_name: 'LG French Door Smart Refrigerator',
    title: 'Water Filter Replacement & Compressor Service',
    service_type: 'Preventive',
    status: 'Completed',
    service_date: '2024-03-12',
    service_provider_name: 'LG Direct Care (Maria Lopez)',
    labor_cost: 25,
    parts_cost: 40,
    total_cost: 65,
    technician_notes: 'Replaced LT1000P filter cartridge. Condenser coils vacuumed.'
  },
  {
    id: 'r3',
    asset_id: 'a4',
    asset_name: 'Worcester Bosch Boiler',
    title: 'Annual Gas Safety Inspection & CP1 Cert',
    service_type: 'Inspection',
    status: 'Scheduled',
    service_date: '2024-11-28',
    service_provider_name: 'BOXT Certified Tech (David Parker)',
    labor_cost: 85,
    parts_cost: 0,
    total_cost: 85,
    technician_notes: 'Technician dispatched. Slot: 10:00 AM - 12:00 PM.'
  }
];

const initialDocuments = [
  {
    id: 'd1',
    title: 'MacBook Pro Tax Invoice & Receipt',
    document_type: 'Invoice',
    asset_id: 'a1',
    asset_name: 'MacBook Pro 16"',
    file_name: 'apple-invoice-m3.pdf',
    expiry_date: null
  },
  {
    id: 'd2',
    title: 'LG Refrigerator Warranty Card',
    document_type: 'Warranty_Card',
    asset_id: 'a2',
    asset_name: 'LG French Door Refrigerator',
    file_name: 'lg-warranty-card.pdf',
    expiry_date: '2024-11-20'
  },
  {
    id: 'd3',
    title: 'Honda Comprehensive Insurance Policy',
    document_type: 'Insurance_Policy',
    asset_id: 'a3',
    asset_name: 'Honda City ZX CVT',
    file_name: 'honda-policy-2024.pdf',
    expiry_date: '2024-12-01'
  },
  {
    id: 'd4',
    title: 'CP1 Gas Safety Certificate',
    document_type: 'Manual',
    asset_id: 'a4',
    asset_name: 'Worcester Bosch Boiler',
    file_name: 'cp1-gas-safety.pdf',
    expiry_date: '2025-10-30'
  }
];

const initialTasks = [
  { id: 't1', room: 'Home Office', title: 'Wipe down desk & clean monitor surfaces', due: 'Due in 5 days', priority: 'Normal' },
  { id: 't2', room: 'Kitchen', title: 'Replace LG Refrigerator water filter', due: 'Due in 2 weeks', priority: 'High' },
  { id: 't3', room: 'Entire Home', title: 'Annual Boiler safety check with David Parker', due: 'Due Nov 28', priority: 'Urgent' },
  { id: 't4', room: 'Garage', title: 'Honda City synthetic oil check', due: 'Due in 1 month', priority: 'Normal' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [assets, setAssets] = useState(initialAssets);
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [repairs, setRepairs] = useState(initialRepairs);
  const [documents, setDocuments] = useState(initialDocuments);
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedAsset, setSelectedAsset] = useState(initialAssets[0]);
  const [backendConnected, setBackendConnected] = useState(false);

  // ===== Auth state =====
  const [token, setToken] = useState(() => localStorage.getItem('ld_token') || '');
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ld_user')) || null; } catch { return null; }
  });
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [roomFilter, setRoomFilter] = useState('All');

  // Modals
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [showAddSubModal, setShowAddSubModal] = useState(false);
  const [showAddRepairModal, setShowAddRepairModal] = useState(false);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // Forms
  const [newAsset, setNewAsset] = useState({
    name: '',
    category: 'Electronics',
    brand: '',
    model_number: '',
    serial_number: '',
    purchase_price: '',
    purchase_date: '',
    store_vendor: '',
    location_room: 'Living Room',
    warranty_expiry_date: '',
    notes: ''
  });

  const [newSub, setNewSub] = useState({
    name: '',
    category: 'Insurance',
    cost: '',
    billing_cycle: 'Monthly',
    next_renewal_date: '',
    asset_id: '',
    auto_renew: true
  });

  const [newRepair, setNewRepair] = useState({
    asset_id: '',
    title: '',
    service_type: 'Repair',
    service_provider_name: '',
    service_date: '',
    labor_cost: '',
    parts_cost: '',
    technician_notes: ''
  });

  const [newDoc, setNewDoc] = useState({
    title: '',
    document_type: 'Invoice',
    asset_id: '',
    file_name: '',
    expiry_date: ''
  });

  const [newTask, setNewTask] = useState({
    room: 'Home Office',
    title: '',
    due: 'Due in 7 days',
    priority: 'Normal'
  });

  // Authenticated fetch helper — attaches the JWT Bearer token
  const authHeaders = () => (token ? { Authorization: `Bearer ${token}` } : {});

  // Try fetching from Express / PostgreSQL backend on mount
  useEffect(() => {
    async function fetchBackendData() {
      try {
        const h = token ? { Authorization: `Bearer ${token}` } : {};
        const [resAssets, resSubs, resMaint, resDocs] = await Promise.all([
          fetch(`${API_BASE}/assets`, { headers: h }),
          fetch(`${API_BASE}/subscriptions`, { headers: h }),
          fetch(`${API_BASE}/maintenance`, { headers: h }),
          fetch(`${API_BASE}/documents`, { headers: h })
        ]);

        if (resAssets.ok && resSubs.ok) {
          const [dataAssets, dataSubs, dataMaint, dataDocs] = await Promise.all([
            resAssets.json(),
            resSubs.json(),
            resMaint.json(),
            resDocs.json()
          ]);

          if (dataAssets.length > 0) setAssets(dataAssets);
          if (dataSubs.length > 0) setSubscriptions(dataSubs);
          if (dataMaint.length > 0) setRepairs(dataMaint);
          if (dataDocs.length > 0) setDocuments(dataDocs);
          setBackendConnected(true);
        }
      } catch (err) {
        // Backend not currently reachable; works seamlessly in offline/local state
        setBackendConnected(false);
      }
    }
    fetchBackendData();
  }, [token]);

  // Sync selectedAsset when assets change
  useEffect(() => {
    if (assets.length > 0 && !selectedAsset) {
      setSelectedAsset(assets[0]);
    }
  }, [assets, selectedAsset]);

  // KPI Calculations
  const totalAssetValue = assets.reduce((sum, a) => sum + Number(a.purchase_price || 0), 0);
  const monthlyRecurring = subscriptions.reduce((sum, s) => {
    const cost = Number(s.cost || 0);
    if (s.billing_cycle === 'Monthly') return sum + cost;
    if (s.billing_cycle === 'Quarterly') return sum + cost / 3;
    if (s.billing_cycle === 'Annually') return sum + cost / 12;
    return sum + cost;
  }, 0);
  const totalRepairsCost = repairs.reduce((sum, r) => sum + Number(r.total_cost || (Number(r.labor_cost || 0) + Number(r.parts_cost || 0))), 0);

  // Dynamic TCO Calculation for Selected Asset in Smart Timeline
  const selectedAssetRepairs = repairs.filter(r => r.asset_id === selectedAsset?.id);
  const selectedAssetSubs = subscriptions.filter(s => s.asset_id === selectedAsset?.id);
  const assetRepairSum = selectedAssetRepairs.reduce((sum, r) => sum + Number(r.total_cost || (Number(r.labor_cost || 0) + Number(r.parts_cost || 0))), 0);
  const assetSubsSum = selectedAssetSubs.reduce((sum, s) => sum + Number(s.cost || 0), 0);
  const selectedAssetTCO = Number(selectedAsset?.purchase_price || 0) + assetRepairSum + assetSubsSum;

  // Form Submissions
  const handleAddAsset = async (e) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.purchase_price) return;

    const assetItem = {
      id: `a_${Date.now()}`,
      ...newAsset,
      purchase_price: Number(newAsset.purchase_price),
      status: 'Active'
    };

    setAssets([assetItem, ...assets]);
    setShowAddAssetModal(false);

    // Sync to PostgreSQL backend
    try {
      await fetch(`${API_BASE}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(assetItem)
      });
    } catch (_) {}

    setNewAsset({
      name: '',
      category: 'Electronics',
      brand: '',
      model_number: '',
      serial_number: '',
      purchase_price: '',
      purchase_date: '',
      store_vendor: '',
      location_room: 'Living Room',
      warranty_expiry_date: '',
      notes: ''
    });
  };

  const handleAddSub = async (e) => {
    e.preventDefault();
    if (!newSub.name || !newSub.cost) return;

    const linkedAsset = assets.find(a => a.id === newSub.asset_id);
    const subItem = {
      id: `s_${Date.now()}`,
      ...newSub,
      cost: Number(newSub.cost),
      asset_name: linkedAsset ? linkedAsset.name : 'Home Wide',
      status: 'Active'
    };

    setSubscriptions([subItem, ...subscriptions]);
    setShowAddSubModal(false);

    try {
      await fetch(`${API_BASE}/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(subItem)
      });
    } catch (_) {}

    setNewSub({ name: '', category: 'Insurance', cost: '', billing_cycle: 'Monthly', next_renewal_date: '', asset_id: '', auto_renew: true });
  };

  const handleAddRepair = async (e) => {
    e.preventDefault();
    if (!newRepair.title || !newRepair.asset_id) return;

    const linkedAsset = assets.find(a => a.id === newRepair.asset_id);
    const labor = Number(newRepair.labor_cost || 0);
    const parts = Number(newRepair.parts_cost || 0);

    const repairItem = {
      id: `r_${Date.now()}`,
      ...newRepair,
      asset_name: linkedAsset ? linkedAsset.name : 'Unknown Asset',
      labor_cost: labor,
      parts_cost: parts,
      total_cost: labor + parts,
      status: 'Scheduled'
    };

    setRepairs([repairItem, ...repairs]);
    setShowAddRepairModal(false);

    try {
      await fetch(`${API_BASE}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(repairItem)
      });
    } catch (_) {}

    setNewRepair({ asset_id: '', title: '', service_type: 'Repair', service_provider_name: '', service_date: '', labor_cost: '', parts_cost: '', technician_notes: '' });
  };

  const handleAddDoc = async (e) => {
    e.preventDefault();
    if (!newDoc.title) return;

    const linkedAsset = assets.find(a => a.id === newDoc.asset_id);
    const docItem = {
      id: `d_${Date.now()}`,
      ...newDoc,
      asset_name: linkedAsset ? linkedAsset.name : 'General',
      file_name: newDoc.file_name || `${newDoc.title.toLowerCase().replace(/\s+/g, '-')}.pdf`
    };

    setDocuments([docItem, ...documents]);
    setShowAddDocModal(false);

    try {
      await fetch(`${API_BASE}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(docItem)
      });
    } catch (_) {}

    setNewDoc({ title: '', document_type: 'Invoice', asset_id: '', file_name: '', expiry_date: '' });
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title) return;
    setTasks([{ id: `t_${Date.now()}`, ...newTask }, ...tasks]);
    setShowAddTaskModal(false);
    setNewTask({ room: 'Home Office', title: '', due: 'Due in 7 days', priority: 'Normal' });
  };

  // Filtered Assets
  const filteredAssets = assets.filter(a => {
    const matchesSearch = searchQuery === '' || 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (a.brand && a.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.serial_number && a.serial_number.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = categoryFilter === 'All' || a.category === categoryFilter;
    const matchesRoom = roomFilter === 'All' || a.location_room === roomFilter;
    return matchesSearch && matchesCat && matchesRoom;
  });

  // ===== Auth handlers =====
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const endpoint = authMode === 'register' ? 'register' : 'login';
      const payload = authMode === 'register'
        ? { name: authForm.name, email: authForm.email, password: authForm.password }
        : { email: authForm.email, password: authForm.password };

      const res = await fetch(`${API_BASE}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.message || 'Something went wrong. Please try again.');
        return;
      }

      localStorage.setItem('ld_token', data.token);
      localStorage.setItem('ld_user', JSON.stringify(data.user));
      setToken(data.token);
      setCurrentUser(data.user);
      setAuthForm({ name: '', email: '', password: '' });
    } catch (err) {
      setAuthError('Cannot reach the server. Is the API running on port 5000?');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ld_token');
    localStorage.removeItem('ld_user');
    setToken('');
    setCurrentUser(null);
    setAuthMode('login');
    setAuthForm({ name: '', email: '', password: '' });
  };

  // ===== Auth gate: show login / register screen when not authenticated =====
  if (!token) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="brand-icon"><Layers size={24} /></div>
            <div>
              <div className="brand-title">LifeHub</div>
              <div className="brand-tagline">Personal Life Management · LifeDesk</div>
            </div>
          </div>

          <h2 className="auth-title">
            {authMode === 'register' ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="auth-subtitle">
            {authMode === 'register'
              ? 'Sign up to start tracking your assets, warranties and subscriptions.'
              : 'Sign in to access your LifeDesk dashboard.'}
          </p>

          <form onSubmit={handleAuthSubmit} className="auth-form">
            {authMode === 'register' && (
              <label className="auth-field">
                <span>Full Name</span>
                <input
                  type="text"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  placeholder="Alex Morgan"
                  required
                />
              </label>
            )}
            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                placeholder="demo@lifedesk.com"
                required
              />
            </label>
            <label className="auth-field">
              <span>Password</span>
              <input
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </label>

            {authError && <div className="auth-error"><AlertCircle size={15} /> {authError}</div>}

            <button type="submit" className="auth-submit" disabled={authLoading}>
              {authLoading ? 'Please wait…' : authMode === 'register' ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="auth-switch">
            {authMode === 'register' ? (
              <span>Already have an account?{' '}
                <button type="button" onClick={() => { setAuthMode('login'); setAuthError(''); }}>Sign in</button>
              </span>
            ) : (
              <span>New to LifeHub?{' '}
                <button type="button" onClick={() => { setAuthMode('register'); setAuthError(''); }}>Create an account</button>
              </span>
            )}
          </div>

          {authMode === 'login' && (
            <div className="auth-demo-hint">
              <Sparkles size={13} /> Demo: <strong>demo@lifedesk.com</strong> / <strong>password123</strong>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Top Header with Encrypted & Database Badges */}
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-icon">
              <Layers size={22} />
            </div>
            <div>
              <div className="brand-title">LifeHub</div>
              <div className="brand-tagline">Personal Life Management Platform · LifeDesk</div>
            </div>
          </div>

          <div className="header-badges">
            <div className="security-pill">
              <Lock size={13} /> End-to-End Encrypted
            </div>
            <div className="db-pill">
              <Database size={13} /> {backendConnected ? 'PostgreSQL Live (Port 5432)' : 'Local Ready'}
            </div>
            {currentUser && (
              <div className="user-chip">
                <User size={14} />
                <span>{currentUser.name || currentUser.email}</span>
              </div>
            )}
            <button className="logout-btn" onClick={handleLogout} title="Sign out">
              <ExternalLink size={14} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Bar Tabs */}
      <div className="nav-tabs-wrapper">
        <nav className="nav-tabs">
          <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <Layers size={16} /> Action Center
          </button>
          <button className={`tab-btn ${activeTab === 'assets' ? 'active' : ''}`} onClick={() => setActiveTab('assets')}>
            <Home size={16} /> Asset Inventory ({assets.length})
          </button>
          <button className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}>
            <Clock size={16} /> LifeHub Smart Timeline
          </button>
          <button className={`tab-btn ${activeTab === 'subscriptions' ? 'active' : ''}`} onClick={() => setActiveTab('subscriptions')}>
            <CreditCard size={16} /> SubSave ({subscriptions.length})
          </button>
          <button className={`tab-btn ${activeTab === 'repairs' ? 'active' : ''}`} onClick={() => setActiveTab('repairs')}>
            <Wrench size={16} /> FixFlow ({repairs.length})
          </button>
          <button className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>
            <FileText size={16} /> Document Vault ({documents.length})
          </button>
          <button className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            <BarChart2 size={16} /> Cost Analytics
          </button>
        </nav>
      </div>

      {/* Main Body */}
      <main className="main-content">
        
        {/* ================= TAB 1: SMART ACTION CENTER (DASHBOARD) ================= */}
        {activeTab === 'dashboard' && (
          <div>
            {/* AI Assistant Search Bar (Image 1) */}
            <div className="ai-bar">
              <div className="ai-bar-label">
                <Sparkles size={16} /> AI Assistant
              </div>
              <input 
                type="text" 
                className="ai-bar-input" 
                placeholder="Ask me anything about your household data, documents, warranty events, or savings..." 
              />
              <button className="secondary-btn" style={{ border: 'none', background: 'transparent' }}>
                <ArrowRight size={16} color="var(--primary)" />
              </button>
            </div>

            {/* Quick Overview Category Cards (Image 1) */}
            <div className="overview-pills">
              <div className="overview-pill" onClick={() => setActiveTab('assets')}>
                <div className="pill-icon blue"><Building size={20} /></div>
                <div>
                  <div className="pill-count">{assets.length}</div>
                  <div className="pill-label">Assets Owned</div>
                </div>
              </div>
              <div className="overview-pill" onClick={() => setActiveTab('assets')}>
                <div className="pill-icon green"><Car size={20} /></div>
                <div>
                  <div className="pill-count">{assets.filter(a => a.category === 'Vehicles').length}</div>
                  <div className="pill-label">Vehicles</div>
                </div>
              </div>
              <div className="overview-pill" onClick={() => setActiveTab('subscriptions')}>
                <div className="pill-icon purple"><ShieldCheck size={20} /></div>
                <div>
                  <div className="pill-count">{subscriptions.filter(s => s.category === 'Insurance' || s.category === 'AMC').length}</div>
                  <div className="pill-label">Contracts / AMC</div>
                </div>
              </div>
              <div className="overview-pill" onClick={() => setActiveTab('documents')}>
                <div className="pill-icon yellow"><FileText size={20} /></div>
                <div>
                  <div className="pill-count">{documents.length}</div>
                  <div className="pill-label">Vaulted Docs</div>
                </div>
              </div>
              <div className="overview-pill" onClick={() => setActiveTab('repairs')}>
                <div className="pill-icon pink"><Wrench size={20} /></div>
                <div>
                  <div className="pill-count">{repairs.filter(r => r.status !== 'Completed').length}</div>
                  <div className="pill-label">Open Repairs</div>
                </div>
              </div>
            </div>

            {/* Urgent Attention Required Banner (Image 1) */}
            <div className="urgent-banner">
              <div className="urgent-icon">
                <AlertTriangle size={24} />
              </div>
              <div className="urgent-content">
                <div className="urgent-title">Urgent Attention Required (2 items)</div>
                <div className="urgent-desc">
                  • <strong>LG French Door Refrigerator:</strong> Warranty expires in <strong>7 days</strong> (Nov 20, 2024). AMC renewal recommended.<br />
                  • <strong>Honda City ZX Auto Insurance:</strong> Annual renewal payment of $450 due on Dec 1, 2024.
                </div>
              </div>
              <button className="primary-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setActiveTab('subscriptions')}>
                Review Actions
              </button>
            </div>

            {/* Financial KPI Cards */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon blue"><DollarSign size={24} /></div>
                <div>
                  <div className="kpi-label">Total Asset Value</div>
                  <div className="kpi-value">${totalAssetValue.toLocaleString()}</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon purple"><CreditCard size={24} /></div>
                <div>
                  <div className="kpi-label">Monthly Commitments</div>
                  <div className="kpi-value">${Math.round(monthlyRecurring)}/mo</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon emerald"><ShieldCheck size={24} /></div>
                <div>
                  <div className="kpi-label">Active Protected Assets</div>
                  <div className="kpi-value">{assets.filter(a => a.status === 'Active').length} Active</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon amber"><Wrench size={24} /></div>
                <div>
                  <div className="kpi-label">Total Maintenance YTD</div>
                  <div className="kpi-value">${totalRepairsCost}</div>
                </div>
              </div>
            </div>

            {/* Two Column Layout: Upcoming Tasks (Image 7) & Quick Asset Registry */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.75rem', marginTop: '1rem' }}>
              
              {/* Left Column: Upcoming Actions (Image 7) */}
              <div>
                <div className="section-header">
                  <div>
                    <h3 className="section-title">Upcoming Actions & Tasks</h3>
                    <p className="section-subtitle">Maintenance schedules, filter replacements, and life tasks</p>
                  </div>
                  <button className="secondary-btn" onClick={() => setShowAddTaskModal(true)}>
                    <Plus size={14} /> Add Task
                  </button>
                </div>

                <div className="tasks-list">
                  {tasks.map(t => (
                    <div key={t.id} className="task-item">
                      <div>
                        <div className="task-room">{t.room}</div>
                        <div className="task-title">{t.title}</div>
                        <div className="task-due">
                          <Calendar size={13} /> {t.due}
                        </div>
                      </div>
                      <span className={`badge ${t.priority === 'Urgent' ? 'repair' : 'active'}`}>
                        {t.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Key Assets Quick View */}
              <div>
                <div className="section-header">
                  <div>
                    <h3 className="section-title">Household Belongings</h3>
                    <p className="section-subtitle">Most valuable registered assets</p>
                  </div>
                  <button className="primary-btn" onClick={() => setShowAddAssetModal(true)}>
                    <Plus size={14} /> Add Asset
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {assets.slice(0, 3).map(asset => (
                    <div key={asset.id} className="card" style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span className="badge blue">{asset.category}</span>
                        <span className="badge active">{asset.location_room}</span>
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{asset.name}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0.75rem 0' }}>
                        Brand: {asset.brand || 'N/A'} · Model: {asset.model_number || 'N/A'}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                          ${Number(asset.purchase_price).toLocaleString()}
                        </div>
                        <button 
                          className="secondary-btn"
                          onClick={() => { setSelectedAsset(asset); setActiveTab('timeline'); }}
                        >
                          <Clock size={14} /> Smart Timeline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================= TAB 2: ASSET INVENTORY (Image 2 & 4) ================= */}
        {activeTab === 'assets' && (
          <div>
            <div className="section-header">
              <div>
                <h2 className="section-title">Asset Inventory & Registry</h2>
                <p className="section-subtitle">Manage physical appliances, electronics, vehicles, and furniture with warranty tracking.</p>
              </div>
              <button className="primary-btn" onClick={() => setShowAddAssetModal(true)}>
                <Plus size={16} /> Register New Asset
              </button>
            </div>

            {/* Search and Filters Bar (Image 4) */}
            <div className="search-filter-bar">
              <div className="search-box">
                <Search size={18} color="var(--text-muted)" />
                <input 
                  type="text" 
                  placeholder="Find by name, serial number, brand, vendor, or notes..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select className="filter-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="All">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Home Appliances">Home Appliances</option>
                <option value="Vehicles">Vehicles</option>
                <option value="Home Hardware">Home Hardware</option>
              </select>

              <select className="filter-select" value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)}>
                <option value="All">All Rooms</option>
                <option value="Living Room">Living Room</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Home Office">Home Office</option>
                <option value="Garage">Garage</option>
                <option value="Utility Room">Utility Room</option>
              </select>

              {(searchQuery || categoryFilter !== 'All' || roomFilter !== 'All') && (
                <button 
                  className="secondary-btn" 
                  onClick={() => { setSearchQuery(''); setCategoryFilter('All'); setRoomFilter('All'); }}
                >
                  <X size={14} /> Clear
                </button>
              )}
            </div>

            {/* Assets Grid (Image 4 Warracker Style) */}
            <div className="cards-grid">
              {filteredAssets.map((asset) => {
                const isExpiringSoon = asset.warranty_expiry_date && new Date(asset.warranty_expiry_date) > new Date() && new Date(asset.warranty_expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                const isExpired = asset.warranty_expiry_date && new Date(asset.warranty_expiry_date) < new Date();
                const cardHeaderStyle = isExpiringSoon ? 'gold' : isExpired ? 'gray' : 'green';

                return (
                  <div key={asset.id} className="card">
                    {/* Header Bar */}
                    <div className={`card-top-bar ${cardHeaderStyle}`}>
                      <span>{asset.name}</span>
                      <span className="badge active">{asset.category}</span>
                    </div>

                    <div className="card-body">
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                        <div><strong>Brand:</strong> {asset.brand || 'N/A'}</div>
                        <div><strong>Room:</strong> {asset.location_room || 'N/A'}</div>
                        <div><strong>Model:</strong> {asset.model_number || 'N/A'}</div>
                        <div><strong>Serial:</strong> {asset.serial_number || 'N/A'}</div>
                        <div><strong>Vendor:</strong> {asset.store_vendor || 'N/A'}</div>
                        <div><strong>Purchased:</strong> {asset.purchase_date || 'N/A'}</div>
                      </div>

                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.75rem' }}>
                        ${Number(asset.purchase_price).toLocaleString()}
                      </div>

                      <div style={{ fontSize: '0.8125rem', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0', color: isExpiringSoon ? '#b45309' : '#475569' }}>
                        <strong>Warranty Status:</strong> {isExpiringSoon ? '⚠️ Expiring in 7 days!' : isExpired ? 'Expired' : `Valid until ${asset.warranty_expiry_date}`}
                      </div>
                    </div>

                    <div className="card-footer">
                      <button 
                        className="secondary-btn" 
                        onClick={() => { setSelectedAsset(asset); setActiveTab('timeline'); }}
                      >
                        <Clock size={14} /> Smart Timeline
                      </button>
                      <button 
                        className="primary-btn" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        onClick={() => { setNewRepair({ ...newRepair, asset_id: asset.id }); setShowAddRepairModal(true); }}
                      >
                        <Wrench size={13} /> Report Issue
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 3: LIFEHUB SMART TIMELINE (SIGNATURE Differentiator) ================= */}
        {activeTab === 'timeline' && (
          <div>
            <div className="section-header">
              <div>
                <h2 className="section-title">LifeHub Smart Timeline</h2>
                <p className="section-subtitle">
                  Unified chronological lifecycle and dynamic Total Cost of Ownership (TCO) for <strong>{selectedAsset?.name}</strong>.
                </p>
              </div>

              {/* Asset Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Switch Asset:</span>
                <select 
                  className="filter-select"
                  value={selectedAsset?.id} 
                  onChange={(e) => setSelectedAsset(assets.find(a => a.id === e.target.value))}
                >
                  {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>

            {/* Total Cost of Ownership (TCO) Banner */}
            <div className="timeline-tco-banner">
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Dynamic Total Cost of Ownership (TCO)
                </div>
                <div className="tco-amount">
                  ${selectedAssetTCO.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {selectedAsset?.name} ({selectedAsset?.brand}) · Serial: {selectedAsset?.serial_number || 'N/A'}
                </div>
              </div>

              <div className="tco-breakdown">
                <div className="tco-item">
                  <div className="tco-item-label">Initial Purchase</div>
                  <div className="tco-item-val">${Number(selectedAsset?.purchase_price || 0).toLocaleString()}</div>
                </div>
                <div className="tco-item">
                  <div className="tco-item-label">Repairs & Maintenance</div>
                  <div className="tco-item-val">${assetRepairSum.toLocaleString()}</div>
                </div>
                <div className="tco-item">
                  <div className="tco-item-label">AMCs & Protection</div>
                  <div className="tco-item-val">${assetSubsSum.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Chronological Timeline Feed */}
            <div className="timeline-feed">
              {/* 1. Purchase Milestone */}
              <div className="timeline-item">
                <div className="timeline-dot emerald"></div>
                <div className="timeline-date">
                  <Calendar size={13} /> {selectedAsset?.purchase_date || 'Purchase Date'} · <span className="badge active">Purchase Milestone</span>
                </div>
                <div className="timeline-event-title">Acquired & Registered: {selectedAsset?.name}</div>
                <div className="timeline-event-desc">
                  Purchased from {selectedAsset?.store_vendor || 'Authorized Vendor'}. Initial capital expenditure.
                </div>
                <div className="timeline-cost">+ ${Number(selectedAsset?.purchase_price || 0).toLocaleString()}</div>
              </div>

              {/* 2. Document Vault Events */}
              {documents.filter(d => d.asset_id === selectedAsset?.id).map((doc, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-date">
                    <FileText size={13} /> Document Vaulted · <span className="badge blue">{doc.document_type}</span>
                  </div>
                  <div className="timeline-event-title">{doc.title}</div>
                  <div className="timeline-event-desc">File: {doc.file_name} · Securely archived in LifeAdmin Vault.</div>
                  <div className="timeline-cost" style={{ background: '#f1f5f9', color: '#475569' }}>Vault Record (No Cost)</div>
                </div>
              ))}

              {/* 3. Subscription & Protection Plans */}
              {selectedAssetSubs.map((sub, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-dot purple"></div>
                  <div className="timeline-date">
                    <CreditCard size={13} /> Contract Milestone · <span className="badge purple">{sub.category}</span>
                  </div>
                  <div className="timeline-event-title">{sub.name}</div>
                  <div className="timeline-event-desc">
                    Billing cadence: {sub.billing_cycle} · Next scheduled renewal: {sub.next_renewal_date}
                  </div>
                  <div className="timeline-cost">+ ${sub.cost} / {sub.billing_cycle.toLowerCase()}</div>
                </div>
              ))}

              {/* 4. Repair & Maintenance Milestones */}
              {selectedAssetRepairs.map((rep, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-dot danger"></div>
                  <div className="timeline-date">
                    <Wrench size={13} /> {rep.service_date || 'Service Date'} · <span className="badge warning">{rep.service_type}</span>
                  </div>
                  <div className="timeline-event-title">{rep.title}</div>
                  <div className="timeline-event-desc">
                    Provider: {rep.service_provider_name} · Status: <strong>{rep.status}</strong><br />
                    Notes: {rep.technician_notes || 'Service performed as scheduled.'}
                  </div>
                  <div className="timeline-cost">
                    + ${rep.total_cost || (Number(rep.labor_cost || 0) + Number(rep.parts_cost || 0))} (Labor: ${rep.labor_cost || 0}, Parts: ${rep.parts_cost || 0})
                  </div>
                </div>
              ))}

              {/* 5. Warranty Expiry Milestone */}
              {selectedAsset?.warranty_expiry_date && (
                <div className="timeline-item">
                  <div className="timeline-dot amber"></div>
                  <div className="timeline-date">
                    <ShieldCheck size={13} /> {selectedAsset.warranty_expiry_date} · <span className="badge warning">Warranty Expiration</span>
                  </div>
                  <div className="timeline-event-title">Manufacturer Warranty Expiration Threshold</div>
                  <div className="timeline-event-desc">
                    End of standard coverage. LifeHub alerts 30 days and 7 days prior to ensure uninterrupted AMC coverage.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 4: SUBSAVE (RENEWALS & CONTRACTS) ================= */}
        {activeTab === 'subscriptions' && (
          <div>
            <div className="section-header">
              <div>
                <h2 className="section-title">SubSave — Renewal & Contract Watcher</h2>
                <p className="section-subtitle">Track recurring insurance policies, AMCs, utilities, and software services.</p>
              </div>
              <button className="primary-btn" onClick={() => setShowAddSubModal(true)}>
                <Plus size={16} /> Add Subscription / AMC
              </button>
            </div>

            <div className="cards-grid">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="card">
                  <div className="card-top-bar blue">
                    <span>{sub.name}</span>
                    <span className="badge purple">{sub.category}</span>
                  </div>
                  <div className="card-body">
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', margin: '0.5rem 0' }}>
                      ${sub.cost} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>/{sub.billing_cycle.toLowerCase()}</span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      <strong>Linked Asset:</strong> {sub.asset_name || 'Home-Wide'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: 600 }}>
                      Next Renewal: <strong>{sub.next_renewal_date}</strong>
                    </div>
                  </div>
                  <div className="card-footer">
                    <span className={`badge ${sub.auto_renew ? 'active' : 'warning'}`}>
                      {sub.auto_renew ? 'Auto-Renew: ON' : 'Manual Payment'}
                    </span>
                    <button className="secondary-btn" onClick={() => alert(`Marked ${sub.name} for reminder notifications.`)}>
                      Set Reminder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: FIXFLOW (REPAIR & SERVICE TRACKER) ================= */}
        {activeTab === 'repairs' && (
          <div>
            <div className="section-header">
              <div>
                <h2 className="section-title">FixFlow — Repair & Maintenance Management</h2>
                <p className="section-subtitle">Track service requests, assigned technicians, breakdown history, and repair expenses.</p>
              </div>
              <button className="primary-btn" onClick={() => setShowAddRepairModal(true)}>
                <Plus size={16} /> Log Service / Repair
              </button>
            </div>

            <div className="cards-grid">
              {repairs.map((rep) => (
                <div key={rep.id} className="card">
                  <div className="card-top-bar green">
                    <span>{rep.asset_name}</span>
                    <span className={`badge ${rep.status === 'Completed' ? 'active' : 'repair'}`}>{rep.status}</span>
                  </div>
                  <div className="card-body">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{rep.title}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      <User size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      <strong>Provider:</strong> {rep.service_provider_name}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      <Calendar size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      <strong>Service Date:</strong> {rep.service_date}
                    </div>
                    <div style={{ fontSize: '0.8125rem', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', marginBottom: '0.75rem' }}>
                      {rep.technician_notes || 'Routine maintenance performed.'}
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                      Total Cost: ${rep.total_cost || (Number(rep.labor_cost || 0) + Number(rep.parts_cost || 0))}
                    </div>
                  </div>
                  <div className="card-footer">
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Labor: ${rep.labor_cost || 0} · Parts: ${rep.parts_cost || 0}
                    </span>
                    <button className="secondary-btn" onClick={() => alert(`Showing history for ${rep.asset_name}`)}>
                      History
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 6: DOCUMENT VAULT (Image 3) ================= */}
        {activeTab === 'documents' && (
          <div>
            <div className="section-header">
              <div>
                <h2 className="section-title">LifeAdmin — Document Vault</h2>
                <p className="section-subtitle">Invoices, warranty certificates, user manuals, and insurance policies organized in one place.</p>
              </div>
              <button className="primary-btn" onClick={() => setShowAddDocModal(true)}>
                <Plus size={16} /> Vault New Document
              </button>
            </div>

            <div className="cards-grid">
              {documents.map((doc) => (
                <div key={doc.id} className="card">
                  <div className="card-body" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ background: 'var(--primary-light)', padding: '0.875rem', borderRadius: '0.625rem', color: 'var(--primary)' }}>
                      <FileText size={32} />
                    </div>
                    <div>
                      <span className="badge blue" style={{ marginBottom: '0.35rem' }}>{doc.document_type}</span>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{doc.title}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Linked Asset: <strong>{doc.asset_name}</strong>
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                        File: {doc.file_name} {doc.expiry_date ? `· Expiry: ${doc.expiry_date}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="card-footer">
                    <span className="badge active">Verified</span>
                    <button className="secondary-btn" onClick={() => alert(`Opening preview for ${doc.file_name}`)}>
                      <ExternalLink size={13} /> View File
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 7: COST ANALYTICS (Image 6) ================= */}
        {activeTab === 'analytics' && (
          <div>
            <div className="section-header">
              <div>
                <h2 className="section-title">Cost & Maintenance Analytics</h2>
                <p className="section-subtitle">Track long-term maintenance costs vs recurring commitments and asset depreciation.</p>
              </div>
            </div>

            {/* KPI Cards (Image 6) */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon blue"><DollarSign size={24} /></div>
                <div>
                  <div className="kpi-label">Total Spent On Assets</div>
                  <div className="kpi-value">${totalAssetValue.toLocaleString()}</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon purple"><CreditCard size={24} /></div>
                <div>
                  <div className="kpi-label">Average Monthly Commitments</div>
                  <div className="kpi-value">${Math.round(monthlyRecurring)}</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon amber"><Wrench size={24} /></div>
                <div>
                  <div className="kpi-label">Cumulative Maintenance</div>
                  <div className="kpi-value">${totalRepairsCost}</div>
                </div>
              </div>
            </div>

            {/* Visual Bar Chart (Image 6) */}
            <div className="chart-container">
              <div className="chart-header">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Monthly Spending Trend (Maintenance vs Subscriptions)</h3>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <div style={{ width: 12, height: 12, background: '#4f46e5', borderRadius: 2 }}></div> Maintenance & Repairs
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <div style={{ width: 12, height: 12, background: '#f59e0b', borderRadius: 2 }}></div> Subscriptions & AMCs
                  </div>
                </div>
              </div>

              {/* Responsive Pure CSS Chart */}
              <div className="simple-bar-chart">
                {[
                  { month: 'Jan', maint: 0, subs: 85 },
                  { month: 'Feb', maint: 140, subs: 85 },
                  { month: 'Mar', maint: 65, subs: 85 },
                  { month: 'Apr', maint: 0, subs: 85 },
                  { month: 'May', maint: 0, subs: 85 },
                  { month: 'Jun', maint: 0, subs: 85 },
                  { month: 'Jul', maint: 120, subs: 85 },
                  { month: 'Aug', maint: 0, subs: 85 },
                  { month: 'Sep', maint: 0, subs: 85 },
                  { month: 'Oct', maint: 0, subs: 85 },
                  { month: 'Nov', maint: 85, subs: 540 },
                  { month: 'Dec', maint: 0, subs: 85 }
                ].map((item, idx) => (
                  <div key={idx} className="bar-column">
                    <div className="bar-stack" style={{ height: `${Math.min(100, (item.maint + item.subs) / 7)}%` }}>
                      <div className="bar-segment-maint" style={{ height: `${(item.maint / (item.maint + item.subs || 1)) * 100}%` }}></div>
                      <div className="bar-segment-subs" style={{ height: `${(item.subs / (item.maint + item.subs || 1)) * 100}%` }}></div>
                    </div>
                    <div className="bar-label">{item.month}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ================= MODAL: ADD ASSET ================= */}
      {showAddAssetModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Register New Asset</h3>
              <button className="close-btn" onClick={() => setShowAddAssetModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddAsset}>
              <div className="form-group">
                <label>Asset / Product Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Sony Bravia 65-inch OLED TV" 
                  required 
                  value={newAsset.name} 
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })} 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select value={newAsset.category} onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}>
                    <option value="Electronics">Electronics</option>
                    <option value="Home Appliances">Home Appliances</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Home Hardware">Home Hardware</option>
                    <option value="Furniture">Furniture</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Room / Location</label>
                  <select value={newAsset.location_room} onChange={(e) => setNewAsset({ ...newAsset, location_room: e.target.value })}>
                    <option value="Living Room">Living Room</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Home Office">Home Office</option>
                    <option value="Garage">Garage</option>
                    <option value="Utility Room">Utility Room</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Brand</label>
                  <input type="text" placeholder="Apple, LG, Bosch" value={newAsset.brand} onChange={(e) => setNewAsset({ ...newAsset, brand: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Model Number</label>
                  <input type="text" placeholder="A2991" value={newAsset.model_number} onChange={(e) => setNewAsset({ ...newAsset, model_number: e.target.value })} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Purchase Price ($) *</label>
                  <input type="number" placeholder="1499" required value={newAsset.purchase_price} onChange={(e) => setNewAsset({ ...newAsset, purchase_price: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Purchase Date</label>
                  <input type="date" value={newAsset.purchase_date} onChange={(e) => setNewAsset({ ...newAsset, purchase_date: e.target.value })} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Vendor / Store</label>
                  <input type="text" placeholder="Best Buy, Amazon" value={newAsset.store_vendor} onChange={(e) => setNewAsset({ ...newAsset, store_vendor: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Warranty Expiry Date</label>
                  <input type="date" value={newAsset.warranty_expiry_date} onChange={(e) => setNewAsset({ ...newAsset, warranty_expiry_date: e.target.value })} />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddAssetModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn">Save Asset to LifeHub</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD SUBSCRIPTION ================= */}
      {showAddSubModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Add Subscription / AMC Contract</h3>
              <button className="close-btn" onClick={() => setShowAddSubModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddSub}>
              <div className="form-group">
                <label>Contract / Service Name *</label>
                <input type="text" placeholder="e.g. Car Comprehensive Insurance" required value={newSub.name} onChange={(e) => setNewSub({ ...newSub, name: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select value={newSub.category} onChange={(e) => setNewSub({ ...newSub, category: e.target.value })}>
                    <option value="Insurance">Insurance</option>
                    <option value="AMC">AMC (Maintenance Contract)</option>
                    <option value="Utility">Utility</option>
                    <option value="Software">Software / Cloud</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Link to Asset</label>
                  <select value={newSub.asset_id} onChange={(e) => setNewSub({ ...newSub, asset_id: e.target.value })}>
                    <option value="">None (Home Wide)</option>
                    {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Cost ($) *</label>
                  <input type="number" placeholder="450" required value={newSub.cost} onChange={(e) => setNewSub({ ...newSub, cost: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Billing Cycle *</label>
                  <select value={newSub.billing_cycle} onChange={(e) => setNewSub({ ...newSub, billing_cycle: e.target.value })}>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annually">Annually</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Next Renewal Date *</label>
                <input type="date" required value={newSub.next_renewal_date} onChange={(e) => setNewSub({ ...newSub, next_renewal_date: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddSubModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn">Save to SubSave</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: LOG REPAIR ================= */}
      {showAddRepairModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Log Service Request / Repair (FixFlow)</h3>
              <button className="close-btn" onClick={() => setShowAddRepairModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddRepair}>
              <div className="form-group">
                <label>Asset *</label>
                <select required value={newRepair.asset_id} onChange={(e) => setNewRepair({ ...newRepair, asset_id: e.target.value })}>
                  <option value="">Select Asset...</option>
                  {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Issue Title *</label>
                <input type="text" placeholder="e.g. Water leak / Brake pads worn out" required value={newRepair.title} onChange={(e) => setNewRepair({ ...newRepair, title: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Service Type</label>
                  <select value={newRepair.service_type} onChange={(e) => setNewRepair({ ...newRepair, service_type: e.target.value })}>
                    <option value="Repair">Repair</option>
                    <option value="Preventive">Preventive Maintenance</option>
                    <option value="Inspection">Inspection / Safety Check</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Service Date</label>
                  <input type="date" value={newRepair.service_date} onChange={(e) => setNewRepair({ ...newRepair, service_date: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Service Provider / Technician</label>
                <input type="text" placeholder="e.g. David Parker (BOXT Certified)" value={newRepair.service_provider_name} onChange={(e) => setNewRepair({ ...newRepair, service_provider_name: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Labor Cost ($)</label>
                  <input type="number" placeholder="50" value={newRepair.labor_cost} onChange={(e) => setNewRepair({ ...newRepair, labor_cost: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Parts Cost ($)</label>
                  <input type="number" placeholder="40" value={newRepair.parts_cost} onChange={(e) => setNewRepair({ ...newRepair, parts_cost: e.target.value })} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddRepairModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn">Record Service</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: VAULT DOCUMENT ================= */}
      {showAddDocModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Vault Document (LifeAdmin)</h3>
              <button className="close-btn" onClick={() => setShowAddDocModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddDoc}>
              <div className="form-group">
                <label>Document Title *</label>
                <input type="text" placeholder="e.g. Tax Invoice, Gas Certificate" required value={newDoc.title} onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Document Type</label>
                  <select value={newDoc.document_type} onChange={(e) => setNewDoc({ ...newDoc, document_type: e.target.value })}>
                    <option value="Invoice">Invoice / Receipt</option>
                    <option value="Warranty_Card">Warranty Card</option>
                    <option value="Insurance_Policy">Insurance Policy</option>
                    <option value="Manual">Manual / Certificate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Link to Asset</label>
                  <select value={newDoc.asset_id} onChange={(e) => setNewDoc({ ...newDoc, asset_id: e.target.value })}>
                    <option value="">General Document</option>
                    {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Expiration Date (if applicable)</label>
                <input type="date" value={newDoc.expiry_date} onChange={(e) => setNewDoc({ ...newDoc, expiry_date: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddDocModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn">Vault Document</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD TASK ================= */}
      {showAddTaskModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Add Upcoming Action / Task</h3>
              <button className="close-btn" onClick={() => setShowAddTaskModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddTask}>
              <div className="form-group">
                <label>Task Description *</label>
                <input type="text" placeholder="e.g. Clean Gutters, Clean AC Filters" required value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Room / Zone</label>
                  <input type="text" placeholder="Entire Home, Kitchen" value={newTask.room} onChange={(e) => setNewTask({ ...newTask, room: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Due String / Date</label>
                <input type="text" placeholder="Due in 2 weeks" value={newTask.due} onChange={(e) => setNewTask({ ...newTask, due: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddTaskModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn">Save Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
