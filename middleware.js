import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase desde variables de entorno
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Configurar qué rutas deben ser protegidas
export const config = {
  matcher: ['/dashboard.html', '/dashboard', '/ad'],
};

/**
 * Middleware de Vercel que protege las rutas del dashboard
 * Se ejecuta en el edge antes de servir el contenido
 */
export default async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Obtener el token de acceso de las cookies
  const token = request.cookies.get('sb-access-token')?.value;
  
  if (!token) {
    // No hay token, redirigir al login
    console.log('No token found, redirecting to login');
    return Response.redirect(new URL('/index.html', request.url));
  }

  try {
    // Crear cliente de Supabase y verificar el token
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      // Token inválido o expirado, redirigir al login
      console.log('Invalid token, redirecting to login:', error?.message);
      return Response.redirect(new URL('/index.html', request.url));
    }

    // Token válido, permitir acceso al contenido protegido
    console.log('Valid token for user:', user.email);
    return Response.next();
    
  } catch (error) {
    console.error('Error en middleware:', error);
    return Response.redirect(new URL('/index.html', request.url));
  }
}
