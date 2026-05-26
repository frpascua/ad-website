// Evitar que el script se ejecute múltiples veces
if (!window.authInitialized) {
    window.authInitialized = true;

    // ============================================
    // CONFIGURACIÓN DE SUPABASE
    // ============================================
    // IMPORTANTE: Reemplaza estas credenciales con las tuyas
    const SUPABASE_URL = 'https://kdxfalfojxitoolfhrpr.supabase.co';
    const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_W38mKc7B8cOES2pNtz29bQ_Nc0Bq-vx';

    // Inicializar cliente de Supabase
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    // Crear alias global
    window.supabase = window.supabaseClient;
}

// ============================================
// FUNCIONES DE NAVEGACIÓN
// ============================================
window.clearMessages = function() {
    const messages = document.querySelectorAll('.message');
    messages.forEach(msg => {
        msg.textContent = '';
        msg.className = 'message';
    });
}

function showMessage(elementId, message, isError = false) {
    const messageElement = document.getElementById(elementId);
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `message ${isError ? 'error' : 'success'}`;
    }
}

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================

// Autenticación con Magic Link
window.handleMagicLink = async function(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    
    try {
        const { data, error } = await window.supabase.auth.signInWithOtp({
            email: email,
            options: {
                emailRedirectTo: `${window.location.origin}/dashboard.html`
            }
        });
        
        if (error) throw error;
        
        window.showMessage('magic-link-message', '✅ ¡Enlace mágico enviado! Revisa tu email para iniciar sesión.');
        
        // Limpiar formulario
        event.target.reset();
        
    } catch (error) {
        console.error('Error al enviar magic link:', error);
        window.showMessage('magic-link-message', error.message || 'Error al enviar el enlace', true);
    }
}

// Inicio de sesión con Google
window.handleGoogleLogin = async function() {
    try {
        const { data, error } = await window.supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/dashboard.html`
            }
        });
        
        if (error) throw error;
        
    } catch (error) {
        console.error('Error en login con Google:', error);
        alert('Error al iniciar sesión con Google: ' + error.message);
    }
}

// Cerrar sesión
window.handleLogout = async function() {
    try {
        const { error } = await window.supabase.auth.signOut();
        
        if (error) throw error;
        
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        alert('Error al cerrar sesión: ' + error.message);
    }
}

// ============================================
// PROTECCIÓN DE PÁGINAS
// ============================================

// Verificar autenticación (para páginas protegidas)
window.checkAuth = async function() {
    try {
        const { data: { session }, error } = await window.supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!session) {
            // No hay sesión activa, redirigir al login
            window.location.href = 'index.html';
            return;
        }
        
        // Mostrar información del usuario
        window.displayUserInfo(session.user);
        
    } catch (error) {
        console.error('Error al verificar autenticación:', error);
        window.location.href = 'index.html';
    }
}

// Mostrar información del usuario en el dashboard
window.displayUserInfo = function(user) {
    const emailElement = document.getElementById('user-email');
    const idElement = document.getElementById('user-id');
    const lastSignInElement = document.getElementById('last-sign-in');
    
    if (emailElement) emailElement.textContent = user.email;
    if (idElement) idElement.textContent = user.id;
    if (lastSignInElement) {
        const lastSignIn = new Date(user.last_sign_in_at);
        lastSignInElement.textContent = lastSignIn.toLocaleString('es-ES');
    }
}

// ============================================
// LISTENER DE CAMBIOS DE AUTENTICACIÓN
// ============================================
window.supabase.auth.onAuthStateChange((event, session) => {
    console.log('Estado de autenticación:', event, session);
    
    // Puedes manejar eventos como:
    // - SIGNED_IN: Usuario inició sesión
    // - SIGNED_OUT: Usuario cerró sesión
    // - TOKEN_REFRESHED: Token renovado
    // - USER_UPDATED: Usuario actualizado
});

// ============================================
// PREVENIR ACCESO A INDEX SI YA ESTÁ AUTENTICADO
// ============================================
if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
    window.supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            window.location.href = 'dashboard.html';
        }
    });
}
