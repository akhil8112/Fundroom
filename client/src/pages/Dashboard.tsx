import React, { useEffect, useState } from 'react';
import { HiOutlineUsers, HiOutlineCube, HiOutlineExclamationCircle, HiOutlineDocumentText, HiOutlineClock } from 'react-icons/hi2';
import { StatCard } from '../components/common/StatCard';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import * as dashboardApi from '../api/dashboard';
import { DashboardStats } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardApi.getStats();
        setStats(res.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="animate-pulse">Loading dashboard...</div>;
  }

  if (!stats) return null;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Customers" value={stats.totalCustomers} icon={HiOutlineUsers} />
        <StatCard label="Active Customers" value={stats.activeCustomers} icon={HiOutlineUsers} color="var(--success)" />
        <StatCard label="Total Products" value={stats.totalProducts} icon={HiOutlineCube} color="var(--info)" />
        <StatCard label="Low Stock Alerts" value={stats.lowStockCount} icon={HiOutlineExclamationCircle} color="var(--danger)" />
        <StatCard label="Pending Challans" value={stats.pendingChallans} icon={HiOutlineClock} color="var(--warning)" />
        <StatCard label="Total Challans" value={stats.totalChallans} icon={HiOutlineDocumentText} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
        <div>
          <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '18px' }}>Recent Customers</h3>
          <DataTable 
            data={stats.recentCustomers || []}
            columns={[
              { key: 'customerName', label: 'Name' },
              { key: 'businessName', label: 'Business' },
              { key: 'status', label: 'Status', render: (c) => <StatusBadge status={c.status} /> }
            ]}
          />
        </div>
        <div>
          <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '18px' }}>Recent Challans</h3>
          <DataTable 
            data={stats.recentChallans || []}
            columns={[
              { key: 'challanNumber', label: 'Number' },
              { key: 'totalAmount', label: 'Amount', render: (c: any) => `₹${Number(c.totalAmount).toFixed(2)}` },
              { key: 'status', label: 'Status', render: (c) => <StatusBadge status={c.status} /> }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
