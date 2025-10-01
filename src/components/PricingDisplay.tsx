import React, { useState } from 'react';
import { usePricing } from '../context/PricingContext';
import { CheckoutModal } from './CheckoutModal';
import { useAwsBuilder } from '@/context/AwsBuilderContext';

export const PricingDisplay: React.FC<{ className?: string }> = ({ className }) => {
  const { serviceCosts, totalMonthlyCost, totalHourlyCost } = usePricing();
  const { state } = useAwsBuilder();
  const [showCheckout, setShowCheckout] = useState(false);

  const hasServices = serviceCosts.length > 0;

  // Diagnostics calculations
  const nodeIds = state.placedNodes.map(n => n.id);
  const pricedIds = serviceCosts.map(c => c.nodeId);
  const unpricedIds = nodeIds.filter(id => !pricedIds.includes(id));
  const zeroCostItems = serviceCosts.filter(c => c.monthlyCost === 0 || c.hourlyCost === 0);
  const noConnections = state.placedNodes.length > 1 && state.connections.length === 0;
  const highCost = totalMonthlyCost > 1000;

  const diagnostics: { type: 'warning' | 'info' | 'error'; message: string }[] = [];
  if (!hasServices && nodeIds.length === 0) {
    diagnostics.push({ type: 'info', message: 'No services added. Drag a service onto the canvas to see pricing.' });
  }
  if (unpricedIds.length > 0) {
    diagnostics.push({ type: 'warning', message: `${unpricedIds.length} node(s) missing pricing. Set service properties or complete configuration.` });
  }
  if (zeroCostItems.length > 0) {
    diagnostics.push({ type: 'warning', message: `${zeroCostItems.length} service(s) have 0 cost. This may be a misconfiguration (set quantity/size).` });
  }
  if (noConnections) {
    diagnostics.push({ type: 'info', message: 'Multiple nodes present but no connections. Add connections to complete the architecture diagram.' });
  }
  if (highCost) {
    diagnostics.push({ type: 'warning', message: 'Total monthly cost is high (> $1000). Review sizes/regions to optimize cost.' });
  }

  const containerClass = `bg-slate-900 rounded-lg shadow-xl border border-slate-700 p-4 text-slate-200 flex flex-col ${className || ''}`;

  if (!hasServices) {
    return (
      <div className={containerClass}>
        <h3 className="text-lg font-semibold text-slate-200 mb-3">Cost Estimation</h3>
        <div className="text-center py-8 text-slate-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          <p>Add services to canvas to see pricing</p>
        </div>

        {/* Problems & Diagnostics */}
        <div className="mt-4 p-3 bg-slate-800 border border-slate-700 rounded-lg">
          <h4 className="text-sm font-semibold text-slate-200 mb-2">Problems & Diagnostics</h4>
          {diagnostics.length === 0 ? (
            <p className="text-xs text-slate-400">No issues found yet. Add services first.</p>
          ) : (
            <ul className="space-y-1">
              {diagnostics.map((d, idx) => (
                <li key={idx} className={`text-xs ${d.type === 'error' ? 'text-red-400' : d.type === 'warning' ? 'text-yellow-400' : 'text-slate-400'}`}>
                  • {d.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={containerClass}>
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Cost Estimation</h3>
        
        {/* Service Breakdown */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-3 mb-4 max-h-96">
          {serviceCosts.map((cost) => (
            <div key={cost.nodeId} className="flex justify-between items-center p-2 bg-slate-800 border border-slate-700 rounded">
              <div className="flex-1">
                <span className="text-sm font-medium text-slate-200">{cost.serviceName}</span>
                {Object.keys(cost.configuration).length > 0 && (
                  <div className="text-xs text-slate-400 mt-1">
                    {Object.entries(cost.configuration).slice(0, 2).map(([key, value]) => (
                      <span key={key} className="mr-2">{key}: {String(value)}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-200">
                  ${cost.monthlyCost.toFixed(2)}/mo
                </div>
                <div className="text-xs text-slate-400">
                  ${cost.hourlyCost.toFixed(4)}/hr
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total Cost Summary */}
        <div className="border-t border-slate-700 pt-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-slate-200">Total Monthly:</span>
            <span className="text-xl font-bold text-blue-400">${totalMonthlyCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-slate-400">
            <span>Total Hourly:</span>
            <span>${totalHourlyCost.toFixed(4)}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={() => setShowCheckout(true)}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a 2 2 0 00-2 2v4.01" />
          </svg>
          Checkout - ${totalMonthlyCost.toFixed(2)}/month
        </button>

        {/* Problems & Diagnostics */}
        <div className="mt-4 p-3 bg-slate-800 border border-slate-700 rounded-lg">
          <h4 className="text-sm font-semibold text-slate-200 mb-2">Problems & Diagnostics</h4>
          {diagnostics.length === 0 ? (
            <p className="text-xs text-slate-400">Koi major issue detect nahi hua.</p>
          ) : (
            <ul className="space-y-1">
              {diagnostics.map((d, idx) => (
                <li key={idx} className={`text-xs ${d.type === 'error' ? 'text-red-400' : d.type === 'warning' ? 'text-yellow-400' : 'text-slate-400'}`}>
                  • {d.message}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pricing Disclaimer */}
        <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
          <div className="flex items-start">
            <svg className="h-4 w-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a 1 1 0 00-1 1v3a 1 1 0 002 0V6a 1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="text-xs text-yellow-300">
              <strong>Note:</strong> Estimates based on US East (Ohio) region. Actual costs may vary based on usage, data transfer, and region selection.
            </div>
          </div>
        </div>
      </div>

      <CheckoutModal 
        isOpen={showCheckout} 
        onClose={() => setShowCheckout(false)} 
      />
    </>
  );
};