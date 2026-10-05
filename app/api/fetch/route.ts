import { NextRequest, NextResponse } from 'next/server';
import { getAddressList, updateAddress, getTransactions, saveTransactions } from '@/lib/github';
import { fetchAllTransactions } from '@/lib/blockscout';

export async function POST(req: NextRequest) {
  try {
    const { address, fromBlock } = await req.json();
    
    if (!address) {
      const list = await getAddressList();
      const stored = await getTransactions();
      const results = [];
      
      for (const addr of list.addresses) {
        const result = await fetchAllTransactions(addr.address, 0);
        stored[addr.address] = result.transactions;
        await updateAddress(addr.address, { lastFetchedAt: new Date().toISOString() });
        results.push({ address: addr.address, count: result.transactions.length });
      }
      
      await saveTransactions(stored);
      return NextResponse.json({ results, total: results.length });
    }
    
    // Single address fetch
    const result = await fetchAllTransactions(address, fromBlock || 0);
    const stored = await getTransactions();
    stored[address] = result.transactions;
    await saveTransactions(stored);
    await updateAddress(address, { lastFetchedAt: new Date().toISOString() });
    
    return NextResponse.json({ address, count: result.transactions.length, blockRange: result.blockRange });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}