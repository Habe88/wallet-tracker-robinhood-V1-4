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

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b flex gap-4 items-center">
        <h2 className="text-xl font-semibold">Transactions ({transactions.length})</h2>
        <input
          type="text"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter by hash, address, token, method..."
          className="px-3 py-2 border rounded w-80"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
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
                  className="px-3 py-2 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(col.key as keyof Transaction)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortConfig.key === col.key && (
                      <span>{sortConfig.dir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map(tx => (
              <tr key={tx.hash} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2 font-mono text-xs">{tx.blockNumber.toLocaleString()}</td>
                <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                  {new Date(tx.timestamp).toLocaleString()}
                </td>
                <td className="px-3 py-2 font-mono text-xs">
                  <a href={`https://robinhoodchain.blockscout.com/tx/${tx.hash}`} target="_blank" rel="noopener" className="text-primary-600 hover:underline">
                    {tx.hash.slice(0, 10)}...
                  </a>
                </td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    tx.isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {METHOD_LABELS[tx.methodId || '0x'] || tx.methodId || 'Unknown'}
                  </span>
                </td>
                <td className="px-3 py-2 font-mono text-xs">
                  {formatAddress(tx.from)}
                  {isOutgoing(tx) && <span className="ml-1 text-red-600 text-xs">(out)</span>}
                  {isIncoming(tx) && <span className="ml-1 text-green-600 text-xs">(in)</span>}
                </td>
                <td className="px-3 py-2 font-mono text-xs">
                  {formatAddress(tx.to)}
                  {isIncoming(tx) && <span className="ml-1 text-green-600 text-xs">(in)</span>}
                  {isOutgoing(tx) && <span className="ml-1 text-red-600 text-xs">(out)</span>}
                </td>
                <td className="px-3 py-2">{tx.tokenSymbol || 'ETH'}</td>
                <td className="px-3 py-2 font-mono text-right">
                  {tx.tokenSymbol ? formatValue(tx.value, tx.tokenDecimals || 18) : formatValue(tx.value)}
                </td>
                <td className="px-3 py-2 font-mono text-xs text-right">
                  {(BigInt(tx.gasUsed) / BigInt(1e9)).toString()} Gwei
                </td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    tx.isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {tx.isError ? 'Failed' : 'Success'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedTransactions.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          {filter ? 'No transactions match filter' : 'No transactions yet. Click "Fetch" to load data.'}
        </div>
      )}
    </div>
  );
}