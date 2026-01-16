// contact-form.js - Formulario de contacto en index.html
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : window.location.origin + '/api';

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
});

async function handleContactSubmit(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('contact-submit');
    const btnText = document.getElementById('contact-btn-text');
    const btnLoading = document.getElementById('contact-btn-loading');
    const alertDiv = document.getElementById('contact-alert');

    // Obtener datos del formulario
    const formData = {
        name: document.getElementById('contact-name').value.trim(),
        email: document.getElementById('contact-email').value.trim(),
        phone: document.getElementById('contact-phone').value.trim(),
        subject: document.getElementById('contact-subject').value,
        message: document.getElementById('contact-message').value.trim()
    };

    // Validación básica
    if (!formData.name || !formData.email || !formData.message) {
        showAlert('Por favor, completa todos los campos requeridos.', 'danger');
        return;
    }

    // Deshabilitar botón y mostrar loading
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';

    try {
        const response = await fetch(`${API_URL}/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showAlert(
                '¡Mensaje enviado exitosamente! Te hemos enviado una confirmación a tu correo. Te contactaremos pronto.',
                'success'
            );
            document.getElementById('contact-form').reset();
        } else {
            showAlert(
                data.message || 'Hubo un error al enviar tu mensaje. Por favor, intenta de nuevo.',
                'danger'
            );
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert(
            'Error de conexión. Por favor, verifica tu conexión a internet e intenta de nuevo.',
            'danger'
        );
    } finally {
        // Rehabilitar botón
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
    }
}

function showAlert(message, type) {
    const alertDiv = document.getElementById('contact-alert');
    alertDiv.style.display = 'block';
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    // Auto-ocultar después de 10 segundos
    setTimeout(() => {
        alertDiv.style.display = 'none';
    }, 10000);

    // Scroll al alert
    alertDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
