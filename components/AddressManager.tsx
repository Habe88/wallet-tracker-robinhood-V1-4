'use client';

import { useState } from 'react';
import { WalletAddress } from '@/lib/types';

interface AddressManagerProps {
  addresses: WalletAddress[];
  onAdd: (addr: WalletAddress) => void;
  onRemove: (address: string) => void;
  onUpdate: (address: string, updates: Partial<WalletAddress>) => void;
}

export default function AddressManager({ addresses, onAdd, onRemove, onUpdate }: AddressManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [address, setAddress] = useState('');
  const [label, setLabel] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setError('Invalid Ethereum address');
      return;
    }
    setLoading(true);
    try {
      await onAdd({ address: address.toLowerCase(), label, tags: tags.split(',').map(t => t.trim()).filter(Boolean), addedAt: new Date().toISOString() });
      setShowForm(false);
      setAddress(''); setLabel(''); setTags('');
    } catch (err: any) {
      setError(err.message || 'Failed to add');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sidebar-section">
      <div className="flex justify-between items-center mb-4">
        <h2 className="section-title">Tracked Addresses <span className="badge badge-neutral">{addresses.length}</span></h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-secondary text-sm">
          {showForm ? 'Cancel' : 'Add Address'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-3 p-4 bg-bg-secondary border border-border rounded-lg">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Address</label>
            <input value={address} onChange={e => setAddress(e.target.value)} placeholder="0x..." className="input font-mono text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Label (optional)</label>
            <input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g., Main Wallet" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Tags (comma separated)</label>
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g., whale, sniper" className="input" />
          </div>
          {error && <p className="text-error text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Adding...' : 'Add'}
          </button>
        </form>
      )}

      {addresses.length === 0 && !showForm && (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <p className="empty-state-title">No addresses yet</p>
          <p className="empty-state-desc">Click "Add Address" to start tracking</p>
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Address</th>
              <th>Label</th>
              <th>Tags</th>
              <th>Added</th>
              <th>Last Fetch</th>
              <th className="w-20">Actions</th>
            </tr>
          </thead>
          <tbody>
            {addresses.map(addr => (
              <tr key={addr.address}>
                <td className="font-mono text-xs">{addr.address.slice(0,6)}...{addr.address.slice(-4)}</td>
                <td>{addr.label || <span className="text-text-muted">-</span>}</td>
                <td>
                  {addr.tags?.map(t => <span key={t} className="mr-1 badge badge-info">{t}</span>)}
                </td>
                <td className="text-text-secondary text-sm">{new Date(addr.addedAt).toLocaleDateString()}</td>
                <td className="text-text-secondary text-sm">{addr.lastFetchedAt ? new Date(addr.lastFetchedAt).toLocaleString() : <span className="text-text-muted">Never</span>}</td>
                <td>
                  <button onClick={() => onRemove(addr.address)} className="btn-ghost text-error text-xs p-1">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}