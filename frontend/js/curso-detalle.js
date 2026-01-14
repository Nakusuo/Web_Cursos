const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : window.location.origin + '/api';

let currentCourse = null;
let isEnrolled = false;

const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get('id');

document.addEventListener('DOMContentLoaded', async () => {
    updateAuthUI();
    initializeTabs();
    
    if (!courseId) {
        showError('ID de curso no especificado');
        return;
    }

    await loadCourseDetails();
});

async function loadCourseDetails() {
    try {
        const response = await fetch(`${API_URL}/courses/${courseId}`);
        
        if (!response.ok) {
            throw new Error('Curso no encontrado');
        }

        currentCourse = await response.json();
        await checkEnrollmentStatus();
        renderCourseDetails();
        
    } catch (error) {
        console.error('Error:', error);
        showError('Error al cargar el curso. Por favor, intenta de nuevo.');
    }
}

async function checkEnrollmentStatus() {
    if (!isAuthenticated()) {
        isEnrolled = false;
        return;
    }

    try {
        const token = getToken();
        const response = await fetch(`${API_URL}/users/me/courses`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const enrolledCourses = await response.json();
            isEnrolled = enrolledCourses.some(course => 
                course._id === courseId || course.course?._id === courseId
            );
        }
    } catch (error) {
        console.error('Error checking enrollment:', error);
    }
}

function renderCourseDetails() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('course-content').classList.remove('hidden');

    document.getElementById('course-title').textContent = currentCourse.title;
    document.getElementById('short-description').textContent = currentCourse.description;
    document.getElementById('full-description').textContent = currentCourse.description;
    
    document.getElementById('course-level').textContent = getLevelText(currentCourse.level);
    document.getElementById('course-category').textContent = getCategoryText(currentCourse.category);
    document.getElementById('course-instructor').textContent = currentCourse.instructor || 'Instructor';
    document.getElementById('course-duration').textContent = `${currentCourse.duration || 0} minutos`;
    document.getElementById('course-students').textContent = `${currentCourse.students || 0} estudiantes`;
    
    document.getElementById('course-price').textContent = `$${currentCourse.price?.toFixed(2) || '0.00'}`;
    
    const thumbnail = document.getElementById('course-thumbnail');
    thumbnail.src = currentCourse.thumbnail || 'https://via.placeholder.com/350x200';
    thumbnail.alt = currentCourse.title;

    document.getElementById('instructor-name').textContent = currentCourse.instructor || 'Instructor';
    const instructorAvatar = document.getElementById('instructor-avatar');
    instructorAvatar.textContent = (currentCourse.instructor || 'I')[0].toUpperCase();

    if (isEnrolled) {
        document.getElementById('enrolled-section').classList.remove('hidden');
        document.getElementById('purchase-section').classList.add('hidden');
    } else {
        document.getElementById('enrolled-section').classList.add('hidden');
        document.getElementById('purchase-section').classList.remove('hidden');
    }
}

async function enrollCourse() {
    if (!isAuthenticated()) {
        alert('Por favor, inicia sesión para inscribirte en este curso');
        window.location.href = `login.html?redirect=${encodeURIComponent(window.location.href)}`;
        return;
    }

    window.location.href = `checkout.html?courseId=${courseId}`;
}

function continueCourse() {
    window.location.href = `curso-player.html?id=${courseId}`;
}

function addToWishlist() {
    if (!isAuthenticated()) {
        alert('Por favor, inicia sesión para agregar a favoritos');
        window.location.href = `login.html?redirect=${encodeURIComponent(window.location.href)}`;
        return;
    }

    alert('Curso agregado a favoritos (función por implementar)');
}

function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

function updateAuthUI() {
    const authLink = document.getElementById('auth-link');
    const navMenu = document.getElementById('nav-menu');
    
    if (isAuthenticated()) {
        authLink.textContent = 'Cerrar Sesión';
        authLink.href = '#';
        authLink.onclick = (e) => {
            e.preventDefault();
            logout();
        };
    } else {
        authLink.textContent = 'Iniciar Sesión';
        authLink.href = 'login.html';
    }
}

function getLevelText(level) {
    const levels = {
        'beginner': 'Principiante',
        'intermediate': 'Intermedio',
        'advanced': 'Avanzado'
    };
    return levels[level] || level;
}

function getCategoryText(category) {
    const categories = {
        'acuicultura': 'Acuicultura',
        'pesca': 'Pesca',
        'gestion': 'Gestión',
        'sostenibilidad': 'Sostenibilidad'
    };
    return categories[category] || category;
}

function showError(message) {
    document.getElementById('loading').innerHTML = `
        <div style="text-align: center; padding: 60px;">
            <div style="font-size: 4rem; margin-bottom: 20px;">😕</div>
            <h3>${message}</h3>
            <a href="cursos.html" class="btn-enroll" style="display: inline-block; margin-top: 20px;">
                Ver Todos los Cursos
            </a>
        </div>
    `;
}
