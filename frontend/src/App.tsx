import React, { useState, useEffect } from 'react';
import './App.css';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, []);

  const handleLogin = (newToken: string) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        {token ? (
          <>
            <button onClick={handleLogout} style={{ position: 'absolute', top: 20, right: 20 }}>Cerrar sesión</button>
            <Dashboard />
          </>
        ) : showRegister ? (
          <>
            <RegisterForm />
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              ¿Ya tienes cuenta?{' '}
              <button style={{ color: '#1976d2', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '1rem' }} onClick={() => setShowRegister(false)}>
                Inicia sesión
              </button>
            </div>
          </>
        ) : (
          <>
            <LoginForm onLogin={handleLogin} />
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              ¿No tienes cuenta?{' '}
              <button style={{ color: '#1976d2', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '1rem' }} onClick={() => setShowRegister(true)}>
                Regístrate aquí
              </button>
            </div>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
