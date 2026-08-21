import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { getCategories, getProducts } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingId, setAddingId] = useState(null);
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const category = searchParams.get('category') || 'all';

  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(data.data.categories || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getProducts({
          search: searchParams.get('search') || undefined,
          category: category !== 'all' ? category : undefined,
        });
        setProducts(data.data.products || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [searchParams, category]);

  const applySearch = (event) => {
    event.preventDefault();
    const next = {};
    if (search.trim()) next.search = search.trim();
    if (category !== 'all') next.category = category;
    setSearchParams(next);
  };

  const changeCategory = (value) => {
    const next = {};
    if (searchParams.get('search')) next.search = searchParams.get('search');
    if (value !== 'all') next.category = value;
    setSearchParams(next);
  };

  const handleAdd = async (productId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/products' } });
      return;
    }
    setAddingId(productId);
    setToast('');
    try {
      await addItem(productId, 1);
      setToast('Added to cart');
    } catch (err) {
      setToast(err.response?.data?.message || 'Could not add to cart');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="container section">
      <div className="section__head">
        <h1>Products</h1>
        <p className="muted">{products.length} items</p>
      </div>

      <form className="filters" onSubmit={applySearch}>
        <input
          type="search"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => changeCategory(e.target.value)}>
          <option value="all">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button type="submit" className="btn">
          Search
        </button>
      </form>

      {toast && <p className="toast">{toast}</p>}
      {loading && <p className="state-box">Loading products…</p>}
      {error && <p className="state-box state-box--error">{error}</p>}
      {!loading && !error && products.length === 0 && (
        <p className="state-box">No products found. Try another search.</p>
      )}

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onAddToCart={handleAdd}
            addingId={addingId}
          />
        ))}
      </div>
    </div>
  );
}

export default ProductsPage;
