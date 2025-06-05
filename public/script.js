// === VARIÁVEIS GLOBAIS ===
let currentUser = null;
let allPets = [];
let currentSection = 'home';

// === VARIÁVEIS PARA SEÇÃO DE CUIDADOS ===
let slideIndex = 1;
let slideInterval;

// === API BASE URL ===
const API_BASE = '/api';

// === INICIALIZAÇÃO ===
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadInitialData();
    
    // Inicializar funcionalidades da seção de cuidados automaticamente
    setTimeout(() => {
        initializeHomeFeatures();
    }, 500);
});

// === FUNÇÕES DE INICIALIZAÇÃO ===
function initializeApp() {
    // Verificar se há usuário logado (usando sessionStorage ao invés de localStorage)
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
    // Navegação
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.currentTarget.dataset.section;
            showSection(section);
        });
    });
    
    // Formulário de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Formulário de cadastro de usuário
    const registerForm = document.getElementById('register-user-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleUserRegistration);
    }
    
    // Formulário de registro de pet
    const petForm = document.getElementById('register-form');
    if (petForm) {
        petForm.addEventListener('submit', handlePetRegistration);
    }
    
    // Busca de pets
    const searchBtn = document.getElementById('search-btn');
    const clearBtn = document.getElementById('clear-search');
    if (searchBtn) searchBtn.addEventListener('click', handleSearch);
    if (clearBtn) clearBtn.addEventListener('click', clearSearch);
    
    // Logout
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
    
    // Formulário de contato da seção de cuidados
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }
}

async function loadInitialData() {
    try {
        await Promise.all([
            loadStats(),
            loadRecentPets(),
            loadFoundPets()
        ]);
    } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        showNotification('Erro ao carregar dados iniciais. Verifique sua conexão.', 'error');
    }
}

// === FUNÇÕES DE NAVEGAÇÃO ===
function showSection(sectionName) {
    // Remover classe active de todas as seções
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remover classe active de todos os botões de navegação
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar seção selecionada
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Ativar botão correspondente
    const targetBtn = document.querySelector(`[data-section="${sectionName}"]`);
    if (targetBtn) {
        targetBtn.classList.add('active');
    }
    
    currentSection = sectionName;
    
    // Carregar dados específicos da seção
    loadSectionData(sectionName);
}

async function loadSectionData(sectionName) {
    switch (sectionName) {
        case 'home':
            // Reinicializar funcionalidades da página inicial se necessário
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

// === FUNÇÕES DE API ===
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

// === ESTATÍSTICAS ===
async function loadStats() {
    try {
        showLoading('stats-perdidos');
        showLoading('stats-encontrados');
        showLoading('stats-total');
        
        const stats = await apiRequest('/stats');
        
        document.getElementById('stats-perdidos').textContent = stats.stats.perdidos;
        document.getElementById('stats-encontrados').textContent = stats.stats.encontrados;
        document.getElementById('stats-total').textContent = stats.stats.total;
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        document.getElementById('stats-perdidos').textContent = '—';
        document.getElementById('stats-encontrados').textContent = '—';
        document.getElementById('stats-total').textContent = '—';
    }
}

// === PETS RECENTES ===
async function loadRecentPets() {
    try {
        const container = document.getElementById('recent-pets-list');
        if (!container) return;
        
        container.innerHTML = '<div class="loading"><div class="spinner"></div>Carregando pets...</div>';
        
        const response = await apiRequest('/pets?status=PERDIDO');
        const pets = response.pets.slice(0, 6); // Mostrar apenas os 6 mais recentes
        
        if (pets.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>Nenhum pet perdido no momento</h3>
                    <p>Que ótima notícia! 🎉</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = pets.map(pet => createPetCard(pet)).join('');
    } catch (error) {
        console.error('Erro ao carregar pets recentes:', error);
        const container = document.getElementById('recent-pets-list');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Erro ao carregar pets</h3>
                    <p>Tente novamente mais tarde</p>
                </div>
            `;
        }
    }
}

// === PETS ENCONTRADOS ===
async function loadFoundPets() {
    try {
        const container = document.getElementById('found-pets-list');
        if (!container) return;
        
        container.innerHTML = '<div class="loading"><div class="spinner"></div>Carregando reencontros...</div>';
        
        const response = await apiRequest('/pets/historico/reencontros');
        const pets = response.pets;
        
        if (pets.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-heart"></i>
                    <h3>Ainda não há reencontros registrados</h3>
                    <p>Em breve teremos histórias felizes para compartilhar! 💕</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = pets.map(pet => createPetCard(pet, true)).join('');
    } catch (error) {
        console.error('Erro ao carregar pets encontrados:', error);
        const container = document.getElementById('found-pets-list');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Erro ao carregar reencontros</h3>
                    <p>Tente novamente mais tarde</p>
                </div>
            `;
        }
    }
}

// === BUSCA DE PETS ===
async function loadAllPetsForSearch() {
    try {
        const response = await apiRequest('/pets?status=PERDIDO');
        allPets = response.pets;
        displaySearchResults(allPets);
    } catch (error) {
        console.error('Erro ao carregar pets para busca:', error);
        showNotification('Erro ao carregar pets para busca', 'error');
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
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>Nenhum pet encontrado</h3>
                <p>Tente outros termos de busca</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = pets.map(pet => createPetCard(pet)).join('');
}

// === AUTENTICAÇÃO ===
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-password').value;
    
    try {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, senha })
        });
        
        currentUser = response.usuario;
        
        // Usar sessionStorage ao invés de localStorage
        try {
            sessionStorage.setItem('petresgate_user', JSON.stringify(currentUser));
        } catch (error) {
            console.log('Erro ao salvar usuário na sessão');
        }
        
        updateUIForLoggedUser();
        showNotification('Login realizado com sucesso!', 'success');
        
        // Limpar formulário
        document.getElementById('login-form').reset();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function handleUserRegistration(e) {
    e.preventDefault();
    
    const nome = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const senha = document.getElementById('register-password').value;
    
    try {
        const response = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ nome, email, senha })
        });
        
        showNotification('Usuário cadastrado com sucesso! Agora você pode fazer login.', 'success');
        
        // Limpar formulário
        document.getElementById('register-user-form').reset();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function handleLogout() {
    currentUser = null;
    
    try {
        sessionStorage.removeItem('petresgate_user');
    } catch (error) {
        console.log('Erro ao remover usuário da sessão');
    }
    
    updateUIForLoggedUser();
    showNotification('Logout realizado com sucesso!', 'success');
    showSection('home');
}

