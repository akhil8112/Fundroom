import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as customersApi from '../../api/customers';

const CustomerForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    customerName: '',
    mobile: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'RETAIL',
    address: '',
    status: 'ACTIVE',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      const fetchCustomer = async () => {
        try {
          const res = await customersApi.getCustomer(id!);
          const c = res.data;
          setFormData({
            customerName: c.customerName,
            mobile: c.mobile,
            email: c.email,
            businessName: c.businessName,
            gstNumber: c.gstNumber || '',
            customerType: c.customerType,
            address: c.address,
            status: c.status,
            notes: c.notes || ''
          });
        } catch (error) {
          toast.error('Failed to fetch customer');
          navigate('/customers');
        } finally {
          setFetching(false);
        }
      };
      fetchCustomer();
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await customersApi.updateCustomer(id!, formData);
        toast.success('Customer updated successfully');
      } else {
        await customersApi.createCustomer(formData);
        toast.success('Customer created successfully');
      }
      navigate('/customers');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="animate-pulse">Loading...</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">{isEdit ? 'Edit Customer' : 'Add New Customer'}</h1>
      </div>

      <div className="glass-card">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Customer Name *</label>
              <input required type="text" name="customerName" className="form-input" value={formData.customerName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Business Name *</label>
              <input required type="text" name="businessName" className="form-input" value={formData.businessName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input required type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile *</label>
              <input required type="text" name="mobile" className="form-input" value={formData.mobile} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Customer Type</label>
              <select name="customerType" className="form-input" value={formData.customerType} onChange={handleChange}>
                <option value="RETAIL">Retail</option>
                <option value="WHOLESALE">Wholesale</option>
                <option value="DISTRIBUTOR">Distributor</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">GST Number</label>
              <input type="text" name="gstNumber" className="form-input" value={formData.gstNumber} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Address *</label>
              <textarea required name="address" className="form-input" rows={3} value={formData.address} onChange={handleChange}></textarea>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" className="form-input" value={formData.status} onChange={handleChange}>
                <option value="LEAD">Lead</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Notes</label>
              <textarea name="notes" className="form-input" rows={2} value={formData.notes} onChange={handleChange}></textarea>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/customers')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;
