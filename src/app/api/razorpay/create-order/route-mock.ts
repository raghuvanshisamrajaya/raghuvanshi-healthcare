import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = 'INR', notes } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount is required and must be greater than 0' },
        { status: 400 }
      );
    }

    // Simulate successful order creation for demo purposes
    const mockOrder = {
      id: `order_${Date.now()}${Math.floor(Math.random() * 1000)}`,
      entity: 'order',
      amount: Math.round(amount * 100), // Convert to paise
      amount_paid: 0,
      amount_due: Math.round(amount * 100),
      currency,
      receipt: `receipt_${Date.now()}`,
      status: 'created',
      created_at: Math.floor(Date.now() / 1000),
      notes: notes || {},
    };

    console.log('Mock order created:', mockOrder);
    
    return NextResponse.json(mockOrder, { status: 200 });

  } catch (error: any) {
    console.error('Mock order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order', details: error.message },
      { status: 500 }
    );
  }
}
