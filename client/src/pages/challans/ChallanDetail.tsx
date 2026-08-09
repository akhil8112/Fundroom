import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import * as challansApi from '../../api/challans';
import { Challan } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

const ChallanDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  
  const [challan, setChallan] = useState<Challan | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, type: 'confirm'|'cancel'}>({ isOpen: false, type: 'confirm' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchChallan();
  }, [id]);

  const fetchChallan = async () => {
    try {
      const res = await challansApi.getChallan(id!);
      setChallan(res.data);
    } catch (error) {
      toast.error('Failed to load challan');
      navigate('/challans');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (confirmDialog.type === 'confirm') {
        await challansApi.confirmChallan(id!);
        toast.success('Challan confirmed successfully');
      } else {
        await challansApi.cancelChallan(id!);
        toast.success('Challan cancelled');
      }
      setConfirmDialog({ isOpen: false, type: 'confirm' });
      fetchChallan();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${confirmDialog.type} challan`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse">Loading...</div>;
  if (!challan) return null;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button className="btn btn-ghost" style={{ marginBottom: '24px' }} onClick={() => navigate('/challans')}>
        <HiOutlineArrowLeft /> Back to Challans
      </button>
      
      <div className="page-header">
        <h1 className="page-title">Challan #{challan.challanNumber}</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          {challan.status === 'DRAFT' && (
            <>
              <button className="btn btn-danger" onClick={() => setConfirmDialog({ isOpen: true, type: 'cancel' })}>
                <HiOutlineXCircle /> Cancel
              </button>
              <button className="btn btn-primary" onClick={() => setConfirmDialog({ isOpen: true, type: 'confirm' })}>
                <HiOutlineCheckCircle /> Confirm
              </button>
            </>
          )}
          {challan.status === 'CONFIRMED' && hasRole(['ADMIN']) && (
            <button className="btn btn-danger" onClick={() => setConfirmDialog({ isOpen: true, type: 'cancel' })}>
              <HiOutlineXCircle /> Cancel Challan
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div className="glass-card">
          <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Challan Info</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <p className="form-label">Status</p>
              <div style={{ marginTop: '4px' }}><StatusBadge status={challan.status} type="challan" /></div>
            </div>
            <div>
              <p className="form-label">Date</p>
              <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{new Date(challan.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="form-label">Created By</p>
              <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{challan.createdBy?.name}</p>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Customer Info</h3>
          {challan.customer ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p className="form-label">Business Name</p>
                <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{challan.customer.businessName}</p>
              </div>
              <div>
                <p className="form-label">Contact Person</p>
                <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{challan.customer.customerName}</p>
              </div>
              <div>
                <p className="form-label">Mobile</p>
                <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{challan.customer.mobile}</p>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <p className="form-label">Address</p>
                <p style={{ color: 'var(--text-primary)' }}>{challan.customer.address}</p>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Customer information not available</p>
          )}
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0 }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ color: 'var(--text-primary)' }}>Items</h3>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>SKU</th>
              <th>Unit Price</th>
              <th>Quantity</th>
              <th style={{ textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {challan.items?.map(item => (
              <tr key={item.id}>
                <td>{item.productName}</td>
                <td>{item.productSku}</td>
                <td>₹{Number(item.unitPrice).toFixed(2)}</td>
                <td>{item.quantity}</td>
                <td style={{ textAlign: 'right', fontWeight: 500 }}>₹{Number(item.lineTotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} style={{ textAlign: 'right', padding: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Totals:</td>
              <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{challan.totalQuantity}</td>
              <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, fontSize: '18px', color: 'var(--accent-primary)' }}>₹{Number(challan.totalAmount).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={handleAction}
        title={confirmDialog.type === 'confirm' ? 'Confirm Challan' : 'Cancel Challan'}
        message={confirmDialog.type === 'confirm' ? 'Are you sure you want to confirm this challan? This will deduct the items from stock permanently.' : 'Are you sure you want to cancel this challan? This action cannot be undone.'}
        type={confirmDialog.type === 'confirm' ? 'info' : 'danger'}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default ChallanDetail;
