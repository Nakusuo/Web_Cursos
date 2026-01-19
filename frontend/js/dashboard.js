const API_URL = window.API_URL || (
    window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api'
        : window.location.origin + '/api'
);
window.API_URL = API_URL;

function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

async function loadUserData() {
    if (!checkAuth()) return;

    const userData = JSON.parse(localStorage.getItem('userData'));
    
    if (userData) {
        document.getElementById('userName').textContent = userData.firstName || 'Usuario';
    }

    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const user = await response.json();
            document.getElementById('userName').textContent = user.firstName || 'Usuario';
            localStorage.setItem('userData', JSON.stringify(user));
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

async function loadUserCourses() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/users/me/courses`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const courses = await response.json();
            displayUserCourses(courses);
            updateStats(courses.length, 0, 0);
        } else {
            const sampleCourses = getSampleUserCourses();
            displayUserCourses(sampleCourses);
            updateStats(sampleCourses.length, 1, 2);
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        const sampleCourses = getSampleUserCourses();
        displayUserCourses(sampleCourses);
        updateStats(sampleCourses.length, 1, 2);
    }
}

function displayUserCourses(courses) {
    const container = document.getElementById('myCourses');
    
    if (!container) return;

    if (courses.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-4">
                <i class="bi bi-inbox" style="font-size: 3rem; color: #ccc;"></i>
                <p class="text-muted mt-3">Aún no tienes cursos. <a href="cursos.html">Explora nuestro catálogo</a></p>
            </div>
        `;
        return;
    }

    container.innerHTML = courses.map(course => `
        <div class="col-md-6">
            <div class="card mb-3">
                <div class="row g-0">
                    <div class="col-4">
                        <img src="${course.thumbnail || 'https://via.placeholder.com/150'}" 
                             class="img-fluid rounded-start h-100" alt="${course.title}">
                    </div>
                    <div class="col-8">
                        <div class="card-body">
                            <h6 class="card-title">${course.title}</h6>
                            <p class="card-text small text-muted">${course.instructor}</p>
                            <div class="progress mb-2" style="height: 8px;">
                                <div class="progress-bar" role="progressbar" 
                                     style="width: ${course.progress || 0}%" 
                                     aria-valuenow="${course.progress || 0}" 
                                     aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted">${course.progress || 0}% completado</small>
                                <a href="#" class="btn btn-sm btn-primary">Continuar</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

async function loadUserEvents() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/users/me/events`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const events = await response.json();
            displayUserEvents(events);
        } else {
            const sampleEvents = getSampleUserEvents();
            displayUserEvents(sampleEvents);
        }
    } catch (error) {
        console.error('Error loading events:', error);
        const sampleEvents = getSampleUserEvents();
        displayUserEvents(sampleEvents);
    }
}

function displayUserEvents(events) {
    const container = document.getElementById('myEvents');
    
    if (!container) return;

    if (events.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-calendar-x" style="font-size: 3rem; color: #ccc;"></i>
                <p class="text-muted mt-3">No tienes eventos registrados. <a href="evento-vivo.html">Ver eventos disponibles</a></p>
            </div>
        `;
        return;
    }

    container.innerHTML = events.map(event => {
        const eventDate = new Date(event.date);
        const dateStr = eventDate.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="list-group-item">
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${event.title}</h6>
                    <small class="text-muted">
                        <i class="bi bi-calendar"></i> ${dateStr}
                    </small>
                </div>
                <p class="mb-1 small">${event.description}</p>
                <small class="text-muted">
                    <i class="bi bi-person"></i> ${event.speaker}
                </small>
            </div>
        `;
    }).join('');
}

function updateStats(coursesCount, completedCount, eventsCount) {
    const coursesElement = document.getElementById('coursesCount');
    const completedElement = document.getElementById('completedCount');
    const eventsElement = document.getElementById('eventsCount');

    if (coursesElement) coursesElement.textContent = coursesCount;
    if (completedElement) completedElement.textContent = completedCount;
    if (eventsElement) eventsElement.textContent = eventsCount;
}

function getSampleUserCourses() {
    return [
        {
            id: 1,
            title: 'JavaScript Avanzado 2026',
            instructor: 'Carlos Martínez',
            thumbnail: 'https://via.placeholder.com/150/667eea/ffffff?text=JS',
            progress: 65
        },
        {
            id: 2,
            title: 'Diseño UX/UI con Figma',
            instructor: 'Ana López',
            thumbnail: 'https://via.placeholder.com/150/764ba2/ffffff?text=UX',
            progress: 30
        },
        {
            id: 3,
            title: 'Python para Data Science',
            instructor: 'María García',
            thumbnail: 'https://via.placeholder.com/150/667eea/ffffff?text=Python',
            progress: 100
        }
    ];
}

function getSampleUserEvents() {
    return [
        {
            id: 1,
            title: 'El Futuro de la Inteligencia Artificial',
            description: 'Charla sobre las últimas tendencias y aplicaciones de IA',
            date: new Date('2026-02-15T18:00:00'),
            speaker: 'Dr. Juan Pérez'
        },
        {
            id: 2,
            title: 'Desarrollo Web con React y Next.js',
            description: 'Workshop práctico sobre desarrollo de aplicaciones modernas',
            date: new Date('2026-02-25T16:00:00'),
            speaker: 'Carlos Rodríguez'
        }
    ];
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = 'login.html';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        loadUserData();
        loadUserCourses();
        loadUserEvents();
    }
});
