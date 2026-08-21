import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { deleteProduct, getProducts } from '../../services/api';
import { formatPrice, getImageUrl } from '../../utils/helpers';

function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProducts();
      setProducts(data.data.products || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(`Delete "${name}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(id);
    setMessage('');
    try {
      await deleteProduct(id);
      setMessage('Product deleted');
      await loadProducts();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container section">
      <div className="section__head">
        <div>
          <Link to="/admin" className="muted">
            ← Dashboard
          </Link>
          <h1>Products</h1>
        </div>
        <Link to="/admin/products/new" className="btn btn--small">
          Add product
        </Link>
      </div>

      {message && <p className="toast">{message}</p>}
      {loading && <p className="state-box">Loading products…</p>}
      {error && <p className="state-box state-box--error">{error}</p>}

      {!loading && !error && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    <div className="admin-product-cell">
                      {product.image ? (
                        <img src={getImageUrl(product.image)} alt="" />
                      ) : (
                        <span className="admin-thumb-fallback">{product.name.charAt(0)}</span>
                      )}
                      <span>{product.name}</span>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td>{formatPrice(product.price)}</td>
                  <td>{product.stock}</td>
                  <td className="admin-actions">
                    <Link
                      to={`/admin/products/${product._id}/edit`}
                      className="btn btn--ghost btn--small"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="btn btn--ghost btn--small"
                      disabled={deletingId === product._id}
                      onClick={() => handleDelete(product._id, product.name)}
                    >
                      {deletingId === product._id ? 'Deleting…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <p className="state-box">No products yet.</p>}
        </div>
      )}
    </div>
  );
}

export default AdminProductsPage;