function updateUIForLoggedUser() {
    const loginBtn = document.getElementById('loginBtn');
    const loginContainer = document.getElementById('login-form-container');
    const profileContainer = document.getElementById('profile-container');
    
    if (!loginBtn || !loginContainer || !profileContainer) return;
    
    if (currentUser) {
        loginBtn.innerHTML = '<i class="fas fa-user-circle"></i> Perfil';
        loginContainer.style.display = 'none';
        profileContainer.style.display = 'block';
        
        document.getElementById('profile-name').textContent = currentUser.nome;
        document.getElementById('profile-email').textContent = currentUser.email;
        
        loadUserPets();
    } else {
        loginBtn.innerHTML = '<i class="fas fa-user"></i> Login';
        loginContainer.style.display = 'block';
        profileContainer.style.display = 'none';
    }
}

function updateLoginSection() {
    updateUIForLoggedUser();
}

// === REGISTRO DE PETS ===
function checkAuthForRegistration() {
    const warning = document.getElementById('register-warning');
    const form = document.getElementById('register-form');
    
    if (!warning || !form) return;
    
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
        document.getElementById('register-form').reset();
        
        // Recarregar dados
        await loadStats();
        await loadRecentPets();
        
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// === PETS DO USUÁRIO ===
async function loadUserPets() {
    if (!currentUser) return;
    
    try {
        const container = document.getElementById('user-pets');
        if (!container) return;
        
        container.innerHTML = '<div class="loading"><div class="spinner"></div>Carregando seus pets...</div>';
        
        const response = await apiRequest('/pets');
        const userPets = response.pets.filter(pet => pet.idTutor === currentUser.id);
        
        if (userPets.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-paw"></i>
                    <h3>Você ainda não registrou nenhum pet</h3>
                    <p>Registre um pet perdido na seção correspondente</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = userPets.map(pet => createPetCard(pet, false, true)).join('');
    } catch (error) {
        console.error('Erro ao carregar pets do usuário:', error);
        const container = document.getElementById('user-pets');
        if (container) {
            container.innerHTML = '<p>Erro ao carregar pets</p>';
        }
    }
}

// === CRIAR CARD DE PET ===
function createPetCard(pet, isFound = false, showActions = false) {
    const statusClass = pet.status.toLowerCase();
    const statusText = pet.status === 'PERDIDO' ? 'Perdido' : 'Encontrado';
    
    const imageUrl = pet.foto && pet.foto !== 'N/A (Console não suporta imagens)' 
        ? pet.foto 
        : `https://via.placeholder.com/300x200/667eea/ffffff?text=${pet.especie}`;
    
    const actionsHtml = showActions && pet.status === 'PERDIDO' ? `
        <div class="pet-actions" style="margin-top: 1rem;">
            <button class="btn btn-small btn-primary" onclick="markAsFound(${pet.id})">
                <i class="fas fa-check"></i> Marcar como Encontrado
            </button>
        </div>
    ` : '';
    
    return `
        <div class="pet-card" onclick="showPetModal(${pet.id})">
            <img src="${imageUrl}" alt="${pet.nome}" onerror="this.src='https://via.placeholder.com/300x200/667eea/ffffff?text=${pet.especie}'">
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
                ${isFound ? `• Encontrado em: ${pet.dataReencontro}` : ''}
            </div>
            ${actionsHtml}
        </div>
    `;
}

// === MODAL DO PET ===
function setupModalEvents() {
    const modal = document.getElementById('pet-modal');
    if (!modal) return;
    
    const closeBtn = modal.querySelector('.close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
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
            : `https://via.placeholder.com/400x300/667eea/ffffff?text=${pet.especie}`;
        
        detailsContainer.innerHTML = `
            <h2><i class="fas fa-paw"></i> ${pet.nome}</h2>
            <img src="${imageUrl}" alt="${pet.nome}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 0.5rem; margin: 1rem 0;">
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div><strong>Espécie:</strong> ${pet.especie}</div>
                <div><strong>Raça:</strong> ${pet.raca || 'Não informado'}</div>
                <div><strong>Gênero:</strong> ${pet.genero || 'Não informado'}</div>
                <div><strong>Idade:</strong> ${pet.idade || 'Não informado'}</div>
                <div><strong>Cor:</strong> ${pet.cor || 'Não informado'}</div>
                <div><strong>Status:</strong> <span class="pet-status ${pet.status.toLowerCase()}">${pet.status}</span></div>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <strong><i class="fas fa-map-marker-alt"></i> Local onde foi perdido:</strong>
                <p>${pet.localPerdido}</p>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <strong><i class="fas fa-calendar"></i> Data:</strong>
                <p>Perdido em: ${pet.dataPerdido}</p>
                ${pet.status === 'ENCONTRADO' ? `<p>Encontrado em: ${pet.dataReencontro}</p>` : ''}
            </div>
            
            <div style="margin-bottom: 1rem;">
                <strong><i class="fas fa-comment"></i> Observações do tutor:</strong>
                <p>${pet.comentarioTutor || 'Nenhuma observação'}</p>
            </div>
            
            ${currentUser && currentUser.id === pet.idTutor && pet.status === 'PERDIDO' ? `
                <button class="btn btn-primary" onclick="markAsFound(${pet.id}); document.getElementById('pet-modal').style.display='none';">
                    <i class="fas fa-check"></i> Marcar como Encontrado
                </button>
            ` : ''}
        `;
        
        modal.style.display = 'block';
    } catch (error) {
        console.error('Erro ao carregar detalhes do pet:', error);
        showNotification('Erro ao carregar detalhes do pet', 'error');
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
        
        // Recarregar dados
        await Promise.all([
            loadStats(),
            loadRecentPets(),
            loadFoundPets(),
            loadUserPets()
        ]);
        
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// ===== FUNCIONALIDADES DA PÁGINA INICIAL =====

// === SLIDESHOW ===
function initializeSlideshow() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.slide-dot');
    
    if (slides.length === 0 || dots.length === 0) return;
    
    showSlide(slideIndex);
    
    // Auto slideshow
    if (slideInterval) clearInterval(slideInterval);
    slideInterval = setInterval(() => {
        slideIndex++;
        showSlide(slideIndex);
    }, 4000);
}

function currentSlide(n) {
    if (slideInterval) clearInterval(slideInterval);
    showSlide(slideIndex = n);
    
    // Reinicia o auto slideshow após 10 segundos
    setTimeout(() => {
        slideInterval = setInterval(() => {
            slideIndex++;
            showSlide(slideIndex);
        }, 4000);
    }, 10000);
}

function showSlide(n) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.slide-dot');
    
    if (!slides.length || !dots.length) return;
    
    if (n > slides.length) { slideIndex = 1; }
    if (n < 1) { slideIndex = slides.length; }
    
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    if (slides[slideIndex - 1] && dots[slideIndex - 1]) {
        slides[slideIndex - 1].classList.add('active');
        dots[slideIndex - 1].classList.add('active');
    }
}

// === FORMULÁRIO DE CONTATO ===
function handleContactFormSubmit(e) {
    e.preventDefault();
    
    // Simular envio
    const submitBtn = document.querySelector('.submit-btn');
    if (!submitBtn) return;
    
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        showNotification('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
        e.target.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// === INTERSECTION OBSERVER PARA ANIMAÇÕES ===
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observar elementos para animação
    document.querySelectorAll('.tip-card, .product-card, .sponsor-logo').forEach(el => {
        observer.observe(el);
    });
}

// === EFEITO DE HOVER NAS IMAGENS DAS DICAS ===
function initializeTipCardEffects() {
    document.querySelectorAll('.tip-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            const images = card.querySelectorAll('.tip-img');
            images.forEach((img, index) => {
                setTimeout(() => {
                    img.style.transform = 'scale(1.1) rotate(2deg)';
                }, index * 100);
            });
        });

        card.addEventListener('mouseleave', () => {
            const images = card.querySelectorAll('.tip-img');
            images.forEach(img => {
                img.style.transform = 'scale(1) rotate(0deg)';
            });
        });
    });
}

