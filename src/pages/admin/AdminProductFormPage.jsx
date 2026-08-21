import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  createProduct,
  getProductById,
  updateProduct,
} from '../../services/api';
import { getImageUrl } from '../../utils/helpers';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category: '',
  stock: '',
};

function AdminProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [existingImage, setExistingImage] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (!isEdit) return;

    const load = async () => {
      try {
        const data = await getProductById(id);
        const product = data.data.product;
        setForm({
          name: product.name || '',
          description: product.description || '',
          price: String(product.price ?? ''),
          category: product.category || '',
          stock: String(product.stock ?? ''),
        });
        setExistingImage(product.image || '');
      } catch (err) {
        setLoadFailed(true);
        setError(err.response?.data?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, isEdit]);

  useEffect(() => {
    if (!imageFile) {
      setPreview('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImageFile(null);
      return;
    }

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Only JPEG, PNG, or WebP images are allowed');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2MB');
      return;
    }

    setError('');
    setImageFile(file);
  };

  const validate = () => {
    if (!form.name.trim() || !form.description.trim() || !form.category.trim()) {
      return 'Name, description, and category are required';
    }
    if (form.price === '' || Number(form.price) < 0) {
      return 'Price must be zero or a positive number';
    }
    if (form.stock === '' || Number(form.stock) < 0) {
      return 'Stock cannot be negative';
    }
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const formData = new FormData();
    formData.append('name', form.name.trim());
    formData.append('description', form.description.trim());
    formData.append('price', form.price);
    formData.append('category', form.category.trim());
    formData.append('stock', form.stock);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    setSaving(true);
    try {
      if (isEdit) {
        await updateProduct(id, formData);
      } else {
        await createProduct(formData);
      }
      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container state-box">Loading product…</div>;

  if (loadFailed) {
    return (
      <div className="container state-box state-box--error">
        <p>{error || 'Product not found'}</p>
        <Link to="/admin/products" className="btn btn--small">
          Back to products
        </Link>
      </div>
    );
  }

  const previewSrc = preview || (existingImage ? getImageUrl(existingImage) : '');

  return (
    <div className="container section">
      <Link to="/admin/products" className="muted">
        ← Back to products
      </Link>
      <h1>{isEdit ? 'Edit product' : 'Add product'}</h1>

      <form className="form-card admin-form" onSubmit={handleSubmit}>
        {error && <p className="form-error">{error}</p>}

        <label>
          Product name
          <input name="name" value={form.name} onChange={onChange} required />
        </label>

        <label>
          Description
          <textarea
            name="description"
            rows="4"
            value={form.description}
            onChange={onChange}
            required
          />
        </label>

        <div className="form-row">
          <label>
            Price (₹)
            <input
              name="price"
              type="number"
              min="0"
              step="1"
              value={form.price}
              onChange={onChange}
              required
            />
          </label>
          <label>
            Stock
            <input
              name="stock"
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={onChange}
              required
            />
          </label>
        </div>

        <label>
          Category
          <input
            name="category"
            value={form.category}
            onChange={onChange}
            placeholder="e.g. Electronics"
            required
          />
        </label>

        <label>
          Product image
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onImageChange} />
        </label>

        {previewSrc && (
          <div className="image-preview">
            <p className="muted">Image preview</p>
            <img src={previewSrc} alt="Product preview" />
          </div>
        )}

        <button type="submit" className="btn" disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Update product' : 'Create product'}
        </button>
      </form>
    </div>
  );
}

export default AdminProductFormPage;
