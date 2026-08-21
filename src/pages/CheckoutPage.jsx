import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createOrder } from '../services/api';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';

const initialForm = {
  fullName: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
};

function CheckoutPage() {
  const { cart, loading: cartLoading, refreshCart } = useCart();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const items = cart?.items || [];

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.fullName.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim() || !form.state.trim() || !form.pincode.trim()) {
      return 'Please fill in all shipping fields';
    }
    if (form.fullName.trim().length < 2) {
      return 'Please enter your full name';
    }
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      return 'Enter a valid 10-digit phone number starting with 6-9';
    }
    if (form.address.trim().length < 5) {
      return 'Please enter a complete address';
    }
    if (!/^\d{6}$/.test(form.pincode.trim())) {
      return 'Enter a valid 6-digit pincode';
    }
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!items.length) {
      setError('Your cart is empty');
      return;
    }

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const data = await createOrder({
        shippingAddress: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        },
        paymentMethod: 'COD',
      });
      await refreshCart();
      navigate(`/orders/${data.data.order._id}/confirmation`);
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartLoading && !cart) {
    return <div className="container state-box">Loading checkout…</div>;
  }

  if (!items.length) {
    return (
      <div className="container state-box">
        <p>Nothing to checkout.</p>
        <Link to="/products" className="btn btn--small">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="container section checkout">
      <h1>Checkout</h1>
      <div className="checkout__grid">
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>Shipping details</h2>
          {error && <p className="form-error">{error}</p>}

          <label>
            Full name
            <input name="fullName" value={form.fullName} onChange={onChange} required />
          </label>
          <label>
            Phone
            <input name="phone" value={form.phone} onChange={onChange} required />
          </label>
          <label>
            Address
            <textarea name="address" rows="3" value={form.address} onChange={onChange} required />
          </label>
          <div className="form-row">
            <label>
              City
              <input name="city" value={form.city} onChange={onChange} required />
            </label>
            <label>
              State
              <input name="state" value={form.state} onChange={onChange} required />
            </label>
          </div>
          <label>
            Pincode
            <input name="pincode" value={form.pincode} onChange={onChange} required />
          </label>

          <fieldset className="payment-box">
            <legend>Payment method</legend>
            <label className="radio-line">
              <input type="radio" name="payment" checked readOnly />
              Cash on Delivery (COD)
            </label>
          </fieldset>

          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? 'Placing order…' : 'Place Order'}
          </button>
        </form>

        <aside className="cart-summary">
          <h2>Order summary</h2>
          <ul className="summary-list">
            {items.map((item) => (
              <li key={item.product._id}>
                <span>
                  {item.product.name} × {item.quantity}
                </span>
                <strong>{formatPrice(item.lineTotal)}</strong>
              </li>
            ))}
          </ul>
          <p>
            Total items: <strong>{cart.totalQuantity}</strong>
          </p>
          <p>
            Total: <strong>{formatPrice(cart.subtotal)}</strong>
          </p>
        </aside>
      </div>
    </div>
  );
}

export default CheckoutPage;
