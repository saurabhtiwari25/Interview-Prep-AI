import React, { useActionState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (prevState, formData) => {
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      college: formData.get('college'),
      branch: formData.get('branch'),
      skills: formData.get('skills')
    };

    try {
      await register(data);
      navigate('/');
      return { error: null };
    } catch (err) {
      return { error: err.message || 'Failed to register' };
    }
  };

  const [state, formAction, isPending] = useActionState(handleRegister, { error: null });

  return (
    <div className="card fade-in" style={{ maxWidth: '500px', margin: '40px auto', padding: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
        <UserPlus size={28} color="var(--primary-color)" />
        <h2 style={{ margin: 0 }}>Create Account</h2>
      </div>
      
      {state.error && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>{state.error}</div>}

      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Full Name</label>
          <input type="text" name="name" className="input-field" required style={{ width: '100%', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
          <input type="email" name="email" className="input-field" required style={{ width: '100%', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
          <input type="password" name="password" className="input-field" required style={{ width: '100%', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>College</label>
            <input type="text" name="college" className="input-field" style={{ width: '100%', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Branch</label>
            <input type="text" name="branch" className="input-field" style={{ width: '100%', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Skills</label>
          <input type="text" name="skills" className="input-field" placeholder="e.g. Java, React, Python" style={{ width: '100%', boxSizing: 'border-box' }} />
        </div>
        
        <button type="submit" disabled={isPending} style={{ marginTop: '10px' }}>
          {isPending ? 'Creating Account...' : 'Register'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)' }}>Login here</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
