const API_URL = window.API_URL || (
    window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api'
        : window.location.origin + '/api'
);
window.API_URL = API_URL;

let profileData = null;

document.addEventListener('DOMContentLoaded', async () => {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    await loadCompleteProfile();
    initializeTabs();
    setupLogout();
});

async function loadCompleteProfile() {
    try {
        const token = getToken();
        const response = await fetch(`${API_URL}/users/me/profile-complete`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar perfil');
        }

        profileData = await response.json();
        renderProfile();
    } catch (error) {
        console.error('Error:', error);
        showError('Error al cargar tu perfil. Por favor, intenta de nuevo.');
    }
}

function renderProfile() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('profile-content').classList.remove('hidden');

    const user = profileData.user;
    document.getElementById('user-name').textContent = 
        `${user.firstName} ${user.lastName}`;
    document.getElementById('user-email').textContent = user.email;

    document.getElementById('stat-courses').textContent = 
        profileData.stats.totalCourses;
    document.getElementById('stat-completed').textContent = 
        profileData.stats.completedCourses;
    document.getElementById('stat-events').textContent = 
        profileData.stats.attendedEvents;
    document.getElementById('stat-spent').textContent = 
        `$${profileData.stats.totalSpent.toFixed(2)}`;

    renderCourses();
    renderPurchases();
    renderUpcomingEvents();
    renderPastEvents();
}

