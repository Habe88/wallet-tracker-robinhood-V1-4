export interface WalletAddress {
  address: string;
  label?: string;
  tags?: string[];
  addedAt: string;
  lastFetchedAt?: string;
}

export interface Transaction {
  hash: string;
  blockNumber: number;
  timestamp: number;
  from: string;
  to: string;
  value: string;
  tokenSymbol?: string;
  tokenAddress?: string;
  tokenDecimals?: number;
  gasUsed: string;
  gasPrice: string;
  methodId?: string;
  isError: boolean;
}

export interface FetchResult {
  address: string;
  transactions: Transaction[];
  fetchedAt: string;
  blockRange?: { from: number; to: number };
}

export interface AddressList {
  addresses: WalletAddress[];
  updatedAt: string;
}