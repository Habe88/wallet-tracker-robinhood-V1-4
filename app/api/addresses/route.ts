import { NextRequest, NextResponse } from 'next/server';
import { getAddressList, saveAddressList } from '@/lib/github';
import { WalletAddress } from '@/lib/types';
import { z } from 'zod';

const addressSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  label: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET() {
  try {
    const list = await getAddressList();
    return NextResponse.json(list);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = addressSchema.parse(body);
    
    const list = await getAddressList();
    const exists = list.addresses.find(a => a.address.toLowerCase() === parsed.address.toLowerCase());
    if (exists) {
      return NextResponse.json({ error: 'Address already exists' }, { status: 400 });
    }
    
    const newAddress: WalletAddress = {
      ...parsed,
      address: parsed.address.toLowerCase(),
      addedAt: new Date().toISOString(),
    };
    
    list.addresses.push(newAddress);
    await saveAddressList(list);
    
    return NextResponse.json(newAddress, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to add address' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    if (!address) {
      return NextResponse.json({ error: 'Address required' }, { status: 400 });
    }
    
    const list = await getAddressList();
    list.addresses = list.addresses.filter(a => a.address.toLowerCase() !== address.toLowerCase());
    await saveAddressList(list);
    
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to remove address' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, ...updates } = body;
    
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({ error: 'Valid address required' }, { status: 400 });
    }
    
    const list = await getAddressList();
    const idx = list.addresses.findIndex(a => a.address.toLowerCase() === address.toLowerCase());
    if (idx === -1) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }
    
    list.addresses[idx] = { ...list.addresses[idx], ...updates };
    await saveAddressList(list);
    
    return NextResponse.json(list.addresses[idx]);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
  }
}