const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : window.location.origin + '/api';

function checkAdminAuth() {
    const token = localStorage.getItem('authToken');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!token || userData.role !== 'admin') {
        alert('Acceso denegado. Solo administradores pueden acceder.');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

async function loadPendingPayments() {
    if (!checkAdminAuth()) return;

    const token = localStorage.getItem('authToken');
    const tableBody = document.getElementById('pendingPaymentsTable');

    try {
        const response = await fetch(`${API_URL}/payments/pending`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar pagos pendientes');
        }

        const payments = await response.json();

        document.getElementById('pendingPayments').textContent = payments.length;
        
        if (payments.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">
                        <i class="bi bi-check-circle" style="font-size: 3rem;"></i>
                        <p class="mt-2">No hay pagos pendientes de verificación</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = payments.map(payment => {
            const date = new Date(payment.createdAt).toLocaleDateString('es-PE');
            const time = new Date(payment.createdAt).toLocaleTimeString('es-PE', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            return `
                <tr>
                    <td>
                        <small class="d-block">${date}</small>
                        <small class="text-muted">${time}</small>
                    </td>
                    <td>
                        <strong>${payment.user.firstName} ${payment.user.lastName}</strong>
                        <small class="d-block text-muted">${payment.user.email}</small>
                    </td>
                    <td>
                        <small>${payment.course.title}</small>
                    </td>
                    <td>
                        <span class="badge bg-info">
                            <i class="bi bi-phone"></i> ${payment.paymentMethod.toUpperCase()}
                        </span>
                    </td>
                    <td>
                        <strong>S/ ${(payment.amount * 3.7).toFixed(2)}</strong>
                        <small class="d-block text-muted">$${payment.amount}</small>
                    </td>
                    <td>
                        ${payment.yapePhone ? `
                            <small class="d-block"><i class="bi bi-phone"></i> ${payment.yapePhone}</small>
                            <small class="d-block"><i class="bi bi-hash"></i> ${payment.yapeTransactionCode}</small>
                        ` : '<small class="text-muted">Sin datos</small>'}
                    </td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="showPaymentDetail('${payment._id}')">
                            <i class="bi bi-eye"></i> Ver
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading pending payments:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger py-4">
                    <i class="bi bi-exclamation-triangle"></i>
                    Error al cargar pagos pendientes
                </td>
            </tr>
        `;
    }
}

async function showPaymentDetail(paymentId) {
    const token = localStorage.getItem('authToken');

    try {
        const response = await fetch(`${API_URL}/purchases/${paymentId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const payment = await response.json();

        const detailBody = document.getElementById('paymentDetailBody');
        detailBody.innerHTML = `
            <div class="mb-3">
                <h6>Información del Usuario</h6>
                <p class="mb-1"><strong>Nombre:</strong> ${payment.user.firstName} ${payment.user.lastName}</p>
                <p class="mb-1"><strong>Email:</strong> ${payment.user.email}</p>
            </div>

            <div class="mb-3">
                <h6>Información del Curso</h6>
                <p class="mb-1"><strong>Curso:</strong> ${payment.course.title}</p>
                <p class="mb-1"><strong>Precio:</strong> $${payment.amount} USD / S/ ${(payment.amount * 3.7).toFixed(2)} PEN</p>
            </div>

            <div class="mb-3">
                <h6>Detalles del Pago</h6>
                <p class="mb-1"><strong>Método:</strong> ${payment.paymentMethod.toUpperCase()}</p>
                <p class="mb-1"><strong>Fecha:</strong> ${new Date(payment.createdAt).toLocaleString('es-PE')}</p>
                ${payment.yapePhone ? `<p class="mb-1"><strong>Teléfono Yape/Plin:</strong> ${payment.yapePhone}</p>` : ''}
                ${payment.yapeTransactionCode ? `<p class="mb-1"><strong>Código de Operación:</strong> <span class="badge bg-success">${payment.yapeTransactionCode}</span></p>` : ''}
                <p class="mb-1"><strong>ID Transacción:</strong> <code>${payment.transactionId}</code></p>
            </div>

            ${payment.paymentProofUrl ? `
                <div class="mb-3">
                    <h6>Comprobante</h6>
                    <img src="${payment.paymentProofUrl}" class="img-fluid rounded" alt="Comprobante">
                </div>
            ` : ''}
        `;

        document.getElementById('approvePaymentBtn').onclick = () => verifyPayment(paymentId, 'completed');
        document.getElementById('rejectPaymentBtn').onclick = () => verifyPayment(paymentId, 'failed');

        const modal = new bootstrap.Modal(document.getElementById('paymentDetailModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading payment detail:', error);
        alert('Error al cargar detalles del pago');
    }
}

async function verifyPayment(paymentId, status) {
    const token = localStorage.getItem('authToken');

    const confirmMessage = status === 'completed' 
        ? '¿Estás seguro de aprobar este pago? El usuario tendrá acceso inmediato al curso.'
        : '¿Estás seguro de rechazar este pago?';

    if (!confirm(confirmMessage)) return;

    try {
        const response = await fetch(`${API_URL}/payments/${paymentId}/verify`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('paymentDetailModal'));
            modal.hide();
            
            loadPendingPayments();
        } else {
            alert(data.message || 'Error al verificar el pago');
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        alert('Error de conexión al verificar el pago');
    }
}

document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = 'login.html';
});

document.addEventListener('DOMContentLoaded', () => {
    if (checkAdminAuth()) {
        loadPendingPayments();
    }
});
