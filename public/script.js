// === VARIÁVEIS GLOBAIS ===
let currentUser = null;
let allPets = [];
let currentSection = 'home';
let slideIndex = 1;
let slideInterval;
let navIndicatorPosition = 0;

// === API BASE URL ===
const API_BASE = '/api';

// === INICIALIZAÇÃO ===
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadInitialData();
    initializeAnimations();
    updateNavIndicator();
});

// === FUNÇÕES DE INICIALIZAÇÃO ===
function initializeApp() {
    // Verificar usuário logado
    try {
        const savedUser = sessionStorage.getItem('petresgate_user');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            updateUIForLoggedUser();
        }
    } catch (error) {
        console.log('Nenhum usuário salvo encontrado');
    }
    
    // Mostrar seção inicial
    showSection('home');
}

function setupEventListeners() {
    // Navegação principal
    document.querySelectorAll('.nav-btn').forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            const section = e.currentTarget.dataset.section;
            showSection(section);
            updateNavIndicator(index);
        });
    });
    
    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Formulários
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const registerForm = document.getElementById('register-user-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleUserRegistration);
    }
    
    const petForm = document.getElementById('register-form');
    if (petForm) {
        petForm.addEventListener('submit', handlePetRegistration);
    }
    
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }
    
    // Busca
    const searchBtn = document.getElementById('search-btn');
    const clearBtn = document.getElementById('clear-search');
    if (searchBtn) searchBtn.addEventListener('click', handleSearch);
    if (clearBtn) clearBtn.addEventListener('click', clearSearch);
    
    // Auth
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Modal
    setupModalEvents();
    
    // Notificações
    const notificationClose = document.getElementById('notification-close');
    if (notificationClose) {
        notificationClose.addEventListener('click', hideNotification);
    }
    
    // Scroll suave para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Parallax no scroll
    window.addEventListener('scroll', handleParallax);
}

// === NAVEGAÇÃO FLUIDA ===
function updateNavIndicator(index) {
    const navBtns = document.querySelectorAll('.nav-btn');
    const indicator = document.querySelector('.nav-indicator');
    
    if (!indicator || navBtns.length === 0) return;
    
    // Se não foi passado índice, encontrar o botão ativo
    if (index === undefined) {
        navBtns.forEach((btn, i) => {
            if (btn.classList.contains('active')) {
                index = i;
            }
        });
    }
    
    if (index !== undefined && navBtns[index]) {
        const btn = navBtns[index];
        const navRect = document.querySelector('.nav').getBoundingClientRect();
        const btnRect = btn.getBoundingClientRect();
        
        const left = btnRect.left - navRect.left + 8;
        const width = btnRect.width;
        
        indicator.style.left = `${left}px`;
        indicator.style.width = `${width}px`;
        indicator.style.opacity = '1';
    }
}

function toggleMobileMenu() {
    const nav = document.querySelector('.nav');
    const toggle = document.querySelector('.mobile-menu-toggle');
    
    nav.classList.toggle('mobile-open');
    toggle.classList.toggle('active');
}

// === ANIMAÇÕES E EFEITOS VISUAIS ===
function initializeAnimations() {
    // Intersection Observer para animações ao scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Animação especial para cards
                if (entry.target.classList.contains('pet-card') || 
                    entry.target.classList.contains('tip-card') ||
                    entry.target.classList.contains('product-card')) {
                    
                    const delay = Array.from(entry.target.parentElement.children).indexOf(entry.target) * 100;
                    entry.target.style.animationDelay = `${delay}ms`;
                }
            }
        });
    }, observerOptions);

    // Observar elementos
    const animatedElements = document.querySelectorAll(
        '.pet-card, .tip-card, .product-card, .stat-item, .hero, .glass-card'
    );
    
    animatedElements.forEach(el => {
        observer.observe(el);
    });
    
    // Animação dos números das estatísticas
    animateStats();
}

function handleParallax() {
    const scrolled = window.pageYOffset;
    const blobs = document.querySelectorAll('.blob');
    
    blobs.forEach((blob, index) => {
        const speed = 0.5 + (index * 0.2);
        blob.style.transform = `translateY(${scrolled * speed}px)`;
    });
}

// === ANIMAÇÃO DE ESTATÍSTICAS ===
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    
    stats.forEach(stat => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                    animateNumber(entry.target);
                    entry.target.classList.add('animated');
                }
            });
        });
        
        observer.observe(stat);
    });
}

function animateNumber(element) {
    const finalValue = parseInt(element.textContent) || 0;
    const duration = 2000;
    const steps = 60;
    const increment = finalValue / steps;
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= finalValue) {
            current = finalValue;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, duration / steps);
}

// === NAVEGAÇÃO ENTRE SEÇÕES ===
function showSection(sectionName) {
    // Remover classes ativas
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-btn').forEach((btn, index) => {
        if (btn.dataset.section === sectionName) {
            btn.classList.add('active');
            updateNavIndicator(index);
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Mostrar seção
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Animação de entrada suave
        targetSection.style.opacity = '0';
        targetSection.style.transform = 'translateY(20px)';
        
        requestAnimationFrame(() => {
            targetSection.style.transition = 'all 0.5s ease-out';
            targetSection.style.opacity = '1';
            targetSection.style.transform = 'translateY(0)';
        });
    }
    
    currentSection = sectionName;
    
    // Carregar dados da seção
    loadSectionData(sectionName);
    
    // Scroll para o topo suavemente
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function loadSectionData(sectionName) {
    switch (sectionName) {
        case 'home':
            setTimeout(() => {
                initializeHomeFeatures();
            }, 100);
            break;
        case 'search':
            await loadAllPetsForSearch();
            break;
        case 'register':
            checkAuthForRegistration();
            break;
        case 'found':
            await loadFoundPets();
            break;
        case 'login':
            updateLoginSection();
            break;
    }
}

// === INICIALIZAÇÃO DE FUNCIONALIDADES HOME ===
function initializeHomeFeatures() {
    initializeSlideshow();
    initializeTipCards();
    initializeProductCards();
    initializeSponsorCarousel();
}

// === SLIDESHOW MODERNO ===
function initializeSlideshow() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.slide-dot');
    
    if (slides.length === 0) return;
    
    showSlide(slideIndex);
    
    // Auto play
    if (slideInterval) clearInterval(slideInterval);
    slideInterval = setInterval(() => {
        changeSlide(1);
    }, 5000);
}

