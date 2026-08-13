'use client'
 
import { useState } from 'react';
import Link from 'next/link';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
 
export default function LoginForm() {
  const { loginWithFirebase, loginWithGoogle } = useFirebaseUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
 
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
 
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
 
    try {
      if (!email || !password) {
        throw new Error('Todos los campos son obligatorios');
      }
 
      await loginWithFirebase(email, password);
    } catch (err: any) {
      let errorMessage = 'Error al iniciar sesión.';
      
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = 'Credenciales incorrectas. Por favor, verifica tu email y contraseña.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos fallidos. Intenta más tarde.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
 
  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    
    try {
      await loginWithGoogle();
    } catch (err: any) {
      let errorMessage = 'Error al iniciar sesión con Google.';
      
      if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className='container-auth'>
      <div className='auth-left'></div>
      <div className='auth-right'>
        <form className='auth-form' onSubmit={handleLogin}>
          <h2 className='auth-title'>Inicio de Sesión</h2>
 
          <input
            className='auth-input'
            type='email'
            placeholder='Email'
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
 
          <div className="password-container">
            <input
              className='auth-input'
              type={passwordVisible ? 'text' : 'password'}
              placeholder='Contraseña'
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={togglePasswordVisibility}
              aria-label="Mostrar/Ocultar contraseña"
            >
              {passwordVisible ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
 
          {error && <p className="error-message">{error}</p>}
 
          <button className='auth-button' type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
 
          <div className='auth-footer'>
            <span>¿Aún no tienes cuenta? </span>
            <Link href='/signup'>REGÍSTRATE</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
 