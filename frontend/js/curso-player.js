const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : window.location.origin + '/api';

const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get('id');

let courseData = null;
let currentLesson = null;
let completedLessons = new Set();
let curriculum = [];

document.addEventListener('DOMContentLoaded', async () => {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    if (!courseId) {
        alert('Curso no especificado');
        window.location.href = 'cursos.html';
        return;
    }

    await loadCourseData();
    renderCurriculum();
    updateProgress();
});

async function loadCourseData() {
    try {
        const token = getToken();
        const response = await fetch(`${API_URL}/courses/${courseId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Curso no encontrado');
        }

        courseData = await response.json();
        document.getElementById('course-title').textContent = courseData.title;

        curriculum = generateSampleCurriculum();
        
        loadProgress();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar el curso');
        window.location.href = 'cursos.html';
    }
}

function generateSampleCurriculum() {
    return [
        {
            id: 1,
            title: 'Módulo 1: Introducción',
            lessons: [
                { id: '1-1', title: 'Bienvenida al curso', duration: 10, videoUrl: '' },
                { id: '1-2', title: 'Conceptos básicos', duration: 25, videoUrl: '' },
                { id: '1-3', title: 'Materiales necesarios', duration: 15, videoUrl: '' }
            ]
        },
        {
            id: 2,
            title: 'Módulo 2: Fundamentos',
            lessons: [
                { id: '2-1', title: 'Teoría fundamental', duration: 30, videoUrl: '' },
                { id: '2-2', title: 'Ejercicios prácticos', duration: 45, videoUrl: '' },
                { id: '2-3', title: 'Evaluación del módulo', duration: 20, videoUrl: '' }
            ]
        },
        {
            id: 3,
            title: 'Módulo 3: Práctica Avanzada',
            lessons: [
                { id: '3-1', title: 'Técnicas avanzadas', duration: 40, videoUrl: '' },
                { id: '3-2', title: 'Proyecto final', duration: 60, videoUrl: '' },
                { id: '3-3', title: 'Evaluación final', duration: 30, videoUrl: '' }
            ]
        }
    ];
}

function renderCurriculum() {
    const container = document.getElementById('curriculum-content');
    
    container.innerHTML = curriculum.map(module => `
        <div class="module" id="module-${module.id}">
            <div class="module-header" onclick="toggleModule(${module.id})">
                <span class="module-title">${module.title}</span>
                <span class="module-icon">▼</span>
            </div>
            <div class="lessons-list">
                ${module.lessons.map(lesson => `
                    <div class="lesson-item ${completedLessons.has(lesson.id) ? 'completed' : ''}" 
                         id="lesson-${lesson.id}"
                         onclick="playLesson('${lesson.id}', ${module.id})">
                        <span class="lesson-title">${lesson.title}</span>
                        <span class="lesson-duration">${lesson.duration} min</span>
                        <span class="lesson-status">
                            ${completedLessons.has(lesson.id) ? '✓' : ''}
                        </span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    toggleModule(1);
}

function toggleModule(moduleId) {
    const module = document.getElementById(`module-${moduleId}`);
    module.classList.toggle('active');
}

function playLesson(lessonId, moduleId) {
    const module = curriculum.find(m => m.id === moduleId);
    const lesson = module.lessons.find(l => l.id === lessonId);
    
    if (!lesson) return;

    currentLesson = { ...lesson, moduleId };

    document.querySelectorAll('.lesson-item').forEach(item => {
        item.classList.remove('active');
    });
    document.getElementById(`lesson-${lessonId}`).classList.add('active');


    const videoPlayer = document.getElementById('video-player');
    videoPlayer.innerHTML = `
        <div class="video-placeholder">
            <div style="text-align: center;">
                <div style="font-size: 5rem; margin-bottom: 20px;">📹</div>
                <p style="font-size: 1.2rem;">${lesson.title}</p>
                <p style="font-size: 1rem; opacity: 0.8;">Video de ${lesson.duration} minutos</p>
                <button onclick="simulateVideoEnd()" style="margin-top: 20px; padding: 15px 30px; background: white; color: #667eea; border: none; border-radius: 5px; cursor: pointer; font-size: 1rem;">
                    Simular Video Completado
                </button>
            </div>
        </div>
    `;

    document.getElementById('lesson-title').textContent = lesson.title;
    document.getElementById('lesson-duration').textContent = `${lesson.duration} min`;
    document.getElementById('lesson-module').textContent = module.title;
}

function markAsCompleted() {
    if (!currentLesson) {
        alert('Selecciona una lección primero');
        return;
    }

    completedLessons.add(currentLesson.id);
    saveProgress();
    updateProgress();
    
    const lessonElement = document.getElementById(`lesson-${currentLesson.id}`);
    lessonElement.classList.add('completed');
    lessonElement.querySelector('.lesson-status').textContent = '✓';

    const totalLessons = curriculum.reduce((sum, m) => sum + m.lessons.length, 0);
    if (completedLessons.size === totalLessons) {
        showCompletionModal();
    } else {
        setTimeout(() => nextLesson(), 500);
    }
}

function simulateVideoEnd() {
    markAsCompleted();
}

function nextLesson() {
    if (!currentLesson) return;

    const currentModule = curriculum.find(m => m.id === currentLesson.moduleId);
    const currentIndex = currentModule.lessons.findIndex(l => l.id === currentLesson.id);

    if (currentIndex < currentModule.lessons.length - 1) {
        const nextLesson = currentModule.lessons[currentIndex + 1];
        playLesson(nextLesson.id, currentLesson.moduleId);
    } else {
        const moduleIndex = curriculum.findIndex(m => m.id === currentLesson.moduleId);
        if (moduleIndex < curriculum.length - 1) {
            const nextModule = curriculum[moduleIndex + 1];
            toggleModule(nextModule.id);
            playLesson(nextModule.lessons[0].id, nextModule.id);
        } else {
            alert('Has llegado al final del curso');
        }
    }
}

function previousLesson() {
    if (!currentLesson) return;

    const currentModule = curriculum.find(m => m.id === currentLesson.moduleId);
    const currentIndex = currentModule.lessons.findIndex(l => l.id === currentLesson.id);

    if (currentIndex > 0) {
        const prevLesson = currentModule.lessons[currentIndex - 1];
        playLesson(prevLesson.id, currentLesson.moduleId);
    } else {
        const moduleIndex = curriculum.findIndex(m => m.id === currentLesson.moduleId);
        if (moduleIndex > 0) {
            const prevModule = curriculum[moduleIndex - 1];
            toggleModule(prevModule.id);
            const lastLesson = prevModule.lessons[prevModule.lessons.length - 1];
            playLesson(lastLesson.id, prevModule.id);
        } else {
            alert('Estás en la primera lección');
        }
    }
}

function updateProgress() {
    const totalLessons = curriculum.reduce((sum, m) => sum + m.lessons.length, 0);
    const completed = completedLessons.size;
    const percentage = Math.round((completed / totalLessons) * 100);

    document.getElementById('course-progress-text').textContent = `${percentage}%`;
    document.getElementById('course-progress-bar').style.width = `${percentage}%`;
    document.getElementById('course-stats').textContent = `${completed} de ${totalLessons} lecciones completadas`;
}

function saveProgress() {
    const progress = {
        courseId,
        completedLessons: Array.from(completedLessons),
        lastLesson: currentLesson?.id,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem(`course_progress_${courseId}`, JSON.stringify(progress));
}

function loadProgress() {
    const saved = localStorage.getItem(`course_progress_${courseId}`);
    if (saved) {
        const progress = JSON.parse(saved);
        completedLessons = new Set(progress.completedLessons);
        
        if (progress.lastLesson) {
            const module = curriculum.find(m => 
                m.lessons.some(l => l.id === progress.lastLesson)
            );
            if (module) {
                playLesson(progress.lastLesson, module.id);
            }
        }
    }
}

function showCompletionModal() {
    const modal = document.getElementById('completion-modal');
    modal.classList.remove('hidden');
    modal.classList.add('show-flex');
    
    updateCourseProgress(100, true);
}

async function updateCourseProgress(progress, completed) {
    try {
        const token = getToken();
        await fetch(`${API_URL}/users/me/courses/${courseId}/progress`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ progress, completed })
        });
    } catch (error) {
        console.error('Error updating progress:', error);
    }
}

function returnToCourses() {
    window.location.href = 'mi-perfil.html';
}
