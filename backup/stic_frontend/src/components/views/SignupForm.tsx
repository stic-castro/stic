'use client'
 
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useForm, SubmitHandler } from "react-hook-form";
import { useFirebaseUser, UserRole } from "@/hooks/useFirebaseUser";
 
type Inputs = {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  telefono: string;
  direccion: string;
};
 
export default function SignupForm() {
  const { registerWithFirebase } = useFirebaseUser();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Inicializar como true porque el valor por defecto del rol es 'cliente'
  const [showAdditionalFields, setShowAdditionalFields] = useState(true);
 
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Inputs>({
    defaultValues: {
      role: 'cliente',
      telefono: '',
      direccion: ''
    }
  });
 
  // Observar el valor actual del campo role
  const selectedRole = watch('role');
 
  // Actualizar campos adicionales cuando cambia el rol
  useEffect(() => { // Cambiado de useState a useEffect
    setShowAdditionalFields(selectedRole === 'cliente');
  }, [selectedRole]);
 
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
 
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log('Formulario enviado');
    console.log('Datos enviados:', data);
 
    setError('');
    setLoading(true);
 
    try {
      if (!accepted) {
        throw new Error('Debes aceptar los términos y condiciones');
      }
 
      await registerWithFirebase(
        data.email,
        data.password,
        data.fullName,
        data.role,
        data.telefono,
        data.direccion
      );
 
      console.log('Usuario registrado exitosamente');
    } catch (err: any) {
      let errorMessage = 'Hubo un error al crear la cuenta.';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Este correo ya está registrado. Por favor, utiliza otro.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'El formato del correo electrónico no es válido.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="container-auth">
      <div className="auth-left"></div>
      <div className="auth-right">
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <h2 className="auth-title">Registro</h2>
 
          {/* Nombre completo */}
          <input
            className="auth-input"
            type="text"
            placeholder="Nombre completo"
            {...register('fullName', { required: 'Este campo es obligatorio' })}
          />
          {errors.fullName && <span className="error-text">{errors.fullName.message}</span>}
 
          {/* Email */}
          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            {...register('email', {
              required: 'Este campo es obligatorio',
              pattern: {
                value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: 'Por favor ingresa un email válido',
              },
            })}
          />
          {errors.email && <span className="error-text">{errors.email.message}</span>}
 
          {/* Contraseña */}
          <div className="password-container">
            <input
              className="auth-input"
              type={passwordVisible ? 'text' : 'password'}
              placeholder="Contraseña"
              {...register('password', {
                required: 'Este campo es obligatorio',
                minLength: {
                  value: 6,
                  message: 'La contraseña debe tener al menos 6 caracteres'
                }
              })}
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
          {errors.password && <span className="error-text">{errors.password.message}</span>}
 
          {/* Selección de Rol */}
          <div className="form-group">
            <label htmlFor="role">Tipo de usuario:</label>
            <select
              id="role"
              {...register('role')}
              className="auth-select"
              onChange={(e) => {
                setShowAdditionalFields(e.target.value === 'cliente');
              }}
            >
              <option value="cliente">Cliente</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
 
          {/* Campos adicionales para clientes */}
          {showAdditionalFields && (
            <>
              <input
                className="auth-input"
                type="tel"
                placeholder="Teléfono (opcional)"
                {...register('telefono')}
              />
              
              <input
                className="auth-input"
                type="text"
                placeholder="Dirección (opcional)"
                {...register('direccion')}
              />
            </>
          )}
 
          {/* Aceptar términos y condiciones */}
          <div className="checkbox">
            <input
              type="checkbox"
              id="terms"
              onChange={() => setAccepted(!accepted)}
              className="auth-checkbox"
            />
            <label htmlFor="terms">Acepto los términos y condiciones</label>
          </div>
 
          {/* Mensaje de error */}
          {error && <p className="error-message">{error}</p>}
 
          {/* Botón de registro */}
          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Registrarse'}
          </button>
 
          {/* Footer */}
          <div className="auth-footer">
            <span>¿Ya tienes una cuenta? </span>
            <Link href="/login">Inicia Sesión</Link>
          </div>
        </form>
      </div>
    </div>
  );
}