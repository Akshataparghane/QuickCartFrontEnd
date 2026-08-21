import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="container state-box section">
      <h1>Page not found</h1>
      <p className="muted">The page you requested does not exist.</p>
      <Link to="/" className="btn btn--small">
        Go home
      </Link>
    </div>
  );
}

export default NotFoundPage;
