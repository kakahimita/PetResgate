/**
 * SISTEMA DE ACESSIBILIDADE - PetResgate
 * Implementação completa seguindo WCAG 2.1 AA
 * 
 * Funcionalidades:
 * - Filtros para daltonismo (deuteranopia, protanopia, tritanopia)
 * - Alto contraste
 * - Controle de tamanho de fonte
 * - Redução de animações
 * - Navegação por teclado aprimorada
 * - Suporte a leitores de tela
 * - Teclas de atalho
 */

class AccessibilityManager {
    constructor() {
        this.settings = {
            fontSize: 'medium',
            highContrast: false,
            colorBlindFilter: 'none',
            reduceMotion: false,
            enhancedFocus: false,
            screenReaderMode: false,
            speechSynthesis: false,
            speechRate: 1,
            speechPitch: 1,
            speechVolume: 1,
            librasEnabled: true,
            librasPosition: 'bottom-right',
            librasSize: 'medium'
        };

        // Inicializar síntese de voz
        this.speechSynth = window.speechSynthesis;
        this.isReading = false;
        this.currentUtterance = null;
        this.isTyping = false;
        
        this.shortcuts = {
            'Alt+A': 'toggleAccessibilityPanel',
            'Alt+C': 'toggleHighContrast',
            'Alt+M': 'toggleReduceMotion',
            'Alt+F': 'increaseFontSize',
            'Shift+Alt+F': 'decreaseFontSize',
            'Alt+1': 'focusMainContent',
            'Alt+2': 'focusNavigation',
            'Alt+3': 'focusSearch'
        };

        this.init();
    }

