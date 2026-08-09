import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlinePlus, HiOutlineEye } from 'react-icons/hi2';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import * as challansApi from '../../api/challans';
import { Challan } from '../../types';

const ChallanList: React.FC = () => {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const canCreate = hasRole(['ADMIN', 'SALES']);

  useEffect(() => {
    fetchChallans();
  }, [page, statusFilter]);

  const fetchChallans = async () => {
    setLoading(true);
    try {
      const res = await challansApi.getChallans({ page, limit: 10, status: statusFilter });
      setChallans(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'challanNumber', label: 'Challan No.' },
    { key: 'customer', label: 'Customer', render: (c: Challan) => c.customer?.customerName },
    { key: 'totalQuantity', label: 'Total Qty' },
    { key: 'totalAmount', label: 'Total Amount', render: (c: Challan) => `₹${Number(c.totalAmount).toFixed(2)}` },
    { key: 'status', label: 'Status', render: (c: Challan) => <StatusBadge status={c.status} /> },
    { key: 'createdAt', label: 'Date', render: (c: Challan) => new Date(c.createdAt).toLocaleDateString() },
    { 
      key: 'actions', 
      label: 'Actions', 
      render: (c: Challan) => (
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/challans/${c.id}`)}>
          <HiOutlineEye size={18} />
        </button>
      )
    }
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Challans</h1>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => navigate('/challans/new')}>
            <HiOutlinePlus /> Create Challan
          </button>
        )}
      </div>

      <div className="glass-card" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <select 
            className="form-input" 
            style={{ width: '200px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <DataTable 
        data={challans} 
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

export default ChallanList;
