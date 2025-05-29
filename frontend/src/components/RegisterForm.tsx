import React, { useState } from 'react';

const RegisterForm: React.FC = () => {
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.email || !form.password) {
      setError('El email y la contraseña son obligatorios.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3010/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || 'Usuario registrado exitosamente.');
        setForm({ email: '', password: '', name: '' });
      } else {
        setError(data.error || 'Error al registrar usuario.');
      }
    } catch (err) {
      setError('Error de red o del servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="register-form" onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '0 auto', background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 1px 8px rgba(0,0,0,0.08)' }}>
      <h2>Registro de Usuario</h2>
      <div>
        <label>Email *</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} required />
      </div>
      <div>
        <label>Contraseña *</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} required />
      </div>
      <div>
        <label>Nombre</label>
        <input name="name" value={form.name} onChange={handleChange} />
      </div>
      <button type="submit" disabled={loading} style={{ marginTop: 12, width: '100%' }}>{loading ? 'Registrando...' : 'Registrar'}</button>
      {error && <div className="error" style={{ color: '#d32f2f', marginTop: 10 }}>{error}</div>}
      {success && <div className="success" style={{ color: '#388e3c', marginTop: 10 }}>{success}</div>}
    </form>
  );
};

export default RegisterForm; 