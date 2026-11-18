import React from 'react';
import { Plus, Search, X, Clock, Wrench } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export default function BelongingsView({
  filteredAssets = [],
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  roomFilter,
  setRoomFilter,
  setShowAddAssetModal,
  setSelectedAsset,
  setActiveTab,
  setNewRepair,
  newRepair,
  setShowAddRepairModal,
}) {
  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">My Belongings</h2>
          <p className="section-subtitle">
            Keep track of your appliances, electronics, vehicles and furniture — with warranties in one place.
          </p>
        </div>
        <button className="primary-btn" onClick={() => setShowAddAssetModal(true)}>
          <Plus size={16} /> Add an item
        </button>
      </div>

      {/* Search and Filters Bar */}
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
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('All');
              setRoomFilter('All');
            }}
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Assets Grid */}
      {filteredAssets.length === 0 ? (
        <div className="empty-state">
          <p>No belongings found. Try clearing your filters or click &quot;Add an item&quot;.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredAssets.map((asset) => {
            const isExpiringSoon =
              asset.warranty_expiry_date &&
              new Date(asset.warranty_expiry_date) > new Date() &&
              new Date(asset.warranty_expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
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
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.5rem',
                      marginBottom: '1rem',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div>
                      <strong>Brand:</strong> {asset.brand || 'N/A'}
                    </div>
                    <div>
                      <strong>Room:</strong> {asset.location_room || 'N/A'}
                    </div>
                    <div>
                      <strong>Model:</strong> {asset.model_number || 'N/A'}
                    </div>
                    <div>
                      <strong>Serial:</strong> {asset.serial_number || 'N/A'}
                    </div>
                    <div>
                      <strong>Vendor:</strong> {asset.store_vendor || 'N/A'}
                    </div>
                    <div>
                      <strong>Purchased:</strong> {formatDate(asset.purchase_date) || 'N/A'}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: '1.35rem',
                      fontWeight: 800,
                      color: 'var(--primary)',
                      marginBottom: '0.75rem',
                    }}
                  >
                    ${Number(asset.purchase_price).toLocaleString()}
                  </div>

                  <div
                    style={{
                      fontSize: '0.8125rem',
                      padding: '0.5rem 0.75rem',
                      background: '#f8fafc',
                      borderRadius: '0.5rem',
                      border: '1px solid #e2e8f0',
                      color: isExpiringSoon ? '#b45309' : '#475569',
                    }}
                  >
                    <strong>Warranty:</strong>{' '}
                    {isExpiringSoon
                      ? '⚠️ Expiring soon!'
                      : isExpired
                      ? 'Expired'
                      : `Covered until ${formatDate(asset.warranty_expiry_date)}`}
                  </div>
                </div>

                <div className="card-footer">
                  <button
                    className="secondary-btn"
                    onClick={() => {
                      setSelectedAsset(asset);
                      setActiveTab('timeline');
                    }}
                  >
                    <Clock size={14} /> View history
                  </button>
                  <button
                    className="primary-btn"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    onClick={() => {
                      setNewRepair({ ...newRepair, asset_id: asset.id });
                      setShowAddRepairModal(true);
                    }}
                  >
                    <Wrench size={13} /> Report Issue
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

