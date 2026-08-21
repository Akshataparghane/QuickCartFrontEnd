import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingId, setAddingId] = useState(null);
  const [message, setMessage] = useState('');
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProducts();
        setFeatured((data.data.products || []).slice(0, 4));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load featured products');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAdd = async (productId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/' } });
      return;
    }
    setAddingId(productId);
    setMessage('');
    try {
      await addItem(productId, 1);
      setMessage('Added to cart');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not add to cart');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <>
      <section className="hero">
        <div className="container hero__content">
          <p className="eyebrow">QuickCart</p>
          <h1>Shop everyday essentials, delivered simply.</h1>
          <p>
            A clean full-stack storefront with products, cart, COD checkout, and order
            tracking — built for portfolio learning.
          </p>
          <div className="hero__actions">
            <Link to="/products" className="btn">
              Browse Products
            </Link>
            <Link to="/register" className="btn btn--ghost">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <h2>Featured products</h2>
            <Link to="/products">View all</Link>
          </div>
          {loading && <p className="state-box">Loading products…</p>}
          {error && <p className="state-box state-box--error">{error}</p>}
          {message && <p className="toast">{message}</p>}
          {!loading && !error && featured.length === 0 && (
            <p className="state-box">
              No products yet. Run <code>npm run seed</code> in the backend folder.
            </p>
          )}
          {!loading && !error && featured.length > 0 && (
            <div className="product-grid">
              {featured.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={handleAdd}
                  addingId={addingId}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section section--soft">
        <div className="container">
          <h2>Shop by category</h2>
          <div className="category-row">
            {['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports'].map((cat) => (
              <Link key={cat} to={`/products?category=${encodeURIComponent(cat)}`} className="category-chip">
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container why-grid">
          <h2 className="why-grid__title">Why choose QuickCart</h2>
          <div className="why-card">
            <h3>Simple shopping</h3>
            <p>Search, filter, and add items without clutter.</p>
          </div>
          <div className="why-card">
            <h3>Secure login</h3>
            <p>JWT authentication with hashed passwords.</p>
          </div>
          <div className="why-card">
            <h3>COD checkout</h3>
            <p>Place orders locally with cash on delivery.</p>
          </div>
        </div>
      </section>

      <section className="section section--cta">
        <div className="container cta">
          <h2>Ready to fill your cart?</h2>
          <p>Browse the catalog and place your first COD order.</p>
          <Link to="/products" className="btn">
            Start Shopping
          </Link>
        </div>
      </section>
    </>
  );
}

export default HomePage;
