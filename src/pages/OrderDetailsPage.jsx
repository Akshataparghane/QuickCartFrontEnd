import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import OrderTracker from '../components/OrderTracker';
import { getOrderById } from '../services/api';
import { formatPrice, getImageUrl } from '../utils/helpers';

function OrderDetailsPage({ confirmation = false }) {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getOrderById(id);
        setOrder(data.data.order);
      } catch (err) {
        setError(err.response?.data?.message || 'Order not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="container state-box">Loading order…</div>;
  if (error) return <div className="container state-box state-box--error">{error}</div>;

  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const placedOn = new Date(order.createdAt).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="container section order-details">
      {confirmation ? (
        <div className="order-success">
          <div className="order-success__icon" aria-hidden="true">
            ✓
          </div>
          <div>
            <h1>Thank you! Your order is placed</h1>
            <p>
              Pay with <strong>Cash on Delivery</strong> when your package arrives. We will update
              the status as your order moves forward.
            </p>
          </div>
        </div>
      ) : (
        <div className="section__head">
          <div>
            <p className="eyebrow">Order</p>
            <h1>Order details</h1>
          </div>
          <Link to="/orders" className="btn btn--ghost btn--small">
            All orders
          </Link>
        </div>
      )}

      <div className="order-summary-grid">
        <article className="order-summary-card">
          <p className="muted">Order ID</p>
          <p className="mono order-summary-card__value">{order._id}</p>
        </article>
        <article className="order-summary-card">
          <p className="muted">Placed on</p>
          <p className="order-summary-card__value">{placedOn}</p>
        </article>
        <article className="order-summary-card">
          <p className="muted">Payment</p>
          <p className="order-summary-card__value">
            {order.paymentMethod}
            <span className="status-pill status-pill--soft">{order.paymentStatus}</span>
          </p>
        </article>
        <article className="order-summary-card">
          <p className="muted">Order total</p>
          <p className="order-summary-card__value order-summary-card__total">
            {formatPrice(order.totalAmount)}
          </p>
        </article>
      </div>

      <section className="order-panel">
        <div className="order-panel__head">
          <h2>Order status</h2>
          <span className="status-pill">{order.orderStatus}</span>
        </div>
        <OrderTracker status={order.orderStatus} />
      </section>

      <div className="order-details__grid">
        <section className="order-panel">
          <div className="order-panel__head">
            <h2>Items ordered</h2>
            <p className="muted">
              {itemCount} item{itemCount === 1 ? '' : 's'}
            </p>
          </div>

          <div className="order-items">
            {order.items.map((item) => (
              <article key={`${item.product}-${item.name}`} className="order-item">
                <div className="order-item__media">
                  {item.image ? (
                    <img src={getImageUrl(item.image)} alt={item.name} />
                  ) : (
                    <div className="product-card__placeholder">{item.name.charAt(0)}</div>
                  )}
                </div>
                <div className="order-item__info">
                  <h3>{item.name}</h3>
                  <p className="muted">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                </div>
                <div className="order-item__total">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </article>
            ))}
          </div>

          <div className="order-total-row">
            <span>Total paid on delivery</span>
            <strong>{formatPrice(order.totalAmount)}</strong>
          </div>
        </section>

        <aside className="order-side">
          <section className="order-panel">
            <h2>Shipping address</h2>
            <div className="shipping-block">
              <p className="shipping-block__name">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </p>
              <p>PIN {order.shippingAddress.pincode}</p>
            </div>
          </section>

          <section className="order-panel order-panel--actions">
            <h2>Next steps</h2>
            <p className="muted">
              Keep this order ID handy if you need help with delivery.
            </p>
            <div className="order-actions">
              <Link to="/products" className="btn">
                Continue shopping
              </Link>
              <Link to="/orders" className="btn btn--ghost">
                View all orders
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default OrderDetailsPage;
