import React, { useState } from 'react';

const LoginForm: React.FC<{ onLogin?: (token: string) => void }> = ({ onLogin }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('El email y la contraseña son obligatorios.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3010/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        if (onLogin) onLogin(data.token);
        localStorage.setItem('token', data.token);
      } else {
        setError(data.error || 'Credenciales inválidas.');
      }
    } catch (err) {
      setError('Error de red o del servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '0 auto', background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 1px 8px rgba(0,0,0,0.08)' }}>
      <h2>Iniciar Sesión</h2>
      <div>
        <label>Email *</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} required />
      </div>
      <div>
        <label>Contraseña *</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} required />
      </div>
      <button type="submit" disabled={loading} style={{ marginTop: 12, width: '100%' }}>{loading ? 'Ingresando...' : 'Ingresar'}</button>
      {error && <div className="error" style={{ color: '#d32f2f', marginTop: 10 }}>{error}</div>}
    </form>
  );
};

export default LoginForm; 