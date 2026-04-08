import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend validation
    if (!form.email || !form.password) {
      setError('Email and password are required');
      return;
    }

    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(form);
      navigate('/watchlist');
    } catch (err) {
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to login. Please try again.';
      setError(backendMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container form-animate">
      <form onSubmit={handleSubmit}>
        <h1>Login</h1>
        <p className="page-subtitle" style={{ textAlign: 'center' }}>
          Welcome back — sign in to continue
        </p>

        {error && (
          <p style={{ color: 'var(--error-color)', textAlign: 'center', marginBottom: '1rem' }}>
            {error}
          </p>
        )}

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
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="btn btn-full-width" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Don&apos;t have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-color)' }}>
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
