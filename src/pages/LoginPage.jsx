import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.email.trim(), form.password);
      const fallback =
        data?.data?.user?.role === 'admin' ? '/admin' : '/products';
      navigate(location.state?.from || fallback);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container section auth-page">
      <form className="form-card auth-card" onSubmit={handleSubmit}>
        <h1>Login</h1>
        <p className="muted">Use your QuickCart account to shop and checkout.</p>
        {error && <p className="form-error">{error}</p>}
        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            required
          />
        </label>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Signing in…' : 'Login'}
        </button>
        <p className="muted">
          New here? <Link to="/register">Create an account</Link>
        </p>
        <p className="hint">Test user: akshata@quickcart.com / user123</p>
        <p className="hint">Admin: admin@quickcart.com / admin123</p>
      </form>
    </div>
  );
}

export default LoginPage;