function changeSlide(direction) {
    slideIndex += direction;
    showSlide(slideIndex);
}

function currentSlide(n) {
    if (slideInterval) clearInterval(slideInterval);
    showSlide(slideIndex = n);
    
    // Reiniciar autoplay
    setTimeout(() => {
        slideInterval = setInterval(() => {
            changeSlide(1);
        }, 5000);
    }, 10000);
}

function showSlide(n) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.slide-dot');
    
    if (!slides.length) return;
    
    if (n > slides.length) slideIndex = 1;
    if (n < 1) slideIndex = slides.length;
    
    slides.forEach((slide, index) => {
        slide.classList.remove('active');
        slide.style.opacity = '0';
    });
    
    dots.forEach(dot => dot.classList.remove('active'));
    
    const currentSlideEl = slides[slideIndex - 1];
    const currentDot = dots[slideIndex - 1];
    
    if (currentSlideEl && currentDot) {
        setTimeout(() => {
            currentSlideEl.classList.add('active');
            currentSlideEl.style.opacity = '1';
            currentDot.classList.add('active');
        }, 50);
    }
}

// === CARDS INTERATIVOS ===
function initializeTipCards() {
    const tipCards = document.querySelectorAll('.tip-card');
    
    tipCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const icon = card.querySelector('.tip-icon-wrapper');
            if (icon) {
                icon.style.animation = 'none';
                requestAnimationFrame(() => {
                    icon.style.animation = 'rotate 0.6s ease-in-out';
                });
            }
        });
    });
}

function initializeProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const store = card.querySelector('.product-store');
        if (store) {
            store.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Efeito de ripple
                createRipple(e, store);
                
                const storeName = store.textContent.trim();
                showNotification(`Redirecionando para ${storeName}...`, 'info');
                
                setTimeout(() => {
                    showNotification('Em breve! Esta loja estará disponível.', 'info');
                }, 1500);
            });
        }
    });
}

function initializeSponsorCarousel() {
    const track = document.querySelector('.sponsors-track');
    if (!track) return;
    
    // Pausar animação ao hover
    track.addEventListener('mouseenter', () => {
        track.style.animationPlayState = 'paused';
    });
    
    track.addEventListener('mouseleave', () => {
        track.style.animationPlayState = 'running';
    });
    
    // Click nos sponsors
    const sponsors = track.querySelectorAll('.sponsor-logo');
    sponsors.forEach(sponsor => {
        sponsor.addEventListener('click', () => {
            const name = sponsor.querySelector('span').textContent;
            showNotification(`Parceiro: ${name}`, 'info');
        });
    });
}

// === EFEITO RIPPLE ===
function createRipple(event, element) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// === API FUNCTIONS ===
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erro na requisição');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// === CARREGAMENTO DE DADOS ===
async function loadInitialData() {
    try {
        await Promise.all([
            loadStats(),
            loadRecentPets()
        ]);
    } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        showNotification('Erro ao carregar dados. Verifique sua conexão.', 'error');
    }
}

async function loadStats() {
    try {
        const stats = await apiRequest('/stats');
        
        document.getElementById('stats-perdidos').textContent = stats.stats.perdidos;
        document.getElementById('stats-encontrados').textContent = stats.stats.encontrados;
        document.getElementById('stats-total').textContent = stats.stats.total;
        
        // Re-animar números
        animateStats();
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

async function loadRecentPets() {
    try {
        const container = document.getElementById('recent-pets-list');
        if (!container) return;
        
        container.innerHTML = createLoadingState();
        
        const response = await apiRequest('/pets?status=PERDIDO');
        const pets = response.pets.slice(0, 6);
        
        if (pets.length === 0) {
            container.innerHTML = createEmptyState(
                'fa-paw',
                'Nenhum pet perdido no momento',
                'Que ótima notícia! 🎉'
            );
            return;
        }
        
        container.innerHTML = pets.map(pet => createPetCard(pet)).join('');
        
        // Animar cards ao aparecer
        requestAnimationFrame(() => {
            container.querySelectorAll('.pet-card').forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('animate-in');
                }, index * 100);
            });
        });
    } catch (error) {
        console.error('Erro ao carregar pets recentes:', error);
    }
}

async function loadFoundPets() {
    try {
        const container = document.getElementById('found-pets-list');
        if (!container) return;
        
        container.innerHTML = createLoadingState();
        
        const response = await apiRequest('/pets/historico/reencontros');
        const pets = response.pets;
        
        if (pets.length === 0) {
            container.innerHTML = createEmptyState(
                'fa-heart',
                'Ainda não há reencontros registrados',
                'Em breve teremos histórias felizes! 💕'
            );
            return;
        }
        
        container.innerHTML = pets.map(pet => createPetCard(pet, true)).join('');
        
        // Animar cards
        requestAnimationFrame(() => {
            container.querySelectorAll('.pet-card').forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('animate-in');
                }, index * 100);
            });
        });
    } catch (error) {
        console.error('Erro ao carregar pets encontrados:', error);
    }
}

// === BUSCA ===
async function loadAllPetsForSearch() {
    try {
        const response = await apiRequest('/pets?status=PERDIDO');
        allPets = response.pets;
        displaySearchResults(allPets);
    } catch (error) {
        console.error('Erro ao carregar pets para busca:', error);
        showNotification('Erro ao carregar pets', 'error');
    }
}

async function handleSearch() {
    const name = document.getElementById('search-name').value.trim();
    const location = document.getElementById('search-location').value.trim();
    
    if (!name && !location) {
        displaySearchResults(allPets);
        return;
    }
    
    try {
        const params = new URLSearchParams();
        if (name) params.append('nome', name);
        if (location) params.append('localidade', location);
        
        const response = await apiRequest(`/pets/search?${params.toString()}`);
        displaySearchResults(response.pets);
    } catch (error) {
        console.error('Erro na busca:', error);
        showNotification('Erro ao buscar pets', 'error');
    }
}

