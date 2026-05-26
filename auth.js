// auth.js - Lógica de autenticación para la página principal

// Esperar a que Clerk se cargue
window.addEventListener('load', async () => {
    try {
        // Inicializar Clerk
        await Clerk.load({
            // Las opciones se pueden configurar aquí
        });

        // Verificar si el usuario está autenticado
        if (Clerk.user) {
            // Usuario autenticado
            showUserInfo(Clerk.user);
        } else {
            // Usuario no autenticado, mostrar componente de inicio de sesión
            showSignIn();
        }

        // Configurar botón de cerrar sesión
        const signOutBtn = document.getElementById('sign-out-btn');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', handleSignOut);
        }

        // Escuchar cambios en el estado de autenticación
        Clerk.addListener((user) => {
            if (user) {
                showUserInfo(user);
            } else {
                showSignIn();
            }
        });

    } catch (error) {
        console.error('Error al cargar Clerk:', error);
        showError();
    }
});

// Mostrar información del usuario autenticado
function showUserInfo(user) {
    const authContainer = document.getElementById('auth-container');
    const userInfo = document.getElementById('user-info');
    
    if (authContainer && userInfo) {
        authContainer.style.display = 'none';
        userInfo.style.display = 'block';

        // Actualizar información del usuario
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');

        if (userName) {
            userName.textContent = user.firstName || user.emailAddresses[0].emailAddress.split('@')[0];
        }

        if (userEmail) {
            userEmail.textContent = user.emailAddresses[0].emailAddress;
        }
    }
}

// Mostrar formulario de inicio de sesión
function showSignIn() {
    const authContainer = document.getElementById('auth-container');
    const userInfo = document.getElementById('user-info');
    
    if (authContainer && userInfo) {
        authContainer.style.display = 'block';
        userInfo.style.display = 'none';

        // Montar el componente de inicio de sesión de Clerk
        const signInDiv = document.getElementById('sign-in');
        if (signInDiv && Clerk) {
            Clerk.mountSignIn(signInDiv, {
                appearance: {
                    elements: {
                        rootBox: 'clerk-root-box',
                        card: 'clerk-card',
                    },
                    variables: {
                        colorPrimary: '#6366f1',
                    }
                },
                signUpUrl: '/signup.html' // Opcional: página de registro separada
            });
        }
    }
}

// Manejar cierre de sesión
async function handleSignOut() {
    try {
        await Clerk.signOut();
        // Recargar la página después de cerrar sesión
        window.location.reload();
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        alert('Error al cerrar sesión. Por favor, intenta de nuevo.');
    }
}

// Mostrar mensaje de error
function showError() {
    const authContainer = document.getElementById('auth-container');
    if (authContainer) {
        authContainer.innerHTML = `
            <div style="padding: 2rem; background-color: rgba(239, 68, 68, 0.1); border-radius: 0.5rem;">
                <h3 style="color: #ef4444;">Error de Configuración</h3>
                <p>No se pudo cargar el sistema de autenticación. Por favor, verifica tu configuración de Clerk.</p>
            </div>
        `;
    }
}

// Función auxiliar para obtener el estado de autenticación
function isAuthenticated() {
    return Clerk && Clerk.user !== null;
}

// Exportar funciones útiles
window.ClerkAuth = {
    isAuthenticated,
    getUser: () => Clerk ? Clerk.user : null,
    signOut: handleSignOut
};
