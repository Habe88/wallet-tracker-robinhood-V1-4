import { Transaction, FetchResult } from './types';

const BLOCKSCOUT_BASE = process.env.BLOCKSCOUT_BASE || 'https://robinhoodchain.blockscout.com/api/v2';
const RATE_LIMIT_DELAY = 200; // ms between requests

interface BlockscoutTx {
  hash: string;
  block_number: number;
  timestamp: string;
  from: { hash: string };
  to: { hash: string } | null;
  value: string;
  gas_used: string;
  gas_price: string;
  method: string;
  is_error: boolean;
  token_transfers?: Array<{
    token_address: string;
    token_symbol: string;
    token_decimals: string;
    value: string;
    from: { hash: string };
    to: { hash: string };
  }>;
}

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url);
    if (res.status === 429) {
      await new Promise(r => setTimeout(r, RATE_LIMIT_DELAY * (i + 1) * 2));
      continue;
    }
    if (!res.ok) throw new Error(`Blockscout API error: ${res.status}`);
    return res;
  }
  throw new Error('Max retries exceeded');
}

export async function fetchTransactions(
  address: string,
  fromBlock = 0,
  toBlock = 'latest',
  page = 1,
  pageSize = 100
): Promise<{ transactions: Transaction[]; nextPageParams?: { page: number } }> {
  const url = `${BLOCKSCOUT_BASE}/addresses/${address}/transactions?filter=to%2Cfrom&from_block=${fromBlock}&to_block=${toBlock}&page=${page}&page_size=${pageSize}`;
  
  const res = await fetchWithRetry(url);
  const data = await res.json();
  
  const transactions: Transaction[] = data.items.map((tx: BlockscoutTx) => {
    let tokenSymbol: string | undefined;
    let tokenAddress: string | undefined;
    let tokenDecimals: number | undefined;
    let value = tx.value;
    
    if (tx.token_transfers && tx.token_transfers.length > 0) {
      const transfer = tx.token_transfers[0];
      tokenSymbol = transfer.token_symbol;
      tokenAddress = transfer.token_address;
      tokenDecimals = parseInt(transfer.token_decimals);
      value = transfer.value;
    }
    
    return {
      hash: tx.hash,
      blockNumber: tx.block_number,
      timestamp: new Date(tx.timestamp).getTime(),
      from: tx.from.hash,
      to: tx.to?.hash || '',
      value,
      tokenSymbol,
      tokenAddress,
      tokenDecimals,
      gasUsed: tx.gas_used,
      gasPrice: tx.gas_price,
      methodId: tx.method.slice(0, 10),
      isError: tx.is_error,
    };
  });
  
  return {
    transactions,
    nextPageParams: data.next_page_params ? { page: data.next_page_params.page } : undefined,
  };
}

export async function fetchAllTransactions(
  address: string,
  fromBlock = 0
): Promise<FetchResult> {
  const allTransactions: Transaction[] = [];
  let page = 1;
  let hasMore = true;
  let maxBlock = fromBlock;
  
  while (hasMore) {
    const { transactions, nextPageParams } = await fetchTransactions(address, fromBlock, 'latest', page);
    allTransactions.push(...transactions);
    if (transactions.length > 0) {
      maxBlock = Math.max(maxBlock, ...transactions.map(t => t.blockNumber));
    }
    hasMore = !!nextPageParams;
    page = nextPageParams?.page || page + 1;
    
    // Rate limit
    await new Promise(r => setTimeout(r, RATE_LIMIT_DELAY));
  }
  
  return {
    address,
    transactions: allTransactions.sort((a, b) => b.blockNumber - a.blockNumber),
    fetchedAt: new Date().toISOString(),
    blockRange: { from: fromBlock, to: maxBlock },
  };
}