function clearSearch() {
    document.getElementById('search-name').value = '';
    document.getElementById('search-location').value = '';
    displaySearchResults(allPets);
}

function displaySearchResults(pets) {
    const container = document.getElementById('search-results');
    if (!container) return;
    
    if (pets.length === 0) {
        container.innerHTML = createEmptyState(
            'fa-search',
            'Nenhum pet encontrado',
            'Tente outros termos de busca'
        );
        return;
    }
    
    container.innerHTML = pets.map(pet => createPetCard(pet)).join('');
    
    // Animar resultados
    requestAnimationFrame(() => {
        container.querySelectorAll('.pet-card').forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animate-in');
            }, index * 50);
        });
    });
}

// === AUTENTICAÇÃO ===
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-password').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    // Loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
    submitBtn.disabled = true;
    
    try {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, senha })
        });
        
        currentUser = response.usuario;
        sessionStorage.setItem('petresgate_user', JSON.stringify(currentUser));
        
        updateUIForLoggedUser();
        showNotification('Login realizado com sucesso!', 'success');
        
        // Limpar form
        e.target.reset();
        
        // Ir para home
        setTimeout(() => {
            showSection('home');
        }, 1000);
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function handleUserRegistration(e) {
    e.preventDefault();
    
    const nome = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const senha = document.getElementById('register-password').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cadastrando...';
    submitBtn.disabled = true;
    
    try {
        const response = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ nome, email, senha })
        });
        
        showNotification('Cadastro realizado! Faça login para continuar.', 'success');
        e.target.reset();
        
        // Focar no form de login
        document.getElementById('login-email').focus();
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function handleLogout() {
    currentUser = null;
    sessionStorage.removeItem('petresgate_user');
    updateUIForLoggedUser();
    showNotification('Logout realizado com sucesso!', 'success');
    showSection('home');
}

function updateUIForLoggedUser() {
    const loginBtn = document.getElementById('loginBtn');
    const loginContainer = document.getElementById('login-form-container');
    const profileContainer = document.getElementById('profile-container');
    
    if (currentUser) {
        loginBtn.innerHTML = '<i class="fas fa-user-circle"></i><span>Perfil</span>';
        if (loginContainer) loginContainer.style.display = 'none';
        if (profileContainer) {
            profileContainer.style.display = 'block';
            updateProfileDisplay();
            loadUserPets();
        }
    } else {
        loginBtn.innerHTML = '<i class="fas fa-user"></i><span>Login</span>';
        if (loginContainer) loginContainer.style.display = 'block';
        if (profileContainer) profileContainer.style.display = 'none';
    }
}

function updateLoginSection() {
    updateUIForLoggedUser();
}

// === REGISTRO DE PET ===
function checkAuthForRegistration() {
    const warning = document.getElementById('register-warning');
    const form = document.getElementById('register-form');
    
    if (!currentUser) {
        warning.style.display = 'flex';
        form.style.display = 'none';
    } else {
        warning.style.display = 'none';
        form.style.display = 'block';
    }
}

