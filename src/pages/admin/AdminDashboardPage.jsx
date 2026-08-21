import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAdminStats } from '../../services/api';
import { formatPrice } from '../../utils/helpers';

function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAdminStats();
        setStats(data.data.stats);
        setRecentOrders(data.data.recentOrders || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="container state-box">Loading dashboard…</div>;
  if (error) return <div className="container state-box state-box--error">{error}</div>;

  return (
    <div className="container section">
      <div className="section__head">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Dashboard</h1>
        </div>
        <div className="admin-actions">
          <Link to="/admin/products" className="btn btn--ghost btn--small">
            Manage products
          </Link>
          <Link to="/admin/orders" className="btn btn--ghost btn--small">
            Manage orders
          </Link>
          <Link to="/admin/products/new" className="btn btn--small">
            Add product
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <article className="stat-card">
          <p className="muted">Total products</p>
          <strong>{stats.totalProducts}</strong>
        </article>
        <article className="stat-card">
          <p className="muted">Total orders</p>
          <strong>{stats.totalOrders}</strong>
        </article>
        <article className="stat-card">
          <p className="muted">Total users</p>
          <strong>{stats.totalUsers}</strong>
        </article>
        <article className="stat-card">
          <p className="muted">Total sales</p>
          <strong>{formatPrice(stats.totalSales)}</strong>
        </article>
      </div>

      <h2>Recent orders</h2>
      {recentOrders.length === 0 ? (
        <p className="state-box">No orders yet.</p>
      ) : (
        <div className="orders-list">
          {recentOrders.map((order) => (
            <article key={order._id} className="order-card admin-order-card">
              <div>
                <p className="muted">Customer</p>
                <p>{order.user?.name || 'User'}</p>
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
                Open
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDashboardPage;
