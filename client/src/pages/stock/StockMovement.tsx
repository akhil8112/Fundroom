import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as productsApi from '../../api/products';
import * as stockApi from '../../api/stock';
import { Product } from '../../types';

const StockMovement: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialProductId = location.state?.productId || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    productId: initialProductId,
    quantity: '',
    movementType: 'IN',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productsApi.getProducts({ limit: 1000 });
        setProducts(res.data);
      } catch (error) {
        toast.error('Failed to fetch products');
      } finally {
        setFetching(false);
      }
    };
    fetchProducts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectedProduct = products.find(p => p.id === formData.productId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId || !formData.quantity || !formData.reason) {
      toast.error('Please fill all required fields');
      return;
    }

    const qty = Number(formData.quantity);
    if (qty <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    if (formData.movementType === 'OUT' && selectedProduct && qty > selectedProduct.currentStock) {
      toast.error(`Cannot remove more than current stock (${selectedProduct.currentStock})`);
      return;
    }

    setLoading(true);
    try {
      await stockApi.createMovement({
        productId: formData.productId,
        quantity: qty,
        movementType: formData.movementType,
        reason: formData.reason
      });
      toast.success('Stock updated successfully');
      navigate('/stock/log');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update stock');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="animate-pulse">Loading products...</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Stock Adjustment</h1>
      </div>

      <div className="glass-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Product *</label>
            <select required name="productId" className="form-input" value={formData.productId} onChange={handleChange}>
              <option value="">-- Select Product --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku}) - Stock: {p.currentStock}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Movement Type *</label>
            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="movementType" 
                  value="IN" 
                  checked={formData.movementType === 'IN'} 
                  onChange={handleChange} 
                />
                <span style={{ color: formData.movementType === 'IN' ? 'var(--success)' : 'var(--text-primary)' }}>Stock In (+)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="movementType" 
                  value="OUT" 
                  checked={formData.movementType === 'OUT'} 
                  onChange={handleChange} 
                />
                <span style={{ color: formData.movementType === 'OUT' ? 'var(--danger)' : 'var(--text-primary)' }}>Stock Out (-)</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Quantity *</label>
            <input required type="number" name="quantity" className="form-input" value={formData.quantity} onChange={handleChange} min="1" />
          </div>

          <div className="form-group">
            <label className="form-label">Reason / Reference *</label>
            <textarea required name="reason" className="form-input" rows={3} value={formData.reason} onChange={handleChange} placeholder="e.g. Received new shipment, Damaged goods..."></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/stock/log')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Processing...' : 'Confirm Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockMovement;
