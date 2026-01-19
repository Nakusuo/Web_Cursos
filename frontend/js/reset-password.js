const API_URL = window.API_URL || (
    window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api'
        : window.location.origin + '/api'
);
window.API_URL = API_URL;

// Obtener token de la URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

if (!token) {
    document.getElementById('alertContainer').innerHTML = `
        <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle"></i>
            Token inválido o faltante. Por favor, solicita un nuevo enlace de recuperación.
        </div>
    `;
    document.getElementById('resetPasswordForm').style.display = 'none';
}

// Toggle visibilidad de contraseña
document.getElementById('togglePassword').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    const icon = this.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
    }
});

// Verificar fortaleza de contraseña
document.getElementById('password').addEventListener('input', function() {
    const password = this.value;
    const strengthBar = document.getElementById('passwordStrength');
    const feedback = document.getElementById('passwordFeedback');
    
    let strength = 0;
    let feedbackText = '';
    let color = '';
    
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    
    if (strength <= 25) {
        color = 'bg-danger';
        feedbackText = 'Contraseña débil';
    } else if (strength <= 50) {
        color = 'bg-warning';
        feedbackText = 'Contraseña regular';
    } else if (strength <= 75) {
        color = 'bg-info';
        feedbackText = 'Contraseña buena';
    } else {
        color = 'bg-success';
        feedbackText = 'Contraseña fuerte';
    }
    
    strengthBar.style.width = strength + '%';
    strengthBar.className = `progress-bar ${color}`;
    feedback.textContent = feedbackText;
});

// Manejar envío del formulario
document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const submitBtn = document.getElementById('submitBtn');
    const alertContainer = document.getElementById('alertContainer');
    
    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
        alertContainer.innerHTML = `
            <div class="alert alert-warning alert-dismissible fade show" role="alert">
                <i class="bi bi-exclamation-triangle"></i>
                Las contraseñas no coinciden
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        return;
    }
    
    // Validar fortaleza de contraseña
    if (password.length < 8 || 
        !password.match(/[a-z]/) || 
        !password.match(/[A-Z]/) || 
        !password.match(/[0-9]/)) {
        alertContainer.innerHTML = `
            <div class="alert alert-warning alert-dismissible fade show" role="alert">
                <i class="bi bi-exclamation-triangle"></i>
                La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        return;
    }
    
    // Deshabilitar botón
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Restableciendo...';
    
    try {
        const response = await fetch(`${API_URL}/password/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alertContainer.innerHTML = `
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    <i class="bi bi-check-circle"></i>
                    <strong>¡Éxito!</strong> ${data.message}
                    <br>Redirigiendo al inicio de sesión...
                </div>
            `;
            
            // Redirigir al login después de 3 segundos
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
        } else {
            alertContainer.innerHTML = `
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <i class="bi bi-exclamation-triangle"></i>
                    ${data.message || 'Error al restablecer la contraseña'}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-check-circle"></i> Restablecer Contraseña';
        }
    } catch (error) {
        console.error('Error:', error);
        alertContainer.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="bi bi-x-circle"></i>
                Error de conexión. Por favor, intenta nuevamente.
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-check-circle"></i> Restablecer Contraseña';
    }
});
