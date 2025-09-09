# 🌟 Guia de Acessibilidade - PetResgate

Este documento descreve as funcionalidades de acessibilidade implementadas no PetResgate, seguindo as diretrizes **WCAG 2.1 AA**.

## 📋 Índice
- [Funcionalidades Implementadas](#funcionalidades-implementadas)
- [Como Usar](#como-usar)
- [Atalhos de Teclado](#atalhos-de-teclado)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Diretrizes Seguidas](#diretrizes-seguidas)
- [Testes de Acessibilidade](#testes-de-acessibilidade)
- [Suporte e Feedback](#suporte-e-feedback)

## 🚀 Funcionalidades Implementadas

### 1. **Botão Flutuante de Acessibilidade**
- **Localização**: Canto superior direito da tela
- **Função**: Acesso rápido a todas as configurações de acessibilidade
- **Atalho**: `Alt + A`
- **Visual**: Ícone de acessibilidade universal com efeitos visuais

### 2. **Filtros para Daltonismo**
Suporte completo para diferentes tipos de daltonismo:
- **Deuteranopia** (dificuldade com verde)
- **Protanopia** (dificuldade com vermelho)  
- **Tritanopia** (dificuldade com azul)

#### Como funciona:
- Filtros baseados em matrizes de transformação SVG
- Aplicação em tempo real
- Persistência das configurações no navegador

### 3. **Sistema de Alto Contraste**
- **Função**: Melhora a visibilidade do texto e elementos
- **Atalho**: `Alt + C`
- **Efeitos**: 
  - Contraste aumentado para 150%
  - Brilho ajustado para 120%
  - Cores simplificadas (preto/branco/amarelo)
  - Remoção de efeitos visuais desnecessários

### 4. **Controle de Tamanho de Fonte**
Quatro níveis de tamanho:
- **Pequeno** (14px) - `P`
- **Médio** (16px) - `M` (padrão)
- **Grande** (18px) - `G` 
- **Extra Grande** (22px) - `XG`

#### Controles:
- **Aumentar**: `Alt + F` ou botão `A+`
- **Diminuir**: `Shift + Alt + F` ou botão `A-`

### 5. **Redução de Animações**
- **Função**: Pausa/reduz animações para usuários sensíveis
- **Atalho**: `Alt + M`
- **Benefícios**: Previne desconforto visual e epilepsia fotossensível
- **Detecção automática**: Respeita `prefers-reduced-motion` do sistema

### 6. **Navegação por Teclado Aprimorada**

#### Skip Links:
- **"Pular para conteúdo principal"** - Aparece ao pressionar `Tab`

#### Atalhos de navegação:
- `Alt + 1`: Focar conteúdo principal
- `Alt + 2`: Focar navegação
- `Alt + 3`: Focar campo de busca

#### Melhorias:
- Focus trap em modais e painéis
- Indicadores de foco visualmente aprimorados
- Navegação lógica entre elementos

### 7. **Suporte a Leitores de Tela**

#### Estrutura Semântica:
- **Landmarks** ARIA apropriados
- **Roles** semânticos corretos
- **Labels** e descrições completas

#### Recursos ARIA:
- `aria-label`, `aria-labelledby`, `aria-describedby`
- `aria-expanded`, `aria-checked` para estados
- `aria-live` para anúncios dinâmicos
- `aria-hidden` para elementos decorativos

#### Live Regions:
- Anúncios de mudanças de estado
- Feedback de ações do usuário
- Notificações não visuais

### 8. **Síntese de Voz (Novo!)**
- **Função**: Leitura automática de elementos da interface
- **Ativação**: Toggle no painel de acessibilidade
- **Recursos**:
  - Lê textos ao passar o mouse ou focar elementos
  - Controles de velocidade, tom e volume
  - Identificação de tipos de elementos (botões, campos, links)
  - Feedback visual durante a leitura (destaque amarelo)
  - Botão de teste e parada da voz

#### Configurações de Voz:
- **Velocidade**: 0.5x até 2x (padrão: 1x)
- **Tom**: 0.5x até 2x (padrão: 1x)  
- **Volume**: 0% até 100% (padrão: 100%)
- **Idioma**: Português brasileiro (pt-BR)

### 9. **Foco Aprimorado**
- **Função**: Indicadores de foco mais visíveis
- **Visual**: Contorno azul de 3px com sombra
- **Contexto**: Melhora a navegação por teclado

## 🎯 Como Usar

### Acesso Rápido
1. **Clique** no botão de acessibilidade (canto superior direito)
2. **Ou pressione** `Alt + A` em qualquer lugar da página

### Painel de Controle
O painel é organizado em duas seções principais:

#### **Visual** 👁️
- Alto Contraste (toggle) - Cores harmoniosas com o tema do site
- Tamanho da Fonte (botões +/-)
- Filtros para Daltonismo (dropdown) - Corrigidos e funcionando

#### **Leitura de Voz** 🔊
- Leitura Automática (toggle)
- Velocidade da Fala (slider)
- Tom de Voz (slider)
- Volume (slider)
- Botões: Testar Voz / Parar

#### **Comportamento** ⚙️
- Reduzir Animações (toggle)
- Foco Aprimorado (toggle)

### Salvamento Automático
- Todas as configurações são salvas automaticamente
- Persistem entre sessões do navegador
- Aplicadas imediatamente

## ⌨️ Atalhos de Teclado

| Atalho | Função |
|--------|--------|
| `Alt + A` | Abrir/fechar painel de acessibilidade |
| `Alt + C` | Alternar alto contraste |
| `Alt + M` | Alternar redução de animações |
| `Alt + F` | Aumentar tamanho da fonte |
| `Shift + Alt + F` | Diminuir tamanho da fonte |
| `Alt + 1` | Focar conteúdo principal |
| `Alt + 2` | Focar navegação principal |
| `Alt + 3` | Focar campo de busca |
| `Esc` | Fechar painéis/modais |
| `Tab` | Navegar pelos elementos |
| `Shift + Tab` | Navegar para trás |

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **HTML5 Semântico** com roles ARIA
- **CSS3** com media queries de acessibilidade
- **JavaScript ES6+** para interatividade

### **Filtros SVG**
- Matrizes de transformação de cor personalizadas
- Implementação baseada em pesquisa científica
- Performance otimizada

### **Detecção de Preferências**
- `prefers-reduced-motion`
- `prefers-contrast`
- `prefers-color-scheme`

### **Persistência**
- `localStorage` para configurações
- Fallback gracioso para erros

## 📏 Diretrizes Seguidas

### **WCAG 2.1 AA Compliance**

#### **Perceptível**
- ✅ 1.1.1 - Conteúdo não textual (alt text)
- ✅ 1.2.1 - Conteúdo apenas áudio/vídeo
- ✅ 1.3.1 - Informações e relacionamentos
- ✅ 1.3.2 - Sequência com significado
- ✅ 1.4.1 - Uso de cor
- ✅ 1.4.3 - Contraste (mínimo)
- ✅ 1.4.4 - Redimensionar texto
- ✅ 1.4.10 - Refluxo (responsividade)
- ✅ 1.4.11 - Contraste de componentes não textuais

#### **Operável**
- ✅ 2.1.1 - Funcionalidade do teclado
- ✅ 2.1.2 - Sem armadilha de teclado
- ✅ 2.2.2 - Pausar, parar, ocultar
- ✅ 2.3.1 - Três flashes ou abaixo do limite
- ✅ 2.4.1 - Pular blocos
- ✅ 2.4.2 - Página com título
- ✅ 2.4.3 - Ordem de foco
- ✅ 2.4.6 - Cabeçalhos e rótulos
- ✅ 2.4.7 - Foco visível

#### **Compreensível**
- ✅ 3.1.1 - Idioma da página
- ✅ 3.2.1 - No foco
- ✅ 3.2.2 - Na entrada
- ✅ 3.3.1 - Identificação de erro
- ✅ 3.3.2 - Rótulos ou instruções

#### **Robusto**
- ✅ 4.1.1 - Análise
- ✅ 4.1.2 - Nome, função, valor
- ✅ 4.1.3 - Mensagens de status

## 🧪 Testes de Acessibilidade

### **Ferramentas Recomendadas**

#### **Navegadores e Extensions**
- **Chrome**: axe DevTools, WAVE, Lighthouse
- **Firefox**: Firefox Accessibility Inspector
- **Edge**: Accessibility Insights

#### **Leitores de Tela**
- **NVDA** (Windows) - Gratuito
- **JAWS** (Windows) - Pago
- **VoiceOver** (macOS/iOS) - Nativo
- **TalkBack** (Android) - Nativo
- **Orca** (Linux) - Gratuito

#### **Testes de Teclado**
1. Desconecte o mouse
2. Use apenas `Tab`, `Shift+Tab`, `Enter`, `Space`, `Esc`
3. Verifique se todos os elementos são acessíveis
4. Confirme que o foco está sempre visível

#### **Testes de Contraste**
- **WebAIM**: Colour Contrast Analyser
- **Paciello Group**: Colour Contrast Analyser
- **Chrome DevTools**: Contrast ratio

### **Checklist de Testes**

#### ✅ **Visual**
- [ ] Alto contraste funciona corretamente
- [ ] Fontes redimensionam proporcionalmente
- [ ] Filtros de daltonismo aplicam corretamente
- [ ] Foco está sempre visível
- [ ] Cores não são a única forma de transmitir informação

#### ✅ **Navegação**
- [ ] Todos os elementos são acessíveis por teclado
- [ ] Ordem de foco é lógica
- [ ] Skip links funcionam
- [ ] Atalhos de teclado respondem
- [ ] Modais fazem focus trap corretamente

#### ✅ **Screen Readers**
- [ ] Conteúdo é lido na ordem correta
- [ ] Links têm descrições significativas
- [ ] Botões têm labels apropriados
- [ ] Estados são anunciados (expandido/contraído)
- [ ] Erros são comunicados claramente

#### ✅ **Responsividade**
- [ ] Funciona em dispositivos móveis
- [ ] Painel se adapta a telas pequenas
- [ ] Touch targets são suficientemente grandes (44px mínimo)

## 🎨 Personalização Adicional

### **Para Desenvolvedores**

#### **Adicionar Novos Filtros**
```css
/* Exemplo: Filtro personalizado */
body.colorblind-custom .colorblind-filters {
  filter: url('#custom-filter');
}
```

#### **Customizar Cores do Alto Contraste**
```css
body.high-contrast .custom-element {
  background: #000 !important;
  color: #fff !important;
  border: 2px solid #fff !important;
}
```

#### **Eventos JavaScript**
```javascript
// Escutar mudanças de acessibilidade
document.addEventListener('accessibilityChange', (event) => {
  console.log('Configuração alterada:', event.detail);
});
```

## 🔧 APIs Disponíveis

### **Programática**
```javascript
// Acessar o gerenciador globalmente
const accessibility = window.accessibilityManager;

// Métodos disponíveis
accessibility.toggleHighContrast();
accessibility.setColorBlindFilter('deuteranopia');
accessibility.increaseFontSize();
accessibility.announce('Mensagem personalizada');
```

## 🐛 Problemas Conhecidos e Limitações

### **Limitações Técnicas**
- **Filtros SVG**: Podem afetar a performance em dispositivos muito antigos
- **localStorage**: Não funciona em modo privado de alguns navegadores
- **CSS Filters**: Suporte limitado no IE11

### **Workarounds**
- Fallbacks para navegadores antigos
- Detecção de suporte antes de aplicar filtros
- Configurações resetam se localStorage falhar

## 📱 Suporte Mobile

### **Funcionalidades Otimizadas**
- **Touch targets** com tamanho mínimo de 44px
- **Painel responsivo** que ocupa tela inteira em dispositivos pequenos
- **Gestos acessíveis** compatíveis com assistiva
- **Zoom** suportado até 200% sem quebras de layout

### **Testes Mobile**
- **iOS VoiceOver**: Navegação por gestos
- **Android TalkBack**: Compatibilidade completa
- **Switch Navigation**: Suporte para controle por switch

## 📞 Suporte e Feedback

### **Como Reportar Problemas**
1. **Descreva** o problema específico
2. **Inclua** seu navegador e versão
3. **Mencione** tecnologias assistivas usadas
4. **Forneça** passos para reproduzir

### **Canais de Suporte**
- **Email**: acessibilidade@petresgate.com
- **Issue Tracker**: GitHub Issues
- **Feedback direto**: Formulário na aplicação

### **Contribuições**
Contribuições para melhorar a acessibilidade são bem-vindas!
- Fork do projeto
- Implemente melhorias
- Teste com usuários reais
- Submeta Pull Request com documentação

## 🏆 Reconhecimentos

Este sistema de acessibilidade foi desenvolvido com base em:
- **W3C Web Accessibility Initiative**
- **WebAIM Guidelines**
- **Inclusive Design Principles**
- **Real user feedback**

## 📚 Recursos Adicionais

### **Documentação**
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices/)
- [WebAIM Articles](https://webaim.org/articles/)

### **Treinamento**
- [Accessibility Fundamentals](https://www.w3.org/WAI/fundamentals/)
- [Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [Color Accessibility](https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html)

---

**Versão**: 1.0.0  
**Última atualização**: 09/09/2025  
**Conformidade**: WCAG 2.1 AA  

*💙 Desenvolvido com amor e inclusão para todos os usuários do PetResgate*