async function handlePetRegistration(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showNotification('Você precisa estar logado para registrar um pet', 'error');
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';
    submitBtn.disabled = true;
    
    const formData = {
        nome: document.getElementById('pet-name').value,
        especie: document.getElementById('pet-species').value,
        raca: document.getElementById('pet-breed').value || 'Não informado',
        genero: document.getElementById('pet-gender').value || 'Não informado',
        idade: document.getElementById('pet-age').value || 'Não informado',
        cor: document.getElementById('pet-color').value || 'Não informado',
        localPerdido: document.getElementById('pet-location').value,
        dataPerdido: formatDateForAPI(document.getElementById('pet-date').value),
        comentarioTutor: document.getElementById('pet-description').value || 'Nenhuma observação',
        foto: document.getElementById('pet-photo').value || null,
        idTutor: currentUser.id
    };
    
    try {
        const response = await apiRequest('/pets', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        showNotification('Pet registrado com sucesso!', 'success');
        e.target.reset();
        
        // Recarregar dados
        await Promise.all([
            loadStats(),
            loadRecentPets()
        ]);
        
        // Ir para home
        setTimeout(() => {
            showSection('home');
        }, 1500);
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// === PETS DO USUÁRIO ===
async function loadUserPets() {
    if (!currentUser) return;
    
    try {
        const container = document.getElementById('user-pets');
        if (!container) return;
        
        container.innerHTML = createLoadingState();
        
        const response = await apiRequest('/pets');
        const userPets = response.pets.filter(pet => pet.idTutor === currentUser.id);
        
        if (userPets.length === 0) {
            container.innerHTML = createEmptyState(
                'fa-paw',
                'Você ainda não registrou nenhum pet',
                'Registre um pet perdido na seção correspondente'
            );
            return;
        }
        
        container.innerHTML = userPets.map(pet => createPetCard(pet, false, true)).join('');
    } catch (error) {
        console.error('Erro ao carregar pets do usuário:', error);
    }
}

// === CRIAR ELEMENTOS UI ===
function createPetCard(pet, isFound = false, showActions = false) {
    const statusClass = pet.status.toLowerCase();
    const statusText = pet.status === 'PERDIDO' ? 'Perdido' : 'Encontrado';
    
    const imageUrl = pet.foto && pet.foto !== 'N/A (Console não suporta imagens)' 
        ? pet.foto 
        : `https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=300&fit=crop`;
    
    const actionsHtml = showActions && pet.status === 'PERDIDO' ? `
        <button class="btn btn-primary btn-small" onclick="markAsFound(${pet.id})">
            <i class="fas fa-check"></i> Marcar como Encontrado
        </button>
    ` : '';
    
    return `
        <div class="pet-card" onclick="showPetModal(${pet.id})">
            <img src="${imageUrl}" alt="${pet.nome}" onerror="this.src='https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=300&fit=crop'">
            <div class="pet-card-content">
                <div class="pet-name">${pet.nome}</div>
                <div class="pet-info">
                    <span class="pet-species">${pet.especie}</span>
                    <span class="pet-status ${statusClass}">${statusText}</span>
                </div>
                <div class="pet-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${pet.localPerdido}
                </div>
                <div class="pet-date">
                    Perdido em: ${pet.dataPerdido}
                    ${isFound ? `<br>Encontrado em: ${pet.dataReencontro}` : ''}
                </div>
                ${actionsHtml}
            </div>
        </div>
    `;
}

function createLoadingState() {
    return `
        <div class="loading">
            <div class="spinner"></div>
            <span>Carregando...</span>
        </div>
    `;
}

function createEmptyState(icon, title, message) {
    return `
        <div class="empty-state">
            <i class="fas ${icon}"></i>
            <h3>${title}</h3>
            <p>${message}</p>
        </div>
    `;
}

// === MODAL ===
function setupModalEvents() {
    const modal = document.getElementById('pet-modal');
    if (!modal) return;
    
    // Fechar ao clicar fora
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // ESC para fechar
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });
}

async function showPetModal(petId) {
    try {
        const response = await apiRequest(`/pets/${petId}`);
        const pet = response.pet;
        
        const modal = document.getElementById('pet-modal');
        const detailsContainer = document.getElementById('pet-details');
        
        if (!modal || !detailsContainer) return;
        
        const imageUrl = pet.foto && pet.foto !== 'N/A (Console não suporta imagens)' 
            ? pet.foto 
            : `https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&h=400&fit=crop`;
        
        detailsContainer.innerHTML = `
            <div class="modal-header">
                <h2><i class="fas fa-paw"></i> ${pet.nome}</h2>
                <span class="pet-status ${pet.status.toLowerCase()}">${pet.status}</span>
            </div>
            
            <img src="${imageUrl}" alt="${pet.nome}" class="modal-image">
            
            <div class="modal-info-grid">
                <div class="info-item">
                    <i class="fas fa-dog"></i>
                    <div>
                        <span class="info-label">Espécie</span>
                        <span class="info-value">${pet.especie}</span>
                    </div>
                </div>
                <div class="info-item">
                    <i class="fas fa-dna"></i>
                    <div>
                        <span class="info-label">Raça</span>
                        <span class="info-value">${pet.raca || 'Não informado'}</span>
                    </div>
                </div>
                <div class="info-item">
                    <i class="fas fa-venus-mars"></i>
                    <div>
                        <span class="info-label">Gênero</span>
                        <span class="info-value">${pet.genero || 'Não informado'}</span>
                    </div>
                </div>
                <div class="info-item">
                    <i class="fas fa-birthday-cake"></i>
                    <div>
                        <span class="info-label">Idade</span>
                        <span class="info-value">${pet.idade || 'Não informado'}</span>
                    </div>
                </div>
                <div class="info-item">
                    <i class="fas fa-palette"></i>
                    <div>
                        <span class="info-label">Cor</span>
                        <span class="info-value">${pet.cor || 'Não informado'}</span>
                    </div>
                </div>
                <div class="info-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <div>
                        <span class="info-label">Local</span>
                        <span class="info-value">${pet.localPerdido}</span>
                    </div>
                </div>
            </div>
            
            <div class="modal-dates">
                <p><i class="fas fa-calendar"></i> Perdido em: ${pet.dataPerdido}</p>
                ${pet.status === 'ENCONTRADO' ? `<p><i class="fas fa-heart"></i> Encontrado em: ${pet.dataReencontro}</p>` : ''}
            </div>
            
            ${pet.comentarioTutor ? `
                <div class="modal-description">
                    <h3><i class="fas fa-comment"></i> Observações</h3>
                    <p>${pet.comentarioTutor}</p>
                </div>
            ` : ''}
            
            ${currentUser && currentUser.id === pet.idTutor && pet.status === 'PERDIDO' ? `
                <div class="modal-actions">
                    <button class="btn btn-primary btn-large" onclick="markAsFound(${pet.id})">
                        <i class="fas fa-check"></i> Marcar como Encontrado
                    </button>
                </div>
            ` : ''}
        `;
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Animação de entrada
        requestAnimationFrame(() => {
            modal.classList.add('modal-open');
        });
    } catch (error) {
        console.error('Erro ao carregar detalhes do pet:', error);
        showNotification('Erro ao carregar detalhes do pet', 'error');
    }
}

function closeModal() {
    const modal = document.getElementById('pet-modal');
    if (modal) {
        modal.classList.remove('modal-open');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }
}

// === MARCAR COMO ENCONTRADO ===
async function markAsFound(petId) {
    if (!currentUser) {
        showNotification('Você precisa estar logado', 'error');
        return;
    }
    
    try {
        await apiRequest(`/pets/${petId}/encontrado`, {
            method: 'PUT'
        });
        
        showNotification('Pet marcado como encontrado! 🎉', 'success');
        
        // Fechar modal
        closeModal();
        
        // Recarregar dados
        await Promise.all([
            loadStats(),
            loadRecentPets(),
            loadFoundPets(),
            loadUserPets()
        ]);
        
        // Celebração
        celebrate();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// === EFEITO DE CELEBRAÇÃO ===
function celebrate() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f7dc6f', '#bb8fce'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 3000);
    }
}

// === FORMULÁRIO DE CONTATO ===
function handleContactFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    submitBtn.disabled = true;
    
    // Simular envio
    setTimeout(() => {
        showNotification('Mensagem enviada com sucesso!', 'success');
        e.target.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// === NOTIFICAÇÕES ===
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const messageEl = document.getElementById('notification-message');
    
    if (!notification || !messageEl) return;
    
    messageEl.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });
    
    setTimeout(() => {
        hideNotification();
    }, 5000);
}

function hideNotification() {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.style.display = 'none';
        }, 300);
    }
}

