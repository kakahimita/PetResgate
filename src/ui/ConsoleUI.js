// src/ui/ConsoleUI.js
import readlineSync from "readline-sync";
import ConsoleRenderer from "./ConsoleRenderer.js"; // Importar o novo Renderer

class ConsoleUI {
  constructor(petService, authService) {
    this.petService = petService;
    this.authService = authService;
    this.renderer = new ConsoleRenderer(petService, authService); // Instanciar o Renderer
    this.usuarioLogado = null;
  }

  // Métodos que usam renderer: limparConsole e pausar podem ser chamados via this.renderer
  limparConsole() {
    this.renderer.limparConsole();
  }

  pausar() {
    this.renderer.pausar();
  }

  exibirMenuPrincipal() {
    return this.renderer.desenharMenuPrincipal(this.usuarioLogado);
  }

  processarLogin() {
    this.renderer.exibirTituloFormatado("LOGIN");
    const email = readlineSync.question("Email: ");
    const senha = readlineSync.question("Senha: ", { hideEchoBack: true });
    const resultado = this.authService.login(email, senha);

    this.renderer.exibirMensagem(resultado.message, resultado.success ? "success" : "error");

    if (resultado.success) {
      this.usuarioLogado = resultado.usuario;
    }
    this.pausar();
  }

  processarCadastroUsuario() {
    this.renderer.exibirTituloFormatado("CADASTRAR USUÁRIO");
    const nome = readlineSync.question("Nome completo: ");
    const email = readlineSync.questionEMail("Email: ");
    const senha = readlineSync.question("Senha: ", { hideEchoBack: true });
    const confirmaSenha = readlineSync.question("Confirme a senha: ", {
      hideEchoBack: true,
    });

    if (senha !== confirmaSenha) {
      this.renderer.exibirMensagem("As senhas não coincidem!", "warning");
      this.pausar();
      return;
    }

    const resultado = this.authService.cadastrar(nome, email, senha);
    this.renderer.exibirMensagem(resultado.message, resultado.success ? "success" : "error");
    this.pausar();
  }

  processarLogout() {
    if (this.usuarioLogado) {
      this.renderer.exibirMensagem(`Até logo, ${this.usuarioLogado.nome}!`, "info");
      this.usuarioLogado = null;
    } else {
      this.renderer.exibirMensagem("Nenhum usuário logado.", "info");
    }
    this.pausar();
  }

    processarSobre() {
      this.renderer.desenharTelaSobre();
      this.pausar();
    }

  exibirMenuAchadosEPerdidos() {
    let loopAchadosPerdidos = true;
    while (loopAchadosPerdidos) {
      const opcao = this.renderer.desenharMenuAchadosEPerdidos();

      switch (opcao) {
        case "1":
          this.listarPetsPerdidos();
          break;
        case "2":
          this.buscarPetPerdidoPorNome();
          break;
        case "3":
          this.buscarPetPerdidoPorLocalidade();
          break;
        case "0":
          loopAchadosPerdidos = false;
          break;
        default:
          this.renderer.exibirMensagem("Opção inválida.", "warning");
          this.pausar();
      }
    }
  }
  
  listarPetsComDetalhes(pets, titulo) {
    const temPets = this.renderer.desenharTabelaPets(pets, titulo);

    if (temPets) { // Só pede ID se a tabela foi desenhada com pets
      console.log("\n🔍 Deseja ver mais detalhes de algum pet?");
      const idParaDetalhes = readlineSync.question("Digite o ID do pet ou 0 para voltar: ");
      if (idParaDetalhes !== "0") {
        const petSelecionado = this.petService.buscarPetPorId(parseInt(idParaDetalhes));
        if (petSelecionado) {
          this.renderer.mostrarDetalhesPet(petSelecionado);
        } else {
          this.renderer.exibirMensagem("Pet não encontrado com o ID informado.", "error");
        }
      }
    }
    this.pausar();
  }

  listarPetsPerdidos() {
    const petsPerdidos = this.petService.listarTodosOsPets("PERDIDO");
    this.listarPetsComDetalhes(petsPerdidos, "PETS PERDIDOS REGISTRADOS");
  }

  buscarPetPerdidoPorNome() {
    this.renderer.exibirTituloFormatado("BUSCAR PET POR NOME");
    const nome = readlineSync.question("Digite o nome (ou parte do nome) do pet: ");
    const petsEncontrados = this.petService.buscarPets({ nome }, "PERDIDO");
    this.listarPetsComDetalhes(petsEncontrados, `PETS COM NOME CONTENDO "${nome.toUpperCase()}"`);
  }

