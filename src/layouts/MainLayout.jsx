import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

function MainLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="page">
        <Outlet />
      </div>
      <footer className="footer">
        <div className="container footer__inner">
          <p>© {new Date().getFullYear()} QuickCart. Built for learning full-stack development.</p>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