// === UTILITÁRIOS ===
function formatDateForAPI(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function showLogin() {
    showSection('login');
}

// === ESTILOS CSS DINÂMICOS ===
const dynamicStyles = `
    .animate-in {
        animation: fadeInUp 0.6s ease-out forwards;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: rippleEffect 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes rippleEffect {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .modal-open {
        animation: modalOpen 0.3s ease-out;
    }
    
    @keyframes modalOpen {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }
    
    .modal-image {
        width: 100%;
        height: 300px;
        object-fit: cover;
        border-radius: 1rem;
        margin-bottom: 1.5rem;
    }
    
    .modal-info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
    }
    
    .info-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        background: var(--bg-light);
        border-radius: 0.75rem;
    }
    
    .info-item i {
        font-size: 1.25rem;
        color: var(--primary);
    }
    
    .info-label {
        display: block;
        font-size: 0.875rem;
        color: var(--text-secondary);
    }
    
    .info-value {
        display: block;
        font-weight: 600;
        color: var(--text-primary);
    }
    
    .modal-dates {
        margin-bottom: 1.5rem;
        color: var(--text-secondary);
    }
    
    .modal-dates p {
        margin-bottom: 0.5rem;
    }
    
    .modal-description {
        background: var(--bg-light);
        padding: 1.5rem;
        border-radius: 1rem;
        margin-bottom: 1.5rem;
    }
    
    .modal-description h3 {
        margin-bottom: 0.75rem;
    }
    
    .modal-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
    }
    
    .notification.show {
        animation: notificationSlide 0.3s ease-out;
    }
    
    @keyframes notificationSlide {
        from {
            transform: translateX(100%);
        }
        to {
            transform: translateX(0);
        }
    }
    
    .confetti {
        position: fixed;
        width: 10px;
        height: 10px;
        background: #f0f;
        animation: confettiFall 3s ease-out forwards;
        z-index: 1000;
    }
    
    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;

// Adicionar estilos dinâmicos
const styleSheet = document.createElement('style');
styleSheet.textContent = dynamicStyles;
document.head.appendChild(styleSheet);

// === EXPOSIÇÃO DE FUNÇÕES GLOBAIS ===
// === FUNCIONALIDADES DO PERFIL EXPANDIDO ===

// Variável para controlar modo de edição
let isEditingProfile = false;

// Atualizar exibição do perfil com os novos campos
function updateProfileDisplay() {
    if (!currentUser) return;
    
    // Dados básicos
    document.getElementById('profile-name').textContent = currentUser.nome || '';
    document.getElementById('profile-email').textContent = currentUser.email || '';
    document.getElementById('profile-email-display').textContent = currentUser.email || '';
    
    // Data de cadastro
    if (currentUser.dataCadastro) {
        const dataFormatada = new Date(currentUser.dataCadastro).toLocaleDateString('pt-BR', {
            month: 'short',
            year: 'numeric'
        });
        document.getElementById('profile-member-since').textContent = `Membro desde: ${dataFormatada}`;
    }
    
    // Informações de contato
    document.getElementById('profile-whatsapp').textContent = currentUser.whatsapp || '-';
    
    // Endereço
    document.getElementById('profile-endereco-rua').textContent = currentUser.endereco?.rua || '-';
    document.getElementById('profile-bairro').textContent = currentUser.endereco?.bairro || '-';
    document.getElementById('profile-cidade').textContent = currentUser.endereco?.cidade || '-';
    document.getElementById('profile-estado').textContent = currentUser.endereco?.estado || '-';
    
    // Redes sociais
    document.getElementById('profile-instagram').textContent = currentUser.redesSociais?.instagram || '-';
    document.getElementById('profile-facebook').textContent = currentUser.redesSociais?.facebook || '-';
    document.getElementById('profile-twitter').textContent = currentUser.redesSociais?.twitter || '-';
    
    // Descrição
    updateProfileDescription();
    
    // Completude do perfil
    updateProfileCompletion();
    
    // Estatísticas
    updateUserStats();
}


// Atualizar descrição do perfil
function updateProfileDescription() {
    const descricaoElement = document.getElementById('profile-descricao');
    if (currentUser.descricao && currentUser.descricao.trim()) {
        descricaoElement.innerHTML = `<p>${currentUser.descricao}</p>`;
    } else {
        descricaoElement.innerHTML = '<p class="empty-text">Nenhuma descrição cadastrada</p>';
    }
}

// Atualizar completude do perfil
function updateProfileCompletion() {
    if (!currentUser.calcularCompletudeProfile) {
        // Função simples para calcular completude se o método não existir
        let campos = 3; // nome, email, senha
        let preenchidos = 3;
        
        campos += 7; // whatsapp, descricao, bairro, cidade, facebook, instagram, twitter
        if (currentUser.whatsapp) preenchidos++;
        if (currentUser.descricao) preenchidos++;
        if (currentUser.endereco?.bairro) preenchidos++;
        if (currentUser.endereco?.cidade) preenchidos++;
        if (currentUser.redesSociais?.facebook) preenchidos++;
        if (currentUser.redesSociais?.instagram) preenchidos++;
        if (currentUser.redesSociais?.twitter) preenchidos++;
        
        currentUser.completude = Math.round((preenchidos / campos) * 100);
    } else {
        currentUser.completude = currentUser.calcularCompletudeProfile();
    }
    
    const progressBar = document.getElementById('completion-progress');
    const completionText = document.getElementById('completion-text');
    const profileTip = document.getElementById('profile-tip');
    
    progressBar.style.width = `${currentUser.completude}%`;
    completionText.textContent = `Perfil ${currentUser.completude}% completo`;
    
    // Adicionar classes de cor baseado na completude
    progressBar.className = 'completion-fill';
    if (currentUser.completude >= 70) {
        progressBar.classList.add('high');
    } else if (currentUser.completude >= 40) {
        progressBar.classList.add('medium');
    } else {
        progressBar.classList.add('low');
    }
    
    // Mostrar dica se perfil não está completo
    if (currentUser.completude < 70) {
        showProfileTip();
    }
}

// Mostrar dica de completude
function showProfileTip() {
    const profileTip = document.getElementById('profile-tip');
    const missingFields = [];
    
    if (!currentUser.whatsapp) missingFields.push('WhatsApp');
    if (!currentUser.descricao) missingFields.push('Descrição');
    if (!currentUser.endereco?.bairro) missingFields.push('Bairro');
    if (!currentUser.endereco?.cidade) missingFields.push('Cidade');
    
    if (missingFields.length > 0) {
        document.getElementById('tip-missing-fields').textContent = `Faltam: ${missingFields.join(', ')}`;
        profileTip.style.display = 'block';
    }
}

// Fechar dica
function closeTip() {
    document.getElementById('profile-tip').style.display = 'none';
}

// Atualizar estatísticas do usuário
function updateUserStats() {
    const petsCount = currentUser.petsRegistrados ? currentUser.petsRegistrados.length : 0;
    document.getElementById('user-pets-count').textContent = petsCount;
    
    // Calcular dias como membro
    if (currentUser.dataCadastro) {
        const hoje = new Date();
        const cadastro = new Date(currentUser.dataCadastro);
        const diasMembro = Math.floor((hoje - cadastro) / (1000 * 60 * 60 * 24));
        document.getElementById('user-days-member').textContent = diasMembro;
    }
    
    // TODO: Implementar contagem de reencontros quando essa funcionalidade for adicionada
    document.getElementById('user-reunions-count').textContent = '0';
}

// === NAVEGAÇÃO ENTRE ABAS DO PERFIL ===
function setupProfileTabs() {
    const tabs = document.querySelectorAll('.profile-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Remover classe active de todas as abas
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Ativar aba selecionada
            tab.classList.add('active');
            document.getElementById(`tab-${targetTab}`).classList.add('active');
        });
    });
}

// === EDIÇÃO INLINE DO PERFIL ===
function toggleProfileEdit() {
    const editBtn = document.getElementById('edit-profile-btn');
    const saveBtn = document.getElementById('save-profile-btn');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    
    if (!isEditingProfile) {
        // Entrar no modo de edição
        isEditingProfile = true;
        editBtn.style.display = 'none';
        saveBtn.style.display = 'inline-flex';
        cancelBtn.style.display = 'inline-flex';
        
        showEditFields();
        fillEditFields();
    } else {
        // Sair do modo de edição
        isEditingProfile = false;
        editBtn.style.display = 'inline-flex';
        saveBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
        
        hideEditFields();
    }
}

function showEditFields() {
    // Esconder spans e mostrar inputs
    const editableFields = document.querySelectorAll('.editable-field');
    const editableInputs = document.querySelectorAll('.editable-input, .editable-textarea');
    
    editableFields.forEach(field => {
        field.style.display = 'none';
    });
    
    editableInputs.forEach(input => {
        input.style.display = input.tagName === 'TEXTAREA' ? 'block' : 'inline-block';
    });
    
    // Mostrar contador de caracteres para textarea
    const charCounter = document.getElementById('descricao-counter');
    if (charCounter) {
        charCounter.style.display = 'block';
    }
    
    // Configurar event listeners para validação em tempo real
    setupValidationListeners();
}

function hideEditFields() {
    // Mostrar spans e esconder inputs
    const editableFields = document.querySelectorAll('.editable-field');
    const editableInputs = document.querySelectorAll('.editable-input, .editable-textarea');
    
    editableFields.forEach(field => {
        field.style.display = '';
    });
    
    editableInputs.forEach(input => {
        input.style.display = 'none';
        // Limpar classes de validação
        input.classList.remove('error', 'success');
    });
    
    // Esconder contador de caracteres
    const charCounter = document.getElementById('descricao-counter');
    if (charCounter) {
        charCounter.style.display = 'none';
    }
    
    // Esconder mensagens de erro
    document.querySelectorAll('.validation-error').forEach(error => {
        error.style.display = 'none';
    });
}

function fillEditFields() {
    if (!currentUser) return;
    
    document.getElementById('edit-whatsapp').value = currentUser.whatsapp || '';
    document.getElementById('edit-endereco-rua').value = currentUser.endereco?.rua || '';
    document.getElementById('edit-endereco-bairro').value = currentUser.endereco?.bairro || '';
    document.getElementById('edit-endereco-cidade').value = currentUser.endereco?.cidade || '';
    document.getElementById('edit-endereco-estado').value = currentUser.endereco?.estado || '';
    document.getElementById('edit-instagram').value = currentUser.redesSociais?.instagram || '';
    document.getElementById('edit-facebook').value = currentUser.redesSociais?.facebook || '';
    document.getElementById('edit-twitter').value = currentUser.redesSociais?.twitter || '';
    document.getElementById('edit-descricao').value = currentUser.descricao || '';
}

async function saveProfileChanges() {
    // Validar todos os campos antes de salvar
    if (!validateAllFields()) {
        showNotification('Por favor, corrija os erros nos campos destacados.', 'error');
        return;
    }
    
    const saveBtn = document.getElementById('save-profile-btn');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    saveBtn.disabled = true;
    
    // Adicionar classe de loading na seção
    document.querySelectorAll('.profile-section').forEach(section => {
        section.classList.add('saving');
    });
    
    try {
        const dadosNovos = {
            whatsapp: document.getElementById('edit-whatsapp').value,
            descricao: document.getElementById('edit-descricao').value,
            endereco: {
                rua: document.getElementById('edit-endereco-rua').value,
                bairro: document.getElementById('edit-endereco-bairro').value,
                cidade: document.getElementById('edit-endereco-cidade').value,
                estado: document.getElementById('edit-endereco-estado').value
            },
            redesSociais: {
                instagram: document.getElementById('edit-instagram').value,
                facebook: document.getElementById('edit-facebook').value,
                twitter: document.getElementById('edit-twitter').value
            }
        };
        
        const response = await fetch(`${API_BASE}/usuario/${currentUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosNovos)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Atualizar dados do usuário atual
            Object.assign(currentUser, dadosNovos);
            sessionStorage.setItem('petresgate_user', JSON.stringify(currentUser));
            
            updateProfileDisplay();
            toggleProfileEdit(); // Sair do modo de edição
            showNotification('Perfil atualizado com sucesso!', 'success');
        } else {
            showNotification(result.message || 'Erro ao atualizar perfil', 'error');
        }
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        showNotification('Erro ao atualizar perfil', 'error');
    } finally {
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
        
        // Remover classe de loading
        document.querySelectorAll('.profile-section').forEach(section => {
            section.classList.remove('saving');
        });
    }
}

