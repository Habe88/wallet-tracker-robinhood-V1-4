'use client';

import { useState } from 'react';

interface FetchButtonProps {
  onFetch: (address?: string) => Promise<void>;
  isLoading: boolean;
  addressesCount: number;
}

export default function FetchButton({ onFetch, isLoading, addressesCount }: FetchButtonProps) {
  const [fetchingSingle, setFetchingSingle] = useState<string | null>(null);
  const [singleAddress, setSingleAddress] = useState('');

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h2 className="text-xl font-semibold">Fetch Transactions</h2>
      
      <div className="flex gap-4 items-center">
        <button
          onClick={() => onFetch()}
          disabled={isLoading || addressesCount === 0}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isLoading ? 'Fetching All...' : `Fetch All (${addressesCount} addresses)`}
        </button>
        
        <div className="flex gap-2 items-center border-l pl-4">
          <input
            type="text"
            value={singleAddress}
            onChange={e => setSingleAddress(e.target.value)}
            placeholder="0x... (single address)"
            className="px-3 py-2 border rounded w-64"
          />
          <button
            onClick={() => {
              if (/^0x[a-fA-F0-9]{40}$/.test(singleAddress)) {
                setFetchingSingle(singleAddress);
                onFetch(singleAddress).finally(() => setFetchingSingle(null));
              }
            }}
            disabled={isLoading || fetchingSingle !== null || !/^0x[a-fA-F0-9]{40}$/.test(singleAddress)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
          >
            {fetchingSingle ? `Fetching ${fetchingSingle.slice(0,6)}...` : 'Fetch One'}
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        Uses Blockscout API (rate limited). Large fetches may take several minutes.
        Results stored in GitHub JSON.
      </p>
    </div>
  );
}