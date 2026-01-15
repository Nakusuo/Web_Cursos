const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : window.location.origin + '/api';

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            let data;
            try {
                data = await response.json();
            } catch (e) {
                data = { message: 'Error en la respuesta del servidor' };
            }

            if (response.ok) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userData', JSON.stringify(data.user));
                
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                }

                window.location.href = 'dashboard.html';
            } else {
                showLoginError(data.message || 'Credenciales inválidas. Usa: admin@academiapesquera.com / Admin123');
            }
        } catch (error) {
            console.error('Login error:', error);
            showLoginError('Error de conexión. Asegúrate de que el servidor esté corriendo.');
        }
    });
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const phone = document.getElementById('phone').value;
        const newsletter = document.getElementById('newsletter').checked;

        if (password !== confirmPassword) {
            showRegisterError('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 8) {
            showRegisterError('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    password,
                    phone,
                    newsletter
                })
            });

            const data = await response.json();

            if (response.ok) {
                showRegisterSuccess('¡Cuenta creada exitosamente! Redirigiendo al login...');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                showRegisterError(data.message || 'Error al crear la cuenta');
            }
        } catch (error) {
            console.error('Register error:', error);
            showRegisterError('Error de conexión. Por favor, intenta nuevamente.');
        }
    });
}

function showLoginError(message) {
    const errorDiv = document.getElementById('loginError');
    const errorMessage = document.getElementById('loginErrorMessage');
    
    if (errorDiv && errorMessage) {
        errorMessage.textContent = message;
        errorDiv.classList.remove('d-none');
        
        setTimeout(() => {
            errorDiv.classList.add('d-none');
        }, 5000);
    }
}

function showRegisterSuccess(message) {
    const successDiv = document.getElementById('registerSuccess');
    const successMessage = document.getElementById('registerSuccessMessage');
    
    if (successDiv && successMessage) {
        successMessage.textContent = message;
        successDiv.classList.remove('d-none');
    }
}

function showRegisterError(message) {
    const errorDiv = document.getElementById('registerError');
    const errorMessage = document.getElementById('registerErrorMessage');
    
    if (errorDiv && errorMessage) {
        errorMessage.textContent = message;
        errorDiv.classList.remove('d-none');
        
        setTimeout(() => {
            errorDiv.classList.add('d-none');
        }, 5000);
    }
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('rememberMe');
        window.location.href = 'login.html';
    });
}
