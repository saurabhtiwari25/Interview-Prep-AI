import React, { useActionState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const LoginPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect to home
  if (user) return <Navigate to="/" replace />;

  const handleLogin = async (prevState, formData) => {
    const email = formData.get('email');
    const password = formData.get('password');
    try {
      await login(email, password);
      navigate('/');
      return { error: null };
    } catch (err) {
      return { error: err.message || 'Failed to login' };
    }
  };

  const [state, formAction, isPending] = useActionState(handleLogin, { error: null });

  return (
    <div className="card fade-in" style={{ maxWidth: '400px', margin: '40px auto', padding: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
        <LogIn size={28} color="var(--primary-color)" />
        <h2 style={{ margin: 0 }}>Login</h2>
      </div>
      
      {state.error && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>{state.error}</div>}

      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
          <input 
            type="email" 
            name="email"
            className="input-field" 
            required
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
          <input 
            type="password" 
            name="password"
            className="input-field" 
            required
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" disabled={isPending} style={{ marginTop: '10px' }}>
          {isPending ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        Don't have an account? <Link to="/register" style={{ color: 'var(--primary-color)' }}>Register here</Link>
      </p>
    </div>
  );
};

export default LoginPage;
