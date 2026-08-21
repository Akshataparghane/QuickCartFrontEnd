import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../services/api';
import { formatPrice } from '../utils/helpers';

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyOrders();
        setOrders(data.data.orders || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="container state-box">Loading orders…</div>;
  if (error) return <div className="container state-box state-box--error">{error}</div>;

  return (
    <div className="container section">
      <h1>My Orders</h1>
      {orders.length === 0 ? (
        <div className="state-box">
          <p>No orders yet.</p>
          <Link to="/products" className="btn btn--small">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article key={order._id} className="order-card">
              <div>
                <p className="muted">Order ID</p>
                <p className="mono">{order._id}</p>
              </div>
              <div>
                <p className="muted">Date</p>
                <p>{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="muted">Total</p>
                <p>{formatPrice(order.totalAmount)}</p>
              </div>
              <div>
                <p className="muted">Status</p>
                <p className="status-pill">{order.orderStatus}</p>
              </div>
              <div>
                <p className="muted">Payment</p>
                <p>{order.paymentStatus}</p>
              </div>
              <Link to={`/orders/${order._id}`} className="btn btn--small btn--ghost">
                View details
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
