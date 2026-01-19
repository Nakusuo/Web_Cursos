const API_URL = window.API_URL || (
    window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api'
        : window.location.origin + '/api'
);
window.API_URL = API_URL;

let allCourses = [];
let currentFilters = {
    search: '',
    category: '',
    priceRange: ''
};

async function loadCourses() {
    const container = document.getElementById('coursesContainer');
    const spinner = document.getElementById('loadingSpinner');
    
    showLoading(spinner);

    try {
        const response = await fetch(`${API_URL}/courses`);
        const data = await response.json();
        
        allCourses = data;
        displayCourses(allCourses);
    } catch (error) {
        console.error('Error loading courses:', error);
        allCourses = getSampleCourses();
        displayCourses(allCourses);
    } finally {
        hideLoading(spinner);
    }
}

function displayCourses(courses) {
    const container = document.getElementById('coursesContainer');
    
    if (courses.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-inbox" style="font-size: 4rem; color: #ccc;"></i>
                <p class="text-muted mt-3">No se encontraron cursos con los filtros seleccionados</p>
            </div>
        `;
        return;
    }

    container.innerHTML = courses.map(course => `
        <div class="col-md-4 col-lg-3">
            <div class="card course-card">
                <img src="${course.thumbnail || 'https://via.placeholder.com/400x250/667eea/ffffff?text=Curso'}" 
                     class="card-img-top" alt="${course.title}">
                <div class="card-body">
                    <span class="category-badge">${course.category}</span>
                    <h5 class="card-title mt-2">${course.title}</h5>
                    <p class="card-text text-muted small">${course.description.substring(0, 80)}...</p>
                    
                    <div class="course-instructor mb-2">
                        <img src="${course.instructorAvatar || 'https://via.placeholder.com/40'}" 
                             class="instructor-avatar" alt="${course.instructor}">
                        <small class="text-muted">${course.instructor}</small>
                    </div>

                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div class="star-rating">
                            <i class="bi bi-star-fill"></i> ${course.rating || 4.5}
                            <small class="text-muted">(${course.students || 0})</small>
                        </div>
                        <span class="badge bg-info">${course.duration || '2h'}</span>
                    </div>

                    <div class="d-flex justify-content-between align-items-center">
                        <span class="course-price">$${course.price}</span>
                        <a href="curso-detalle.html?id=${course._id || course.id}" class="btn btn-sm btn-primary">
                            Ver Más
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

async function showCourseDetails(courseId) {
    try {
        const response = await fetch(`${API_URL}/courses/${courseId}`);
        const course = await response.json();
        
        displayCourseModal(course);
    } catch (error) {
        console.error('Error loading course details:', error);
        const course = allCourses.find(c => c._id === courseId || c.id == courseId);
        if (course) {
            displayCourseModal(course);
        }
    }
}

function displayCourseModal(course) {
    const modalTitle = document.getElementById('modalCourseTitle');
    const modalBody = document.getElementById('modalCourseBody');
    const buyBtn = document.getElementById('buyCourseBtn');

    modalTitle.textContent = course.title;
    
    modalBody.innerHTML = `
        <img src="${course.thumbnail || 'https://via.placeholder.com/800x400'}" 
             class="img-fluid rounded mb-3" alt="${course.title}">
        
        <div class="mb-3">
            <span class="category-badge">${course.category}</span>
            <span class="badge bg-secondary ms-2">${course.level || 'Intermedio'}</span>
        </div>

        <p class="lead">${course.description}</p>

        <div class="row mb-3">
            <div class="col-6">
                <p><strong><i class="bi bi-person"></i> Instructor:</strong> ${course.instructor}</p>
                <p><strong><i class="bi bi-clock"></i> Duración:</strong> ${course.duration || '10 horas'}</p>
            </div>
            <div class="col-6">
                <p><strong><i class="bi bi-people"></i> Estudiantes:</strong> ${course.students || 0}</p>
                <p><strong><i class="bi bi-star-fill text-warning"></i> Rating:</strong> ${course.rating || 4.5}/5</p>
            </div>
        </div>

        <h5>Lo que aprenderás:</h5>
        <ul>
            ${(course.learningPoints || [
                'Conceptos fundamentales',
                'Aplicaciones prácticas',
                'Proyectos reales',
                'Certificado de finalización'
            ]).map(point => `<li>${point}</li>`).join('')}
        </ul>

        <h5 class="mt-4">Contenido del curso:</h5>
        <div class="accordion" id="courseContent">
            ${(course.modules || [
                { title: 'Introducción', lessons: 5 },
                { title: 'Fundamentos', lessons: 8 },
                { title: 'Práctica', lessons: 10 },
                { title: 'Proyecto Final', lessons: 3 }
            ]).map((module, index) => `
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" 
                                data-bs-toggle="collapse" data-bs-target="#module${index}">
                            ${module.title} (${module.lessons} lecciones)
                        </button>
                    </h2>
                    <div id="module${index}" class="accordion-collapse collapse">
                        <div class="accordion-body">
                            Contenido del módulo ${module.title}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="mt-4 p-3 bg-light rounded">
            <h3 class="text-primary">$${course.price}</h3>
            <p class="text-muted mb-0">Acceso de por vida • Certificado incluido</p>
        </div>
    `;

    buyBtn.onclick = () => purchaseCourse(course._id || course.id, course.price);

    const modal = new bootstrap.Modal(document.getElementById('courseModal'));
    modal.show();
}

async function purchaseCourse(courseId, price) {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        alert('Debes iniciar sesión para comprar un curso');
        window.location.href = 'login.html';
        return;
    }

    showPaymentModal(courseId, price);
}

function showPaymentModal(courseId, price) {
    const modalHTML = `
        <div class="modal fade" id="paymentModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Selecciona tu método de pago</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="payment-amount mb-4 text-center">
                            <h3 class="text-primary">S/ ${(price * 3.7).toFixed(2)}</h3>
                            <small class="text-muted">(Aproximadamente $${price} USD)</small>
                        </div>
                        
                        <div class="payment-methods">
                            <button class="btn btn-outline-primary w-100 mb-3 payment-method-btn" data-method="yape">
                                <i class="bi bi-phone"></i> Pagar con Yape
                            </button>
                            <button class="btn btn-outline-primary w-100 mb-3 payment-method-btn" data-method="plin">
                                <i class="bi bi-wallet2"></i> Pagar con Plin
                            </button>
                            <button class="btn btn-outline-primary w-100 mb-3 payment-method-btn" data-method="credit_card">
                                <i class="bi bi-credit-card"></i> Tarjeta de Crédito/Débito
                            </button>
                        </div>

                        <div id="yapePaymentForm" class="d-none mt-4">
                            <div class="alert alert-info">
                                <h6><i class="bi bi-info-circle"></i> Instrucciones de pago con Yape:</h6>
                                <ol class="mb-0 small">
                                    <li>Realiza la transferencia al número: <strong>987 654 321</strong></li>
                                    <li>Monto: <strong>S/ ${(price * 3.7).toFixed(2)}</strong></li>
                                    <li>Ingresa el código de operación de 6 dígitos</li>
                                    <li>Opcionalmente adjunta captura de pantalla</li>
                                </ol>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Tu número de Yape *</label>
                                <input type="tel" class="form-control" id="yapePhone" placeholder="987654321" required>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Código de operación Yape (6 dígitos) *</label>
                                <input type="text" class="form-control" id="yapeCode" placeholder="123456" maxlength="6" required>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Captura del comprobante (opcional)</label>
                                <input type="file" class="form-control" id="proofImage" accept="image/*">
                                <small class="text-muted">Formatos: JPG, PNG</small>
                            </div>
                            
                            <button class="btn btn-success w-100" onclick="processPurchase('${courseId}', ${price}, 'yape')">
                                <i class="bi bi-check-circle"></i> Confirmar Pago
                            </button>
                        </div>

                        <div id="plinPaymentForm" class="d-none mt-4">
                            <div class="alert alert-info">
                                <h6><i class="bi bi-info-circle"></i> Instrucciones de pago con Plin:</h6>
                                <ol class="mb-0 small">
                                    <li>Realiza la transferencia al número: <strong>987 654 321</strong></li>
                                    <li>Monto: <strong>S/ ${(price * 3.7).toFixed(2)}</strong></li>
                                    <li>Ingresa el código de operación</li>
                                </ol>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Tu número de Plin *</label>
                                <input type="tel" class="form-control" id="plinPhone" placeholder="987654321" required>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Código de operación Plin *</label>
                                <input type="text" class="form-control" id="plinCode" placeholder="Código de operación" required>
                            </div>
                            
                            <button class="btn btn-success w-100" onclick="processPurchase('${courseId}', ${price}, 'plin')">
                                <i class="bi bi-check-circle"></i> Confirmar Pago
                            </button>
                        </div>

                        <div id="cardPaymentForm" class="d-none mt-4">
                            <div class="alert alert-warning">
                                <i class="bi bi-exclamation-triangle"></i> Pago con tarjeta en desarrollo. Usa Yape o Plin.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const existingModal = document.getElementById('paymentModal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
    modal.show();
    
    document.querySelectorAll('.payment-method-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const method = this.dataset.method;
            
            document.getElementById('yapePaymentForm').classList.add('d-none');
            document.getElementById('plinPaymentForm').classList.add('d-none');
            document.getElementById('cardPaymentForm').classList.add('d-none');
            
            if (method === 'yape') {
                document.getElementById('yapePaymentForm').classList.remove('d-none');
            } else if (method === 'plin') {
                document.getElementById('plinPaymentForm').classList.remove('d-none');
            } else if (method === 'credit_card') {
                document.getElementById('cardPaymentForm').classList.remove('d-none');
            }
        });
    });
}

