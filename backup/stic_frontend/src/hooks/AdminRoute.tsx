'use client';
 
import { useFirebaseUser } from "@/hooks/useFirebaseUser";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
 
interface AdminRouteProps {
  children: ReactNode;
}
 
export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading, isAdmin } = useFirebaseUser();
  const router = useRouter();
  // Añadir un estado para controlar si el componente está en el navegador
  const [isMounted, setIsMounted] = useState(false);
 
  // Este efecto se ejecuta solo en el cliente
  useEffect(() => {
    setIsMounted(true);
    
    // El resto de la lógica solo se ejecuta cuando sabemos que estamos en el cliente
    if (isMounted) {
      // Si ya terminó de cargar y el usuario no es admin, redirigir
      if (!loading && user && !isAdmin()) {
        router.push('/');
      }
 
      // Si no hay usuario autenticado, redirigir al login
      if (!loading && !user) {
        router.push('/login');
      }
    }
  }, [loading, user, isAdmin, router, isMounted]);
 
  // No renderizar nada hasta que estemos en el cliente
  if (!isMounted) {
    return null;
  }
 
  // Mientras carga o verifica permisos
  if (loading || !user) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Verificando permisos de administrador...</p>
      </div>
    );
  }
 
  // Si no es administrador, no mostrar nada
  if (!isAdmin()) {
    return null;
  }
 
  // Si es administrador, mostrar el contenido
  return <>{children}</>;
}