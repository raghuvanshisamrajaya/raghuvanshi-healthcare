import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { razorpayConfig } from '@/lib/razorpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required payment verification parameters' },
        { status: 400 }
      );
    }

    // Create signature for verification
    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", razorpayConfig.keySecret)
      .update(text.toString())
      .digest("hex");

    // Verify signature
    const isSignatureValid = expectedSignature === razorpay_signature;

    if (isSignatureValid) {
      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      });
    } else {
      return NextResponse.json(
        { 
          error: 'Payment verification failed',
          message: 'Invalid signature' 
        },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('Payment verification error:', error);
    
    return NextResponse.json(
      { 
        error: 'Payment verification failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
