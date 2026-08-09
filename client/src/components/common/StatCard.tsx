import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, trend, color = 'var(--accent-primary)' }) => {
  return (
    <div className="glass-card stat-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{ background: `${color}20`, color: color, padding: '16px', borderRadius: '12px', display: 'flex' }}>
        <Icon size={24} />
      </div>
      <div>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 500 }}>{label}</p>
        <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</h3>
      </div>
    </div>
  );
};
