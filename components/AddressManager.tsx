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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Tracked Addresses ({addresses.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">
          {showForm ? 'Cancel' : 'Add Address'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-3 p-4 bg-gray-50 rounded">
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input value={address} onChange={e => setAddress(e.target.value)} placeholder="0x..." className="w-full px-3 py-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Label (optional)</label>
            <input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g., Main Wallet" className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g., whale, sniper" className="w-full px-3 py-2 border rounded" />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50">
            {loading ? 'Adding...' : 'Add'}
          </button>
        </form>
      )}

      {addresses.length === 0 && !showForm && (
        <p className="text-gray-500 text-center py-8">No addresses yet. Click "Add Address" to start.</p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-600">
              <th className="pb-2">Address</th>
              <th className="pb-2">Label</th>
              <th className="pb-2">Tags</th>
              <th className="pb-2">Added</th>
              <th className="pb-2">Last Fetch</th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {addresses.map(addr => (
              <tr key={addr.address} className="border-b hover:bg-gray-50">
                <td className="py-3 font-mono text-xs">{addr.address.slice(0,6)}...{addr.address.slice(-4)}</td>
                <td className="py-3">{addr.label || '-'}</td>
                <td className="py-3">
                  {addr.tags?.map(t => <span key={t} className="mr-1 px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs">{t}</span>)}
                </td>
                <td className="py-3 text-gray-500">{new Date(addr.addedAt).toLocaleDateString()}</td>
                <td className="py-3 text-gray-500">{addr.lastFetchedAt ? new Date(addr.lastFetchedAt).toLocaleString() : 'Never'}</td>
                <td className="py-3">
                  <button onClick={() => onRemove(addr.address)} className="text-red-600 hover:underline text-xs">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}