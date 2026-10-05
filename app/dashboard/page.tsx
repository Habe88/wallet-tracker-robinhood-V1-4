'use client';

import { useState, useEffect } from 'react';
import AddressManager from '@/components/AddressManager';
import FetchButton from '@/components/FetchButton';
import TransactionTable from '@/components/TransactionTable';
import { WalletAddress, Transaction } from '@/lib/types';

export default function Dashboard() {
  const [addresses, setAddresses] = useState<WalletAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const res = await fetch('/api/addresses');
      const data = await res.json();
      setAddresses(data.addresses || []);
      if (data.addresses?.[0] && !selectedAddress) {
        setSelectedAddress(data.addresses[0].address);
        loadTransactions(data.addresses[0].address);
      }
    } catch (e) {
      setError('Failed to load addresses');
    }
  };

  const loadTransactions = async (address: string) => {
    try {
      const res = await fetch(`/api/transactions?address=${address}`);
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (e) {
      setError('Failed to load transactions');
    }
  };

  const handleAdd = async (addr: WalletAddress) => {
    const res = await fetch('/api/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addr),
    });
    if (!res.ok) throw new Error('Failed to add');
    await loadAddresses();
  };

  const handleRemove = async (address: string) => {
    const res = await fetch(`/api/addresses?address=${address}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to remove');
    await loadAddresses();
    if (selectedAddress === address) {
      setSelectedAddress('');
      setTransactions([]);
    }
  };

  const handleUpdate = async (address: string, updates: Partial<WalletAddress>) => {
    const res = await fetch('/api/addresses', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, ...updates }),
    });
    if (!res.ok) throw new Error('Failed to update');
    await loadAddresses();
  };

  const handleFetch = async (address?: string) => {
    setFetching(true);
    setError('');
    try {
      const res = await fetch('/api/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fetch failed');
      
      if (address) {
        await loadTransactions(address);
      } else {
        // Refresh all
        await loadAddresses();
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setFetching(false);
    }
  };

  const handleSelectAddress = (address: string) => {
    setSelectedAddress(address);
    loadTransactions(address);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Wallet Tracker</h1>
            <p className="text-gray-500">Robinhood Chain Transaction History</p>
          </div>
          <div className="text-sm text-gray-500">
            {addresses.length} addresses tracked
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <AddressManager
              addresses={addresses}
              onAdd={handleAdd}
              onRemove={handleRemove}
              onUpdate={handleUpdate}
            />
            <FetchButton
              onFetch={handleFetch}
              isLoading={fetching}
              addressesCount={addresses.length}
            />
          </div>

          <div className="lg:col-span-2">
            {selectedAddress ? (
              <>
                <div className="mb-4 flex items-center gap-4">
                  <label className="text-sm font-medium">Select Wallet:</label>
                  <select
                    value={selectedAddress}
                    onChange={e => handleSelectAddress(e.target.value)}
                    className="px-3 py-2 border rounded bg-white"
                  >
                    {addresses.map(addr => (
                      <option key={addr.address} value={addr.address}>
                        {addr.label || addr.address.slice(0, 6) + '...' + addr.address.slice(-4)}
                      </option>
                    ))}
                  </select>
                </div>
                <TransactionTable
                  transactions={transactions}
                  selectedAddress={selectedAddress}
                />
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                Select or add an address to view transactions
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}