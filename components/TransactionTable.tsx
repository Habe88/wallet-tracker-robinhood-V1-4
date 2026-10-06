'use client';

import { useState, useMemo } from 'react';
import { Transaction } from '@/lib/types';

interface TransactionTableProps {
  transactions: Transaction[];
  selectedAddress: string;
}

const METHOD_LABELS: Record<string, string> = {
  '0x': 'Transfer',
  '0xa9059cbb': 'ERC20 Transfer',
  '0x23b872dd': 'ERC20 TransferFrom',
  '0x095ea7b3': 'Approve',
  '0x40c10f19': 'Mint',
  '0x8c5be1e5': 'Swap',
  '0x7ff36ab5': 'SwapExactTokensForTokens',
  '0x18cbafe5': 'SwapExactETHForTokens',
  '0xfb3bdb41': 'SwapTokensForExactTokens',
  '0x5c11d795': 'SwapTokensForExactETH',
  '0x38ed1739': 'SwapExactTokensForETH',
  '0x7c025200': 'SwapETHForExactTokens',
};

function formatValue(value: string, decimals = 18): string {
  const num = BigInt(value);
  const divisor = BigInt(10 ** decimals);
  const whole = num / divisor;
  const frac = num % divisor;
  if (frac === 0n) return whole.toString();
  const fracStr = frac.toString().padStart(decimals, '0').replace(/0+$/, '');
  return `${whole}.${fracStr}`;
}

function formatAddress(addr: string): string {
  if (!addr) return '-';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

function formatGas(gasUsed: string): string {
  return (BigInt(gasUsed) / BigInt(1e9)).toString() + ' Gwei';
}

export default function TransactionTable({ transactions, selectedAddress }: TransactionTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction; dir: 'asc' | 'desc' }>({ key: 'blockNumber', dir: 'desc' });
  const [filter, setFilter] = useState('');

  const sortedTransactions = useMemo(() => {
    let result = transactions;
    
    if (filter) {
      const f = filter.toLowerCase();
      result = result.filter(tx => 
        tx.hash.toLowerCase().includes(f) ||
        tx.from.toLowerCase().includes(f) ||
        tx.to.toLowerCase().includes(f) ||
        tx.tokenSymbol?.toLowerCase().includes(f) ||
        tx.methodId?.toLowerCase().includes(f)
      );
    }
    
    result = [...result].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal == null || bVal == null) return 0;
      if (aVal < bVal) return sortConfig.dir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.dir === 'asc' ? 1 : -1;
      return 0;
    });
    
    return result;
  }, [transactions, sortConfig, filter]);

  const handleSort = (key: keyof Transaction) => {
    setSortConfig(prev => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc',
    }));
  };

  const isOutgoing = (tx: Transaction) => tx.from.toLowerCase() === selectedAddress.toLowerCase();
  const isIncoming = (tx: Transaction) => tx.to.toLowerCase() === selectedAddress.toLowerCase();

  const getMethodLabel = (methodId?: string) => {
    if (!methodId || methodId === '0x') return 'Transfer';
    return METHOD_LABELS[methodId] || methodId;
  };

  if (sortedTransactions.length === 0) {
    return (
      <div className="card">
        <div className="empty-state h-64">
          <div className="empty-state-icon">📋</div>
          <p className="empty-state-title">{filter ? 'No transactions match filter' : 'No transactions yet'}</p>
          <p className="empty-state-desc">{filter ? 'Try adjusting your search' : 'Click "Fetch" to load data'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Transactions</h2>
          <p className="text-text-secondary text-sm mt-0.5">{sortedTransactions.length} transactions for {formatAddress(selectedAddress)}</p>
        </div>
        <input
          type="text"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter: hash, address, token, method..."
          className="input w-full sm:w-80"
        />
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {[
                { key: 'blockNumber', label: 'Block' },
                { key: 'timestamp', label: 'Time' },
                { key: 'hash', label: 'Tx Hash' },
                { key: 'methodId', label: 'Method' },
                { key: 'from', label: 'From' },
                { key: 'to', label: 'To' },
                { key: 'tokenSymbol', label: 'Token' },
                { key: 'value', label: 'Value' },
                { key: 'gasUsed', label: 'Gas' },
                { key: 'isError', label: 'Status' },
              ].map(col => (
                <th
                  key={col.key}
                  className="cursor-pointer hover:bg-bg-hover transition-colors"
                  onClick={() => handleSort(col.key as keyof Transaction)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortConfig.key === col.key && (
                      <span className="text-accent-primary">{sortConfig.dir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map(tx => (
              <tr key={tx.hash}>
                <td className="font-mono text-xs text-text-secondary">{tx.blockNumber.toLocaleString()}</td>
                <td className="text-text-secondary whitespace-nowrap text-sm">{formatDate(tx.timestamp)}</td>
                <td className="font-mono text-xs">
                  <a href={`https://robinhoodchain.blockscout.com/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:text-accent-light hover:underline">
                    {tx.hash.slice(0, 10)}...
                  </a>
                </td>
                <td>
                  <span className={`badge ${tx.isError ? 'badge-error' : 'badge-success'}`}>
                    {getMethodLabel(tx.methodId)}
                  </span>
                </td>
                <td className="font-mono text-xs">
                  {formatAddress(tx.from)}
                  {isOutgoing(tx) && <span className="ml-1 badge badge-error text-[10px]">OUT</span>}
                  {isIncoming(tx) && <span className="ml-1 badge badge-success text-[10px]">IN</span>}
                </td>
                <td className="font-mono text-xs">
                  {formatAddress(tx.to)}
                  {isIncoming(tx) && <span className="ml-1 badge badge-success text-[10px]">IN</span>}
                  {isOutgoing(tx) && <span className="ml-1 badge badge-error text-[10px]">OUT</span>}
                </td>
                <td className="font-medium">{tx.tokenSymbol || 'ETH'}</td>
                <td className="font-mono text-sm tabular-nums text-right pr-4">
                  {tx.tokenSymbol ? formatValue(tx.value, tx.tokenDecimals || 18) : formatValue(tx.value)}
                </td>
                <td className="font-mono text-xs text-text-secondary text-right pr-4">{formatGas(tx.gasUsed)}</td>
                <td>
                  <span className={`badge ${tx.isError ? 'badge-error' : 'badge-success'}`}>
                    {tx.isError ? 'Failed' : 'Success'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filter && sortedTransactions.length === 0 && (
        <div className="p-4 text-center text-text-muted">
          No transactions match "{filter}"
        </div>
      )}
    </div>
  );
}