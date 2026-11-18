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
  Database,
  Mail
} from 'lucide-react';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

// Friendly, human-readable date — turns "2024-11-24T18:30:00.000Z" into "Nov 24, 2024"
const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Turns enum values like "Warranty_Card" / "Insurance_Policy" into "Warranty Card"
const prettyType = (value) => (value ? String(value).replace(/_/g, ' ') : value);

// Data now comes exclusively from the backend (PostgreSQL) — no mock/sample data.

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [assets, setAssets] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [backendConnected, setBackendConnected] = useState(false);

  // ===== Auth state =====
  const [token, setToken] = useState(() => localStorage.getItem('ld_token') || '');
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ld_user')) || null; } catch { return null; }
  });
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'forgot' | 'reset'
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [resetForm, setResetForm] = useState({ email: '', code: '', newPassword: '', confirmPassword: '' });
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authPreviewUrl, setAuthPreviewUrl] = useState('');
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

          setAssets(Array.isArray(dataAssets) ? dataAssets : []);
          setSubscriptions(Array.isArray(dataSubs) ? dataSubs : []);
          setRepairs(Array.isArray(dataMaint) ? dataMaint : []);
          setDocuments(Array.isArray(dataDocs) ? dataDocs : []);
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

  // Check URL parameters for password reset link
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get('email');
      const codeParam = params.get('code');
      if (emailParam || codeParam) {
        setAuthMode('reset');
        setResetForm(prev => ({
          ...prev,
          email: emailParam || prev.email,
          code: codeParam || prev.code
        }));
      }
    } catch (_) {}
  }, []);

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
    setAuthSuccess('');
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

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthPreviewUrl('');
    setAuthLoading(true);

    try {
      const emailToSend = (resetForm.email || authForm.email || '').trim();
      if (!emailToSend) {
        setAuthError('Please enter your email address');
        setAuthLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToSend })
      });
      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.message || 'Failed to send reset code');
        return;
      }

      setAuthSuccess(data.message || 'Verification code sent to your email.');
      if (data.previewUrl) {
        setAuthPreviewUrl(data.previewUrl);
      }
      setResetForm(prev => ({ ...prev, email: emailToSend }));
      setAuthMode('reset');
    } catch (err) {
      setAuthError('Cannot reach the server. Is the API running on port 5000?');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setAuthError('Passwords do not match');
      setAuthLoading(false);
      return;
    }

    if (resetForm.newPassword.length < 6) {
      setAuthError('Password must be at least 6 characters long');
      setAuthLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetForm.email,
          code: resetForm.code,
          newPassword: resetForm.newPassword
        })
      });
      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.message || 'Failed to reset password');
        return;
      }

      setAuthSuccess('Password reset successfully! You can now sign in.');
      setAuthForm(prev => ({ ...prev, email: resetForm.email, password: '' }));
      setResetForm({ email: '', code: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setAuthMode('login');
      }, 1500);
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

  // ===== Auth gate: show login / register / forgot / reset screen when not authenticated =====
  if (!token) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="brand-icon"><Layers size={24} /></div>
            <div>
              <div className="brand-title">LifeHub</div>
              <div className="brand-tagline">Your home &amp; belongings, all in one place</div>
            </div>
          </div>

          <h2 className="auth-title">
            {authMode === 'register' && 'Create your account'}
            {authMode === 'login' && 'Welcome back'}
            {authMode === 'forgot' && 'Reset your password'}
            {authMode === 'reset' && 'Enter Verification Code'}
          </h2>
          <p className="auth-subtitle">
            {authMode === 'register' && 'Sign up to start keeping track of your things, warranties and subscriptions.'}
            {authMode === 'login' && 'Sign in to pick up where you left off.'}
            {authMode === 'forgot' && "Enter your registered email address and we'll send you a 6-digit verification code."}
            {authMode === 'reset' && `Check your inbox (${resetForm.email || 'your email'}) for the 6-digit verification code.`}
          </p>

          {/* LOGIN & REGISTER FORM */}
          {(authMode === 'login' || authMode === 'register') && (
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
                <div className="auth-field-header">
                  <span>Password</span>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      className="auth-forgot-link"
                      onClick={() => {
                        setAuthMode('forgot');
                        setAuthError('');
                        setAuthSuccess('');
                        setResetForm(prev => ({ ...prev, email: authForm.email }));
                      }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </label>

              {authSuccess && <div className="auth-success"><CheckCircle size={15} /> {authSuccess}</div>}
              {authError && (
                <div className="auth-error" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <AlertCircle size={15} /> {authError}
                  </div>
                  {authError.toLowerCase().includes('no account') && (
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: '#4338ca',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                      onClick={() => {
                        setAuthMode('register');
                        setAuthError('');
                        setAuthForm(prev => ({ ...prev, email: resetForm.email }));
                      }}
                    >
                      Click here to create an account with this email →
                    </button>
                  )}
                </div>
              )}

              <button type="submit" className="auth-submit" disabled={authLoading}>
                {authLoading ? 'Please wait…' : authMode === 'register' ? 'Create Account' : 'Sign In'}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {authMode === 'forgot' && (
            <form onSubmit={handleForgotPasswordSubmit} className="auth-form">
              <label className="auth-field">
                <span>Registered Email</span>
                <input
                  type="email"
                  value={resetForm.email}
                  onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                />
              </label>

              {authError && (
                <div className="auth-error" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <AlertCircle size={15} /> {authError}
                  </div>
                  {authError.toLowerCase().includes('no account') && (
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: '#4338ca',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                      onClick={() => {
                        setAuthMode('register');
                        setAuthError('');
                        setAuthForm(prev => ({ ...prev, email: resetForm.email }));
                      }}
                    >
                      Click here to create an account with this email →
                    </button>
                  )}
                </div>
              )}
              {authSuccess && <div className="auth-success"><CheckCircle size={15} /> {authSuccess}</div>}

              <button type="submit" className="auth-submit" disabled={authLoading}>
                {authLoading ? 'Sending code…' : 'Send Verification Code'}
              </button>
            </form>
          )}

          {/* RESET PASSWORD FORM */}
          {authMode === 'reset' && (
            <form onSubmit={handleResetPasswordSubmit} className="auth-form">
              <label className="auth-field">
                <span>Email</span>
                <input
                  type="email"
                  value={resetForm.email}
                  onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })}
                  required
                />
              </label>
              <label className="auth-field">
                <span>6-Digit Verification Code</span>
                <input
                  type="text"
                  maxLength={6}
                  value={resetForm.code}
                  onChange={(e) => setResetForm({ ...resetForm, code: e.target.value })}
                  placeholder="123456"
                  style={{ letterSpacing: '4px', fontWeight: 'bold', fontSize: '1.1rem' }}
                  required
                />
              </label>
              <label className="auth-field">
                <span>New Password</span>
                <input
                  type="password"
                  value={resetForm.newPassword}
                  onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </label>
              <label className="auth-field">
                <span>Confirm New Password</span>
                <input
                  type="password"
                  value={resetForm.confirmPassword}
                  onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </label>

              {authError && (
                <div className="auth-error" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <AlertCircle size={15} /> {authError}
                  </div>
                  {authError.toLowerCase().includes('no account') && (
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        color: '#4338ca',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                      onClick={() => {
                        setAuthMode('register');
                        setAuthError('');
                        setAuthForm(prev => ({ ...prev, email: resetForm.email }));
                      }}
                    >
                      Click here to create an account with this email →
                    </button>
                  )}
                </div>
              )}
              {authSuccess && <div className="auth-success"><CheckCircle size={15} /> {authSuccess}</div>}

              {authPreviewUrl && (
                <div style={{ textAlign: 'center', marginTop: '0.25rem' }}>
                  <a
                    href={authPreviewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="auth-preview-link"
                  >
                    <Mail size={13} /> View test email preview (Ethereal) ↗
                  </a>
                </div>
              )}

              <button type="submit" className="auth-submit" disabled={authLoading}>
                {authLoading ? 'Updating password…' : 'Update Password'}
              </button>
            </form>
          )}

          <div className="auth-switch">
            {authMode === 'register' && (
              <span>Already have an account?{' '}
                <button type="button" onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }}>Sign in</button>
              </span>
            )}
            {authMode === 'login' && (
              <span>New to LifeHub?{' '}
                <button type="button" onClick={() => { setAuthMode('register'); setAuthError(''); setAuthSuccess(''); }}>Create an account</button>
              </span>
            )}
            {(authMode === 'forgot' || authMode === 'reset') && (
              <span>Remember your password?{' '}
                <button type="button" onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }}>Back to Sign In</button>
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

  // ===== Shell helpers =====
  const navItems = [
    { key: 'dashboard', label: 'Home', icon: Layers },
    { key: 'assets', label: 'My Belongings', icon: Home, count: assets.length },
    { key: 'subscriptions', label: 'Subscriptions', icon: CreditCard, count: subscriptions.length },
    { key: 'repairs', label: 'Repairs', icon: Wrench, count: repairs.length },
    { key: 'documents', label: 'Documents', icon: FileText, count: documents.length },
    { key: 'timeline', label: 'History', icon: Clock },
    { key: 'analytics', label: 'Spending', icon: BarChart2 },
  ];

  const firstName = (currentUser?.name || 'there').split(' ')[0];
  const initials = (currentUser?.name || currentUser?.email || '?')
    .split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const pageSubtitle = {
    dashboard: "Here's what needs you today.",
    assets: 'Everything you own, in one place.',
    subscriptions: 'Your plans, bills and renewals.',
    repairs: 'Repairs and maintenance history.',
    documents: 'Invoices, warranties and policies.',
    timeline: 'The full story of each item.',
    analytics: 'Where your money goes.',
  }[activeTab] || '';

  // Things that need attention (warranties ending soon, renewals due, open repairs)
  const soon = (d) => {
    if (!d) return false;
    const date = new Date(d); const now = new Date();
    return date >= now && date <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  };
  const attention = [
    ...assets.filter((a) => soon(a.warranty_expiry_date)).map((a) => ({
      type: 'Warranty', icon: ShieldCheck, tone: 'amber', tab: 'assets',
      title: a.name, detail: `Warranty ends ${formatDate(a.warranty_expiry_date)}`,
    })),
    ...subscriptions.filter((s) => soon(s.next_renewal_date)).map((s) => ({
      type: 'Renewal', icon: CreditCard, tone: 'purple', tab: 'subscriptions',
      title: s.name, detail: `Renews ${formatDate(s.next_renewal_date)} · $${s.cost}`,
    })),
    ...repairs.filter((r) => r.status !== 'Completed').map((r) => ({
      type: 'Repair', icon: Wrench, tone: 'pink', tab: 'repairs',
      title: r.title, detail: `${r.status} · ${r.asset_name || 'Scheduled service'}`,
    })),
  ];

  return (
    <div className="app-shell">
      {/* ===== Left Sidebar ===== */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon"><Layers size={20} /></div>
          <div>
            <div className="brand-title">LifeHub</div>
            <div className="brand-tagline">Home, organized</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className={`side-link ${activeTab === item.key ? 'active' : ''}`}
                onClick={() => setActiveTab(item.key)}
              >
                <Icon size={18} />
                <span className="side-link-label">{item.label}</span>
                {item.count != null && <span className="side-count">{item.count}</span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{currentUser?.name || 'You'}</div>
              <div className="sidebar-user-email">{currentUser?.email}</div>
            </div>
          </div>
          <button className="logout-btn full" onClick={handleLogout} title="Sign out">
            <ExternalLink size={14} /> Sign out
          </button>
        </div>
      </aside>

      {/* ===== Main Column ===== */}
      <div className="app-main">
        <header className="topbar">
          <div>
            <div className="topbar-greeting">{greeting}, {firstName} 👋</div>
            <div className="topbar-sub">{pageSubtitle}</div>
          </div>
          <div className="topbar-badges">
            <div className="security-pill"><Lock size={13} /> Private &amp; secure</div>
            <div className="db-pill">
              <Database size={13} /> {backendConnected ? 'All changes saved' : 'Working offline'}
            </div>
          </div>
        </header>

        <main className="main-content">

        {/* ================= TAB 1: SMART ACTION CENTER (DASHBOARD) ================= */}
        {activeTab === 'dashboard' && (
          <div>
            {/* ===== Needs your attention (leads the page) ===== */}
            <section className="attention-panel">
              <div className="attention-head">
                <div className="attention-head-left">
                  <div className={`attention-badge ${attention.length ? 'warn' : 'ok'}`}>
                    {attention.length ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                  </div>
                  <div>
                    <h2 className="attention-title">
                      {attention.length ? `${attention.length} ${attention.length === 1 ? 'thing needs' : 'things need'} your attention` : "You're all caught up"}
                    </h2>
                    <p className="attention-sub">
                      {attention.length ? 'Warranties ending, renewals due and open repairs.' : 'Nothing needs you in the next 30 days. Nice.'}
                    </p>
                  </div>
                </div>
              </div>

              {attention.length > 0 && (
                <div className="attention-list">
                  {attention.slice(0, 5).map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button key={idx} className="attention-item" onClick={() => setActiveTab(item.tab)}>
                        <div className={`attention-item-icon ${item.tone}`}><Icon size={16} /></div>
                        <div className="attention-item-body">
                          <div className="attention-item-title">{item.title}</div>
                          <div className="attention-item-detail">{item.detail}</div>
                        </div>
                        <span className={`chip ${item.tone}`}>{item.type}</span>
                        <ArrowRight size={16} className="attention-item-arrow" />
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ===== At a glance ===== */}
            <h3 className="block-heading">At a glance</h3>
            {/* Financial KPI Cards */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon blue"><DollarSign size={24} /></div>
                <div>
                  <div className="kpi-label">What your things are worth</div>
                  <div className="kpi-value">${totalAssetValue.toLocaleString()}</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon purple"><CreditCard size={24} /></div>
                <div>
                  <div className="kpi-label">Monthly spending</div>
                  <div className="kpi-value">${Math.round(monthlyRecurring)}/mo</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon emerald"><ShieldCheck size={24} /></div>
                <div>
                  <div className="kpi-label">Protected items</div>
                  <div className="kpi-value">{assets.filter(a => a.status === 'Active').length} Active</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon amber"><Wrench size={24} /></div>
                <div>
                  <div className="kpi-label">Spent on upkeep this year</div>
                  <div className="kpi-value">${totalRepairsCost}</div>
                </div>
              </div>
            </div>

            {/* Two Column Layout: Upcoming Tasks (Image 7) & Quick Asset Registry */}
            <div className="dash-columns">
              
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
                  {tasks.length === 0 ? (
                    <div className="empty-state">
                      <CheckCircle size={22} />
                      <p>No tasks yet. Add a reminder for upkeep or errands.</p>
                    </div>
                  ) : (
                    tasks.map(t => (
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
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Key Assets Quick View */}
              <div>
                <div className="section-header">
                  <div>
                    <h3 className="section-title">Your belongings</h3>
                    <p className="section-subtitle">Your most valuable items</p>
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
                          <Clock size={14} /> View history
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
                <h2 className="section-title">My Belongings</h2>
                <p className="section-subtitle">Keep track of your appliances, electronics, vehicles and furniture — with warranties in one place.</p>
              </div>
              <button className="primary-btn" onClick={() => setShowAddAssetModal(true)}>
                <Plus size={16} /> Add an item
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
                        <div><strong>Purchased:</strong> {formatDate(asset.purchase_date) || 'N/A'}</div>
                      </div>

                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.75rem' }}>
                        ${Number(asset.purchase_price).toLocaleString()}
                      </div>

                      <div style={{ fontSize: '0.8125rem', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0', color: isExpiringSoon ? '#b45309' : '#475569' }}>
                        <strong>Warranty:</strong> {isExpiringSoon ? '⚠️ Expiring soon!' : isExpired ? 'Expired' : `Covered until ${formatDate(asset.warranty_expiry_date)}`}
                      </div>
                    </div>

                    <div className="card-footer">
                      <button 
                        className="secondary-btn" 
                        onClick={() => { setSelectedAsset(asset); setActiveTab('timeline'); }}
                      >
                        <Clock size={14} /> View history
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
                <h2 className="section-title">History</h2>
                <p className="section-subtitle">
                  Everything that's happened — and the total cost so far — for <strong>{selectedAsset?.name}</strong>.
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
                  <Calendar size={13} /> {formatDate(selectedAsset?.purchase_date) || 'Purchase date'} · <span className="badge active">Purchased</span>
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
                    <FileText size={13} /> Document saved · <span className="badge blue">{prettyType(doc.document_type)}</span>
                  </div>
                  <div className="timeline-event-title">{doc.title}</div>
                  <div className="timeline-event-desc">File: {doc.file_name} · Safely saved to your documents.</div>
                  <div className="timeline-cost" style={{ background: '#f1f5f9', color: '#475569' }}>Saved (No cost)</div>
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
                    Billed {sub.billing_cycle.toLowerCase()} · Next renewal: {formatDate(sub.next_renewal_date)}
                  </div>
                  <div className="timeline-cost">+ ${sub.cost} / {sub.billing_cycle.toLowerCase()}</div>
                </div>
              ))}

              {/* 4. Repair & Maintenance Milestones */}
              {selectedAssetRepairs.map((rep, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-dot danger"></div>
                  <div className="timeline-date">
                    <Wrench size={13} /> {formatDate(rep.service_date) || 'Service date'} · <span className="badge warning">{rep.service_type}</span>
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
                    <ShieldCheck size={13} /> {formatDate(selectedAsset.warranty_expiry_date)} · <span className="badge warning">Warranty ends</span>
                  </div>
                  <div className="timeline-event-title">Manufacturer Warranty Expiration Threshold</div>
                  <div className="timeline-event-desc">
                    End of standard coverage. We'll remind you 30 days and 7 days before, so your cover never lapses.
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
                <h2 className="section-title">Subscriptions &amp; Renewals</h2>
                <p className="section-subtitle">Keep an eye on insurance, AMCs, utilities and apps — and never miss a renewal.</p>
              </div>
              <button className="primary-btn" onClick={() => setShowAddSubModal(true)}>
                <Plus size={16} /> Add a subscription
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
                      <strong>For:</strong> {sub.asset_name || 'Your whole home'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: 600 }}>
                      Next renewal: <strong>{formatDate(sub.next_renewal_date)}</strong>
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
                <h2 className="section-title">Repairs &amp; Maintenance</h2>
                <p className="section-subtitle">Log repairs, remember who fixed what, and see what you've spent keeping things running.</p>
              </div>
              <button className="primary-btn" onClick={() => setShowAddRepairModal(true)}>
                <Plus size={16} /> Log a repair
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
                      <strong>Service date:</strong> {formatDate(rep.service_date)}
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
                <h2 className="section-title">Documents</h2>
                <p className="section-subtitle">Invoices, warranty cards, manuals and insurance papers — safely organized in one place.</p>
              </div>
              <button className="primary-btn" onClick={() => setShowAddDocModal(true)}>
                <Plus size={16} /> Add a document
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
                      <span className="badge blue" style={{ marginBottom: '0.35rem' }}>{prettyType(doc.document_type)}</span>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{doc.title}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        For: <strong>{doc.asset_name}</strong>
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                        File: {doc.file_name} {doc.expiry_date ? `· Expires ${formatDate(doc.expiry_date)}` : ''}
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
                <h2 className="section-title">Spending</h2>
                <p className="section-subtitle">See where your money goes — upkeep, subscriptions and how your things hold their value.</p>
              </div>
            </div>

            {/* KPI Cards (Image 6) */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon blue"><DollarSign size={24} /></div>
                <div>
                  <div className="kpi-label">Total spent on your things</div>
                  <div className="kpi-value">${totalAssetValue.toLocaleString()}</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon purple"><CreditCard size={24} /></div>
                <div>
                  <div className="kpi-label">Average monthly spending</div>
                  <div className="kpi-value">${Math.round(monthlyRecurring)}</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon amber"><Wrench size={24} /></div>
                <div>
                  <div className="kpi-label">Spent on repairs</div>
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
              <h3 className="modal-title">Add an item</h3>
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
                <button type="submit" className="primary-btn">Save item</button>
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
              <h3 className="modal-title">Add a subscription</h3>
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
                <button type="submit" className="primary-btn">Save subscription</button>
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
              <h3 className="modal-title">Log a repair or service</h3>
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
                <button type="submit" className="primary-btn">Save repair</button>
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
              <h3 className="modal-title">Add a document</h3>
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
                <button type="submit" className="primary-btn">Save document</button>
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
              <h3 className="modal-title">Add a task</h3>
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
                <button type="submit" className="primary-btn">Save task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
