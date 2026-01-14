const API_URL = 'http://localhost:3000/api';

const showLoading = (element) => {
    if (element) element.classList.remove('d-none');
};

const hideLoading = (element) => {
    if (element) element.classList.add('d-none');
};

const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

const setAuthToken = (token) => {
    localStorage.setItem('authToken', token);
};

const removeAuthToken = () => {
    localStorage.removeItem('authToken');
};

const getUserData = () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
};

const setUserData = (data) => {
    localStorage.setItem('userData', JSON.stringify(data));
};

async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    const token = getAuthToken();
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Error en la petición');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

async function loadPopularCourses() {
    try {
        const courses = await apiCall('/courses?limit=3&featured=true');
        const container = document.getElementById('popularCourses');
        
        if (!container) return;

        container.innerHTML = courses.map(course => `
            <div class="col-md-4">
                <div class="card course-card">
                    <img src="${course.thumbnail || 'https://via.placeholder.com/400x250/667eea/ffffff?text=Curso'}" class="card-img-top" alt="${course.title}">
                    <div class="card-body">
                        <span class="category-badge">${course.category}</span>
                        <h5 class="card-title mt-2">${course.title}</h5>
                        <p class="card-text text-muted">${course.description.substring(0, 100)}...</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="course-price">$${course.price}</span>
                            <div class="star-rating">
                                <i class="bi bi-star-fill"></i> ${course.rating || 4.5}
                            </div>
                        </div>
                        <a href="cursos.html?id=${course._id}" class="btn btn-primary w-100 mt-3">Ver Detalles</a>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading courses:', error);
        loadSampleCourses();
    }
}

function loadSampleCourses() {
    const sampleCourses = [
        {
            id: 1,
            title: 'JavaScript Avanzado 2026',
            description: 'Domina JavaScript moderno con ES2026 y las últimas características del lenguaje',
            category: 'Programación',
            price: 49.99,
            rating: 4.8,
            thumbnail: 'https://via.placeholder.com/400x250/667eea/ffffff?text=JavaScript'
        },
        {
            id: 2,
            title: 'Diseño UX/UI con Figma',
            description: 'Aprende a crear interfaces de usuario profesionales desde cero',
            category: 'Diseño',
            price: 39.99,
            rating: 4.6,
            thumbnail: 'https://via.placeholder.com/400x250/764ba2/ffffff?text=UX+UI'
        },
        {
            id: 3,
            title: 'Marketing Digital Estratégico',
            description: 'Estrategias probadas para hacer crecer tu negocio en línea',
            category: 'Marketing',
            price: 59.99,
            rating: 4.9,
            thumbnail: 'https://via.placeholder.com/400x250/667eea/ffffff?text=Marketing'
        }
    ];

    const container = document.getElementById('popularCourses');
    if (!container) return;

    container.innerHTML = sampleCourses.map(course => `
        <div class="col-md-4">
            <div class="card course-card">
                <img src="${course.thumbnail}" class="card-img-top" alt="${course.title}">
                <div class="card-body">
                    <span class="category-badge">${course.category}</span>
                    <h5 class="card-title mt-2">${course.title}</h5>
                    <p class="card-text text-muted">${course.description}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="course-price">$${course.price}</span>
                        <div class="star-rating">
                            <i class="bi bi-star-fill"></i> ${course.rating}
                        </div>
                    </div>
                    <a href="cursos.html?id=${course.id}" class="btn btn-primary w-100 mt-3">Ver Detalles</a>
                </div>
            </div>
        </div>
    `).join('');
}

function checkAuth() {
    const token = getAuthToken();
    const currentPage = window.location.pathname.split('/').pop();
    
    if (token && (currentPage === 'login.html' || currentPage === 'registro.html')) {
        window.location.href = 'dashboard.html';
    }
    
    if (!token && currentPage === 'dashboard.html') {
        window.location.href = 'login.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        loadPopularCourses();
    }
});