  buscarPetPerdidoPorLocalidade() {
    this.renderer.exibirTituloFormatado("BUSCAR PET POR LOCALIDADE");
    const localidade = readlineSync.question("Digite a localidade (ou parte dela): ");
    const petsEncontrados = this.petService.buscarPets({ localidade }, "PERDIDO");
    this.listarPetsComDetalhes(petsEncontrados, `PETS EM LOCALIDADE "${localidade.toUpperCase()}"`);
  }

  processarRegistroPetPerdido() {
    if (!this.usuarioLogado) {
      this.renderer.exibirMensagem("Você precisa estar logado para registrar um pet perdido.", "warning");
      this.pausar();
      return;
    }

    this.renderer.exibirTituloFormatado("REGISTRAR NOVO PET PERDIDO");
    const dadosPet = {
      nome: readlineSync.question("Nome do pet: "),
      especie: readlineSync.question("Espécie (ex: Cachorro, Gato): "),
      raca: readlineSync.question("Raça (ex: Labrador, SRD): "),
      genero: readlineSync.question("Gênero (Macho/Fêmea): "),
      idade: readlineSync.question("Idade aproximada: "),
      cor: readlineSync.question("Cor predominante: "),
      localPerdido: readlineSync.question("Último local visto: "),
      dataPerdido: readlineSync.question("Data em que foi perdido (DD/MM/AAAA): "),
      comentarioTutor: readlineSync.question("Alguma observação importante? "),
      foto: readlineSync.question("Link para uma foto (opcional): ") || undefined,
    };

    // Validações básicas poderiam ser adicionadas aqui ou no InputHandler
    if (!dadosPet.nome || !dadosPet.especie || !dadosPet.localPerdido || !dadosPet.dataPerdido) {
        this.renderer.exibirMensagem("Nome, espécie, local perdido e data perdido são obrigatórios.", "error");
        this.pausar();
        return;
    }


    const novoPet = this.petService.registrarPetPerdido(dadosPet, this.usuarioLogado.id);
    this.usuarioLogado.adicionarPetRegistrado(novoPet.id);
    this.renderer.exibirMensagem(`Pet "${novoPet.nome}" (ID: ${novoPet.id}) registrado com sucesso!`, "success");
    this.pausar();
  }

  processarMarcarPetComoEncontrado() {
    if (!this.usuarioLogado) {
      this.renderer.exibirMensagem("Você precisa estar logado para esta funcionalidade.", "warning");
      this.pausar();
      return;
    }
    this.renderer.exibirTituloFormatado("MARCAR PET COMO ENCONTRADO");

    const petsDoUsuario = this.usuarioLogado.petsRegistrados
      .map((petId) => this.petService.buscarPetPorId(petId))
      .filter((pet) => pet && pet.status === "PERDIDO");

    if (petsDoUsuario.length === 0) {
      this.renderer.exibirMensagem("Você não possui pets registrados como perdidos no momento.", "info");
      this.pausar();
      return;
    }

    console.log("🐾 Seus pets registrados como PERDIDOS:\n");
    // Usar renderer.desenharTabelaPets aqui para consistência, mesmo que simples
    const petsFormatadosParaTabela = petsDoUsuario.map(p => ({id: p.id, nome: p.nome, status: p.status})); // Ajustar para o formato da tabela
    this.renderer.desenharTabelaPets(petsFormatadosParaTabela, "SEUS PETS PERDIDOS");


    const idPetStr = readlineSync.question("\nDigite o ID do pet que foi encontrado (0 para cancelar): ");
    if (idPetStr === "0") return;
    const idPet = parseInt(idPetStr);

    const petParaMarcar = petsDoUsuario.find((p) => p.id === idPet);
    if (petParaMarcar) {
      const resultado = this.petService.marcarPetComoEncontrado(idPet);
      this.renderer.exibirMensagem(resultado.message, resultado.success ? "success" : "error");
    } else {
      this.renderer.exibirMensagem("ID inválido ou o pet não pertence a você/não está como perdido.", "error");
    }
    this.pausar();
  }

  processarHistoricoReencontros() {
    const petsReencontrados = this.petService.listarHistoricoReencontros();
    this.listarPetsComDetalhes(petsReencontrados, "HISTÓRICO DE PETS REENCONTRADOS");
  }
}

export default ConsoleUI;