async function processPurchase(courseId, price, paymentMethod) {
    const token = localStorage.getItem('authToken');
    
    let paymentData = {
        courseId,
        amount: price,
        paymentMethod
    };
    
    if (paymentMethod === 'yape') {
        const yapePhone = document.getElementById('yapePhone').value;
        const yapeCode = document.getElementById('yapeCode').value;
        
        if (!yapePhone || !yapeCode) {
            alert('Por favor completa todos los campos requeridos');
            return;
        }
        
        if (yapeCode.length !== 6) {
            alert('El código de operación debe tener 6 dígitos');
            return;
        }
        
        paymentData.yapePhone = yapePhone;
        paymentData.yapeTransactionCode = yapeCode;
    } else if (paymentMethod === 'plin') {
        const plinPhone = document.getElementById('plinPhone').value;
        const plinCode = document.getElementById('plinCode').value;
        
        if (!plinPhone || !plinCode) {
            alert('Por favor completa todos los campos requeridos');
            return;
        }
        
        paymentData.yapePhone = plinPhone;
        paymentData.yapeTransactionCode = plinCode;
    }
    
    try {
        const response = await fetch(`${API_URL}/purchases`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(paymentData)
        });

        const data = await response.json();

        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
            modal.hide();
            
            alert('¡Compra realizada exitosamente! Tu pago está siendo verificado. Pronto tendrás acceso al curso.');
            window.location.href = 'dashboard.html';
        } else {
            alert(data.message || 'Error al procesar la compra');
        }
    } catch (error) {
        console.error('Purchase error:', error);
        alert('Error de conexión. Por favor, intenta nuevamente.');
    }
}

