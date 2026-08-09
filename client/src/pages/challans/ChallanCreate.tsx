import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineTrash } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import * as customersApi from '../../api/customers';
import * as productsApi from '../../api/products';
import * as challansApi from '../../api/challans';
import { Customer, Product } from '../../types';

interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  availableStock: number;
}

const ChallanCreate: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  
  // Item entry state
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          customersApi.getCustomers({ limit: 1000, status: 'ACTIVE' }),
          productsApi.getProducts({ limit: 1000 })
        ]);
        setCustomers(custRes.data);
        setProducts(prodRes.data);
      } catch (error) {
        toast.error('Failed to load form data');
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, []);

  const handleAddItem = () => {
    if (!selectedProductId || !quantity) return;
    
    const qty = Number(quantity);
    if (qty <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    if (qty > product.currentStock) {
      toast.error(`Only ${product.currentStock} items available in stock`);
      return;
    }

    const existingItemIndex = items.findIndex(i => i.productId === selectedProductId);
    if (existingItemIndex >= 0) {
      const newItems = [...items];
      const newQty = newItems[existingItemIndex].quantity + qty;
      if (newQty > product.currentStock) {
        toast.error(`Total quantity exceeds available stock (${product.currentStock})`);
        return;
      }
      newItems[existingItemIndex].quantity = newQty;
      setItems(newItems);
    } else {
      setItems([...items, {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unitPrice: Number(product.unitPrice),
        quantity: qty,
        availableStock: product.currentStock
      }]);
    }

    setSelectedProductId('');
    setQuantity('');
  };

  const handleRemoveItem = (idx: number) => {
    const newItems = [...items];
    newItems.splice(idx, 1);
    setItems(newItems);
  };

  const handleSubmit = async (status: 'DRAFT' | 'CONFIRMED') => {
    if (!customerId) {
      toast.error('Please select a customer');
      return;
    }
    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customerId,
        status,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity }))
      };
      
      const res = await challansApi.createChallan(payload);
      toast.success(`Challan ${status.toLowerCase()} successfully`);
      navigate(`/challans/${res.data.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create challan');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="animate-pulse">Loading...</div>;

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Create Challan</h1>
      </div>

      <div style={{ display: 'grid', gap: '24px' }}>
        <div className="glass-card">
          <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>1. Select Customer</h3>
          <select className="form-input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">-- Select Customer --</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.customerName} - {c.businessName}</option>
            ))}
          </select>
        </div>

        <div className="glass-card">
          <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>2. Add Products</h3>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', marginBottom: '24px' }}>
            <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
              <label className="form-label">Product</label>
              <select className="form-input" value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}>
                <option value="">-- Select Product --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id} disabled={p.currentStock === 0}>
                    {p.name} ({p.sku}) - ₹{p.unitPrice} - Stock: {p.currentStock}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Quantity</label>
              <input type="number" className="form-input" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" />
            </div>
            <button type="button" className="btn btn-secondary" onClick={handleAddItem} style={{ height: '42px' }}>
              Add to List
            </button>
          </div>

          {items.length > 0 && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.productName}</td>
                    <td>{item.sku}</td>
                    <td>₹{item.unitPrice.toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td>₹{(item.unitPrice * item.quantity).toFixed(2)}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleRemoveItem(idx)} style={{ color: 'var(--danger)' }}>
                        <HiOutlineTrash size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ color: 'var(--text-primary)' }}>Summary</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Total Items: {items.length} | Total Quantity: {totalQuantity}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Total Amount</p>
            <h2 style={{ color: 'var(--accent-primary)', fontSize: '32px' }}>₹{totalAmount.toFixed(2)}</h2>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/challans')} disabled={loading}>Cancel</button>
          <button className="btn btn-secondary" onClick={() => handleSubmit('DRAFT')} disabled={loading}>Save as Draft</button>
          <button className="btn btn-primary" onClick={() => handleSubmit('CONFIRMED')} disabled={loading}>Confirm Challan</button>
        </div>
      </div>
    </div>
  );
};

export default ChallanCreate;
