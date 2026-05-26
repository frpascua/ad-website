// middleware.js - Middleware de autenticación para páginas protegidas

/**
 * Middleware de autenticación
 * Este archivo protege las páginas que requieren autenticación
 * Debe ser incluido en todas las páginas protegidas
 */

// Estado del middleware
let isChecking = true;

// Esperar a que Clerk se cargue
window.addEventListener('load', async () => {
    await initializeMiddleware();
});

/**
 * Inicializar el middleware de autenticación
 */
async function initializeMiddleware() {
    try {
        // Mostrar indicador de carga
        showLoading();

        // Esperar a que Clerk se cargue
        await Clerk.load();

        // Verificar autenticación
        if (Clerk.user) {
            // Usuario autenticado - mostrar contenido protegido
            await handleAuthenticatedUser(Clerk.user);
        } else {
            // Usuario no autenticado - redirigir o mostrar error
            handleUnauthenticatedUser();
        }

        // Escuchar cambios en el estado de autenticación
        Clerk.addListener((user) => {
            if (!user && !isChecking) {
                // Si el usuario cierra sesión mientras está en una página protegida
                handleUnauthenticatedUser();
            }
        });

        isChecking = false;

    } catch (error) {
        console.error('Error en el middleware de autenticación:', error);
        showError('Error al verificar la autenticación');
    }
}

/**
 * Manejar usuario autenticado
 */
async function handleAuthenticatedUser(user) {
    console.log('Usuario autenticado:', user.id);

    // Ocultar loading
    hideLoading();

    // Mostrar contenido protegido
    showProtectedContent();

    // Actualizar información del usuario en la página
    updateUserInfo(user);

    // Configurar botón de cerrar sesión
    setupSignOutButton();
}

/**
 * Manejar usuario no autenticado
 */
function handleUnauthenticatedUser() {
    console.warn('Usuario no autenticado - acceso denegado');

    // Ocultar loading
    hideLoading();

    // Mostrar mensaje de no autorizado
    showUnauthorized();

    // Opcional: Redirigir automáticamente después de unos segundos
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 3000);
}

/**
 * Mostrar indicador de carga
 */
function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'block';
    }
}

/**
 * Ocultar indicador de carga
 */
function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }
}

/**
 * Mostrar contenido protegido
 */
function showProtectedContent() {
    const protectedContent = document.getElementById('protected-content');
    if (protectedContent) {
        protectedContent.style.display = 'block';
    }
}

/**
 * Mostrar mensaje de no autorizado
 */
function showUnauthorized() {
    const unauthorized = document.getElementById('unauthorized');
    if (unauthorized) {
        unauthorized.style.display = 'block';
    }
}

/**
 * Actualizar información del usuario en la página
 */
function updateUserInfo(user) {
    // Nombre del usuario
    const userNameElements = document.querySelectorAll('#user-name');
    userNameElements.forEach(element => {
        element.textContent = user.firstName || user.emailAddresses[0].emailAddress.split('@')[0];
    });

    // Email del usuario
    const userEmailElement = document.getElementById('user-email');
    if (userEmailElement) {
        userEmailElement.textContent = user.emailAddresses[0].emailAddress;
    }

    // ID del usuario
    const userIdElement = document.getElementById('user-id');
    if (userIdElement) {
        userIdElement.textContent = user.id;
    }

    // Último inicio de sesión
    const lastSignInElement = document.getElementById('last-sign-in');
    if (lastSignInElement && user.lastSignInAt) {
        const date = new Date(user.lastSignInAt);
        lastSignInElement.textContent = date.toLocaleString('es-ES');
    }
}

/**
 * Configurar botón de cerrar sesión
 */
function setupSignOutButton() {
    const signOutBtn = document.getElementById('sign-out-btn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', async () => {
            try {
                await Clerk.signOut();
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
                alert('Error al cerrar sesión. Por favor, intenta de nuevo.');
            }
        });
    }
}

/**
 * Mostrar mensaje de error
 */
function showError(message) {
    hideLoading();
    const protectedContent = document.getElementById('protected-content');
    if (protectedContent) {
        protectedContent.innerHTML = `
            <div style="text-align: center; padding: 4rem;">
                <h2 style="color: #ef4444;">Error</h2>
                <p>${message}</p>
                <a href="index.html" class="btn btn-primary" style="margin-top: 1rem;">Volver al Inicio</a>
            </div>
        `;
        protectedContent.style.display = 'block';
    }
}

/**
 * Verificar si el usuario tiene un rol específico (opcional)
 * @param {string} role - Rol a verificar
 * @returns {boolean}
 */
function hasRole(role) {
    if (!Clerk || !Clerk.user) return false;
    
    const userRoles = Clerk.user.publicMetadata?.roles || [];
    return userRoles.includes(role);
}

/**
 * Verificar si el usuario tiene acceso a un recurso (opcional)
 * @param {string} resource - Recurso a verificar
 * @returns {boolean}
 */
function hasAccess(resource) {
    if (!Clerk || !Clerk.user) return false;
    
    // Implementar lógica de control de acceso personalizada
    const permissions = Clerk.user.publicMetadata?.permissions || [];
    return permissions.includes(resource);
}

// Exportar funciones útiles
window.ClerkMiddleware = {
    isAuthenticated: () => Clerk && Clerk.user !== null,
    getUser: () => Clerk ? Clerk.user : null,
    hasRole,
    hasAccess
};
