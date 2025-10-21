import React, { useEffect, useState } from 'react';
import { SecurityGroup, SecurityGroupRule, useSecurityGroups } from '@/context/SecurityGroupsContext';

type Props = {
  open: boolean;
  onClose: () => void;
  initialGroup?: SecurityGroup | null;
};

const emptyRule: SecurityGroupRule = {
  protocol: 'tcp',
  fromPort: 0,
  toPort: 0,
  cidr: '0.0.0.0/0',
  description: '',
};

export const SecurityGroupModal: React.FC<Props> = ({ open, onClose, initialGroup }) => {
  const { addGroup, updateGroup } = useSecurityGroups();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [vpcId, setVpcId] = useState('');
  const [ingress, setIngress] = useState<SecurityGroupRule[]>([emptyRule]);
  const [egress, setEgress] = useState<SecurityGroupRule[]>([{ ...emptyRule, protocol: '-1' }]);

  useEffect(() => {
    if (initialGroup) {
      setName(initialGroup.name || '');
      setDescription(initialGroup.description || '');
      setVpcId(initialGroup.vpcId || '');
      setIngress(initialGroup.ingress?.length ? initialGroup.ingress : [emptyRule]);
      setEgress(initialGroup.egress?.length ? initialGroup.egress : [{ ...emptyRule, protocol: '-1' }]);
    } else {
      setName('');
      setDescription('');
      setVpcId('');
      setIngress([emptyRule]);
      setEgress([{ ...emptyRule, protocol: '-1' }]);
    }
  }, [initialGroup?.id, open]);

  const handleSave = () => {
    const group: Omit<SecurityGroup, 'id'> = { name, description, vpcId, ingress, egress };
    if (initialGroup && initialGroup.id) {
      updateGroup(initialGroup.id, group);
    } else {
      addGroup(group);
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-[900px] max-w-[95vw] bg-white rounded-xl border shadow-2xl h-[80vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b bg-slate-50 rounded-t-xl">
          <h2 className="text-lg font-semibold text-slate-900">{initialGroup ? 'Edit Security Group' : 'Add Security Group'}</h2>
          <button className="text-slate-500 hover:text-slate-900" onClick={onClose}>✕</button>
        </div>
        <div className="p-4 space-y-4 ">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-black">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" placeholder="web-sg" />
            </div>
            <div>
              <label className="text-xs font-medium text-black">VPC ID</label>
              <input value={vpcId} onChange={(e) => setVpcId(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black" placeholder="vpc-12345" />
            </div>
            
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-green-700">Ingress Rules</h3>
              <button className="text-sm px-2 py-1 rounded-md border bg-green-600 text-white hover:bg-green-500" onClick={() => setIngress((prev) => [...prev, emptyRule])}>+ Add Rule</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {ingress.map((rule, idx) => (
                <div key={`ing-${idx}`} className="p-3 text-black rounded-lg border border-slate-200 bg-slate-50">
                  <div className="grid grid-cols-5 gap-2 items-end">
                    <div>
                      <label className="text-xs font-medium">Protocol</label>
                      <select value={rule.protocol} onChange={(e) => setIngress((prev) => prev.map((r, i) => i === idx ? { ...r, protocol: e.target.value } : r))} className="mt-1 w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500">
                        <option value="tcp">TCP</option>
                        <option value="udp">UDP</option>
                        <option value="-1">All</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium">From</label>
                      <input type="number" value={rule.fromPort} onChange={(e) => setIngress((prev) => prev.map((r, i) => i === idx ? { ...r, fromPort: Number(e.target.value) } : r))} className="mt-1 w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                    </div>
                    <div>
                      <label className="text-xs font-medium">To</label>
                      <input type="number" value={rule.toPort} onChange={(e) => setIngress((prev) => prev.map((r, i) => i === idx ? { ...r, toPort: Number(e.target.value) } : r))} className="mt-1 w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-medium">CIDR</label>
                      <input value={rule.cidr} onChange={(e) => setIngress((prev) => prev.map((r, i) => i === idx ? { ...r, cidr: e.target.value } : r))} className="mt-1 w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="text-xs font-medium">Description</label>
                    <input value={rule.description || ''} onChange={(e) => setIngress((prev) => prev.map((r, i) => i === idx ? { ...r, description: e.target.value } : r))} className="mt-1 w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" />
                  </div>
                  <div className="mt-2 text-right">
                    <button className="text-xs text-red-600 hover:underline" onClick={() => setIngress((prev) => prev.filter((_, i) => i !== idx))}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-orange-700">Egress Rules</h3>
              <button className="text-sm px-2 py-1 rounded-md border bg-orange-600 text-white hover:bg-orange-500" onClick={() => setEgress((prev) => [...prev, emptyRule])}>+ Add Rule</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {egress.map((rule, idx) => (
                <div key={`eg-${idx}`} className="p-3 text-black rounded-lg border border-slate-200 bg-slate-50">
                  <div className="grid grid-cols-5 gap-2 items-end">
                    <div>
                      <label className="text-xs font-medium">Protocol</label>
                      <select value={rule.protocol} onChange={(e) => setEgress((prev) => prev.map((r, i) => i === idx ? { ...r, protocol: e.target.value } : r))} className="mt-1 w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                        <option value="tcp">TCP</option>
                        <option value="udp">UDP</option>
                        <option value="-1">All</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium">From</label>
                      <input type="number" value={rule.fromPort} onChange={(e) => setEgress((prev) => prev.map((r, i) => i === idx ? { ...r, fromPort: Number(e.target.value) } : r))} className="mt-1 w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                    </div>
                    <div>
                      <label className="text-xs font-medium">To</label>
                      <input type="number" value={rule.toPort} onChange={(e) => setEgress((prev) => prev.map((r, i) => i === idx ? { ...r, toPort: Number(e.target.value) } : r))} className="mt-1 w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-medium">CIDR</label>
                      <input value={rule.cidr} onChange={(e) => setEgress((prev) => prev.map((r, i) => i === idx ? { ...r, cidr: e.target.value } : r))} className="mt-1 w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="text-xs font-medium">Description</label>
                    <input value={rule.description || ''} onChange={(e) => setEgress((prev) => prev.map((r, i) => i === idx ? { ...r, description: e.target.value } : r))} className="mt-1 w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                  </div>
                  <div className="mt-2 text-right">
                    <button className="text-xs text-red-600 hover:underline" onClick={() => setEgress((prev) => prev.filter((_, i) => i !== idx))}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4 border-t bg-slate-50 rounded-b-xl flex items-center justify-end gap-2">
          <button className="px-3 py-1.5 rounded-md border bg-white hover:bg-slate-100" onClick={onClose}>Cancel</button>
          <button className="px-3 py-1.5 rounded-md border bg-blue-600 text-white hover:bg-blue-500" onClick={handleSave}>{initialGroup ? 'Save Changes' : 'Create Group'}</button>
        </div>
      </div>
    </div>
  );
};

export default SecurityGroupModal;