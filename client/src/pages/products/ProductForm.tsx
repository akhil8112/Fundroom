import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as productsApi from '../../api/products';

const ProductForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unitPrice: 0,
    currentStock: 0,
    minStockAlert: 10,
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const res = await productsApi.getProduct(id!);
          const p = res.data;
          setFormData({
            name: p.name,
            sku: p.sku,
            category: p.category,
            unitPrice: p.unitPrice,
            currentStock: p.currentStock,
            minStockAlert: p.minStockAlert,
            location: p.location || ''
          });
        } catch (error) {
          toast.error('Failed to fetch product');
          navigate('/products');
        } finally {
          setFetching(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numFields = ['unitPrice', 'currentStock', 'minStockAlert'];
    setFormData(prev => ({ 
      ...prev, 
      [name]: numFields.includes(name) ? Number(value) : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await productsApi.updateProduct(id!, formData);
        toast.success('Product updated successfully');
      } else {
        await productsApi.createProduct(formData);
        toast.success('Product created successfully');
      }
      navigate('/products');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="animate-pulse">Loading...</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      <div className="glass-card">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Product Name *</label>
              <input required type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">SKU *</label>
              <input required type="text" name="sku" className="form-input" value={formData.sku} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <input required type="text" name="category" className="form-input" list="categories" value={formData.category} onChange={handleChange} />
              <datalist id="categories">
                <option value="Electronics" />
                <option value="Furniture" />
                <option value="Office Supplies" />
                <option value="Hardware" />
              </datalist>
            </div>
            <div className="form-group">
              <label className="form-label">Unit Price (₹) *</label>
              <input required type="number" step="0.01" name="unitPrice" className="form-input" value={formData.unitPrice} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Initial Stock *</label>
              <input required type="number" name="currentStock" className="form-input" value={formData.currentStock} onChange={handleChange} disabled={isEdit} title={isEdit ? "Stock can only be modified via stock movements after creation" : ""} />
            </div>
            <div className="form-group">
              <label className="form-label">Min Stock Alert *</label>
              <input required type="number" name="minStockAlert" className="form-input" value={formData.minStockAlert} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Warehouse Location</label>
              <input type="text" name="location" className="form-input" value={formData.location} onChange={handleChange} placeholder="e.g. Rack A-12" />
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/products')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
