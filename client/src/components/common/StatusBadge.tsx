import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'customer' | 'challan' | 'movement' | 'customerType';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type }) => {
  let badgeClass = 'badge-info';

  const s = status.toUpperCase();

  if (s === 'ACTIVE' || s === 'CONFIRMED' || s === 'IN') {
    badgeClass = 'badge-success';
  } else if (s === 'INACTIVE' || s === 'CANCELLED' || s === 'OUT') {
    badgeClass = 'badge-danger';
  } else if (s === 'LEAD' || s === 'DRAFT') {
    badgeClass = 'badge-warning';
  } else if (s === 'RETAIL' || s === 'WHOLESALE' || s === 'DISTRIBUTOR') {
    badgeClass = 'badge-info';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      {status}
    </span>
  );
};
