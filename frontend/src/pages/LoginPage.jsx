import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { resendVerificationEmail } from '../services/authService';

const LoginPage = () => {
  const { login, loginWithToken, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const emailRegex = /^\S+@\S+\.\S+$/;

  // Handle OAuth callback AND email verification redirect (both pass ?token=)
  useEffect(() => {
    const token = searchParams.get('token');
    const oauthError = searchParams.get('error');
    const verified = searchParams.get('verified');

    if (token) {
      setIsProcessingOAuth(true);
      loginWithToken(token)
        .then((userData) => navigate(userData?.role === 'admin' ? '/admin' : '/watchlist'))
        .catch(() => {
          setError('Login failed. Please try again.');
          setIsProcessingOAuth(false);
        });
    } else if (oauthError) {
      setError(oauthError);
    } else if (verified === 'true') {
      setSuccess('✓ Email verified! You can now log in.');
    }
  }, []);

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
      const { user: loggedInUser } = await login(form);
      navigate(loggedInUser?.role === 'admin' ? '/admin' : '/watchlist');
    } catch (err) {
      const rawMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to login. Please try again.';
      // Strip [ErrorType] prefix added by frontend service layer
      const backendMessage = rawMessage.replace(/^\[[^\]]+\]\s*/, '');
      setError(backendMessage);
      // Show resend button if the error is about unverified email
      if (backendMessage.toLowerCase().includes('verify')) {
        setShowResend(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!form.email) {
      setError('Enter your email above then click Resend.');
      return;
    }
    try {
      setResendLoading(true);
      await resendVerificationEmail(form.email);
      setShowResend(false);
      setError('');
      setSuccess('✓ Verification email resent! Check your inbox.');
    } catch (err) {
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsProcessingOAuth(true);
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    window.location.href = `${backendUrl}/auth/google`;
  };

  return (
    <div className="form-container form-animate">
      <form onSubmit={handleSubmit}>
        <h1>Login</h1>
        <p className="page-subtitle" style={{ textAlign: 'center' }}>
          Welcome back — sign in to continue
        </p>

        {success && (
          <p style={{ color: 'var(--success-color)', textAlign: 'center', marginBottom: '1rem', fontWeight: 'bold' }}>
            {success}
          </p>
        )}

        {error && (
          <p style={{ color: 'var(--error-color)', textAlign: 'center', marginBottom: '0.5rem' }}>
            {error}
          </p>
        )}

        {showResend && (
          <p style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}
            >
              {resendLoading ? 'Sending...' : 'Resend verification email'}
            </button>
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

        <button type="submit" className="btn btn-full-width" disabled={isSubmitting || isProcessingOAuth}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>

        <div style={{ position: 'relative', margin: '1.5rem 0' }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            width: '100%',
            height: '1px',
            backgroundColor: 'var(--border-color)',
            transform: 'translateY(-50%)',
          }} />
          <div style={{
            position: 'relative',
            textAlign: 'center',
            backgroundColor: 'var(--primary-bg)',
            display: 'inline-block',
            width: '100%',
          }}>
            <span style={{ padding: '0 10px', color: 'var(--text-muted)' }}>or</span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-full-width"
          onClick={handleGoogleLogin}
          disabled={isProcessingOAuth || isSubmitting}
          style={{
            backgroundColor: 'var(--secondary-bg)',
            border: '2px solid var(--border-color)',
            color: 'var(--primary-text)',
            cursor: isProcessingOAuth ? 'not-allowed' : 'pointer',
          }}
        >
          {isProcessingOAuth ? (
            <>
              <span style={{ marginRight: '0.5rem' }}>🔄</span>
              Redirecting to Google...
            </>
          ) : (
            <>
              <span style={{ marginRight: '0.5rem' }}>🔐</span>
              Login with Gmail
            </>
          )}
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
