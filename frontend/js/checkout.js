const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : window.location.origin + '/api';

const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get('courseId');

let courseData = null;
let selectedPaymentMethod = 'credit_card';

document.addEventListener('DOMContentLoaded', async () => {
    if (!isAuthenticated()) {
        window.location.href = `login.html?redirect=${encodeURIComponent(window.location.href)}`;
        return;
    }

    if (!courseId) {
        alert('Curso no especificado');
        window.location.href = 'cursos.html';
        return;
    }

    await loadCourseData();
    initializePaymentMethods();
    loadUserData();
});

async function loadCourseData() {
    try {
        const response = await fetch(`${API_URL}/courses/${courseId}`);
        
        if (!response.ok) {
            throw new Error('Curso no encontrado');
        }

        courseData = await response.json();
        renderCheckout();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar la información del curso');
        window.location.href = 'cursos.html';
    }
}

function renderCheckout() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('checkout-content').classList.remove('hidden');

    const courseSummary = document.getElementById('course-summary');
    courseSummary.innerHTML = `
        <img src="${courseData.thumbnail || 'https://via.placeholder.com/100x75'}" 
             alt="${courseData.title}" 
             class="course-thumbnail">
        <div class="course-info">
            <h4>${courseData.title}</h4>
            <p>${courseData.instructor || 'Instructor'}</p>
            <p style="color: #667eea; font-weight: 600;">$${courseData.price?.toFixed(2) || '0.00'}</p>
        </div>
    `;

    const price = courseData.price || 0;
    const discount = 0;
    const total = price - discount;

    document.getElementById('subtotal').textContent = `$${price.toFixed(2)}`;
    document.getElementById('discount').textContent = `-$${discount.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

function initializePaymentMethods() {
    const methods = document.querySelectorAll('.payment-method');
    
    methods.forEach(method => {
        method.addEventListener('click', () => {
            methods.forEach(m => m.classList.remove('selected'));
            method.classList.add('selected');
            
            selectedPaymentMethod = method.dataset.method;
            togglePaymentForms();
        });
    });
}

function togglePaymentForms() {
    const cardForm = document.getElementById('card-payment-form');
    const mobileForm = document.getElementById('mobile-payment-form');

    if (selectedPaymentMethod === 'yape' || selectedPaymentMethod === 'plin') {
        cardForm.classList.add('hidden');
        mobileForm.classList.remove('hidden');
    } else {
        cardForm.classList.remove('hidden');
        mobileForm.classList.add('hidden');
    }
}

async function loadUserData() {
    try {
        const token = getToken();
        const response = await fetch(`${API_URL}/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const userData = await response.json();
            document.getElementById('billing-name').value = 
                `${userData.firstName} ${userData.lastName}`;
            document.getElementById('billing-email').value = userData.email;
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

async function processPurchase() {
    const button = document.getElementById('btn-purchase');
    button.disabled = true;
    button.textContent = 'Procesando...';

    try {
        const token = getToken();
        
        const purchaseData = {
            courseId: courseId,
            amount: courseData.price,
            paymentMethod: selectedPaymentMethod
        };

        if (selectedPaymentMethod === 'yape' || selectedPaymentMethod === 'plin') {
            purchaseData.yapePhone = document.getElementById('phone-number').value;
            purchaseData.yapeTransactionCode = document.getElementById('transaction-code').value;
        }

        const response = await fetch(`${API_URL}/purchases`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(purchaseData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al procesar la compra');
        }

        const result = await response.json();
        
        alert('¡Compra realizada exitosamente! 🎉');
        window.location.href = `curso-detalle.html?id=${courseId}`;
        
    } catch (error) {
        console.error('Purchase error:', error);
        alert(error.message || 'Error al procesar la compra. Por favor, intenta de nuevo.');
        button.disabled = false;
        button.textContent = 'Completar Compra';
    }
}
