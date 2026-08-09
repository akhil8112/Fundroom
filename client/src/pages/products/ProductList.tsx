import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlinePlus, HiOutlineEye, HiOutlinePencilSquare } from 'react-icons/hi2';
import { DataTable } from '../../components/common/DataTable';
import { SearchBar } from '../../components/common/SearchBar';
import { useAuth } from '../../context/AuthContext';
import * as productsApi from '../../api/products';
import { Product } from '../../types';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const canEdit = hasRole(['ADMIN', 'WAREHOUSE']);

  useEffect(() => {
    fetchProducts();
  }, [page, search, category]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productsApi.getProducts({ page, limit: 10, search, category });
      setProducts(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Product Name' },
    { key: 'sku', label: 'SKU' },
    { key: 'category', label: 'Category' },
    { key: 'unitPrice', label: 'Price', render: (p: Product) => `₹${Number(p.unitPrice).toFixed(2)}` },
    { 
      key: 'currentStock', 
      label: 'Stock', 
      render: (p: Product) => (
        <span style={{ color: p.currentStock <= p.minStockAlert ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>
          {p.currentStock}
        </span>
      )
    },
    { key: 'location', label: 'Location' },
    { 
      key: 'actions', 
      label: 'Actions', 
      render: (p: Product) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/products/${p.id}`)}>
            <HiOutlineEye size={18} />
          </button>
          {canEdit && (
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/products/${p.id}/edit`)}>
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
        <h1 className="page-title">Products</h1>
        {canEdit && (
          <button className="btn btn-primary" onClick={() => navigate('/products/new')}>
            <HiOutlinePlus /> Add Product
          </button>
        )}
      </div>

      <div className="glass-card" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <SearchBar onSearch={setSearch} placeholder="Search by name or SKU..." />
          <select 
            className="form-input" 
            style={{ width: '200px' }}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
            <option value="Office Supplies">Office Supplies</option>
            <option value="Hardware">Hardware</option>
          </select>
        </div>
      </div>

      <DataTable 
        data={products} 
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

export default ProductList;
