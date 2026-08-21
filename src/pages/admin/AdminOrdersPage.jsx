import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAdminOrders } from '../../services/api';
import { formatPrice } from '../../utils/helpers';

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAdminOrders();
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
      <div className="section__head">
        <div>
          <Link to="/admin" className="muted">
            ← Dashboard
          </Link>
          <h1>All orders</h1>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="state-box">No orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article key={order._id} className="order-card admin-order-card">
              <div>
                <p className="muted">Order ID</p>
                <p className="mono">{order._id}</p>
              </div>
              <div>
                <p className="muted">Customer</p>
                <p>{order.user?.name || 'User'}</p>
                <p className="muted">{order.user?.email}</p>
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
              <Link to={`/admin/orders/${order._id}`} className="btn btn--small btn--ghost">
                Manage
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminOrdersPage;
