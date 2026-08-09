import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlinePlus, HiOutlineEye, HiOutlinePencilSquare } from 'react-icons/hi2';
import { DataTable } from '../../components/common/DataTable';
import { SearchBar } from '../../components/common/SearchBar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import * as customersApi from '../../api/customers';
import { Customer } from '../../types';

const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const canEdit = hasRole(['ADMIN', 'SALES']);

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await customersApi.getCustomers({ page, limit: 10, search });
      setCustomers(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'customerName', label: 'Name' },
    { key: 'businessName', label: 'Business' },
    { key: 'customerType', label: 'Type', render: (c: Customer) => <StatusBadge status={c.customerType} /> },
    { key: 'status', label: 'Status', render: (c: Customer) => <StatusBadge status={c.status} /> },
    { key: 'mobile', label: 'Mobile' },
    { 
      key: 'actions', 
      label: 'Actions', 
      render: (c: Customer) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/customers/${c.id}`)}>
            <HiOutlineEye size={18} />
          </button>
          {canEdit && (
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/customers/${c.id}/edit`)}>
              <HiOutlinePencilSquare size={18} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Customers</h1>
        {canEdit && (
          <button className="btn btn-primary" onClick={() => navigate('/customers/new')}>
            <HiOutlinePlus /> Add Customer
          </button>
        )}
      </div>

      <div className="glass-card" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <SearchBar onSearch={setSearch} placeholder="Search by name, email or business..." />
        </div>
      </div>

      <DataTable 
        data={customers} 
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

export default CustomerList;
