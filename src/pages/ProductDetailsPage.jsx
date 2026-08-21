import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getProductById } from '../services/api';
import { formatPrice, getImageUrl } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [adding, setAdding] = useState(false);
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getProductById(id);
        setProduct(data.data.product);
        setQuantity(1);
      } catch (err) {
        setError(err.response?.data?.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAdd = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    if (product.stock < 1) {
      setMessage('This product is out of stock');
      return;
    }
    if (quantity < 1 || quantity > product.stock) {
      setMessage(`Choose a quantity between 1 and ${product.stock}`);
      return;
    }

    setAdding(true);
    setMessage('');
    try {
      await addItem(product._id, quantity);
      setMessage('Added to cart');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="container state-box">Loading product…</div>;
  if (error) {
    return (
      <div className="container state-box state-box--error">
        <p>{error}</p>
        <Link to="/products" className="btn btn--small">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="container section details">
      <div className="details__media">
        {product.image ? (
          <img src={getImageUrl(product.image)} alt={product.name} />
        ) : (
          <div className="details__placeholder">{product.name.charAt(0)}</div>
        )}
      </div>
      <div className="details__info">
        <p className="product-card__category">{product.category}</p>
        <h1>{product.name}</h1>
        <p className="details__price">{formatPrice(product.price)}</p>
        <p>{product.description}</p>
        <p className={`stock ${product.stock > 0 ? 'stock--ok' : 'stock--out'}`}>
          {product.stock > 0 ? `Available stock: ${product.stock}` : 'Out of stock'}
        </p>

        <div className="qty-row">
          <label htmlFor="qty">Quantity</label>
          <input
            id="qty"
            type="number"
            min="1"
            max={product.stock || 1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            disabled={product.stock < 1}
          />
        </div>

        {message && <p className="toast">{message}</p>}

        <div className="details__actions">
          <button
            type="button"
            className="btn"
            onClick={handleAdd}
            disabled={product.stock < 1 || adding}
          >
            {adding ? 'Adding…' : 'Add to Cart'}
          </button>
          <Link to="/cart" className="btn btn--ghost">
            Go to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsPage;
