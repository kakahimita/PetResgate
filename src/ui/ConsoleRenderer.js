// src/ui/ConsoleRenderer.js
import readlineSync from "readline-sync"; // Pode ser necessário para pausas ou interações dentro da renderização

class ConsoleRenderer {
    constructor(petService, authService) {
      this.petService = petService;
      this.authService = authService;
      this.versaoApp = "1.0.0"; // Centralizar a versão
      this.larguraPadrao = 56; // Definir uma largura padrão para os elementos
      
      // Configuração da Logo - agora modularizada e configurável
      this.logoLines = [
        "_____       _   _____        ",
        "|  __ \\     | | |  __ \\       ",
        "| |__) |____| |_| |__) |___  ___  ___ _ ",
        "|  ___/  _ \\ __|  _  // _ \\/ __|/ _ \\ |",
        "| |    |  __/ |_| | \\ \\  __/\\__ \\ (_) |",
        "|_|     \\___|\\__|_|  \\_\\___||___/\\___/"
      ];
    }
  
    limparConsole() {
      console.clear();
    }
  
    pausar() {
      readlineSync.keyInPause("\nPressione qualquer tecla para continuar...");
    }
  
    centralizarTexto(texto, largura) {
      const textoLimpo = texto.replace(/(\x1B\[[0-9;]*[mGKH])/g, ''); // Remove códigos ANSI para cálculo de tamanho
      const espacos = largura - textoLimpo.length;
      if (espacos <= 0) return texto; // Se o texto já for maior ou igual à largura
      const espacosEsquerda = Math.floor(espacos / 2);
      const espacosDireita = espacos - espacosEsquerda;
      return " ".repeat(espacosEsquerda) + texto + " ".repeat(espacosDireita);
    }
  
    desenharLinha(caractere = "═", largura = this.larguraPadrao) {
      return caractere.repeat(largura);
    }
  
    // Helper para desenhar a logo e versão, para reuso
    _desenharLogoEVersao(largura) {
      // Desenha a borda superior fixa
      console.log(`╔${this.desenharLinha("═", largura - 2)}╗`);
      
      // Desenha a logo de forma modular e configurável
      for (const linha of this.logoLines) {
        console.log(`║${this.centralizarTexto(linha, largura - 2)}║`);
      }
      
      // Adiciona espaço e versão
      console.log(`║${" ".repeat(largura - 2)}║`);
      console.log(`║${this.centralizarTexto(`versão: ${this.versaoApp}`, largura - 2)}║`);
    }
    
    // Método para atualizar a logo do aplicativo
    atualizarLogo(novasLinhas) {
      if (Array.isArray(novasLinhas) && novasLinhas.length > 0) {
        this.logoLines = novasLinhas;
      }
    }
  
    // Método útil para carregar uma logo predefinida
    carregarLogoPredefinida(nome) {
      const logos = {
        "default": [
          "_____       _   _____        ",
          "|  __ \\     | | |  __ \\       ",
          "| |__) |____| |_| |__) |___  ___  ___ _ ",
          "|  ___/  _ \\ __|  _  // _ \\/ __|/ _ \\ |",
          "| |    |  __/ |_| | \\ \\  __/\\__ \\ (_) |",
          "|_|     \\___|\\__|_|  \\_\\___||___/\\___/"
        ],
        "simples": [
          "╭─────────────────────────╮",
          "│     P E T R E S G A T E │",
          "│        🐾   🐶   🐱      │",
          "╰─────────────────────────╯"
        ],
        "mini": [
          "╭──── PetResgate ────╮",
          "│      🐾   🐶 🐱     │",
          "╰────────────────────╯"
        ]
      };
      
      if (logos[nome]) {
        this.logoLines = logos[nome];
        return true;
      }
      return false;
    }
  
    exibirTituloFormatado(titulo, largura = this.larguraPadrao) {
      this.limparConsole();
      console.log(`╔${this.desenharLinha("═", largura - 2)}╗`);
      console.log(`║ ${this.centralizarTexto(titulo, largura - 4)} ║`);
      console.log(`╚${this.desenharLinha("═", largura - 2)}╝`);
      console.log(""); // Espaço após o título
    }
  
    exibirMensagem(mensagem, tipo = "info") {
      let prefixo = "";
      switch (tipo) {
        case "success": prefixo = "✅ "; break;
        case "error": prefixo = "❌ "; break;
        case "warning": prefixo = "⚠️ "; break;
        default: prefixo = "ℹ️ "; break;
      }
      console.log(`\n${prefixo}${mensagem}`);
    }
  
    desenharMenuPrincipal(usuarioLogado) {
      this.limparConsole();
      const petsPerdidos = this.petService.listarTodosOsPets("PERDIDO").length;
      const contadorPets = String(petsPerdidos).padStart(2, "0");
      const largura = this.larguraPadrao;
  
      this._desenharLogoEVersao(largura); // Usa o helper
  
      // As bordas do menu são fixas
      console.log(`╠${this.desenharLinha("═", largura - 2)}╣`);
      console.log(`║${this.centralizarTexto(">>>> MENU <<<<", largura - 2)}║`);
      console.log(`║${" ".repeat(largura - 2)}║`);
      
      // Conteúdo do menu - agora separado da estrutura fixa
      this._desenharConteudoMenu(usuarioLogado, largura);
      
      // Rodapé fixo com contador de pets
      const footerPets = ` Pets Perdidos: ${contadorPets} `;
      const paddingFooter = (largura - 2 - footerPets.length) / 2;
      console.log(`╚${this.desenharLinha("═", Math.floor(paddingFooter))}${footerPets}${this.desenharLinha("═", Math.ceil(paddingFooter))}╝`);
  
      if (usuarioLogado) {
        console.log(`\nLogado como: ${usuarioLogado.nome} (${usuarioLogado.email})`);
      }
      return readlineSync.question("\nEscolha uma opção: ");
    }
    
    // Novo método para separar o conteúdo do menu da estrutura
    _desenharConteudoMenu(usuarioLogado, largura) {
      // Opções do menu
      console.log(`║ ${"[1] - Login".padEnd(largura - 4)} ║`);
      console.log(`║ ${"[2] - Cadastrar Usuário".padEnd(largura - 4)} ║`);
      console.log(`║ ${"[3] - Achados e Perdidos".padEnd(largura - 4)} ║`);
      console.log(`║ ${"[4] - Registrar Pet Perdido".padEnd(largura - 4)} ║`);
      console.log(`║ ${"[5] - Marcar Pet como Encontrado".padEnd(largura - 4)} ║`);
      console.log(`║ ${"[6] - Histórico de Reencontros".padEnd(largura - 4)} ║`);
      console.log(`║ ${"[7] - Sobre o PetResgate".padEnd(largura - 4)} ║`);

      let proximaOpcaoNumerica = 8;
  
      if (usuarioLogado) {
        console.log(`║ ${`[${proximaOpcaoNumerica}] - Logout`.padEnd(largura - 4)} ║`);
        proximaOpcaoNumerica++;
        console.log(`║${" ".repeat(largura - 2)}║`);
        const nomeUsuarioFormatado = `Usuário: ${usuarioLogado.nome}`;
        console.log(`║ ${nomeUsuarioFormatado.padEnd(largura - 4).substring(0, largura - 4)} ║`);
      }
      console.log(`║${" ".repeat(largura - 2)}║`);
      console.log(`║ ${"[0] - Sair".padEnd(largura - 4)} ║`);
    }
  
    // NOVO MÉTODO para exibir a tela "Sobre"
    desenharTelaSobre() {
      this.limparConsole();
      const largura = this.larguraPadrao;
  
      this._desenharLogoEVersao(largura); // Reutiliza a logo e versão
  
      console.log(`╠${this.desenharLinha("═", largura - 2)}╣`);
      console.log(`║${this.centralizarTexto("SOBRE O PETRESGATE", largura - 2)}║`);
      console.log(`╠${this.desenharLinha("═", largura - 2)}╣`);
      console.log(`║${" ".repeat(largura - 2)}║`); // Linha em branco
  
      const descricao = [
        "PetResgate é um sistema de console para ajudar",
        "a encontrar pets perdidos e reunir tutores",
        "com seus amados companheiros.",
        " ",
        "Funcionalidades:",
        "- Cadastro e Login de usuários.",
        "- Registro de pets perdidos.",
        "- Busca de pets por nome ou localidade.",
        "- Marcação de pets como encontrados.",
        "- Histórico de reencontros.",
        " ",
      ];
  
      descricao.forEach(linha => {
          console.log(`║ ${this.centralizarTexto(linha, largura - 4)} ║`);
      });
  
      console.log(`║${" ".repeat(largura - 2)}║`); // Linha em branco
      console.log(`╚${this.desenharLinha("═", largura - 2)}╝`);
    }

  desenharMenuAchadosEPerdidos() {
    this.exibirTituloFormatado("ACHADOS E PERDIDOS");
    console.log("1. Listar todos os pets perdidos");
    console.log("2. Buscar pet perdido por Nome");
    console.log("3. Buscar pet perdido por Localidade");
    console.log("0. Voltar para o Menu Principal");
    console.log(this.desenharLinha("─"));
    return readlineSync.question("Escolha uma opção: ");
  }

  desenharTabelaPets(pets, titulo) {
    this.exibirTituloFormatado(titulo);

    if (!pets || pets.length === 0) {
      this.exibirMensagem("Nenhum pet encontrado com os critérios informados.", "warning");
      return false; // Indica que não há pets para mostrar mais detalhes
    }

    const larguraId = 5;
    const larguraNome = 25;
    const larguraStatus = 22;
    const larguraTotal = larguraId + larguraNome + larguraStatus + 7; // 3 pipes, 2 spaces * 2

    console.log(`┌${this.desenharLinha("─", larguraId)}┬${this.desenharLinha("─", larguraNome)}┬${this.desenharLinha("─", larguraStatus)}┐`);
    console.log(`│ ${"ID".padEnd(larguraId - 2)} │ ${"Nome".padEnd(larguraNome - 2)} │ ${"Status".padEnd(larguraStatus - 2)} │`);
    console.log(`├${this.desenharLinha("─", larguraId)}┼${this.desenharLinha("─", larguraNome)}┼${this.desenharLinha("─", larguraStatus)}┤`);

    pets.forEach((pet) => {
      const id = String(pet.id).padEnd(larguraId - 2);
      const nome = pet.nome.padEnd(larguraNome - 2).substring(0, larguraNome - 2);
      const status = pet.status.padEnd(larguraStatus - 2).substring(0, larguraStatus - 2);
      console.log(`│ ${id} │ ${nome} │ ${status} │`);
    });
    console.log(`└${this.desenharLinha("─", larguraId)}┴${this.desenharLinha("─", larguraNome)}┴${this.desenharLinha("─", larguraStatus)}┘`);
    return true; // Indica que há pets e pode pedir para mostrar detalhes
  }

  mostrarDetalhesPet(pet) {
    const tutor = this.authService.getUsuarioById(pet.idTutor);
    const tutorNome = tutor ? tutor.nome : "Não informado";

    this.exibirTituloFormatado(`DETALHES DO PET: ${pet.nome}`);

    const col1Width = 18;
    const col2Width = 32;

    console.log(`┌${this.desenharLinha("─", col1Width)}┬${this.desenharLinha("─", col2Width)}┐`);
    const printRow = (label, value) => {
      console.log(`│ ${label.padEnd(col1Width - 2)} │ ${String(value || 'N/A').substring(0, col2Width -2).padEnd(col2Width - 2)} │`);
    };

    printRow("ID:", pet.id);
    printRow("Nome:", pet.nome);
    printRow("Espécie:", pet.especie);
    printRow("Raça:", pet.raca);
    printRow("Gênero:", pet.genero);
    printRow("Idade:", pet.idade);
    printRow("Cor:", pet.cor);
    printRow("Local Perdido:", pet.localPerdido);
    printRow("Data Perdido:", pet.dataPerdido);
    printRow("Status:", pet.status);
    printRow("Tutor:", tutorNome);
    printRow("Data Registro:", pet.dataRegistro);
    if (pet.status === "ENCONTRADO") {
      printRow("Data Reencontro:", pet.dataReencontro);
    }
    console.log(`└${this.desenharLinha("─", col1Width)}┴${this.desenharLinha("─", col2Width)}┘`);

    console.log(`\n📝 Comentário do Tutor:`);
    console.log(`${pet.comentarioTutor || "Nenhum comentário."}`);
    console.log(`\n🖼️ Foto: ${pet.foto}`); // Simplificado
  }
}

export default ConsoleRenderer;