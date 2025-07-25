'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function OrderTestPage() {
  const [amount, setAmount] = useState(100);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const testOrderCreation = async () => {
    try {
      setLoading(true);
      setError('');
      setResult(null);
      
      console.log('Testing order creation with amount:', amount);
      
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'INR',
          notes: {
            test: 'true',
            timestamp: new Date().toISOString()
          }
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok) {
        setResult(data);
        toast.success('Order created successfully!');
      } else {
        setError(data.error || 'Unknown error');
        toast.error(`Error: ${data.error || 'Unknown error'}`);
      }
      
    } catch (networkError) {
      console.error('Network error:', networkError);
      setError(`Network error: ${networkError}`);
      toast.error('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Order Creation Test</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          <Button
            onClick={testOrderCreation}
            disabled={loading}
            className="w-full"
            variant="primary"
          >
            {loading ? 'Testing...' : 'Test Order Creation'}
          </Button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-medium text-red-900 mb-2">Error:</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">Success:</h3>
              <pre className="text-green-700 text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Environment Info:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Current URL: {typeof window !== 'undefined' ? window.location.href : 'Server'}</p>
              <p>API Endpoint: /api/razorpay/create-order</p>
              <p>Test Mode: Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