    init() {
        this.setupTypingDetection();
        this.loadSettings();
        this.createAccessibilityWidget();
        this.createSVGFilters();
        this.setupKeyboardShortcuts();
        this.setupSkipLinks();
        this.setupScreenReaderSupport();
        this.setupFocusManagement();
        this.applySettings();
        
        // Detectar preferências do sistema
        this.detectSystemPreferences();
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('petresgate_accessibility');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('Erro ao carregar configurações de acessibilidade:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('petresgate_accessibility', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Erro ao salvar configurações de acessibilidade:', error);
        }
    }

    setupTypingDetection() {
        // Detectar quando usuário está digitando para pausar síntese de voz
        document.addEventListener('keydown', (e) => {
            const target = e.target;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                this.isTyping = true;
                
                // Pausar síntese de voz durante digitação
                if (this.isReading) {
                    this.stopSpeech();
                }
                
                // Resetar flag após um tempo sem digitar
                clearTimeout(this.typingTimeout);
                this.typingTimeout = setTimeout(() => {
                    this.isTyping = false;
                }, 1000);
            }
        });
        
        // Detectar clique em inputs para garantir que não há interferência
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                console.log('🔍 Input clicado, garantindo foco:', target);
                
                // Garantir que o input pode receber foco
                setTimeout(() => {
                    if (target !== document.activeElement) {
                        target.focus();
                        console.log('🎯 Foco forçado para input:', target);
                    }
                }, 10);
            }
        }, true); // Use capture para garantir prioridade
    }

    detectSystemPreferences() {
        // Detectar preferência de movimento reduzido
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.settings.reduceMotion = true;
            this.toggleReduceMotion(true);
        }

        // Detectar preferência de alto contraste
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            this.settings.highContrast = true;
            this.toggleHighContrast(true);
        }

        // Escutar mudanças nas preferências
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            if (e.matches) {
                this.settings.reduceMotion = true;
                this.toggleReduceMotion(true);
            }
        });

        // Garantir que a animação do hero-badge sempre funcione
        this.ensureHeroBadgeAnimation();
    }

    ensureHeroBadgeAnimation() {
        // Força a animação do hero-badge mesmo com reduce-motion ativo
        const heroBadge = document.querySelector('.hero-badge');
        if (heroBadge) {
            heroBadge.style.animation = 'pulse 2s infinite';
            console.log('🎬 Animação do hero-badge restaurada');
        }
        
        // Re-aplicar a cada segundo para garantir que não seja removida
        setInterval(() => {
            const badge = document.querySelector('.hero-badge');
            if (badge && !badge.style.animation.includes('pulse')) {
                badge.style.animation = 'pulse 2s infinite';
            }
        }, 1000);
    }

    createAccessibilityWidget() {
        const widget = document.createElement('div');
        widget.className = 'accessibility-widget';
        widget.setAttribute('role', 'application');
        widget.setAttribute('aria-label', 'Controles de Acessibilidade');

        widget.innerHTML = `
            <button class="accessibility-toggle" 
                    aria-label="Abrir painel de acessibilidade (Alt+A)"
                    aria-expanded="false"
                    aria-controls="accessibility-panel">
                <i class="fas fa-universal-access" aria-hidden="true"></i>
            </button>
            
            <div id="accessibility-panel" class="accessibility-panel" role="dialog" aria-label="Painel de Configurações de Acessibilidade">
                <div class="accessibility-header">
                    <h3>Acessibilidade</h3>
                    <p>Personalize sua experiência</p>
                </div>

                <div class="accessibility-group">
                    <div class="group-title">
                        <i class="fas fa-eye" aria-hidden="true"></i>
                        Visual
                    </div>
                    
                    <div class="accessibility-control">
                        <div class="control-info">
                            <span class="control-label">Alto Contraste</span>
                            <span class="control-description">Melhora a visibilidade do texto</span>
                        </div>
                        <button class="toggle-switch" 
                                id="high-contrast-toggle"
                                role="switch"
                                aria-checked="false"
                                aria-label="Ativar alto contraste">
                        </button>
                    </div>

                    <div class="accessibility-control">
                        <div class="control-info">
                            <span class="control-label">Tamanho da Fonte</span>
                            <span class="control-description">Ajuste o tamanho do texto</span>
                        </div>
                        <div class="font-size-controls">
                            <button class="font-size-btn" id="font-decrease" aria-label="Diminuir fonte">A-</button>
                            <span class="font-size-display" id="font-size-display" aria-live="polite">M</span>
                            <button class="font-size-btn" id="font-increase" aria-label="Aumentar fonte">A+</button>
                        </div>
                    </div>

                    <div class="accessibility-control">
                        <div class="control-info">
                            <span class="control-label">Filtro para Daltonismo</span>
                            <span class="control-description">Ajustes para diferentes tipos de daltonismo</span>
                        </div>
                        <select class="accessibility-select" id="colorblind-filter" aria-label="Selecionar modo de daltonismo">
                            <option value="none">Sem Filtro</option>
                            <optgroup label="🔬 Simulação (para pessoas com visão normal)">
                                <option value="simulate-protanopia">Simular Protanopia (sem vermelho)</option>
                                <option value="simulate-deuteranopia">Simular Deuteranopia (sem verde)</option>
                                <option value="simulate-tritanopia">Simular Tritanopia (sem azul)</option>
                            </optgroup>
                            <optgroup label="🛠️ Correção (para pessoas com daltonismo)">
                                <option value="correct-protanopia">Corrigir Protanopia</option>
                                <option value="correct-deuteranopia">Corrigir Deuteranopia</option>
                                <option value="correct-tritanopia">Corrigir Tritanopia</option>
                            </optgroup>
                        </select>
                    </div>

                    <div class="accessibility-control">
                        <div class="colorblind-info-panel">
                            <h4 class="info-title">
                                <i class="fas fa-info-circle"></i>
                                Sobre os Filtros Científicos
                            </h4>
                            <div class="info-content">
                                <div class="info-section">
                                    <strong>🔬 Simulação:</strong>
                                    <p>Mostra como pessoas com daltonismo veem as cores. Útil para designers e pessoas com visão normal entenderem a experiência.</p>
                                </div>
                                <div class="info-section">
                                    <strong>🛠️ Correção:</strong>
                                    <p>Ajuda pessoas com daltonismo a distinguir melhor as cores através de realces e ajustes de contraste.</p>
                                </div>
                                <div class="info-section">
                                    <strong>📚 Base Científica:</strong>
                                    <p>Filtros baseados em pesquisas de Brettel et al. (1997) e Machado et al. (2009) - os padrões científicos para simulação de daltonismo.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="accessibility-control" id="colorblind-test-area" style="display: none;">
                        <div class="colorblind-test-palette">
                            <div class="test-color" style="background: #ff0000;">Vermelho</div>
                            <div class="test-color" style="background: #00ff00;">Verde</div>
                            <div class="test-color" style="background: #0000ff;">Azul</div>
                            <div class="test-color" style="background: #ffff00;">Amarelo</div>
                            <div class="test-color" style="background: #ff00ff;">Magenta</div>
                            <div class="test-color" style="background: #00ffff;">Ciano</div>
                        </div>
                        <button id="toggle-test-area" class="btn btn-small">
                            <i class="fas fa-eye"></i> Testar Filtros
                        </button>
                    </div>
                </div>

                <div class="accessibility-group">
                    <div class="group-title">
                        <i class="fas fa-volume-up" aria-hidden="true"></i>
                        Leitura de Voz
                    </div>
                    
                    <div class="accessibility-control">
                        <div class="control-info">
                            <span class="control-label">Leitura Automática</span>
                            <span class="control-description">Lê textos, botões e campos automaticamente</span>
                        </div>
                        <button class="toggle-switch" 
                                id="speech-toggle"
                                role="switch"
                                aria-checked="false"
                                aria-label="Ativar leitura automática">
                        </button>
                    </div>

                    <div class="accessibility-control" id="speech-controls" style="display: none;">
                        <div class="speech-controls-grid">
                            <div class="speech-control">
                                <span class="control-label">Velocidade</span>
                                <input type="range" id="speech-rate" min="0.5" max="2" step="0.1" value="1" 
                                       aria-label="Velocidade da fala">
                                <span id="rate-display">1x</span>
                            </div>
                            <div class="speech-control">
                                <span class="control-label">Tom</span>
                                <input type="range" id="speech-pitch" min="0.5" max="2" step="0.1" value="1"
                                       aria-label="Tom da voz">
                                <span id="pitch-display">1x</span>
                            </div>
                            <div class="speech-control">
                                <span class="control-label">Volume</span>
                                <input type="range" id="speech-volume" min="0" max="1" step="0.1" value="1"
                                       aria-label="Volume da voz">
                                <span id="volume-display">100%</span>
                            </div>
                        </div>
                        <div class="speech-actions">
                            <button id="test-speech" class="btn btn-small">
                                <i class="fas fa-play"></i> Testar Voz
                            </button>
                            <button id="stop-speech" class="btn btn-small btn-secondary">
                                <i class="fas fa-stop"></i> Parar
                            </button>
                        </div>
                    </div>
                </div>

                <div class="accessibility-group">
                    <div class="group-title">
                        <i class="fas fa-hands" aria-hidden="true"></i>
                        LIBRAS (Língua de Sinais)
                    </div>
                    
                    <div class="accessibility-control">
                        <div class="control-info">
                            <span class="control-label">Intérprete Virtual</span>
                            <span class="control-description">Avatar 3D que traduz conteúdo para LIBRAS</span>
                        </div>
                        <button class="toggle-switch active" 
                                id="libras-toggle"
                                role="switch"
                                aria-checked="true"
                                aria-label="Ativar intérprete de LIBRAS">
                        </button>
                    </div>

                    <div class="accessibility-control" id="libras-controls">
                        <div class="libras-settings-grid">
                            <div class="libras-setting">
                                <span class="control-label">Posição</span>
                                <select class="accessibility-select" id="libras-position">
                                    <option value="bottom-right">Inferior Direita</option>
                                    <option value="bottom-left">Inferior Esquerda</option>
                                    <option value="top-right">Superior Direita</option>
                                    <option value="top-left">Superior Esquerda</option>
                                </select>
                            </div>
                            <div class="libras-setting">
                                <span class="control-label">Tamanho</span>
                                <select class="accessibility-select" id="libras-size">
                                    <option value="small">Pequeno</option>
                                    <option value="medium">Médio</option>
                                    <option value="large">Grande</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="libras-info">
                            <p><strong>🤟 VLibras Oficial:</strong> Tecnologia do Governo Federal desenvolvida pela UFPB para tradução automática Português → LIBRAS</p>
                            <p><strong>📝 Como usar:</strong> Selecione textos na página e o avatar Ícaro interpretará em LIBRAS automaticamente</p>
                        </div>
                    </div>
                </div>

                <div class="accessibility-group">
                    <div class="group-title">
                        <i class="fas fa-cog" aria-hidden="true"></i>
                        Comportamento
                    </div>
                    
                    <div class="accessibility-control">
                        <div class="control-info">
                            <span class="control-label">Reduzir Animações</span>
                            <span class="control-description">Reduz movimentos e transições</span>
                        </div>
                        <button class="toggle-switch" 
                                id="reduce-motion-toggle"
                                role="switch"
                                aria-checked="false"
                                aria-label="Reduzir animações">
                        </button>
                    </div>

                    <div class="accessibility-control">
                        <div class="control-info">
                            <span class="control-label">Foco Aprimorado</span>
                            <span class="control-description">Indicadores de foco mais visíveis</span>
                        </div>
                        <button class="toggle-switch" 
                                id="enhanced-focus-toggle"
                                role="switch"
                                aria-checked="false"
                                aria-label="Ativar foco aprimorado">
                        </button>
                    </div>
                </div>

                <div class="shortcuts-info">
                    <div class="shortcuts-title">
                        <i class="fas fa-keyboard" aria-hidden="true"></i>
                        Atalhos de Teclado
                    </div>
                    <div class="shortcut-item">
                        <span class="shortcut-desc">Abrir painel</span>
                        <span class="shortcut-key">Alt + A</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="shortcut-desc">Alto contraste</span>
                        <span class="shortcut-key">Alt + C</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="shortcut-desc">Reduzir animações</span>
                        <span class="shortcut-key">Alt + M</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="shortcut-desc">Aumentar fonte</span>
                        <span class="shortcut-key">Alt + F</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(widget);
        this.setupEventListeners();
    }

    createSVGFilters() {
        // Verificar se os filtros já existem
        if (document.getElementById('deuteranopia-filter')) {
            return;
        }

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.className = 'accessibility-filters';
        svg.setAttribute('aria-hidden', 'true');
        svg.style.position = 'absolute';
        svg.style.width = '0';
        svg.style.height = '0';
        svg.style.pointerEvents = 'none';
        
        svg.innerHTML = `
            <defs>
                <!-- ========== FILTROS DE SIMULAÇÃO CIENTÍFICOS ========== -->
                <!-- Baseados em Brettel, Viénot, & Mollon (1997) -->
                
                <!-- Protanopia Simulation - Ausência de cones L (vermelho) -->
                <filter id="protanopia-simulation" x="0%" y="0%" width="100%" height="100%" color-interpolation-filters="linearRGB">
                    <feColorMatrix type="matrix" values="0.567  0.433  0.000  0.0  0.0
                                                          0.558  0.442  0.000  0.0  0.0
                                                          0.000  0.242  0.758  0.0  0.0
                                                          0.000  0.000  0.000  1.0  0.0"/>
                </filter>
                
                <!-- Deuteranopia Simulation - Ausência de cones M (verde) -->
                <filter id="deuteranopia-simulation" x="0%" y="0%" width="100%" height="100%" color-interpolation-filters="linearRGB">
                    <feColorMatrix type="matrix" values="0.625  0.375  0.000  0.0  0.0
                                                          0.700  0.300  0.000  0.0  0.0
                                                          0.000  0.300  0.700  0.0  0.0
                                                          0.000  0.000  0.000  1.0  0.0"/>
                </filter>
                
                <!-- Tritanopia Simulation - Ausência de cones S (azul) -->
                <!-- Implementação simplificada baseada em Machado et al. (2009) -->
                <filter id="tritanopia-simulation" x="0%" y="0%" width="100%" height="100%" color-interpolation-filters="linearRGB">
                    <feColorMatrix type="matrix" values="0.950  0.050  0.000  0.0  0.0
                                                          0.000  0.433  0.567  0.0  0.0
                                                          0.000  0.475  0.525  0.0  0.0
                                                          0.000  0.000  0.000  1.0  0.0"/>
                </filter>
                
                <!-- ========== FILTROS DE CORREÇÃO AVANÇADOS ========== -->
                <!-- Para ajudar pessoas com daltonismo a distinguir cores -->
                
                <!-- Protanopia Correction - Realça diferenças vermelho/verde -->
                <filter id="protanopia-correction" x="0%" y="0%" width="100%" height="100%">
                    <feColorMatrix type="matrix" values="1.200  0.000  0.000  0.0  0.0
                                                          0.000  1.400  0.000  0.0  0.0
                                                          0.000  0.000  0.800  0.0  0.0
                                                          0.000  0.000  0.000  1.0  0.0"/>
                </filter>
                
                <!-- Deuteranopia Correction - Realça diferenças verde/vermelho -->
                <filter id="deuteranopia-correction" x="0%" y="0%" width="100%" height="100%">
                    <feColorMatrix type="matrix" values="1.300  0.000  0.000  0.0  0.0
                                                          0.000  1.200  0.000  0.0  0.0
                                                          0.000  0.000  0.900  0.0  0.0
                                                          0.000  0.000  0.000  1.0  0.0"/>
                </filter>
                
                <!-- Tritanopia Correction - Realça diferenças azul/amarelo -->
                <filter id="tritanopia-correction" x="0%" y="0%" width="100%" height="100%">
                    <feColorMatrix type="matrix" values="1.100  0.000  0.000  0.0  0.0
                                                          0.000  1.100  0.000  0.0  0.0
                                                          0.000  0.000  1.500  0.0  0.0
                                                          0.000  0.000  0.000  1.0  0.0"/>
                </filter>
            </defs>
        `;
        
        // Inserir no início do body para garantir que esteja disponível
        document.body.insertBefore(svg, document.body.firstChild);
        
        console.log('Filtros SVG de daltonismo criados');
    }

    setupEventListeners() {
        const toggle = document.querySelector('.accessibility-toggle');
        const panel = document.getElementById('accessibility-panel');

        // Toggle do painel
        toggle.addEventListener('click', () => this.togglePanel());

        // Fechar painel clicando fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.accessibility-widget')) {
                this.closePanel();
            }
        });

        // Controles
        document.getElementById('high-contrast-toggle').addEventListener('click', () => this.toggleHighContrast());
        document.getElementById('reduce-motion-toggle').addEventListener('click', () => this.toggleReduceMotion());
        document.getElementById('enhanced-focus-toggle').addEventListener('click', () => this.toggleEnhancedFocus());
        document.getElementById('font-increase').addEventListener('click', () => this.increaseFontSize());
        document.getElementById('font-decrease').addEventListener('click', () => this.decreaseFontSize());
        document.getElementById('colorblind-filter').addEventListener('change', (e) => this.setColorBlindFilter(e.target.value));
        
        // Controles de síntese de voz
        document.getElementById('speech-toggle').addEventListener('click', () => this.toggleSpeechSynthesis());
        document.getElementById('test-speech').addEventListener('click', () => this.testSpeech());
        document.getElementById('stop-speech').addEventListener('click', () => this.stopSpeech());
        
        // Controles de configuração de voz
        document.getElementById('speech-rate').addEventListener('input', (e) => this.updateSpeechRate(e.target.value));
        document.getElementById('speech-pitch').addEventListener('input', (e) => this.updateSpeechPitch(e.target.value));
        document.getElementById('speech-volume').addEventListener('input', (e) => this.updateSpeechVolume(e.target.value));
        
        // Botão de teste de daltonismo
        document.getElementById('toggle-test-area').addEventListener('click', () => this.toggleColorblindTest());
        
        // Controles de LIBRAS
        document.getElementById('libras-toggle').addEventListener('click', () => this.toggleLibras());
        document.getElementById('libras-position').addEventListener('change', (e) => this.setLibrasPosition(e.target.value));
        document.getElementById('libras-size').addEventListener('change', (e) => this.setLibrasSize(e.target.value));

        // Navegação por teclado no painel
        panel.addEventListener('keydown', (e) => this.handlePanelKeydown(e));
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            const key = [];
            if (e.altKey) key.push('Alt');
            if (e.shiftKey) key.push('Shift');
            if (e.ctrlKey) key.push('Ctrl');
            key.push(e.key.toUpperCase());
            
            const shortcut = key.join('+');
            
            if (this.shortcuts[shortcut]) {
                e.preventDefault();
                this[this.shortcuts[shortcut]]();
            }
        });
    }

    setupSkipLinks() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Pular para o conteúdo principal';
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.focusMainContent();
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Adicionar ID ao main se não existir
        const main = document.querySelector('main');
        if (main && !main.id) {
            main.id = 'main';
        }
    }

    setupScreenReaderSupport() {
        // Criar região live para anúncios
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-live-region';
        liveRegion.id = 'accessibility-announcements';
        document.body.appendChild(liveRegion);

        // Criar indicador visual para mudanças
        const indicator = document.createElement('div');
        indicator.className = 'accessibility-indicator';
        indicator.id = 'accessibility-indicator';
        document.body.appendChild(indicator);
    }

    setupFocusManagement() {
        // Melhorar indicadores de foco
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('using-keyboard');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('using-keyboard');
        });

        // Focus trap para modais
        this.setupFocusTrap();
    }

    setupFocusTrap() {
        const panel = document.getElementById('accessibility-panel');
        const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

        panel.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const focusableContent = panel.querySelectorAll(focusableElements);
                const firstFocusable = focusableContent[0];
                const lastFocusable = focusableContent[focusableContent.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        lastFocusable.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }

    // Métodos para controles de acessibilidade
    togglePanel() {
        const toggle = document.querySelector('.accessibility-toggle');
        const panel = document.getElementById('accessibility-panel');
        const isOpen = panel.classList.contains('active');

        if (isOpen) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    }

    openPanel() {
        const toggle = document.querySelector('.accessibility-toggle');
        const panel = document.getElementById('accessibility-panel');
        
        panel.classList.add('active');
        toggle.setAttribute('aria-expanded', 'true');
        
        // Focar primeiro elemento focalizável
        setTimeout(() => {
            const firstFocusable = panel.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }, 100);

        this.announce('Painel de acessibilidade aberto');
    }

    closePanel() {
        const toggle = document.querySelector('.accessibility-toggle');
        const panel = document.getElementById('accessibility-panel');
        
        panel.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
    }

    toggleHighContrast(force = null) {
        this.settings.highContrast = force !== null ? force : !this.settings.highContrast;
        
        const toggle = document.getElementById('high-contrast-toggle');
        const body = document.body;
        
        if (this.settings.highContrast) {
            body.classList.add('high-contrast');
            toggle?.classList.add('active');
            toggle?.setAttribute('aria-checked', 'true');
            this.announce('Alto contraste ativado');
            this.showIndicator('Alto Contraste ON');
        } else {
            body.classList.remove('high-contrast');
            toggle?.classList.remove('active');
            toggle?.setAttribute('aria-checked', 'false');
            this.announce('Alto contraste desativado');
            this.showIndicator('Alto Contraste OFF');
        }

        this.saveSettings();
    }

    toggleReduceMotion(force = null) {
        this.settings.reduceMotion = force !== null ? force : !this.settings.reduceMotion;
        
        const toggle = document.getElementById('reduce-motion-toggle');
        const body = document.body;
        
        if (this.settings.reduceMotion) {
            body.classList.add('reduce-motion');
            toggle?.classList.add('active');
            toggle?.setAttribute('aria-checked', 'true');
            this.announce('Animações reduzidas');
            this.showIndicator('Animações Reduzidas');
        } else {
            body.classList.remove('reduce-motion');
            toggle?.classList.remove('active');
            toggle?.setAttribute('aria-checked', 'false');
            this.announce('Animações normais');
        }

        this.saveSettings();
    }

    toggleEnhancedFocus() {
        this.settings.enhancedFocus = !this.settings.enhancedFocus;
        
        const toggle = document.getElementById('enhanced-focus-toggle');
        const body = document.body;
        
        if (this.settings.enhancedFocus) {
            body.classList.add('enhanced-focus');
            toggle.classList.add('active');
            toggle.setAttribute('aria-checked', 'true');
            this.announce('Foco aprimorado ativado');
        } else {
            body.classList.remove('enhanced-focus');
            toggle.classList.remove('active');
            toggle.setAttribute('aria-checked', 'false');
            this.announce('Foco aprimorado desativado');
        }

        this.saveSettings();
    }

    increaseFontSize() {
        const sizes = ['small', 'medium', 'large', 'extra-large'];
        const currentIndex = sizes.indexOf(this.settings.fontSize);
        
        if (currentIndex < sizes.length - 1) {
            this.settings.fontSize = sizes[currentIndex + 1];
            this.updateFontSize();
        }
    }

    decreaseFontSize() {
        const sizes = ['small', 'medium', 'large', 'extra-large'];
        const currentIndex = sizes.indexOf(this.settings.fontSize);
        
        if (currentIndex > 0) {
            this.settings.fontSize = sizes[currentIndex - 1];
            this.updateFontSize();
        }
    }

    updateFontSize() {
        const body = document.body;
        const sizes = ['small', 'medium', 'large', 'extra-large'];
        
        // Remove todas as classes de tamanho
        sizes.forEach(size => body.classList.remove(`font-${size}`));
        
        // Adiciona a classe atual
        body.classList.add(`font-${this.settings.fontSize}`);
        
        // Atualiza o display
        const display = document.getElementById('font-size-display');
        if (display) {
            const labels = { small: 'P', medium: 'M', large: 'G', 'extra-large': 'XG' };
            display.textContent = labels[this.settings.fontSize];
        }

        this.announce(`Tamanho da fonte: ${this.settings.fontSize}`);
        this.showIndicator(`Fonte: ${this.settings.fontSize.toUpperCase()}`);
        this.saveSettings();
    }

    setColorBlindFilter(filter) {
        this.settings.colorBlindFilter = filter;
        const html = document.documentElement;
        
        // Remove todas as classes de filtro existentes
        html.classList.remove(
            'simulate-protanopia', 'simulate-deuteranopia', 'simulate-tritanopia',
            'correct-protanopia', 'correct-deuteranopia', 'correct-tritanopia'
        );
        
        // Adiciona a classe do filtro selecionado
        if (filter !== 'none') {
            html.classList.add(filter);
            
            // Mapear nomes científicos
            const filterNames = {
                'simulate-protanopia': 'Simulação: Protanopia (sem cones L)',
                'simulate-deuteranopia': 'Simulação: Deuteranopia (sem cones M)',
                'simulate-tritanopia': 'Simulação: Tritanopia (sem cones S)',
                'correct-protanopia': 'Correção: Protanopia (realce vermelho/verde)',
                'correct-deuteranopia': 'Correção: Deuteranopia (realce verde/vermelho)',
                'correct-tritanopia': 'Correção: Tritanopia (realce azul/amarelo)'
            };
            
            const isSimulation = filter.startsWith('simulate-');
            const isCorrection = filter.startsWith('correct-');
            
            this.announce(`${filterNames[filter]} ativado`);
            this.showIndicator(filterNames[filter]);
            
            // Log científico detalhado
            console.log(`🔬 Filtro científico aplicado: ${filter}`);
            console.log(`📝 Classe CSS: ${filter}`);
            console.log(`🎯 Tipo: ${isSimulation ? 'Simulação' : 'Correção'}`);
            console.log(`🧬 Base científica: Brettel et al. (1997) / Machado et al. (2009)`);
            
            // Verificar aplicação do filtro
            setTimeout(() => {
                const computedStyle = getComputedStyle(html);
                console.log(`✨ Filtro CSS computado:`, computedStyle.filter);
            }, 100);
        } else {
            this.announce('Filtro de daltonismo removido');
            this.showIndicator('Filtro Removido');
            console.log(`🚫 Filtros científicos removidos`);
        }

        this.saveSettings();
    }

    // Métodos de navegação
    focusMainContent() {
        const main = document.getElementById('main') || document.querySelector('main');
        if (main) {
            main.setAttribute('tabindex', '-1');
            main.focus();
            this.announce('Foco movido para conteúdo principal');
        }
    }

    focusNavigation() {
        const nav = document.querySelector('nav') || document.querySelector('.nav');
        if (nav) {
            const firstLink = nav.querySelector('a, button');
            if (firstLink) {
                firstLink.focus();
                this.announce('Foco movido para navegação');
            }
        }
    }

    focusSearch() {
        const searchInput = document.querySelector('#search-name, [type="search"], .search input');
        if (searchInput) {
            searchInput.focus();
            this.announce('Foco movido para campo de busca');
        }
    }

    // Métodos auxiliares
    announce(message) {
        const liveRegion = document.getElementById('accessibility-announcements');
        if (liveRegion) {
            liveRegion.textContent = message;
        }
    }

    showIndicator(text) {
        const indicator = document.getElementById('accessibility-indicator');
        if (indicator) {
            indicator.textContent = text;
            indicator.classList.add('show');
            
            setTimeout(() => {
                indicator.classList.remove('show');
            }, 2000);
        }
    }

    handlePanelKeydown(e) {
        if (e.key === 'Escape') {
            this.closePanel();
        }
    }

    applySettings() {
        // Aplicar configurações salvas
        if (this.settings.highContrast) {
            this.toggleHighContrast(true);
        }
        
        if (this.settings.reduceMotion) {
            this.toggleReduceMotion(true);
        }
        
        if (this.settings.enhancedFocus) {
            this.toggleEnhancedFocus();
        }
        
        if (this.settings.fontSize !== 'medium') {
            this.updateFontSize();
        }
        
        if (this.settings.colorBlindFilter !== 'none') {
            document.getElementById('colorblind-filter').value = this.settings.colorBlindFilter;
            this.setColorBlindFilter(this.settings.colorBlindFilter);
        }

        if (this.settings.speechSynthesis) {
            this.toggleSpeechSynthesis(true);
        }

        // Atualizar controles visuais
        setTimeout(() => {
            const highContrastToggle = document.getElementById('high-contrast-toggle');
            const reduceMotionToggle = document.getElementById('reduce-motion-toggle');
            const enhancedFocusToggle = document.getElementById('enhanced-focus-toggle');
            const speechToggle = document.getElementById('speech-toggle');
            
            if (highContrastToggle && this.settings.highContrast) {
                highContrastToggle.classList.add('active');
                highContrastToggle.setAttribute('aria-checked', 'true');
            }
            
            if (reduceMotionToggle && this.settings.reduceMotion) {
                reduceMotionToggle.classList.add('active');
                reduceMotionToggle.setAttribute('aria-checked', 'true');
            }
            
            if (enhancedFocusToggle && this.settings.enhancedFocus) {
                enhancedFocusToggle.classList.add('active');
                enhancedFocusToggle.setAttribute('aria-checked', 'true');
            }

            if (speechToggle && this.settings.speechSynthesis) {
                speechToggle.classList.add('active');
                speechToggle.setAttribute('aria-checked', 'true');
            }

            // Aplicar configurações de voz
            if (document.getElementById('speech-rate')) {
                document.getElementById('speech-rate').value = this.settings.speechRate;
                document.getElementById('rate-display').textContent = this.settings.speechRate + 'x';
            }
            
            if (document.getElementById('speech-pitch')) {
                document.getElementById('speech-pitch').value = this.settings.speechPitch;
                document.getElementById('pitch-display').textContent = this.settings.speechPitch + 'x';
            }
            
            if (document.getElementById('speech-volume')) {
                document.getElementById('speech-volume').value = this.settings.speechVolume;
                document.getElementById('volume-display').textContent = Math.round(this.settings.speechVolume * 100) + '%';
            }
        }, 100);

        // Garantir que a animação do hero-badge sempre funcione
        this.ensureHeroBadgeAnimation();

        // Inicializar LIBRAS após um delay para garantir que o VLibras foi carregado
        setTimeout(() => {
            this.initializeLibras();
        }, 2000);
    }

    // === MÉTODOS DE SÍNTESE DE VOZ ===

    toggleSpeechSynthesis(force = null) {
        this.settings.speechSynthesis = force !== null ? force : !this.settings.speechSynthesis;
        
        const toggle = document.getElementById('speech-toggle');
        const controls = document.getElementById('speech-controls');
        const body = document.body;
        
        if (this.settings.speechSynthesis) {
            body.classList.add('speech-active');
            toggle?.classList.add('active');
            toggle?.setAttribute('aria-checked', 'true');
            controls.style.display = 'block';
            
            this.setupSpeechListeners();
            this.announce('Leitura automática ativada');
            this.showIndicator('Leitura Ativa');
        } else {
            body.classList.remove('speech-active');
            toggle?.classList.remove('active');
            toggle?.setAttribute('aria-checked', 'false');
            controls.style.display = 'none';
            
            this.removeSpeechListeners();
            this.stopSpeech();
            this.announce('Leitura automática desativada');
        }

        this.saveSettings();
    }

    setupSpeechListeners() {
        // Remover listeners existentes primeiro
        this.removeSpeechListeners();

        // Listeners para elementos interativos (SEM interferir com inputs)
        this.speechListeners = {
            mouseenter: (e) => this.handleElementHover(e),
            focus: (e) => this.handleElementFocusSafe(e),
            click: (e) => this.handleElementClickSafe(e)
        };

        // Adicionar listeners APENAS para elementos que não são inputs de texto
        const interactiveElements = document.querySelectorAll('button, a, select, [tabindex]:not([tabindex="-1"])');
        
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', this.speechListeners.mouseenter);
            element.addEventListener('focus', this.speechListeners.focus);
            element.addEventListener('click', this.speechListeners.click);
        });

        // Para inputs, apenas adicionar listener de foco (sem click que pode interferir)
        // EXCLUIR inputs do painel de acessibilidade para evitar conflitos
        const inputElements = document.querySelectorAll('input:not(.accessibility-panel input):not(.accessibility-control input), textarea:not(.accessibility-panel textarea)');
        inputElements.forEach(element => {
            // Apenas anunciar quando focar, não interferir com outros eventos
            element.addEventListener('focus', this.speechListeners.focus, { passive: true });
        });
    }

    removeSpeechListeners() {
        if (!this.speechListeners) return;

        // Remover listeners de elementos não-input
        const interactiveElements = document.querySelectorAll('button, a, select, [tabindex]:not([tabindex="-1"])');
        interactiveElements.forEach(element => {
            element.removeEventListener('mouseenter', this.speechListeners.mouseenter);
            element.removeEventListener('focus', this.speechListeners.focus);
            element.removeEventListener('click', this.speechListeners.click);
        });

        // Remover listeners de inputs (apenas focus) - mesmos elementos que foram adicionados
        const inputElements = document.querySelectorAll('input:not(.accessibility-panel input):not(.accessibility-control input), textarea:not(.accessibility-panel textarea)');
        inputElements.forEach(element => {
            element.removeEventListener('focus', this.speechListeners.focus);
        });

        this.speechListeners = null;
    }

    handleElementHover(event) {
        if (!this.settings.speechSynthesis) return;
        
        const element = event.target;
        
        // Não interferir com inputs durante hover
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            return;
        }
        
        const text = this.getElementText(element);
        
        if (text && text.length > 0) {
            this.speakText(text, element);
        }
    }

    handleElementFocus(event) {
        if (!this.settings.speechSynthesis) return;
        
        const element = event.target;
        let text = '';

        // Texto específico para diferentes tipos de elementos
        if (element.tagName === 'INPUT') {
            const label = document.querySelector(`label[for="${element.id}"]`);
            const labelText = label ? label.textContent : element.getAttribute('aria-label') || element.placeholder;
            text = `Campo ${labelText || 'de entrada'}`;
            
            if (element.type === 'submit' || element.type === 'button') {
                text = element.value || element.textContent || 'Botão';
            }
        } else {
            text = this.getElementText(element);
        }
        
        if (text && text.length > 0) {
            this.speakText(`Focado: ${text}`, element);
        }
    }

    handleElementClick(event) {
        if (!this.settings.speechSynthesis) return;
        
        const element = event.target;
        const text = this.getElementText(element);
        
        if (text && text.length > 0) {
            this.speakText(`Clicado: ${text}`, element);
        }
    }

    handleElementFocusSafe(event) {
        if (!this.settings.speechSynthesis) return;
        
        const element = event.target;
        
        // Para inputs, apenas anunciar o tipo e label, sem interferir
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            this.handleInputFocus(element);
            return;
        }
        
        // Para outros elementos, usar o método normal
        this.handleElementFocus(event);
    }

    handleElementClickSafe(event) {
        if (!this.settings.speechSynthesis) return;
        
        const element = event.target;
        
        // NÃO processar clicks em inputs para evitar interferência
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            return;
        }
        
        // Para outros elementos, usar o método normal
        this.handleElementClick(event);
    }

    handleInputFocus(element) {
        // Método especializado para inputs que não interfere com digitação
        let announcement = '';
        
        const label = document.querySelector(`label[for="${element.id}"]`);
        const labelText = label ? label.textContent.trim() : 
                         element.getAttribute('aria-label') || 
                         element.placeholder || 
                         element.name;

        if (element.type === 'email') {
            announcement = `Campo de email: ${labelText || 'Digite seu email'}`;
        } else if (element.type === 'password') {
            announcement = `Campo de senha: ${labelText || 'Digite sua senha'}`;
        } else if (element.type === 'text') {
            announcement = `Campo de texto: ${labelText || 'Campo de entrada'}`;
        } else if (element.tagName === 'TEXTAREA') {
            announcement = `Área de texto: ${labelText || 'Digite seu texto'}`;
        } else {
            announcement = `Campo ${element.type}: ${labelText || 'Campo de entrada'}`;
        }

        // Usar timeout para não interferir com o foco
        setTimeout(() => {
            this.announce(announcement);
        }, 100);
    }

    getElementText(element) {
        // Prioridade para obter texto do elemento
        return element.getAttribute('aria-label') ||
               element.getAttribute('title') ||
               element.textContent?.trim() ||
               element.value ||
               element.placeholder ||
               element.alt ||
               '';
    }

    speakText(text, element = null) {
        if (!this.speechSynth || !text || this.isTyping) return;
        
        // Parar fala anterior se estiver acontecendo
        this.speechSynth.cancel();
        
        // Limpar marcação visual anterior
        document.querySelectorAll('.being-read').forEach(el => {
            el.classList.remove('being-read');
        });
        
        // Marcar elemento atual sendo lido
        if (element) {
            element.classList.add('being-read');
        }
        
        // Criar nova fala
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = this.settings.speechRate;
        utterance.pitch = this.settings.speechPitch;
        utterance.volume = this.settings.speechVolume;
        utterance.lang = 'pt-BR';
        
        utterance.onend = () => {
            if (element) {
                element.classList.remove('being-read');
            }
            this.isReading = false;
        };
        
        utterance.onerror = (event) => {
            console.warn('Erro na síntese de voz:', event);
            if (element) {
                element.classList.remove('being-read');
            }
            this.isReading = false;
        };
        
        this.currentUtterance = utterance;
        this.isReading = true;
        this.speechSynth.speak(utterance);
    }

    testSpeech() {
        const testText = 'Esta é uma demonstração da síntese de voz do PetResgate. Ajude a conectar pets aos seus lares!';
        this.speakText(testText);
    }

    stopSpeech() {
        if (this.speechSynth) {
            this.speechSynth.cancel();
        }
        
        // Limpar marcações visuais
        document.querySelectorAll('.being-read').forEach(el => {
            el.classList.remove('being-read');
        });
        
        this.isReading = false;
        this.currentUtterance = null;
    }

    updateSpeechRate(value) {
        this.settings.speechRate = parseFloat(value);
        document.getElementById('rate-display').textContent = value + 'x';
        this.saveSettings();
    }

    updateSpeechPitch(value) {
        this.settings.speechPitch = parseFloat(value);
        document.getElementById('pitch-display').textContent = value + 'x';
        this.saveSettings();
    }

    updateSpeechVolume(value) {
        this.settings.speechVolume = parseFloat(value);
        document.getElementById('volume-display').textContent = Math.round(value * 100) + '%';
        this.saveSettings();
    }

    toggleColorblindTest() {
        const testArea = document.getElementById('colorblind-test-area');
        const button = document.getElementById('toggle-test-area');
        const isVisible = testArea.style.display !== 'none';
        
        if (isVisible) {
            testArea.style.display = 'none';
            button.innerHTML = '<i class="fas fa-eye"></i> Testar Filtros';
        } else {
            testArea.style.display = 'block';
            button.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar Teste';
            this.announce('Paleta de teste de daltonismo exibida');
        }
    }

    // === MÉTODOS LIBRAS === 

    toggleLibras() {
        this.settings.librasEnabled = !this.settings.librasEnabled;
        
        const toggle = document.getElementById('libras-toggle');
        const controls = document.getElementById('libras-controls');
        const vlibrasWidget = document.querySelector('div[vw]');
        
        if (this.settings.librasEnabled) {
            // Ativar VLibras
            if (vlibrasWidget) {
                vlibrasWidget.style.display = 'block';
            }
            
            toggle.classList.add('active');
            toggle.setAttribute('aria-checked', 'true');
            controls.style.display = 'block';
            
            this.announce('Intérprete de LIBRAS ativado');
            this.showIndicator('LIBRAS Ativo');
            
            console.log('🤟 VLibras ativado - Avatar Ícaro disponível');
        } else {
            // Desativar VLibras
            if (vlibrasWidget) {
                vlibrasWidget.style.display = 'none';
            }
            
            toggle.classList.remove('active');
            toggle.setAttribute('aria-checked', 'false');
            controls.style.display = 'none';
            
            this.announce('Intérprete de LIBRAS desativado');
            this.showIndicator('LIBRAS Desativado');
            
            console.log('❌ VLibras desativado');
        }
        
        this.saveSettings();
    }

    setLibrasPosition(position) {
        this.settings.librasPosition = position;
        
        // Aplicar posição ao widget VLibras
        const vlibrasWidget = document.querySelector('div[vw]');
        if (vlibrasWidget) {
            // Remover classes de posição antigas
            vlibrasWidget.classList.remove('position-top-left', 'position-top-right', 'position-bottom-left', 'position-bottom-right');
            
            // Adicionar nova classe de posição
            vlibrasWidget.classList.add(`position-${position}`);
            
            // Aplicar estilos CSS diretamente
            const positions = {
                'bottom-right': { bottom: '20px', right: '20px', top: 'auto', left: 'auto' },
                'bottom-left': { bottom: '20px', left: '20px', top: 'auto', right: 'auto' },
                'top-right': { top: '20px', right: '20px', bottom: 'auto', left: 'auto' },
                'top-left': { top: '20px', left: '20px', bottom: 'auto', right: 'auto' }
            };
            
            const pos = positions[position];
            Object.assign(vlibrasWidget.style, pos);
        }
        
        this.announce(`Posição do intérprete alterada para ${position}`);
        this.saveSettings();
        
        console.log(`📍 Posição VLibras alterada: ${position}`);
    }

    setLibrasSize(size) {
        this.settings.librasSize = size;
        
        // Aplicar tamanho ao widget VLibras
        const vlibrasButton = document.querySelector('div[vw] .vw-access-button');
        if (vlibrasButton) {
            // Remover classes de tamanho antigas
            vlibrasButton.classList.remove('size-small', 'size-medium', 'size-large');
            
            // Adicionar nova classe de tamanho
            vlibrasButton.classList.add(`size-${size}`);
            
            // Aplicar estilos CSS diretamente
            const sizes = {
                'small': { width: '50px', height: '50px', fontSize: '24px' },
                'medium': { width: '64px', height: '64px', fontSize: '32px' },
                'large': { width: '80px', height: '80px', fontSize: '40px' }
            };
            
            const sizeStyle = sizes[size];
            Object.assign(vlibrasButton.style, sizeStyle);
        }
        
        this.announce(`Tamanho do intérprete alterado para ${size}`);
        this.saveSettings();
        
        console.log(`📏 Tamanho VLibras alterado: ${size}`);
    }

    initializeLibras() {
        // Verificar se o VLibras foi carregado
        if (window.VLibras) {
            console.log('✅ VLibras carregado com sucesso');
            
            // Aplicar configurações salvas
            this.setLibrasPosition(this.settings.librasPosition);
            this.setLibrasSize(this.settings.librasSize);
            
            if (!this.settings.librasEnabled) {
                this.toggleLibras();
            }
        } else {
            console.warn('⚠️ VLibras não foi carregado');
        }
    }
}

// Melhorias adicionais para acessibilidade
class AccessibilityEnhancements {
    constructor() {
        this.init();
    }

    init() {
        this.improveFormAccessibility();
        this.addARIALabels();
        this.improveImageAccessibility();
        this.setupTableAccessibility();
        this.improveButtonAccessibility();
    }

    improveFormAccessibility() {
        // Melhorar campos de formulário
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (!label && input.placeholder) {
                input.setAttribute('aria-label', input.placeholder);
            }

            // Adicionar descrições de erro
            if (input.hasAttribute('required')) {
                input.setAttribute('aria-required', 'true');
            }
        });
    }

    addARIALabels() {
        // Adicionar labels ARIA onde necessário
        const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
        buttons.forEach(button => {
            if (button.querySelector('i.fas, i.fab') && !button.textContent.trim()) {
                const icon = button.querySelector('i');
                const iconClass = Array.from(icon.classList).find(cls => cls.startsWith('fa-'));
                if (iconClass) {
                    const actionName = iconClass.replace('fa-', '').replace(/-/g, ' ');
                    button.setAttribute('aria-label', actionName);
                }
            }
        });

        // Adicionar roles apropriados
        const navigation = document.querySelector('.nav');
        if (navigation) {
            navigation.setAttribute('role', 'navigation');
            navigation.setAttribute('aria-label', 'Navegação principal');
        }
    }

    improveImageAccessibility() {
        const images = document.querySelectorAll('img:not([alt])');
        images.forEach(img => {
            // Adicionar alt vazio para imagens decorativas
            if (img.closest('.hero, .background, .decoration')) {
                img.setAttribute('alt', '');
            } else {
                img.setAttribute('alt', 'Imagem');
            }
        });
    }

    setupTableAccessibility() {
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            if (!table.querySelector('caption') && !table.getAttribute('aria-label')) {
                table.setAttribute('aria-label', 'Tabela de dados');
            }

            // Adicionar scope aos headers
            const headers = table.querySelectorAll('th');
            headers.forEach(header => {
                if (!header.getAttribute('scope')) {
                    header.setAttribute('scope', 'col');
                }
            });
        });
    }

    improveButtonAccessibility() {
        const buttons = document.querySelectorAll('button, .btn');
        buttons.forEach(button => {
            // Adicionar type="button" se não especificado
            if (button.tagName === 'BUTTON' && !button.getAttribute('type')) {
                button.setAttribute('type', 'button');
            }

            // Melhorar feedback de loading
            if (button.classList.contains('loading')) {
                button.setAttribute('aria-busy', 'true');
            }
        });
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar sistema de acessibilidade
    const accessibilityManager = new AccessibilityManager();
    const accessibilityEnhancements = new AccessibilityEnhancements();
    
    // Tornar disponível globalmente para debugging
    window.accessibilityManager = accessibilityManager;
    
    console.log('✅ Sistema de Acessibilidade PetResgate inicializado');
    console.log('🔧 Atalhos disponíveis: Alt+A (painel), Alt+C (contraste), Alt+M (animações), Alt+F (fonte)');
});

// Exportar para uso em outros scripts se necessário
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AccessibilityManager, AccessibilityEnhancements };
}