function cancelProfileEdit() {
    toggleProfileEdit();
    // Restaurar valores originais nos campos
    fillEditFields();
}

// === VALIDAÇÃO E MÁSCARAS DE INPUT ===
function setupValidationListeners() {
    // WhatsApp com máscara e validação
    const whatsappInput = document.getElementById('edit-whatsapp');
    if (whatsappInput) {
        whatsappInput.addEventListener('input', function(e) {
            // Aplicar máscara de telefone
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                if (value.length <= 2) {
                    value = value.replace(/(\d{0,2})/, '($1');
                } else if (value.length <= 6) {
                    value = value.replace(/(\d{2})(\d{0,4})/, '($1) $2');
                } else if (value.length <= 10) {
                    value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
                } else {
                    value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
                }
            }
            e.target.value = value;
            
            // Validar formato
            validateWhatsApp(e.target);
        });
    }
    
    // Redes sociais com validação
    const instagramInput = document.getElementById('edit-instagram');
    if (instagramInput) {
        instagramInput.addEventListener('input', function(e) {
            formatSocialMedia(e.target);
            validateSocialMedia(e.target, 'instagram');
        });
    }
    
    const facebookInput = document.getElementById('edit-facebook');
    if (facebookInput) {
        facebookInput.addEventListener('input', function(e) {
            formatSocialMedia(e.target);
            validateSocialMedia(e.target, 'facebook');
        });
    }
    
    const twitterInput = document.getElementById('edit-twitter');
    if (twitterInput) {
        twitterInput.addEventListener('input', function(e) {
            formatSocialMedia(e.target);
            validateSocialMedia(e.target, 'twitter');
        });
    }
    
    // Contador de caracteres para descrição
    const descricaoInput = document.getElementById('edit-descricao');
    if (descricaoInput) {
        descricaoInput.addEventListener('input', function(e) {
            updateCharCounter(e.target);
        });
    }
    
    // Estado com validação de 2 caracteres
    const estadoInput = document.getElementById('edit-endereco-estado');
    if (estadoInput) {
        estadoInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.toUpperCase().slice(0, 2);
        });
    }
}

