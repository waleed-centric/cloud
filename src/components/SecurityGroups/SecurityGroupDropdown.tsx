import React, { useMemo, useState } from 'react';
import { useSecurityGroups, SecurityGroup } from '@/context/SecurityGroupsContext';
import SecurityGroupModal from './SecurityGroupModal';

type Props = {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  allowMulti?: boolean;
  buttonLabel?: string;
};

export const SecurityGroupDropdown: React.FC<Props> = ({ selectedIds, onChange, allowMulti = true, buttonLabel }) => {
  const { groups, deleteGroup } = useSecurityGroups();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SecurityGroup | null>(null);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => g.name.toLowerCase().includes(q) || (g.description || '').toLowerCase().includes(q));
  }, [groups, query]);

  const toggleId = (id: string) => {
    if (allowMulti) {
      const next = selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id];
      onChange(next);
    } else {
      const next = selectedIds.includes(id) ? [] : [id];
      onChange(next);
      setOpen(false);
    }
  };

  const label = buttonLabel || (selectedIds.length ? `${selectedIds.length} selected` : 'Select Security Groups');

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="relative inline-block w-full ">
      <button
        type="button"
        className="w-full  flex items-center justify-between border border-slate-300 rounded-lg px-4 py-3 text-sm font-medium shadow-sm hover:border-blue-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-slate-900">{label}</span>
        <span className={`text-blue-600 transform transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="absolute mt-2 w-full z-50 border border-slate-400 bg-slate-200 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-3 border-b border-slate-100 bg-slate-100 flex items-center gap-3 ">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search groups..."
              className="flex-1 border text-black border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
            {query && (
              <button
                className="text-sm px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-medium transition-colors duration-200"
                onClick={() => setQuery('')}
                title="Clear filter"
              >
                Clear
              </button>
            )}
            <button
              className="text-sm px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors duration-200 shadow-sm"
              onClick={() => { setEditTarget(null); setModalOpen(true); }}
            >
              +
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="p-3 text-xs text-slate-600 flex items-center justify-between">
                <span>No groups found.</span>
                {query && (
                  <button className="text-xs px-2 py-1 rounded-md border bg-white hover:bg-slate-100" onClick={() => setQuery('')}>Clear filter</button>
                )}
              </div>
            )}
            {filtered.map((g) => (
              <div key={g.id} className="px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors duration-150">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <input
                      type={allowMulti ? 'checkbox' : 'radio'}
                      checked={selectedIds.includes(g.id)}
                      onChange={() => toggleId(g.id)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors duration-200">{g.name}</div>
                     
                      {/* <div className="text-[11px] text-slate-500 mt-1">VPC: {g.vpcId || '—'} · ID: {g.id}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[11px] px-2 py-1 rounded-full bg-green-100 text-green-800 border border-green-200 font-medium">Ingress {g.ingress.length}</span>
                        <span className="text-[11px] px-2 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200 font-medium">Egress {g.egress.length}</span>
                      </div> */}
                    </div>
                  </label>
                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      className="w-7 h-7 rounded-md border border-slate-300 bg-white hover:bg-slate-100 text-blue-600 transition-all duration-200 hover:shadow-sm flex items-center justify-center text-[13px] leading-none"
                      onClick={() => toggleExpand(g.id)}
                      aria-label={expandedIds.includes(g.id) ? 'Hide Details' : 'Show Details'}
                      title={expandedIds.includes(g.id) ? 'Hide Details' : 'Show Details'}
                    >
                      <span className={`inline-block transform transition-transform duration-200 ${expandedIds.includes(g.id) ? 'rotate-180' : ''}`}>▾</span>
                    </button>
                    <button
                      className="w-7 h-7 rounded-md border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-all duration-200 hover:shadow-sm flex items-center justify-center text-[13px] leading-none"
                      onClick={() => { setEditTarget(g); setModalOpen(true); }}
                      aria-label="Edit Group"
                      title="Edit Group"
                    >
                      ✏️
                    </button>
                    <button
                      className="w-7 h-7 rounded-md border border-red-200 bg-white hover:bg-red-50 text-red-600 transition-all duration-200 hover:shadow-sm flex items-center justify-center text-[13px] leading-none"
                      onClick={() => deleteGroup(g.id)}
                      aria-label="Delete Group"
                      title="Delete Group"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                {expandedIds.includes(g.id) && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <div className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Ingress Rules ({g.ingress.length})
                        </div>
                        <div className="space-y-2">
                          {g.ingress.map((r, i) => (
                            <div key={`ing-${i}`} className="text-xs bg-white rounded-md p-2 border border-green-100">
                              <div className="font-medium text-slate-900">{r.description || 'Rule'}</div>
                              <div className="text-slate-600 mt-1">
                                {r.protocol === '-1' ? 'ALL' : r.protocol.toUpperCase()} {r.fromPort}:{r.toPort}
                              </div>
                              <div className="text-slate-500 text-[10px] mt-1">{r.cidr}</div>
                            </div>
                          ))}
                          {g.ingress.length === 0 && <div className="text-xs text-slate-500 italic">No ingress rules</div>}
                        </div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                        <div className="text-sm font-semibold text-orange-800 mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                          Egress Rules ({g.egress.length})
                        </div>
                        <div className="space-y-2">
                          {g.egress.map((r, i) => (
                            <div key={`eg-${i}`} className="text-xs bg-white rounded-md p-2 border border-orange-100">
                              <div className="font-medium text-slate-900">{r.description || 'Rule'}</div>
                              <div className="text-slate-600 mt-1">
                                {r.protocol === '-1' ? 'ALL' : r.protocol.toUpperCase()} {r.fromPort}:{r.toPort}
                              </div>
                              <div className="text-slate-500 text-[10px] mt-1">{r.cidr}</div>
                            </div>
                          ))}
                          {g.egress.length === 0 && <div className="text-xs text-slate-500 italic">No egress rules</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <SecurityGroupModal open={modalOpen} onClose={() => setModalOpen(false)} initialGroup={editTarget} />
    </div>
  );
};

export default SecurityGroupDropdown;