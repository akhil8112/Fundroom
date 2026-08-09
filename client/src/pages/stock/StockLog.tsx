import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlinePlus } from 'react-icons/hi2';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import * as stockApi from '../../api/stock';
import { StockMovement as StockMovementType } from '../../types';

const StockLog: React.FC = () => {
  const [movements, setMovements] = useState<StockMovementType[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const canEdit = hasRole(['ADMIN', 'WAREHOUSE']);

  useEffect(() => {
    fetchMovements();
  }, [page]);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const res = await stockApi.getMovements({ page, limit: 15 });
      setMovements(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'createdAt', label: 'Date', render: (m: StockMovementType) => new Date(m.createdAt).toLocaleString() },
    { key: 'product', label: 'Product', render: (m: StockMovementType) => m.product?.name },
    { key: 'movementType', label: 'Type', render: (m: StockMovementType) => <StatusBadge status={m.movementType} type="movement" /> },
    { 
      key: 'quantity', 
      label: 'Qty', 
      render: (m: StockMovementType) => (
        <span style={{ fontWeight: 600, color: m.movementType === 'IN' ? 'var(--success)' : 'var(--danger)' }}>
          {m.movementType === 'IN' ? '+' : '-'}{m.quantity}
        </span>
      ) 
    },
    { key: 'reason', label: 'Reason' },
    { key: 'createdBy', label: 'User', render: (m: StockMovementType) => m.createdBy?.name }
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Stock Movement Log</h1>
        {canEdit && (
          <button className="btn btn-primary" onClick={() => navigate('/stock/movement')}>
            <HiOutlinePlus /> Adjust Stock
          </button>
        )}
      </div>

      <DataTable 
        data={movements} 
        columns={columns} 
        isLoading={loading}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage
        }}
      />
    </div>
  );
};

export default StockLog;