function validateWhatsApp(input) {
    const value = input.value;
    const errorElement = document.getElementById('whatsapp-error');
    
    if (!value) {
        input.classList.remove('error', 'success');
        errorElement.style.display = 'none';
        return true;
    }
    
    const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;
    const isValid = phoneRegex.test(value);
    
    if (isValid) {
        input.classList.remove('error');
        input.classList.add('success');
        errorElement.style.display = 'none';
    } else {
        input.classList.remove('success');
        input.classList.add('error');
        errorElement.textContent = 'Formato inválido. Use: (11) 99999-9999';
        errorElement.style.display = 'flex';
    }
    
    return isValid;
}

function formatSocialMedia(input) {
    let value = input.value;
    if (value && !value.startsWith('@')) {
        value = '@' + value;
        input.value = value;
    }
}

function validateSocialMedia(input, platform) {
    const value = input.value;
    const errorElement = document.getElementById(`${platform}-error`);
    
    if (!value || value === '@') {
        input.classList.remove('error', 'success');
        errorElement.style.display = 'none';
        return true;
    }
    
    let isValid = false;
    let errorMessage = '';
    
    switch (platform) {
        case 'instagram':
            isValid = /^@[a-zA-Z0-9_.]{1,29}$/.test(value);
            errorMessage = 'Use apenas letras, números, _ e .';
            break;
        case 'facebook':
            isValid = /^@[a-zA-Z0-9.]{1,49}$/.test(value);
            errorMessage = 'Use apenas letras, números e .';
            break;
        case 'twitter':
            isValid = /^@[a-zA-Z0-9_]{1,14}$/.test(value);
            errorMessage = 'Use apenas letras, números e _';
            break;
    }
    
    if (isValid) {
        input.classList.remove('error');
        input.classList.add('success');
        errorElement.style.display = 'none';
    } else {
        input.classList.remove('success');
        input.classList.add('error');
        errorElement.textContent = errorMessage;
        errorElement.style.display = 'flex';
    }
    
    return isValid;
}

function updateCharCounter(textarea) {
    const charCount = textarea.value.length;
    const maxLength = parseInt(textarea.getAttribute('maxlength'));
    const counter = document.getElementById('char-count');
    const counterElement = document.getElementById('descricao-counter');
    
    if (counter) {
        counter.textContent = charCount;
    }
    
    if (counterElement) {
        counterElement.classList.remove('warning', 'danger');
        
        if (charCount >= maxLength * 0.9) {
            counterElement.classList.add('danger');
        } else if (charCount >= maxLength * 0.7) {
            counterElement.classList.add('warning');
        }
    }
}

function validateAllFields() {
    const whatsappValid = validateWhatsApp(document.getElementById('edit-whatsapp'));
    const instagramValid = validateSocialMedia(document.getElementById('edit-instagram'), 'instagram');
    const facebookValid = validateSocialMedia(document.getElementById('edit-facebook'), 'facebook');
    const twitterValid = validateSocialMedia(document.getElementById('edit-twitter'), 'twitter');
    
    return whatsappValid && instagramValid && facebookValid && twitterValid;
}

// === CORREÇÕES PARA CAMPOS SELECT ===
function fixSelectFields() {
    const selectElements = document.querySelectorAll('select');
    
    selectElements.forEach(select => {
        // Remover todos os event listeners anteriores
        const newSelect = select.cloneNode(true);
        select.parentNode.replaceChild(newSelect, select);
        
        // Aplicar correções no novo elemento
        applySelectFixes(newSelect);
    });
}