function applyFilters() {
    let filtered = allCourses;


    if (currentFilters.search) {
        filtered = filtered.filter(course => 
            course.title.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
            course.description.toLowerCase().includes(currentFilters.search.toLowerCase())
        );
    }

    if (currentFilters.category) {
        filtered = filtered.filter(course => 
            course.category.toLowerCase() === currentFilters.category.toLowerCase()
        );
    }


    if (currentFilters.priceRange) {
        const [min, max] = currentFilters.priceRange.split('-').map(v => v.replace('+', ''));
        filtered = filtered.filter(course => {
            if (max) {
                return course.price >= parseFloat(min) && course.price <= parseFloat(max);
            } else {
                return course.price >= parseFloat(min);
            }
        });
    }

    displayCourses(filtered);
}

function getSampleCourses() {
    return [
        {
            id: 1,
            title: 'JavaScript Avanzado 2026',
            description: 'Domina JavaScript moderno con ES2026 y las últimas características del lenguaje',
            category: 'Programación',
            price: 49.99,
            rating: 4.8,
            students: 1250,
            duration: '12h',
            level: 'Avanzado',
            instructor: 'Carlos Martínez',
            thumbnail: 'https://via.placeholder.com/400x250/667eea/ffffff?text=JavaScript'
        },
        {
            id: 2,
            title: 'Diseño UX/UI con Figma',
            description: 'Aprende a crear interfaces de usuario profesionales desde cero',
            category: 'Diseño',
            price: 39.99,
            rating: 4.6,
            students: 890,
            duration: '8h',
            level: 'Intermedio',
            instructor: 'Ana López',
            thumbnail: 'https://via.placeholder.com/400x250/764ba2/ffffff?text=UX+UI'
        },
        {
            id: 3,
            title: 'Marketing Digital Estratégico',
            description: 'Estrategias probadas para hacer crecer tu negocio en línea',
            category: 'Marketing',
            price: 59.99,
            rating: 4.9,
            students: 2100,
            duration: '15h',
            level: 'Intermedio',
            instructor: 'Roberto Sánchez',
            thumbnail: 'https://via.placeholder.com/400x250/667eea/ffffff?text=Marketing'
        },
        {
            id: 4,
            title: 'Python para Data Science',
            description: 'Análisis de datos con Python, Pandas y visualización',
            category: 'Data',
            price: 69.99,
            rating: 4.7,
            students: 1560,
            duration: '20h',
            level: 'Avanzado',
            instructor: 'María García',
            thumbnail: 'https://via.placeholder.com/400x250/764ba2/ffffff?text=Python'
        }
    ];
}

function showLoading(element) {
    if (element) element.classList.remove('d-none');
}

function hideLoading(element) {
    if (element) element.classList.add('d-none');
}

document.addEventListener('DOMContentLoaded', () => {
    loadCourses();


    const searchInput = document.getElementById('searchCourse');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentFilters.search = e.target.value;
        });
    }

    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            currentFilters.category = e.target.value;
        });
    }

    const priceFilter = document.getElementById('priceFilter');
    if (priceFilter) {
        priceFilter.addEventListener('change', (e) => {
            currentFilters.priceRange = e.target.value;
        });
    }


    const applyFiltersBtn = document.getElementById('applyFilters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }
});
