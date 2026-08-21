import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import OrderTracker from '../../components/OrderTracker';
import {
  getAdminOrderById,
  updateAdminOrderStatus,
} from '../../services/api';
import { formatPrice, getImageUrl } from '../../utils/helpers';

const STATUS_OPTIONS = ['confirmed', 'shipped', 'delivered', 'cancelled'];

function AdminOrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAdminOrderById(id);
        setOrder(data.data.order);
        setStatus(data.data.order.orderStatus);
      } catch (err) {
        setError(err.response?.data?.message || 'Order not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleUpdate = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (status === 'placed') {
      setError('Choose confirmed, shipped, delivered, or cancelled');
      return;
    }

    setSaving(true);
    try {
      const data = await updateAdminOrderStatus(id, status);
      setOrder(data.data.order);
      setStatus(data.data.order.orderStatus);
      setMessage('Order status updated');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update status');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container state-box">Loading order…</div>;
  if (error && !order) {
    return <div className="container state-box state-box--error">{error}</div>;
  }

  const locked = order.orderStatus === 'delivered' || order.orderStatus === 'cancelled';
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
      <div className="section__head">
        <div>
          <Link to="/admin/orders" className="muted">
            ← All orders
          </Link>
          <p className="eyebrow">Admin</p>
          <h1>Manage order</h1>
        </div>
        <Link to="/admin" className="btn btn--ghost btn--small">
          Dashboard
        </Link>
      </div>

      {message && <p className="toast">{message}</p>}
      {error && <p className="form-error">{error}</p>}

      <div className="order-summary-grid order-summary-grid--admin">
        <article className="order-summary-card">
          <p className="muted">Order ID</p>
          <p className="mono order-summary-card__value">{order._id}</p>
        </article>
        <article className="order-summary-card">
          <p className="muted">Customer</p>
          <p className="order-summary-card__value">{order.user?.name || 'User'}</p>
          <p className="muted">{order.user?.email}</p>
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
            <span>Order total (COD)</span>
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

          <section className="order-panel">
            <h2>Update status</h2>
            <p className="muted">
              Move the order through confirmed, shipped, delivered, or cancel it.
            </p>
            <form className="admin-status-form" onSubmit={handleUpdate}>
              <label>
                Order status
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={locked}
                >
                  <option value="placed" disabled>
                    placed
                  </option>
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="btn" disabled={saving || locked}>
                {locked ? 'Status locked' : saving ? 'Updating…' : 'Update status'}
              </button>
            </form>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default AdminOrderDetailsPage;