function applySelectFixes(select) {
    // Prevenir interferência de eventos
    select.addEventListener('mousedown', function(e) {
        e.stopPropagation();
        e.stopImmediatePropagation();
    }, { passive: false, capture: true });
    
    select.addEventListener('click', function(e) {
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        // Forçar foco se não estiver focado
        if (document.activeElement !== this) {
            this.focus();
        }
    }, { passive: false, capture: true });
    
    // Melhorar comportamento em mobile
    select.addEventListener('touchstart', function(e) {
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.focus();
    }, { passive: false, capture: true });
    
    select.addEventListener('touchend', function(e) {
        e.stopPropagation();
        e.stopImmediatePropagation();
    }, { passive: false, capture: true });
    
    // Prevenir fechamento por cliques externos durante um tempo
    let isOpening = false;
    select.addEventListener('focus', function() {
        isOpening = true;
        setTimeout(() => { isOpening = false; }, 500);
    });
    
    // Garantir que o label se mova quando uma opção é selecionada
    select.addEventListener('change', function(e) {
        e.stopPropagation();
        
        if (this.value) {
            this.setAttribute('data-selected', 'true');
            this.setAttribute('data-has-value', 'true');
        } else {
            this.removeAttribute('data-selected');
            this.removeAttribute('data-has-value');
        }
        
        // Forçar update do label
        this.blur();
        setTimeout(() => this.focus(), 10);
    });
    
    // Verificar se já tem valor selecionado ao carregar
    if (select.value && select.value !== '') {
        select.setAttribute('data-selected', 'true');
        select.setAttribute('data-has-value', 'true');
    }
    
    // Adicionar delay antes de permitir blur
    select.addEventListener('mouseup', function() {
        setTimeout(() => {
            // Apenas processa se ainda tem foco
            if (document.activeElement === this) {
                // Mantém foco por mais tempo
            }
        }, 100);
    });
}

// === SOLUÇÃO ALTERNATIVA COM CUSTOM DROPDOWN ===
function createCustomDropdown(selectElement) {
    const formFloating = selectElement.closest('.form-floating');
    const label = formFloating ? formFloating.querySelector('label') : null;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper';
    
    const display = document.createElement('div');
    display.className = 'custom-select-display';
    display.textContent = selectElement.querySelector('option[value=""]').textContent || 'Selecione...';
    
    const dropdown = document.createElement('div');
    dropdown.className = 'custom-select-dropdown';
    
    const options = selectElement.querySelectorAll('option');
    options.forEach(option => {
        if (option.value === '') return; // Skip placeholder
        
        const optionDiv = document.createElement('div');
        optionDiv.className = 'custom-select-option';
        optionDiv.textContent = option.textContent;
        optionDiv.setAttribute('data-value', option.value);
        
        optionDiv.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Update select and display
            selectElement.value = this.getAttribute('data-value');
            display.textContent = this.textContent;
            dropdown.classList.remove('open');
            
            // Update wrapper classes for label animation
            wrapper.classList.add('has-value');
            wrapper.classList.remove('focused', 'empty-state');
            
            // Trigger change event
            const event = new Event('change', { bubbles: true });
            selectElement.dispatchEvent(event);
            
            // Update attributes for label
            selectElement.setAttribute('data-selected', 'true');
            selectElement.setAttribute('data-has-value', 'true');
        });
        
        dropdown.appendChild(optionDiv);
    });
    
    display.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Toggle dropdown
        const isOpen = dropdown.classList.contains('open');
        
        // Close all other dropdowns
        document.querySelectorAll('.custom-select-dropdown.open').forEach(dd => {
            dd.classList.remove('open');
        });
        document.querySelectorAll('.custom-select-wrapper.focused').forEach(w => {
            w.classList.remove('focused');
        });
        
        if (!isOpen) {
            dropdown.classList.add('open');
            wrapper.classList.add('focused');
        }
    });
    
    // Handle focus/blur for label animation
    display.addEventListener('focus', function() {
        wrapper.classList.add('focused');
    });
    
    display.addEventListener('blur', function() {
        if (!dropdown.classList.contains('open')) {
            wrapper.classList.remove('focused');
        }
    });
    
    // Close on outside click
    document.addEventListener('click', function(e) {
        if (!wrapper.contains(e.target)) {
            dropdown.classList.remove('open');
            wrapper.classList.remove('focused');
        }
    });
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            dropdown.classList.remove('open');
            wrapper.classList.remove('focused');
        }
    });
    
    wrapper.appendChild(display);
    wrapper.appendChild(dropdown);
    
    // Check if select already has value
    if (selectElement.value && selectElement.value !== '') {
        wrapper.classList.add('has-value');
        wrapper.classList.remove('empty-state');
        display.textContent = selectElement.querySelector(`option[value="${selectElement.value}"]`).textContent;
    } else {
        // Estado inicial vazio
        wrapper.classList.add('empty-state');
        wrapper.classList.remove('has-value');
    }
    
    selectElement.style.display = 'none';
    selectElement.parentNode.insertBefore(wrapper, selectElement);
    
    return wrapper;
}

// === IMPLEMENTAR CUSTOM DROPDOWNS PARA CAMPOS PROBLEMÁTICOS ===
function implementCustomDropdowns() {
    const problematicSelects = ['pet-species', 'pet-gender'];
    
    problematicSelects.forEach(id => {
        const select = document.getElementById(id);
        if (select && !select.hasAttribute('data-custom-created')) {
            createCustomDropdown(select);
            select.setAttribute('data-custom-created', 'true');
        }
    });
}

// === CONFIGURAR EVENT LISTENERS ===
document.addEventListener('DOMContentLoaded', function() {
    setupProfileTabs();
    
    // Implementar custom dropdowns para campos problemáticos
    setTimeout(() => {
        implementCustomDropdowns();
    }, 100);
    
    // Corrigir outros campos select (que não são problemáticos)
    setTimeout(() => {
        const otherSelects = document.querySelectorAll('select:not([data-custom-created])');
        otherSelects.forEach(select => {
            applySelectFixes(select);
        });
    }, 200);
    
    // Botões de edição inline do perfil
    const editProfileBtn = document.getElementById('edit-profile-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', toggleProfileEdit);
    }
    
    const saveProfileBtn = document.getElementById('save-profile-btn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveProfileChanges);
    }
    
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', cancelProfileEdit);
    }
});

// Exportar funções para window
window.showPetModal = showPetModal;
window.markAsFound = markAsFound;
window.showLogin = showLogin;
window.currentSlide = currentSlide;
window.changeSlide = changeSlide;
window.scrollToTop = scrollToTop;
window.closeModal = closeModal;
window.showSection = showSection;
window.closeTip = closeTip;