import { Link } from 'react-router-dom';
import { formatPrice, getImageUrl } from '../utils/helpers';

function ProductCard({ product, onAddToCart, addingId }) {
  const inStock = product.stock > 0;

  return (
    <article className="product-card">
      <div className="product-card__image-wrap">
        {product.image ? (
          <img src={getImageUrl(product.image)} alt={product.name} />
        ) : (
          <div className="product-card__placeholder">{product.name.charAt(0)}</div>
        )}
      </div>
      <div className="product-card__body">
        <p className="product-card__category">{product.category}</p>
        <h3>{product.name}</h3>
        <p className="product-card__price">{formatPrice(product.price)}</p>
        <p className={`stock ${inStock ? 'stock--ok' : 'stock--out'}`}>
          {inStock ? `In stock (${product.stock})` : 'Out of stock'}
        </p>
        <div className="product-card__actions">
          <Link to={`/products/${product._id}`} className="btn btn--ghost btn--small">
            View Product
          </Link>
          <button
            type="button"
            className="btn btn--small"
            disabled={!inStock || addingId === product._id}
            onClick={() => onAddToCart(product._id)}
          >
            {addingId === product._id ? 'Adding…' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