// === PRODUTOS - EFEITOS INTERATIVOS ===
function initializeProductEffects() {
    document.querySelectorAll('.product-store').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const storeName = e.target.textContent;
            showNotification(`Redirecionando para ${storeName}...`, 'info');
            
            // Simular redirecionamento
            setTimeout(() => {
                showNotification('Em uma aplicação real, isso abriria a loja!', 'info');
            }, 1500);
        });
    });
}

// === PATROCINADORES - EFEITOS INTERATIVOS ===
function initializeSponsorEffects() {
    document.querySelectorAll('.sponsor-logo').forEach(logo => {
        logo.addEventListener('click', () => {
            const sponsorName = logo.textContent.trim();
            showNotification(`Visitando ${sponsorName}...`, 'info');
            
            // Simular visita ao patrocinador
            setTimeout(() => {
                showNotification('Em uma aplicação real, isso abriria o site do parceiro!', 'info');
            }, 1500);
        });
    });
}

// === LINKS SOCIAIS - INTERATIVIDADE ===
function initializeSocialEffects() {
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const platform = btn.classList[1]; // facebook, instagram, etc.
            showNotification(`Abrindo ${platform.charAt(0).toUpperCase() + platform.slice(1)}...`, 'info');
        });
    });
}

// === MÉTODOS DE CONTATO - INTERATIVIDADE ===
function initializeContactMethodEffects() {
    document.querySelectorAll('.contact-method').forEach(method => {
        method.addEventListener('click', (e) => {
            const href = method.getAttribute('href');
            
            if (href && href.startsWith('tel:')) {
                e.preventDefault();
                showNotification('Número copiado! Use seu telefone para ligar.', 'success');
                
                // Tentar copiar número para clipboard
                const phoneNumber = href.replace('tel:', '');
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(phoneNumber);
                }
            } else if (href && href.startsWith('mailto:')) {
                showNotification('Abrindo seu cliente de email...', 'info');
            } else if (href && href.includes('wa.me')) {
                showNotification('Abrindo WhatsApp...', 'info');
            }
        });
    });
}

