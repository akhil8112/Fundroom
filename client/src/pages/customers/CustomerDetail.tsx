import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlinePencilSquare, HiOutlineArrowLeft } from 'react-icons/hi2';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import * as customersApi from '../../api/customers';
import { Customer } from '../../types';
import toast from 'react-hot-toast';

const CustomerDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const canEdit = hasRole(['ADMIN', 'SALES']);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [followUpNote, setFollowUpNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [addingFollowUp, setAddingFollowUp] = useState(false);

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const res = await customersApi.getCustomer(id!);
      setCustomer(res.data);
    } catch (error) {
      toast.error('Failed to load customer');
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpNote) return;
    setAddingFollowUp(true);
    try {
      await customersApi.addFollowUp(id!, { notes: followUpNote, followUpDate });
      toast.success('Follow-up added');
      setFollowUpNote('');
      setFollowUpDate('');
      fetchCustomer();
    } catch (error) {
      toast.error('Failed to add follow-up');
    } finally {
      setAddingFollowUp(false);
    }
  };

  if (loading) return <div className="animate-pulse">Loading...</div>;
  if (!customer) return null;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button className="btn btn-ghost" style={{ marginBottom: '24px' }} onClick={() => navigate('/customers')}>
        <HiOutlineArrowLeft /> Back to Customers
      </button>
      
      <div className="page-header">
        <h1 className="page-title">{customer.customerName}</h1>
        {canEdit && (
          <button className="btn btn-secondary" onClick={() => navigate(`/customers/${customer.id}/edit`)}>
            <HiOutlinePencilSquare /> Edit
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="glass-card" style={{ alignSelf: 'start' }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Customer Information</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <p className="form-label">Business Name</p>
              <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{customer.businessName}</p>
            </div>
            <div>
              <p className="form-label">Email</p>
              <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{customer.email}</p>
            </div>
            <div>
              <p className="form-label">Mobile</p>
              <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{customer.mobile}</p>
            </div>
            <div>
              <p className="form-label">Type & Status</p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <StatusBadge status={customer.customerType} />
                <StatusBadge status={customer.status} />
              </div>
            </div>
            <div>
              <p className="form-label">GST Number</p>
              <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{customer.gstNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="form-label">Next Follow-up</p>
              <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                {customer.followUpDate ? new Date(customer.followUpDate).toLocaleDateString() : 'None scheduled'}
              </p>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <p className="form-label">Address</p>
              <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{customer.address}</p>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <p className="form-label">Notes</p>
              <p style={{ color: 'var(--text-primary)' }}>{customer.notes || 'No notes'}</p>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ alignSelf: 'start' }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Follow-ups</h3>
          
          <div style={{ marginBottom: '24px' }}>
            {customer.followUps && customer.followUps.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {customer.followUps.map(fu => (
                  <div key={fu.id} style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      {new Date(fu.createdAt).toLocaleString()} by {fu.createdBy?.name}
                    </p>
                    <p style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{fu.notes}</p>
                    {fu.followUpDate && (
                      <p style={{ fontSize: '12px', color: 'var(--accent-primary)', marginTop: '8px' }}>
                        Scheduled next: {new Date(fu.followUpDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No follow-ups recorded.</p>
            )}
          </div>

          {canEdit && (
            <form onSubmit={handleAddFollowUp} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <h4 style={{ marginBottom: '12px', color: 'var(--text-primary)', fontSize: '14px' }}>Add Follow-up</h4>
              <div className="form-group">
                <textarea 
                  required 
                  className="form-input" 
                  rows={2} 
                  placeholder="Notes..."
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Next Follow-up Date (Optional)</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={addingFollowUp}>
                {addingFollowUp ? 'Adding...' : 'Add Record'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
