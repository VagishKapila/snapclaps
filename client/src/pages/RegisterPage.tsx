import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!name.trim()) {
      setLocalError('Name is required');
      return;
    }

    if (!email.trim()) {
      setLocalError('Email is required');
      return;
    }

    if (!password.trim()) {
      setLocalError('Password is required');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }

    try {
      await register(email, password, name);
      navigate('/wallet/onboard');
    } catch (err) {
      // Error is already set in AuthContext
    }
  };

  const displayError = localError || error;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0f0d2e',
        backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(0, 201, 167, 0.05) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(255, 107, 107, 0.05) 0%, transparent 50%)
        `,
      }}
    >
      {/* Header with Logo */}
      <div style={{ padding: '24px 20px' }}>
        <Link
          to="/"
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            fontFamily: '"Anton", sans-serif',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#00C9A7',
            textDecoration: 'none',
          }}
        >
          SnapClaps
        </Link>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            backgroundColor: '#f9f7f4',
            borderRadius: '12px',
            padding: '48px 32px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Heading */}
          <h1
            style={{
              fontFamily: '"Anton", sans-serif',
              fontSize: '32px',
              fontWeight: 'bold',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: '#0f0d2e',
              margin: '0 0 8px 0',
            }}
          >
            Create Account
          </h1>

          {/* Subheading */}
          <p
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: '14px',
              color: '#64748b',
              margin: '0 0 32px 0',
            }}
          >
            Join millions finding deals that match their points.
          </p>

          {/* Error Message */}
          {displayError && (
            <div
              style={{
                backgroundColor: '#FF6B6B',
                color: '#fff',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '24px',
                fontSize: '14px',
                fontFamily: '"Inter", sans-serif',
              }}
            >
              {displayError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Name Input */}
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#475569',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 16px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: '"Inter", sans-serif',
                  backgroundColor: '#fff',
                  color: '#0f0d2e',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#00C9A7';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
              />
            </div>

            {/* Email Input */}
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#475569',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 16px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: '"Inter", sans-serif',
                  backgroundColor: '#fff',
                  color: '#0f0d2e',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#00C9A7';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
              />
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#475569',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '12px 16px',
                    paddingRight: '44px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: '"Inter", sans-serif',
                    backgroundColor: '#fff',
                    color: '#0f0d2e',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#00C9A7';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    fontSize: '14px',
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: '600',
                    padding: '4px 8px',
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <p
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '12px',
                  color: '#94a3b8',
                  marginTop: '6px',
                  margin: '6px 0 0 0',
                }}
              >
                At least 8 characters
              </p>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px 16px',
                backgroundColor: loading ? '#94a3b8' : '#0f0d2e',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontFamily: '"Anton", sans-serif',
                fontSize: '14px',
                fontWeight: 'bold',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                marginBottom: '16px',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#1a1843';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#0f0d2e';
                }
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>
          </form>

          {/* Sign In Link */}
          <div style={{ textAlign: 'center' }}>
            <span
              style={{
                fontFamily: '"Inter", sans-serif',
                fontSize: '14px',
                color: '#475569',
              }}
            >
              Already have an account?{' '}
              <Link
                to="/login"
                style={{
                  color: '#00C9A7',
                  textDecoration: 'none',
                  fontWeight: '600',
                }}
              >
                Sign in →
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
