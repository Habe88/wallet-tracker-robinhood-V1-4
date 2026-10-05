import { AddressList, WalletAddress, Transaction } from './types';

const GITHUB_API = 'https://api.github.com';
const REPO_OWNER = process.env.GITHUB_OWNER!;
const REPO_NAME = process.env.GITHUB_REPO!;
const ADDRESSES_FILE = process.env.GITHUB_FILE_PATH || 'addresses.json';
const TRANSACTIONS_FILE = 'transactions.json';
const BRANCH = process.env.GITHUB_BRANCH || 'main';

async function githubRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = process.env.GITHUB_TOKEN!;
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub API error: ${res.status} ${err}`);
  }
  return res.json();
}

async function getFileContent(filePath: string): Promise<any> {
  try {
    const file = await githubRequest<any>(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}?ref=${BRANCH}`);
    const content = Buffer.from(file.content, 'base64').toString('utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function getFileSha(filePath: string): Promise<string | undefined> {
  try {
    const file = await githubRequest<any>(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}?ref=${BRANCH}`);
    return file.sha;
  } catch {
    return undefined;
  }
}

async function putFileContent(filePath: string, content: any, message: string): Promise<void> {
  const sha = await getFileSha(filePath);
  const encoded = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');
  
  await githubRequest(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`, {
    method: 'PUT',
    body: JSON.stringify({ message, content: encoded, sha, branch: BRANCH }),
  });
}

export async function getAddressList(): Promise<AddressList> {
  const data = await getFileContent(ADDRESSES_FILE);
  return data || { addresses: [], updatedAt: new Date().toISOString() };
}

export async function saveAddressList(list: AddressList): Promise<void> {
  await putFileContent(ADDRESSES_FILE, { ...list, updatedAt: new Date().toISOString() }, `Update address list: ${list.addresses.length} addresses`);
}

export async function getTransactions(): Promise<Record<string, Transaction[]>> {
  const data = await getFileContent(TRANSACTIONS_FILE);
  return data || {};
}

export async function saveTransactions(data: Record<string, Transaction[]>): Promise<void> {
  await putFileContent(TRANSACTIONS_FILE, data, 'Update transactions');
}

export async function addAddress(address: WalletAddress): Promise<void> {
  const list = await getAddressList();
  const exists = list.addresses.find(a => a.address.toLowerCase() === address.address.toLowerCase());
  if (exists) throw new Error('Address already exists');
  list.addresses.push(address);
  await saveAddressList(list);
}

export async function removeAddress(address: string): Promise<void> {
  const list = await getAddressList();
  list.addresses = list.addresses.filter(a => a.address.toLowerCase() !== address.toLowerCase());
  await saveAddressList(list);
}

export async function updateAddress(address: string, updates: Partial<WalletAddress>): Promise<void> {
  const list = await getAddressList();
  const idx = list.addresses.findIndex(a => a.address.toLowerCase() === address.toLowerCase());
  if (idx === -1) throw new Error('Address not found');
  list.addresses[idx] = { ...list.addresses[idx], ...updates };
  await saveAddressList(list);
}