function renderCourses() {
    const container = document.getElementById('courses-grid');
    const courses = profileData.user.enrolledCourses;

    if (!courses || courses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div style="font-size: 4rem;">📚</div>
                <h3>No tienes cursos todavía</h3>
                <p>Explora nuestro catálogo y comienza a aprender</p>
                <a href="cursos.html" class="btn-primary">Ver Cursos</a>
            </div>
        `;
        return;
    }

    container.innerHTML = courses.map(enrollment => {
        const course = enrollment.course;
        if (!course) return '';

        return `
            <div class="item-card">
                <img src="${course.thumbnail || 'https://via.placeholder.com/300x180'}" 
                     alt="${course.title}" 
                     class="item-image">
                <div class="item-content">
                    <h3 class="item-title">${course.title}</h3>
                    <p class="item-description">${course.description?.substring(0, 100)}...</p>
                    
                    <div style="margin-top: 15px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="font-size: 0.9rem; color: #666;">Progreso</span>
                            <span style="font-size: 0.9rem; font-weight: 600; color: #667eea;">
                                ${enrollment.progress || 0}%
                            </span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${enrollment.progress || 0}%"></div>
                        </div>
                    </div>

                    <div class="item-meta">
                        <span class="badge ${enrollment.completed ? 'badge-success' : 'badge-info'}">
                            ${enrollment.completed ? '✓ Completado' : 'En Progreso'}
                        </span>
                        <a href="curso-player.html?id=${course._id}" class="btn-primary" style="padding: 8px 15px; font-size: 0.9rem; text-decoration: none;">
                            ${enrollment.progress > 0 ? 'Continuar' : 'Comenzar'}
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderPurchases() {
    const container = document.getElementById('purchases-grid');
    const purchases = profileData.purchases;

    if (!purchases || purchases.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div style="font-size: 4rem;">🛒</div>
                <h3>No tienes compras registradas</h3>
                <p>Explora nuestros cursos y comienza a aprender</p>
                <a href="cursos.html" class="btn-primary">Ver Cursos</a>
            </div>
        `;
        return;
    }

    container.innerHTML = purchases.map(purchase => {
        const course = purchase.course;
        if (!course) return '';

        const statusBadge = {
            'completed': 'badge-success',
            'pending': 'badge-warning',
            'failed': 'badge-secondary',
            'refunded': 'badge-secondary'
        };

        const statusText = {
            'completed': 'Completado',
            'pending': 'Pendiente',
            'failed': 'Fallido',
            'refunded': 'Reembolsado'
        };

        return `
            <div class="item-card">
                <img src="${course.thumbnail || 'https://via.placeholder.com/300x180'}" 
                     alt="${course.title}" 
                     class="item-image">
                <div class="item-content">
                    <h3 class="item-title">${course.title}</h3>
                    <p class="item-description">
                        <strong>Monto:</strong> ${purchase.currency} $${purchase.amount.toFixed(2)}<br>
                        <strong>Método:</strong> ${getPaymentMethodText(purchase.paymentMethod)}<br>
                        <strong>Fecha:</strong> ${new Date(purchase.paymentDate).toLocaleDateString('es-ES')}
                    </p>

                    <div class="item-meta">
                        <span class="badge ${statusBadge[purchase.status]}">
                            ${statusText[purchase.status]}
                        </span>
                        <span style="font-size: 0.85rem; color: #999;">
                            ID: ${purchase._id.substring(0, 8)}...
                        </span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderUpcomingEvents() {
    const container = document.getElementById('upcoming-events-grid');
    const events = profileData.events.upcoming;

    if (!events || events.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div style="font-size: 4rem;">📅</div>
                <h3>No tienes eventos próximos</h3>
                <p>Regístrate en nuestras conferencias y eventos en vivo</p>
                <a href="dashboard.html" class="btn-primary">Ver Eventos</a>
            </div>
        `;
        return;
    }

    container.innerHTML = events.map(registration => {
        const event = registration.event;
        if (!event) return '';

        return `
            <div class="item-card">
                <img src="${event.image || 'https://via.placeholder.com/300x180'}" 
                     alt="${event.title}" 
                     class="item-image">
                <div class="item-content">
                    <h3 class="item-title">${event.title}</h3>
                    <p class="item-description">${event.description?.substring(0, 100)}...</p>
                    
                    <div style="margin-top: 15px;">
                        <p style="margin: 5px 0;">
                            <strong>📅 Fecha:</strong> 
                            ${new Date(event.date).toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                        <p style="margin: 5px 0;">
                            <strong>⏰ Hora:</strong> ${event.time || 'Por confirmar'}
                        </p>
                        ${event.location ? `
                            <p style="margin: 5px 0;">
                                <strong>📍 Lugar:</strong> ${event.location}
                            </p>
                        ` : ''}
                    </div>

                    <div class="item-meta">
                        <span class="badge badge-info">
                            ${registration.status === 'confirmed' ? '✓ Confirmado' : 'Registrado'}
                        </span>
                        ${event.streamUrl ? 
                            `<a href="${event.streamUrl}" target="_blank" class="btn-primary" style="padding: 8px 15px; font-size: 0.9rem;">
                                Ver Transmisión
                            </a>` : 
                            '<span style="font-size: 0.85rem; color: #999;">Enlace próximamente</span>'
                        }
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderPastEvents() {
    const container = document.getElementById('past-events-grid');
    const events = profileData.events.past;

    if (!events || events.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div style="font-size: 4rem;">🎓</div>
                <h3>No has asistido a eventos todavía</h3>
                <p>Participa en nuestras conferencias y eventos en vivo</p>
                <a href="dashboard.html" class="btn-primary">Ver Eventos Disponibles</a>
            </div>
        `;
        return;
    }

    container.innerHTML = events.map(registration => {
        const event = registration.event;
        if (!event) return '';

        return `
            <div class="item-card">
                <img src="${event.image || 'https://via.placeholder.com/300x180'}" 
                     alt="${event.title}" 
                     class="item-image">
                <div class="item-content">
                    <h3 class="item-title">${event.title}</h3>
                    <p class="item-description">${event.description?.substring(0, 100)}...</p>
                    
                    <div style="margin-top: 15px;">
                        <p style="margin: 5px 0;">
                            <strong>📅 Fecha:</strong> 
                            ${new Date(event.date).toLocaleDateString('es-ES')}
                        </p>
                        ${event.recordingUrl ? `
                            <p style="margin: 5px 0;">
                                <strong>🎥 Grabación disponible</strong>
                            </p>
                        ` : ''}
                    </div>

                    <div class="item-meta">
                        <span class="badge ${registration.attended ? 'badge-success' : 'badge-secondary'}">
                            ${registration.attended ? '✓ Asistido' : 'No asistido'}
                        </span>
                        ${event.recordingUrl ? 
                            `<a href="${event.recordingUrl}" target="_blank" class="btn-primary" style="padding: 8px 15px; font-size: 0.9rem;">
                                Ver Grabación
                            </a>` : 
                            '<span style="font-size: 0.85rem; color: #999;">Sin grabación</span>'
                        }
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function initializeTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;

            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

function setupLogout() {
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
}

function getPaymentMethodText(method) {
    const methods = {
        'credit_card': 'Tarjeta de Crédito',
        'debit_card': 'Tarjeta de Débito',
        'paypal': 'PayPal',
        'stripe': 'Stripe',
        'yape': 'Yape',
        'plin': 'Plin',
        'other': 'Otro'
    };
    return methods[method] || method;
}

function showError(message) {
    alert(message);
}
