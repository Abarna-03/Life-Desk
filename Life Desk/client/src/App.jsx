import React, { useState, useEffect } from 'react';

// Components
import AuthScreen from './components/auth/AuthScreen';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import Dashboard from './components/dashboard/Dashboard';
import Assets from './components/assets/Assets';
import Timeline from './components/timeline/Timeline';
import Subscriptions from './components/subscriptions/Subscriptions';
import Repairs from './components/maintenance/Repairs';
import Documents from './components/documents/Documents';
import Analytics from './components/analytics/Analytics';

// Modals
import AddAssetModal from './components/modals/AddAssetModal';
import AddSubscriptionModal from './components/modals/AddSubscriptionModal';
import AddRepairModal from './components/modals/AddRepairModal';
import AddDocumentModal from './components/modals/AddDocumentModal';
import AddTaskModal from './components/modals/AddTaskModal';
import ConfirmDialog from './components/modals/ConfirmDialog';

// Same-origin relative base. In production the Express server serves this
// app and its /api routes from one port; in dev, Vite proxies /api → :5000.
const API_BASE = '/api';

// Normalize any stored date/timestamp to a YYYY-MM-DD value for <input type="date">
const toDateInput = (v) => {
  if (!v) return '';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [assets, setAssets] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // ===== Auth state =====
  const [token, setToken] = useState(() => localStorage.getItem('ld_token') || '');
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ld_user')) || null;
    } catch {
      return null;
    }
  });
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'forgot' | 'reset'
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [resetForm, setResetForm] = useState({ email: '', code: '', newPassword: '', confirmPassword: '' });
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authPreviewUrl, setAuthPreviewUrl] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [roomFilter, setRoomFilter] = useState('All');

  // Modals state
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [showAddSubModal, setShowAddSubModal] = useState(false);
  const [showAddRepairModal, setShowAddRepairModal] = useState(false);
  const [showEditRepairModal, setShowEditRepairModal] = useState(false);
  const [editRepair, setEditRepair] = useState(null);
  const [showEditAssetModal, setShowEditAssetModal] = useState(false);
  const [editAsset, setEditAsset] = useState(null);
  const [showEditSubModal, setShowEditSubModal] = useState(false);
  const [editSub, setEditSub] = useState(null);
  const [showEditDocModal, setShowEditDocModal] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  // Pending delete: { type: 'asset'|'subscription'|'repair'|'document', id, name }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // Forms state
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
    notes: '',
  });

  const [newSub, setNewSub] = useState({
    name: '',
    category: 'Insurance',
    cost: '',
    billing_cycle: 'Monthly',
    next_renewal_date: '',
    asset_id: '',
    auto_renew: true,
  });

  const [newRepair, setNewRepair] = useState({
    asset_id: '',
    title: '',
    service_type: 'Repair',
    service_provider_name: '',
    service_date: '',
    labor_cost: '',
    parts_cost: '',
    technician_notes: '',
  });

  const [newDoc, setNewDoc] = useState({
    title: '',
    document_type: 'Invoice',
    asset_id: '',
    file_name: '',
    expiry_date: '',
  });

  const [newTask, setNewTask] = useState({
    room: 'Home Office',
    title: '',
    due: 'Due in 7 days',
    priority: 'Normal',
  });

  const authHeaders = () => (token ? { Authorization: `Bearer ${token}` } : {});

  // Fetch from PostgreSQL backend on mount / token change
  useEffect(() => {
    async function fetchBackendData() {
      try {
        const h = token ? { Authorization: `Bearer ${token}` } : {};
        const [resAssets, resSubs, resMaint, resDocs] = await Promise.all([
          fetch(`${API_BASE}/assets`, { headers: h }),
          fetch(`${API_BASE}/subscriptions`, { headers: h }),
          fetch(`${API_BASE}/maintenance`, { headers: h }),
          fetch(`${API_BASE}/documents`, { headers: h }),
        ]);

        if (resAssets.ok && resSubs.ok) {
          const [dataAssets, dataSubs, dataMaint, dataDocs] = await Promise.all([
            resAssets.json(),
            resSubs.json(),
            resMaint.json(),
            resDocs.json(),
          ]);

          setAssets(Array.isArray(dataAssets) ? dataAssets : []);
          setSubscriptions(Array.isArray(dataSubs) ? dataSubs : []);
          setRepairs(Array.isArray(dataMaint) ? dataMaint : []);
          setDocuments(Array.isArray(dataDocs) ? dataDocs : []);
        }
      } catch (err) {
        // backend unreachable — keep local state
      }
    }
    if (token) {
      fetchBackendData();
    }
  }, [token]);

  // Sync selectedAsset when assets list changes
  useEffect(() => {
    if (assets.length > 0 && !selectedAsset) {
      setSelectedAsset(assets[0]);
    }
  }, [assets, selectedAsset]);

  // Check URL query parameters for direct password reset link
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get('email');
      const codeParam = params.get('code');
      if (emailParam || codeParam) {
        setAuthMode('reset');
        setResetForm((prev) => ({
          ...prev,
          email: emailParam || prev.email,
          code: codeParam || prev.code,
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
  const totalRepairsCost = repairs.reduce(
    (sum, r) => sum + Number(r.total_cost || (Number(r.labor_cost || 0) + Number(r.parts_cost || 0))),
    0
  );

  // ===== Auth Handlers =====
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);
    try {
      const endpoint = authMode === 'register' ? 'register' : 'login';
      const payload =
        authMode === 'register'
          ? { name: authForm.name, email: authForm.email, password: authForm.password }
          : { email: authForm.email, password: authForm.password };

      const res = await fetch(`${API_BASE}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload),
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
        body: JSON.stringify({ email: emailToSend }),
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
      setResetForm((prev) => ({ ...prev, email: emailToSend }));
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
          newPassword: resetForm.newPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.message || 'Failed to reset password');
        return;
      }

      setAuthSuccess('Password reset successfully! You can now sign in.');
      setAuthForm((prev) => ({ ...prev, email: resetForm.email, password: '' }));
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

  // ===== Data Creation Handlers =====
  const handleAddAsset = async (e) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.purchase_price) return;

    const assetItem = {
      id: `a_${Date.now()}`,
      ...newAsset,
      purchase_price: Number(newAsset.purchase_price),
      status: 'Active',
    };

    setAssets([assetItem, ...assets]);
    setShowAddAssetModal(false);

    try {
      await fetch(`${API_BASE}/assets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(assetItem),
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
      notes: '',
    });
  };

  const handleAddSub = async (e) => {
    e.preventDefault();
    if (!newSub.name || !newSub.cost) return;

    const linkedAsset = assets.find((a) => a.id === newSub.asset_id);
    const subItem = {
      id: `s_${Date.now()}`,
      ...newSub,
      cost: Number(newSub.cost),
      asset_name: linkedAsset ? linkedAsset.name : 'Home Wide',
      status: 'Active',
    };

    setSubscriptions([subItem, ...subscriptions]);
    setShowAddSubModal(false);

    try {
      await fetch(`${API_BASE}/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(subItem),
      });
    } catch (_) {}

    setNewSub({
      name: '',
      category: 'Insurance',
      cost: '',
      billing_cycle: 'Monthly',
      next_renewal_date: '',
      asset_id: '',
      auto_renew: true,
    });
  };

  const handleAddRepair = async (e) => {
    e.preventDefault();
    if (!newRepair.title || !newRepair.asset_id) return;

    const linkedAsset = assets.find((a) => a.id === newRepair.asset_id);
    const labor = Number(newRepair.labor_cost || 0);
    const parts = Number(newRepair.parts_cost || 0);

    const repairItem = {
      id: `r_${Date.now()}`,
      ...newRepair,
      asset_name: linkedAsset ? linkedAsset.name : 'Unknown Asset',
      labor_cost: labor,
      parts_cost: parts,
      total_cost: labor + parts,
      status: 'Scheduled',
    };

    setRepairs([repairItem, ...repairs]);
    setShowAddRepairModal(false);

    try {
      await fetch(`${API_BASE}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(repairItem),
      });
    } catch (_) {}

    setNewRepair({
      asset_id: '',
      title: '',
      service_type: 'Repair',
      service_provider_name: '',
      service_date: '',
      labor_cost: '',
      parts_cost: '',
      technician_notes: '',
    });
  };

  // Open the edit modal pre-filled with an existing repair
  const openEditRepair = (rep) => {
    setEditRepair({
      id: rep.id,
      asset_id: rep.asset_id || '',
      title: rep.title || '',
      service_type: rep.service_type || 'Repair',
      service_provider_name: rep.service_provider_name || '',
      service_date: toDateInput(rep.service_date),
      status: rep.status || 'Reported',
      labor_cost: rep.labor_cost ?? '',
      parts_cost: rep.parts_cost ?? '',
      technician_notes: rep.technician_notes || '',
    });
    setShowEditRepairModal(true);
  };

  const handleUpdateRepair = async (e) => {
    e.preventDefault();
    if (!editRepair || !editRepair.title) return;

    const labor = Number(editRepair.labor_cost || 0);
    const parts = Number(editRepair.parts_cost || 0);

    setRepairs((prev) =>
      prev.map((r) =>
        r.id === editRepair.id
          ? {
              ...r,
              ...editRepair,
              labor_cost: labor,
              parts_cost: parts,
              total_cost: labor + parts,
            }
          : r
      )
    );
    setShowEditRepairModal(false);

    try {
      await fetch(`${API_BASE}/maintenance/${editRepair.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          title: editRepair.title,
          service_type: editRepair.service_type,
          service_provider_name: editRepair.service_provider_name,
          status: editRepair.status,
          service_date: editRepair.service_date || null,
          technician_notes: editRepair.technician_notes,
          labor_cost: labor,
          parts_cost: parts,
        }),
      });
    } catch (_) {}

    setEditRepair(null);
  };

  // ===== Asset edit =====
  const openEditAsset = (a) => {
    setEditAsset({
      ...a,
      purchase_price: a.purchase_price ?? '',
      purchase_date: toDateInput(a.purchase_date),
      warranty_expiry_date: toDateInput(a.warranty_expiry_date),
    });
    setShowEditAssetModal(true);
  };

  const handleUpdateAsset = async (e) => {
    e.preventDefault();
    if (!editAsset || !editAsset.name || !editAsset.purchase_price) return;

    const updated = { ...editAsset, purchase_price: Number(editAsset.purchase_price) };
    setAssets((prev) => prev.map((a) => (a.id === editAsset.id ? { ...a, ...updated } : a)));
    if (selectedAsset?.id === editAsset.id) setSelectedAsset((prev) => ({ ...prev, ...updated }));
    setShowEditAssetModal(false);

    try {
      await fetch(`${API_BASE}/assets/${editAsset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          name: editAsset.name,
          category: editAsset.category,
          brand: editAsset.brand,
          model_number: editAsset.model_number,
          serial_number: editAsset.serial_number,
          purchase_date: editAsset.purchase_date || null,
          purchase_price: Number(editAsset.purchase_price),
          store_vendor: editAsset.store_vendor,
          location_room: editAsset.location_room,
          warranty_expiry_date: editAsset.warranty_expiry_date || null,
          notes: editAsset.notes,
        }),
      });
    } catch (_) {}

    setEditAsset(null);
  };

  // ===== Subscription edit =====
  const openEditSub = (s) => {
    setEditSub({
      ...s,
      cost: s.cost ?? '',
      asset_id: s.asset_id || '',
      next_renewal_date: toDateInput(s.next_renewal_date),
    });
    setShowEditSubModal(true);
  };

  const handleUpdateSub = async (e) => {
    e.preventDefault();
    if (!editSub || !editSub.name || !editSub.cost) return;

    const linkedAsset = assets.find((a) => a.id === editSub.asset_id);
    const updated = {
      ...editSub,
      cost: Number(editSub.cost),
      asset_name: linkedAsset ? linkedAsset.name : 'Home Wide',
    };
    setSubscriptions((prev) => prev.map((s) => (s.id === editSub.id ? { ...s, ...updated } : s)));
    setShowEditSubModal(false);

    try {
      await fetch(`${API_BASE}/subscriptions/${editSub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          name: editSub.name,
          category: editSub.category,
          cost: Number(editSub.cost),
          billing_cycle: editSub.billing_cycle,
          next_renewal_date: editSub.next_renewal_date || null,
          auto_renew: editSub.auto_renew,
        }),
      });
    } catch (_) {}

    setEditSub(null);
  };

  // ===== Document edit =====
  const openEditDoc = (d) => {
    setEditDoc({
      ...d,
      asset_id: d.asset_id || '',
      expiry_date: toDateInput(d.expiry_date),
    });
    setShowEditDocModal(true);
  };

  const handleUpdateDoc = async (e) => {
    e.preventDefault();
    if (!editDoc || !editDoc.title) return;

    const linkedAsset = assets.find((a) => a.id === editDoc.asset_id);
    const updated = { ...editDoc, asset_name: linkedAsset ? linkedAsset.name : 'General' };
    setDocuments((prev) => prev.map((d) => (d.id === editDoc.id ? { ...d, ...updated } : d)));
    setShowEditDocModal(false);

    try {
      await fetch(`${API_BASE}/documents/${editDoc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          title: editDoc.title,
          document_type: editDoc.document_type,
          asset_id: editDoc.asset_id || null,
          expiry_date: editDoc.expiry_date || null,
        }),
      });
    } catch (_) {}

    setEditDoc(null);
  };

  // ===== Unified delete =====
  const requestDelete = (type, item) => {
    setDeleteTarget({ type, id: item.id, name: item.name || item.title || 'this item' });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;

    const config = {
      asset: { endpoint: 'assets', setter: setAssets },
      subscription: { endpoint: 'subscriptions', setter: setSubscriptions },
      repair: { endpoint: 'maintenance', setter: setRepairs },
      document: { endpoint: 'documents', setter: setDocuments },
    }[type];

    if (config) {
      config.setter((prev) => prev.filter((x) => x.id !== id));
      if (type === 'asset' && selectedAsset?.id === id) setSelectedAsset(null);
      try {
        await fetch(`${API_BASE}/${config.endpoint}/${id}`, {
          method: 'DELETE',
          headers: { ...authHeaders() },
        });
      } catch (_) {}
    }

    setDeleteTarget(null);
  };

  const handleAddDoc = async (e) => {
    e.preventDefault();
    if (!newDoc.title) return;

    const linkedAsset = assets.find((a) => a.id === newDoc.asset_id);
    const docItem = {
      id: `d_${Date.now()}`,
      ...newDoc,
      asset_name: linkedAsset ? linkedAsset.name : 'General',
      file_name: newDoc.file_name || `${newDoc.title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
    };

    setDocuments([docItem, ...documents]);
    setShowAddDocModal(false);

    try {
      await fetch(`${API_BASE}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(docItem),
      });
    } catch (_) {}

    setNewDoc({ title: '', document_type: 'Invoice', asset_id: '', file_name: '', expiry_date: '' });
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title) return;
    setTasks([{ id: `t_${Date.now()}`, done: false, ...newTask }, ...tasks]);
    setShowAddTaskModal(false);
    setNewTask({ room: 'Home Office', title: '', due: 'Due in 7 days', priority: 'Normal' });
  };

  const handleToggleTask = (id) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  // If user is not logged in, render clean AuthScreen
  if (!token) {
    return (
      <AuthScreen
        authMode={authMode}
        setAuthMode={setAuthMode}
        authForm={authForm}
        setAuthForm={setAuthForm}
        resetForm={resetForm}
        setResetForm={setResetForm}
        authError={authError}
        setAuthError={setAuthError}
        authSuccess={authSuccess}
        setAuthSuccess={setAuthSuccess}
        authPreviewUrl={authPreviewUrl}
        authLoading={authLoading}
        handleAuthSubmit={handleAuthSubmit}
        handleForgotPasswordSubmit={handleForgotPasswordSubmit}
        handleResetPasswordSubmit={handleResetPasswordSubmit}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted lg:flex-row">
      {/* Left Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        counts={{
          assets: assets.length,
          subscriptions: subscriptions.length,
          repairs: repairs.length,
          documents: documents.length,
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main column — top bar + content on the grey canvas */}
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <TopBar activeTab={activeTab} onAddAsset={() => setShowAddAssetModal(true)} />
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-6 py-7 lg:px-8 lg:py-8">
          {activeTab === 'dashboard' && (
            <Dashboard
              assets={assets}
              subscriptions={subscriptions}
              repairs={repairs}
              documents={documents}
              tasks={tasks}
              currentUser={currentUser}
              totalAssetValue={totalAssetValue}
              monthlyRecurring={monthlyRecurring}
              totalRepairsCost={totalRepairsCost}
              setActiveTab={setActiveTab}
              setSelectedAsset={setSelectedAsset}
              setShowAddAssetModal={setShowAddAssetModal}
              setShowAddTaskModal={setShowAddTaskModal}
              onToggleTask={handleToggleTask}
            />
          )}

        {activeTab === 'assets' && (
          <Assets
            assets={assets}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            roomFilter={roomFilter}
            setRoomFilter={setRoomFilter}
            setSelectedAsset={setSelectedAsset}
            setActiveTab={setActiveTab}
            setShowAddAssetModal={setShowAddAssetModal}
            setNewRepair={setNewRepair}
            setShowAddRepairModal={setShowAddRepairModal}
            onEditAsset={openEditAsset}
            onDeleteAsset={(a) => requestDelete('asset', a)}
          />
        )}

        {activeTab === 'timeline' && (
          <Timeline
            assets={assets}
            selectedAsset={selectedAsset}
            setSelectedAsset={setSelectedAsset}
            subscriptions={subscriptions}
            repairs={repairs}
            documents={documents}
          />
        )}

        {activeTab === 'subscriptions' && (
          <Subscriptions
            subscriptions={subscriptions}
            setShowAddSubModal={setShowAddSubModal}
            onEditSub={openEditSub}
            onDeleteSub={(s) => requestDelete('subscription', s)}
          />
        )}

        {activeTab === 'repairs' && (
          <Repairs
            repairs={repairs}
            setShowAddRepairModal={setShowAddRepairModal}
            onEditRepair={openEditRepair}
            onDeleteRepair={(r) => requestDelete('repair', r)}
          />
        )}

        {activeTab === 'documents' && (
          <Documents
            documents={documents}
            setShowAddDocModal={setShowAddDocModal}
            onEditDoc={openEditDoc}
            onDeleteDoc={(d) => requestDelete('document', d)}
          />
        )}

        {activeTab === 'analytics' && (
          <Analytics
            totalAssetValue={totalAssetValue}
            monthlyRecurring={monthlyRecurring}
            totalRepairsCost={totalRepairsCost}
            repairs={repairs}
            subscriptions={subscriptions}
          />
        )}
        </main>
      </div>

      {/* Modals */}
      <AddAssetModal
        isOpen={showAddAssetModal}
        onClose={() => setShowAddAssetModal(false)}
        newAsset={newAsset}
        setNewAsset={setNewAsset}
        onSubmit={handleAddAsset}
      />

      <AddSubscriptionModal
        isOpen={showAddSubModal}
        onClose={() => setShowAddSubModal(false)}
        newSub={newSub}
        setNewSub={setNewSub}
        assets={assets}
        onSubmit={handleAddSub}
      />

      <AddRepairModal
        isOpen={showAddRepairModal}
        onClose={() => setShowAddRepairModal(false)}
        newRepair={newRepair}
        setNewRepair={setNewRepair}
        assets={assets}
        onSubmit={handleAddRepair}
      />

      {editRepair && (
        <AddRepairModal
          isEdit
          isOpen={showEditRepairModal}
          onClose={() => setShowEditRepairModal(false)}
          newRepair={editRepair}
          setNewRepair={setEditRepair}
          assets={assets}
          onSubmit={handleUpdateRepair}
        />
      )}

      {editAsset && (
        <AddAssetModal
          isEdit
          isOpen={showEditAssetModal}
          onClose={() => setShowEditAssetModal(false)}
          newAsset={editAsset}
          setNewAsset={setEditAsset}
          onSubmit={handleUpdateAsset}
        />
      )}

      {editSub && (
        <AddSubscriptionModal
          isEdit
          isOpen={showEditSubModal}
          onClose={() => setShowEditSubModal(false)}
          newSub={editSub}
          setNewSub={setEditSub}
          assets={assets}
          onSubmit={handleUpdateSub}
        />
      )}

      {editDoc && (
        <AddDocumentModal
          isEdit
          isOpen={showEditDocModal}
          onClose={() => setShowEditDocModal(false)}
          newDoc={editDoc}
          setNewDoc={setEditDoc}
          assets={assets}
          onSubmit={handleUpdateDoc}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete this item?"
        message={
          deleteTarget
            ? `“${deleteTarget.name}” will be permanently removed. This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
      />

      <AddDocumentModal
        isOpen={showAddDocModal}
        onClose={() => setShowAddDocModal(false)}
        newDoc={newDoc}
        setNewDoc={setNewDoc}
        assets={assets}
        onSubmit={handleAddDoc}
      />

      <AddTaskModal
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        newTask={newTask}
        setNewTask={setNewTask}
        onSubmit={handleAddTask}
      />
    </div>
  );
}
