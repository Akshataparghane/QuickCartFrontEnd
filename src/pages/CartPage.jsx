import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice, getImageUrl } from '../utils/helpers';
import { useState } from 'react';

function CartPage() {
  const { cart, loading, error, updateItem, removeItem, clear } = useCart();
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleUpdate = async (productId, quantity) => {
    setBusyId(productId);
    setMessage('');
    try {
      await updateItem(productId, quantity);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not update quantity');
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (productId) => {
    setBusyId(productId);
    setMessage('');
    try {
      await removeItem(productId);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not remove item');
    } finally {
      setBusyId(null);
    }
  };

  const handleClear = async () => {
    setMessage('');
    try {
      await clear();
      setMessage('Cart cleared');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not clear cart');
    }
  };

  if (loading && !cart) {
    return <div className="container state-box">Loading cart…</div>;
  }

  if (error) {
    return <div className="container state-box state-box--error">{error}</div>;
  }

  const items = cart?.items || [];

  return (
    <div className="container section">
      <div className="section__head">
        <h1>Your Cart</h1>
        {items.length > 0 && (
          <button type="button" className="btn btn--ghost btn--small" onClick={handleClear}>
            Clear cart
          </button>
        )}
      </div>

      {message && <p className="toast">{message}</p>}

      {items.length === 0 ? (
        <div className="state-box">
          <p>Your cart is empty.</p>
          <Link to="/products" className="btn btn--small">
            Browse products
          </Link>
        </div>
      ) : (
        <>
          <div className="cart-list">
            {items.map((item) => {
              const productId = item.product._id;
              return (
                <article key={productId} className="cart-item">
                  <div className="cart-item__media">
                    {item.product.image ? (
                      <img src={getImageUrl(item.product.image)} alt={item.product.name} />
                    ) : (
                      <div className="product-card__placeholder">{item.product.name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="cart-item__info">
                    <h3>{item.product.name}</h3>
                    <p>{formatPrice(item.price)}</p>
                    <div className="qty-row">
                      <button
                        type="button"
                        className="btn btn--ghost btn--small"
                        disabled={item.quantity <= 1 || busyId === productId}
                        onClick={() => handleUpdate(productId, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        className="btn btn--ghost btn--small"
                        disabled={busyId === productId}
                        onClick={() => handleUpdate(productId, item.quantity + 1)}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="btn btn--ghost btn--small"
                        disabled={busyId === productId}
                        onClick={() => handleRemove(productId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="cart-item__total">{formatPrice(item.lineTotal)}</div>
                </article>
              );
            })}
          </div>

          <aside className="cart-summary">
            <p>
              Total items: <strong>{cart.totalQuantity}</strong>
            </p>
            <p>
              Subtotal: <strong>{formatPrice(cart.subtotal)}</strong>
            </p>
            <button type="button" className="btn" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </button>
          </aside>
        </>
      )}
    </div>
  );
}

export default CartPage;
