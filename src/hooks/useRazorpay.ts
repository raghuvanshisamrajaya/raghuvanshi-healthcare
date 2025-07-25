'use client';

import { useState, useCallback } from 'react';
import { razorpayConfig, PaymentOptions, PaymentResult, PaymentError } from '@/lib/razorpay';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface UseRazorpayReturn {
  isLoading: boolean;
  initiatePayment: (options: PaymentOptions) => Promise<PaymentResult | null>;
  loadRazorpayScript: () => Promise<boolean>;
}

export const useRazorpay = (): UseRazorpayReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const { userData } = useAuth();

  // Load Razorpay script dynamically
  const loadRazorpayScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      // Check if script is already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  // Create Razorpay order
  const createOrder = async (amount: number, currency = 'INR', notes = {}) => {
    try {
      console.log('Creating order with:', { amount, currency, notes });
      
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          receipt: `receipt_${Date.now()}`,
          notes,
        }),
      });

      const data = await response.json();
      console.log('Order creation response:', { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      return data;
    } catch (error: any) {
      console.error('Create order error:', error);
      throw new Error(error.message || 'Failed to create payment order');
    }
  };

  // Verify payment
  const verifyPayment = async (paymentData: PaymentResult) => {
    try {
      const response = await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment verification failed');
      }

      return data;
    } catch (error: any) {
      console.error('Verify payment error:', error);
      throw new Error(error.message || 'Payment verification failed');
    }
  };

  // Initiate payment process
  const initiatePayment = useCallback(async (options: PaymentOptions): Promise<PaymentResult | null> => {
    try {
      setIsLoading(true);

      // Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      // Create order
      const orderData = await createOrder(
        options.amount,
        options.currency || 'INR',
        options.notes || {}
      );

      return new Promise((resolve, reject) => {
        const razorpayOptions = {
          key: razorpayConfig.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: razorpayConfig.company.name,
          description: options.description || razorpayConfig.company.description,
          image: razorpayConfig.company.logo,
          order_id: orderData.orderId,
          prefill: {
            name: options.prefill?.name || userData?.displayName || '',
            email: options.prefill?.email || userData?.email || '',
            contact: options.prefill?.contact || userData?.phoneNumber || '',
          },
          notes: options.notes || {},
          theme: {
            color: razorpayConfig.company.theme,
          },
          handler: async (response: PaymentResult) => {
            try {
              // Verify payment on server
              await verifyPayment(response);
              toast.success('Payment completed successfully!');
              
              // Redirect to success page with payment details
              const successUrl = `/payment-success?payment_id=${response.razorpay_payment_id}&order_id=${response.razorpay_order_id}&amount=${options.amount}&service=${encodeURIComponent(options.name || 'Healthcare Service')}`;
              window.location.href = successUrl;
              
              resolve(response);
            } catch (error: any) {
              toast.error(error.message || 'Payment verification failed');
              reject(new Error(error.message || 'Payment verification failed'));
            }
          },
          modal: {
            ondismiss: () => {
              toast.error('Payment cancelled');
              reject(new Error('Payment cancelled by user'));
            },
          },
        };

        const razorpay = new window.Razorpay(razorpayOptions);
        razorpay.open();
      });

    } catch (error: any) {
      console.error('Payment initiation error:', error);
      toast.error(error.message || 'Failed to initiate payment');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userData, loadRazorpayScript]);

  return {
    isLoading,
    initiatePayment,
    loadRazorpayScript,
  };
};
