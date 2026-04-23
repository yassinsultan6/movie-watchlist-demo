import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend validation
    if (!form.name || !form.email || !form.password) {
      setError('Name, email, and password are required');
      return;
    }

    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await register(form);
      setRegistrationSuccess(true);
      setError('');
      // Show success message for 3 seconds then redirect to login
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const errorType = err?.response?.data?.type || 'Error';
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to register. Please try again.';
      setError(`[${errorType}] ${backendMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container form-animate">
      <form onSubmit={handleSubmit}>
        <h1>Register</h1>
        <p className="page-subtitle" style={{ textAlign: 'center' }}>
          Join and start building your movie list
        </p>

        {registrationSuccess && (
          <p style={{ color: 'var(--success-color)', textAlign: 'center', marginBottom: '1rem', fontWeight: 'bold' }}>
            ✓ Registration successful! Please check your email to verify your account.<br />
            Redirecting to login...
          </p>
        )}

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
            disabled={registrationSuccess}
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
            disabled={registrationSuccess}
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
            disabled={registrationSuccess}
          />
        </div>

        <button type="submit" className="btn btn-full-width" disabled={isSubmitting || registrationSuccess}>
          {isSubmitting ? 'Registering...' : 'Register'}
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
