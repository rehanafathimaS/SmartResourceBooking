import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 1. Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      Swal.fire({
        icon: 'success',
        title: 'Welcome Back!',
        timer: 1500,
        showConfirmButton: false,
        background: '#1e293b',
        color: '#fff'
      });

      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: err.response?.data?.message || 'Invalid email or password',
        background: '#1e293b',
        color: '#fff'
      });
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle New Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
        department
      });

      Swal.fire({
        icon: 'success',
        title: 'Account Created!',
        text: 'You can now log in with your credentials.',
        background: '#1e293b',
        color: '#fff'
      });
      setIsRegistering(false);
      setPassword('');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: err.response?.data?.message || 'Error creating account',
        background: '#1e293b',
        color: '#fff'
      });
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', {
        email,
        newPassword
      });

      Swal.fire({
        icon: 'success',
        title: 'Password Updated!',
        text: 'Please log in with your new password.',
        background: '#1e293b',
        color: '#fff'
      });
      setIsForgotPassword(false);
      setPassword('');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Reset Failed',
        text: err.response?.data?.message || 'User not found or server error',
        background: '#1e293b',
        color: '#fff'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      // Modern Computer Lab Background image with dark overlay
      backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.82), rgba(2, 6, 23, 0.9)), url('https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1920&auto=format&fit=crop')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
      padding: '20px 0',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'rgba(30, 41, 59, 0.78)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderRadius: '24px',
        padding: '28px 32px 32px 32px', // Adjusted padding for small laptop screens
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.12)'
      }}>

        {/* Dynamic Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            padding: '10px',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            borderRadius: '14px',
            marginBottom: '10px',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <span style={{ fontSize: '1.8rem' }}>⚡</span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.5px' }}>
            {isRegistering ? 'Create Account' : isForgotPassword ? 'Reset Password' : 'Smart Resource Booking'}
          </h2>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
            {isRegistering ? 'Sign up to request campus facilities' : isForgotPassword ? 'Enter registered email & new password' : 'Sign in to reserve campus facilities'}
          </p>
        </div>

        {/* --- FORM 1: FORGOT PASSWORD VIEW --- */}
        {isForgotPassword ? (
          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Registered Email</label>
              <input type="email" required placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} style={darkInputStyle} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>New Password</label>
              <input type="password" required placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={darkInputStyle} />
            </div>
            <button type="submit" disabled={loading} style={primaryBtnStyle}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button type="button" onClick={() => setIsForgotPassword(false)} style={linkBtnStyle}>Back to Login</button>
            </div>
          </form>
        ) : 

        /* --- FORM 2: REGISTER VIEW --- */
        isRegistering ? (
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Full Name</label>
              <input type="text" required placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} style={darkInputStyle} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Department</label>
              <input type="text" required placeholder="e.g. Computer Science, ECE" value={department} onChange={(e) => setDepartment(e.target.value)} style={darkInputStyle} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Email Address</label>
              <input type="email" required placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} style={darkInputStyle} />
            </div>
            <div style={{ marginBottom: '18px' }}>
              <label style={labelStyle}>Password</label>
              <input type="password" required placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} style={darkInputStyle} />
            </div>
            <button type="submit" disabled={loading} style={primaryBtnStyle}>
              {loading ? 'Creating Account...' : 'Register Account'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Already have an account? </span>
              <button type="button" onClick={() => setIsRegistering(false)} style={linkBtnStyle}>Login</button>
            </div>
          </form>
        ) : 

        /* --- FORM 3: LOGIN VIEW --- */
        (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Email Address</label>
              <input type="email" required placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} style={darkInputStyle} />
            </div>

            <div style={{ marginBottom: '8px' }}>
              <label style={labelStyle}>Password</label>
              <input type="password" required placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} style={darkInputStyle} />
            </div>

            <div style={{ textAlign: 'right', marginBottom: '18px' }}>
              <button type="button" onClick={() => setIsForgotPassword(true)} style={{ ...linkBtnStyle, fontSize: '0.8rem' }}>
                Forgot Password?
              </button>
            </div>

            <button type="submit" disabled={loading} style={primaryBtnStyle}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '18px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '14px' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Don't have an account? </span>
              <button type="button" onClick={() => setIsRegistering(true)} style={linkBtnStyle}>
                Create New Account
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

// Styling Variables for Dark Theme
const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: '700',
  color: '#cbd5e1',
  marginBottom: '5px',
  letterSpacing: '0.3px'
};

const darkInputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '10px',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  backgroundColor: 'rgba(15, 23, 42, 0.65)',
  color: '#ffffff',
  fontSize: '0.88rem',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s'
};

const primaryBtnStyle = {
  width: '100%',
  padding: '12px',
  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  color: '#ffffff',
  border: 'none',
  borderRadius: '10px',
  fontWeight: '800',
  fontSize: '0.92rem',
  cursor: 'pointer',
  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
  transition: 'transform 0.2s'
};

const linkBtnStyle = {
  background: 'none',
  border: 'none',
  color: '#60a5fa',
  fontWeight: '700',
  cursor: 'pointer',
  textDecoration: 'none',
  padding: 0
};

export default Login;