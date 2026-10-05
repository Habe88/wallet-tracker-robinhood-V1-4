import { NextRequest, NextResponse } from 'next/server';
import { getTransactions } from '@/lib/github';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    
    const stored = await getTransactions();
    
    if (address) {
      return NextResponse.json({ address, transactions: stored[address] || [] });
    }
    
    // Return summary for all addresses
    const summary = Object.entries(stored).map(([addr, txs]) => ({
      address: addr,
      count: txs.length,
      latestBlock: txs.length > 0 ? Math.max(...txs.map((t: any) => t.blockNumber)) : 0,
    }));
    
    return NextResponse.json({ addresses: summary });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}