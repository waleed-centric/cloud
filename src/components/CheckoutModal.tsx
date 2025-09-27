import React, { useState } from 'react';
import { usePricing } from '../context/PricingContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { serviceCosts, totalMonthlyCost, totalHourlyCost } = usePricing();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setIsProcessing(true);
    
    // Simulate checkout process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setOrderComplete(true);
  };

  const handleClose = () => {
    setOrderComplete(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-slate-700">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-200">
              {orderComplete ? 'Order Confirmation' : 'Checkout Summary'}
            </h2>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-200 text-2xl"
            >
              ×
            </button>
          </div>

          {orderComplete ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-900/30 border border-green-600/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-200 mb-2">Order Placed Successfully!</h3>
              <p className="text-slate-400 mb-6">
                Your AWS infrastructure setup has been queued for deployment.
                You'll receive an email confirmation shortly.
              </p>
              <button
                onClick={handleClose}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Service Breakdown */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-200 mb-4">Service Breakdown</h3>
                <div className="space-y-3">
                  {serviceCosts.map((cost) => (
                    <div key={cost.nodeId} className="flex justify-between items-center p-3 bg-slate-800 border border-slate-700 rounded-lg">
                      <div>
                        <span className="font-medium text-slate-200">{cost.serviceName}</span>
                        <div className="text-sm text-slate-400">
                          Configuration: {Object.keys(cost.configuration).length > 0 
                            ? Object.entries(cost.configuration).map(([key, value]) => `${key}: ${String(value)}`).join(', ')
                            : 'Default'
                          }
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-slate-200">
                          ${cost.monthlyCost.toFixed(2)}/month
                        </div>
                        <div className="text-sm text-slate-400">
                          ${cost.hourlyCost.toFixed(4)}/hour
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Cost */}
              <div className="border-t border-slate-700 pt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold text-slate-200">Total Monthly Cost:</span>
                  <span className="text-2xl font-bold text-blue-400">${totalMonthlyCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Total Hourly Cost:</span>
                  <span>${totalHourlyCost.toFixed(4)}</span>
                </div>
              </div>

              {/* Billing Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-200 mb-4">Billing Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-200 placeholder-slate-400"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-200 placeholder-slate-400"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      AWS Account ID (Optional)
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-200 placeholder-slate-400"
                      placeholder="Enter your AWS Account ID"
                    />
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="mb-6">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600 bg-slate-800 rounded"
                  />
                  <span className="text-sm text-slate-300">
                    I agree to the{' '}
                    <a href="#" className="text-blue-400 hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-blue-400 hover:underline">Privacy Policy</a>.
                    I understand that AWS charges will be billed separately according to AWS pricing.
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </button>
              </div>

              {/* Disclaimer */}
              <div className="mt-6 p-4 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
                <div className="flex">
                  <svg className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a 1 1 0 002 0V6a 1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-yellow-300">
                    <strong>Important:</strong> This is a cost estimation tool. Actual AWS charges may vary based on usage patterns, data transfer, and other factors. Please review AWS pricing documentation for accurate billing information.
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};