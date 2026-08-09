import React from 'react';
import { HiOutlineInbox } from 'react-icons/hi2';

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  isLoading,
  pagination,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="glass-card animate-pulse" style={{ height: '400px' }}>
        <div style={{ height: '40px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}></div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ height: '40px', borderBottom: '1px solid var(--border-color)', marginBottom: '8px' }}></div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-muted)' }}>
        <HiOutlineInbox size={48} style={{ marginBottom: '16px' }} />
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: 0, overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination" style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)' }}>
          <button 
            className="btn btn-secondary btn-sm"
            disabled={pagination.page <= 1}
            onClick={() => pagination.onPageChange(pagination.page - 1)}
          >
            Prev
          </button>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button 
            className="btn btn-secondary btn-sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => pagination.onPageChange(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
