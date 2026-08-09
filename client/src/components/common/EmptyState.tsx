import React from 'react';
import { HiOutlineInbox } from 'react-icons/hi2';

interface EmptyStateProps {
  message: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message, icon: Icon = HiOutlineInbox, action }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px', textAlign: 'center' }}>
    <Icon size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
    <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 500 }}>{message}</h3>
    {action && <div style={{ marginTop: '16px' }}>{action}</div>}
  </div>
);
