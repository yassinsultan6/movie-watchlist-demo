import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setSubmitting(true);
      await register(form);
      navigate('/watchlist');
    } catch (err) {
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to register. Please try again.';
      setError(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-container form-animate">
      <form onSubmit={handleSubmit}>
        <h1>Register</h1>
        <p className="page-subtitle" style={{ textAlign: 'center' }}>
          Join and start building your movie list
        </p>

        {error && (
          <p style={{ color: 'var(--error-color)', textAlign: 'center', marginBottom: '1rem' }}>
            {error}
          </p>
        )}

        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
            autoComplete="name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
        </div>

        <button type="submit" className="btn btn-full-width" disabled={submitting}>
          {submitting ? 'Registering...' : 'Register'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-color)' }}>
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
