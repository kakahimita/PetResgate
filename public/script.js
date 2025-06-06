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
            document.getElementById('profile-name').textContent = currentUser.nome;
            document.getElementById('profile-email').textContent = currentUser.email;
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
window.showPetModal = showPetModal;
window.markAsFound = markAsFound;
window.showLogin = showLogin;
window.currentSlide = currentSlide;
window.changeSlide = changeSlide;
window.scrollToTop = scrollToTop;
window.closeModal = closeModal;
window.showSection = showSection;