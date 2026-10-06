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
    <div className="sidebar-section">
      <h2 className="section-title">Fetch Transactions</h2>
      
      <div className="space-y-4">
        <button
          onClick={() => onFetch()}
          disabled={isLoading || addressesCount === 0}
          className="btn-primary w-full py-3 text-base"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
              Fetching All...
            </span>
          ) : (
            `Fetch All (${addressesCount} addresses)`
          )}
        </button>
        
        <div className="pt-4 border-t border-border">
          <p className="text-text-muted text-sm mb-3">Fetch single address</p>
          <div className="space-y-2">
            <input
              type="text"
              value={singleAddress}
              onChange={e => setSingleAddress(e.target.value)}
              placeholder="0x... (paste address)"
              className="input font-mono text-sm"
            />
            <button
              onClick={() => {
                if (/^0x[a-fA-F0-9]{40}$/.test(singleAddress)) {
                  setFetchingSingle(singleAddress);
                  onFetch(singleAddress).finally(() => setFetchingSingle(null));
                }
              }}
              disabled={isLoading || fetchingSingle !== null || !/^0x[a-fA-F0-9]{40}$/.test(singleAddress)}
              className="btn-secondary w-full"
            >
              {fetchingSingle ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                  Fetching {fetchingSingle.slice(0,6)}...
                </span>
              ) : (
                'Fetch One'
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-bg-secondary border border-border rounded-lg">
        <p className="text-text-muted text-xs">
          <span className="font-mono text-accent-primary">Blockscout API</span> rate limited (~5 req/s). 
          Large fetches take several minutes. Data stored in GitHub JSON.
        </p>
      </div>
    </div>
  );
}