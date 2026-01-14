const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : window.location.origin + '/api';

async function loadUpcomingEvents() {
    try {
        const response = await fetch(`${API_URL}/events/upcoming`);
        const events = await response.json();
        
        displayEvents(events);
        populateEventSelect(events);
    } catch (error) {
        console.error('Error loading events:', error);
        const sampleEvents = getSampleEvents();
        displayEvents(sampleEvents);
        populateEventSelect(sampleEvents);
    }
}

function displayEvents(events) {
    const container = document.getElementById('upcomingEvents');
    
    if (!container) return;

    if (events.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-calendar-x" style="font-size: 4rem; color: #ccc;"></i>
                <p class="text-muted mt-3">No hay eventos programados en este momento</p>
            </div>
        `;
        return;
    }

    container.innerHTML = events.map(event => {
        const eventDate = new Date(event.date);
        const day = eventDate.getDate();
        const month = eventDate.toLocaleDateString('es-ES', { month: 'short' });
        const time = eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        return `
            <div class="col-md-6">
                <div class="card event-card">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-3">
                                <div class="event-date">
                                    <span class="day">${day}</span>
                                    <span class="month">${month}</span>
                                </div>
                            </div>
                            <div class="col-9">
                                <h5 class="card-title">${event.title}</h5>
                                <p class="text-muted mb-2">
                                    <i class="bi bi-clock"></i> ${time} 
                                    <i class="bi bi-person ms-3"></i> ${event.speaker}
                                </p>
                                <p class="card-text">${event.description}</p>
                                <div class="d-flex justify-content-between align-items-center">
                                    <span class="badge bg-info">${event.category}</span>
                                    <small class="text-muted">
                                        <i class="bi bi-people"></i> ${event.registrations || 0} / ${event.maxCapacity} inscritos
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function populateEventSelect(events) {
    const select = document.getElementById('eventSelect');
    
    if (!select) return;

    select.innerHTML = '<option value="">Elige un evento...</option>' + 
        events.map(event => {
            const eventDate = new Date(event.date);
            const dateStr = eventDate.toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
            });
            return `<option value="${event._id || event.id}">${event.title} - ${dateStr}</option>`;
        }).join('');
}

const eventRegistrationForm = document.getElementById('eventRegistrationForm');
if (eventRegistrationForm) {
    eventRegistrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            eventId: document.getElementById('eventSelect').value,
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            company: document.getElementById('company').value,
            role: document.getElementById('role').value,
            motivation: document.getElementById('motivation').value,
            newsletter: document.getElementById('newsletter').checked
        };

        if (!formData.eventId) {
            showError('Por favor, selecciona un evento');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/event-registrations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                showSuccess();
                eventRegistrationForm.reset();
            } else {
                showError(data.message || 'Error al registrar. Por favor, intenta nuevamente.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showError('Error de conexión. Por favor, intenta nuevamente.');
        }
    });
}

function showSuccess() {
    const successDiv = document.getElementById('registrationSuccess');
    const errorDiv = document.getElementById('registrationError');
    
    if (errorDiv) errorDiv.classList.add('d-none');
    if (successDiv) {
        successDiv.classList.remove('d-none');
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function showError(message) {
    const errorDiv = document.getElementById('registrationError');
    const errorMessage = document.getElementById('errorMessage');
    const successDiv = document.getElementById('registrationSuccess');
    
    if (successDiv) successDiv.classList.add('d-none');
    if (errorDiv && errorMessage) {
        errorMessage.textContent = message;
        errorDiv.classList.remove('d-none');
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        setTimeout(() => {
            errorDiv.classList.add('d-none');
        }, 5000);
    }
}

function getSampleEvents() {
    return [
        {
            id: 1,
            title: 'El Futuro de la Inteligencia Artificial',
            description: 'Charla sobre las últimas tendencias y aplicaciones de IA en diferentes industrias.',
            date: new Date('2026-02-15T18:00:00'),
            speaker: 'Dr. Juan Pérez',
            category: 'Tecnología',
            maxCapacity: 100,
            registrations: 45
        },
        {
            id: 2,
            title: 'Estrategias de Marketing Digital 2026',
            description: 'Descubre las estrategias más efectivas para posicionar tu marca en el entorno digital.',
            date: new Date('2026-02-20T17:00:00'),
            speaker: 'Laura Martínez',
            category: 'Marketing',
            maxCapacity: 150,
            registrations: 89
        },
        {
            id: 3,
            title: 'Desarrollo Web con React y Next.js',
            description: 'Workshop práctico sobre desarrollo de aplicaciones modernas con React y Next.js.',
            date: new Date('2026-02-25T16:00:00'),
            speaker: 'Carlos Rodríguez',
            category: 'Programación',
            maxCapacity: 80,
            registrations: 72
        },
        {
            id: 4,
            title: 'Diseño de Experiencias de Usuario',
            description: 'Aprende a crear experiencias digitales memorables centradas en el usuario.',
            date: new Date('2026-03-01T19:00:00'),
            speaker: 'Ana Gómez',
            category: 'Diseño',
            maxCapacity: 120,
            registrations: 56
        }
    ];
}

document.addEventListener('DOMContentLoaded', () => {
    loadUpcomingEvents();
});
