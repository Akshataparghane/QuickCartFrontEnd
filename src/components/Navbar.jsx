import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to={isAdmin ? '/admin' : '/'} className="navbar__brand" onClick={closeMenu}>
          QuickCart
        </Link>

        <button
          className="navbar__toggle"
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((prev) => !prev)}
        >
          Menu
        </button>

        <nav className={`navbar__links ${open ? 'is-open' : ''}`}>
          {!isAdmin && (
            <NavLink to="/" end onClick={closeMenu}>
              Home
            </NavLink>
          )}
          <NavLink to="/products" onClick={closeMenu}>
            Products
          </NavLink>
          {!isAdmin && (
            <NavLink to="/cart" onClick={closeMenu}>
              Cart{itemCount > 0 ? ` (${itemCount})` : ''}
            </NavLink>
          )}
          {isAuthenticated && !isAdmin && (
            <NavLink to="/orders" onClick={closeMenu}>
              Orders
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" onClick={closeMenu}>
              Admin
            </NavLink>
          )}
          {!isAuthenticated ? (
            <>
              <NavLink to="/login" onClick={closeMenu}>
                Login
              </NavLink>
              <NavLink to="/register" className="btn btn--small" onClick={closeMenu}>
                Register
              </NavLink>
            </>
          ) : (
            <>
              <span className="navbar__user">Hi, {user.name.split(' ')[0]}</span>
              <button type="button" className="btn btn--ghost btn--small" onClick={() => { logout(); closeMenu(); }}>
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