// === INICIALIZAÇÃO DE TODAS AS FUNCIONALIDADES DA PÁGINA INICIAL ===
function initializeHomeFeatures() {
    // Aguardar um pouco para garantir que o DOM esteja pronto
    setTimeout(() => {
        initializeSlideshow();
        initializeAnimations();
        initializeTipCardEffects();
        initializeProductEffects();
        initializeSponsorEffects();
        initializeSocialEffects();
        initializeContactMethodEffects();
    }, 100);
}

// === SCROLL TO TOP ===
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// === UTILITÁRIOS ===
function formatDateForAPI(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="spinner"></div>';
    }
}

function showLogin() {
    showSection('login');
}

// === NOTIFICAÇÕES ===
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const messageEl = document.getElementById('notification-message');
    
    if (!notification || !messageEl) return;
    
    messageEl.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'flex';
    
    // Auto-hide após 5 segundos
    setTimeout(() => {
        hideNotification();
    }, 5000);
}

function hideNotification() {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.style.display = 'none';
    }
}

// === EXPOSURE PARA FUNÇÕES GLOBAIS ===
window.showPetModal = showPetModal;
window.markAsFound = markAsFound;
window.showLogin = showLogin;
window.currentSlide = currentSlide;
window.scrollToTop = scrollToTop;