import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlinePencilSquare, HiOutlineArrowLeft, HiOutlineAdjustmentsHorizontal } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import * as productsApi from '../../api/products';
import { Product } from '../../types';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import toast from 'react-hot-toast';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const canEdit = hasRole(['ADMIN', 'WAREHOUSE']);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productsApi.getProduct(id!);
        setProduct(res.data);
      } catch (error) {
        toast.error('Failed to load product');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  if (loading) return <div className="animate-pulse">Loading...</div>;
  if (!product) return null;

  const stockPercentage = Math.min(100, Math.max(0, (product.currentStock / (product.minStockAlert * 3)) * 100));
  const stockColor = product.currentStock <= product.minStockAlert ? 'var(--danger)' : 'var(--success)';

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button className="btn btn-ghost" style={{ marginBottom: '24px' }} onClick={() => navigate('/products')}>
        <HiOutlineArrowLeft /> Back to Products
      </button>
      
      <div className="page-header">
        <h1 className="page-title">{product.name}</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          {canEdit && (
            <>
              <button className="btn btn-secondary" onClick={() => navigate('/stock/movement', { state: { productId: product.id } })}>
                <HiOutlineAdjustmentsHorizontal /> Adjust Stock
              </button>
              <button className="btn btn-primary" onClick={() => navigate(`/products/${product.id}/edit`)}>
                <HiOutlinePencilSquare /> Edit
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        <div className="glass-card" style={{ alignSelf: 'start' }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Product Details</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <p className="form-label">SKU</p>
              <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{product.sku}</p>
            </div>
            <div>
              <p className="form-label">Category</p>
              <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{product.category}</p>
            </div>
            <div>
              <p className="form-label">Unit Price</p>
              <p style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '18px' }}>₹{Number(product.unitPrice).toFixed(2)}</p>
            </div>
            <div>
              <p className="form-label">Location</p>
              <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{product.location || 'N/A'}</p>
            </div>
            
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <p className="form-label" style={{ marginBottom: '8px' }}>Stock Level</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: stockColor, fontWeight: 700, fontSize: '24px' }}>{product.currentStock}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Min Alert: {product.minStockAlert}</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${stockPercentage}%`, height: '100%', background: stockColor, transition: 'width 0.5s ease' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ alignSelf: 'start', padding: 0 }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ color: 'var(--text-primary)' }}>Stock Movement History</h3>
          </div>
          
          <DataTable 
            data={product.stockMovements || []}
            columns={[
              { key: 'createdAt', label: 'Date', render: (m) => new Date(m.createdAt).toLocaleDateString() },
              { key: 'movementType', label: 'Type', render: (m) => <StatusBadge status={m.movementType} type="movement" /> },
              { key: 'quantity', label: 'Qty', render: (m) => <span style={{ fontWeight: 500, color: m.movementType === 'IN' ? 'var(--success)' : 'var(--danger)' }}>{m.movementType === 'IN' ? '+' : '-'}{m.quantity}</span> },
              { key: 'reason', label: 'Reason' },
              { key: 'createdBy', label: 'By', render: (m) => m.createdBy?.name }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
