import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { initialSecurityGroups } from '@/data/securityGroups';

export type SecurityGroupRule = {
  protocol: string; // 'tcp' | 'udp' | '-1' for all
  fromPort: number;
  toPort: number;
  cidr: string; // e.g., '0.0.0.0/0'
  description?: string;
};

export type SecurityGroup = {
  id: string;
  name: string;
  description?: string;
  vpcId?: string;
  ingress: SecurityGroupRule[];
  egress: SecurityGroupRule[];
};

type SecurityGroupsContextValue = {
  groups: SecurityGroup[];
  addGroup: (group: Omit<SecurityGroup, 'id'> & { id?: string }) => SecurityGroup;
  updateGroup: (id: string, patch: Partial<SecurityGroup>) => void;
  deleteGroup: (id: string) => void;
  getGroupById: (id: string) => SecurityGroup | undefined;
};

const SecurityGroupsContext = createContext<SecurityGroupsContextValue | undefined>(undefined);

function generateId(name?: string) {
  const base = name ? name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toLowerCase() : 'sg';
  return `sg-${base}-${Date.now().toString(36)}`;
}

export function SecurityGroupsProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<SecurityGroup[]>(() => initialSecurityGroups);

  const addGroup: SecurityGroupsContextValue['addGroup'] = (group) => {
    const id = group.id && group.id.trim() ? group.id : generateId(group.name);
    const newGroup: SecurityGroup = {
      id,
      name: group.name,
      description: group.description || '',
      vpcId: group.vpcId || '',
      ingress: Array.isArray(group.ingress) ? group.ingress : [],
      egress: Array.isArray(group.egress) ? group.egress : [],
    };
    setGroups((prev) => [...prev, newGroup]);
    return newGroup;
  };

  const updateGroup: SecurityGroupsContextValue['updateGroup'] = (id, patch) => {
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  };

  const deleteGroup: SecurityGroupsContextValue['deleteGroup'] = (id) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
  };

  const getGroupById = (id: string) => groups.find((g) => g.id === id);

  const value = useMemo<SecurityGroupsContextValue>(
    () => ({ groups, addGroup, updateGroup, deleteGroup, getGroupById }),
    [groups]
  );

  return <SecurityGroupsContext.Provider value={value}>{children}</SecurityGroupsContext.Provider>;
}

export function useSecurityGroups(): SecurityGroupsContextValue {
  const ctx = useContext(SecurityGroupsContext);
  if (!ctx) throw new Error('useSecurityGroups must be used within SecurityGroupsProvider');
  return ctx;
}