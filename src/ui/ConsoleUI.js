import readlineSync from "readline-sync";

class ConsoleUI {
  constructor(petService, authService) {
    this.petService = petService;
    this.authService = authService;
    this.usuarioLogado = null;
  }

  limparConsole() {
    // console.clear() pode não funcionar em todos os terminais,
    // mas é a forma mais comum.
    // Uma alternativa é imprimir várias linhas em branco:
    // for (let i = 0; i < 50; i++) console.log('');
    console.clear();
  }

  pausar() {
    readlineSync.keyInPause("\nPressione qualquer tecla para continuar...");
  }

  exibirMenuPrincipal() {
    this.limparConsole();
    console.log("--------- Pet Resgate ---------");
    if (this.usuarioLogado) {
      console.log(`Usuário: ${this.usuarioLogado.nome}`);
    }
    console.log("\n1. Login");
    console.log("2. Cadastrar Usuário");
    console.log("3. Achados e Perdidos");
    console.log("4. Registrar Pet Perdido"); // Adicionado aqui, requer login
    console.log("5. Marcar Pet como Encontrado"); // Adicionado, requer login
    console.log("6. Histórico de Reencontros");
    if (this.usuarioLogado) {
      console.log("7. Logout");
    }
    console.log("0. Sair");
    console.log("_____________________________");
    return readlineSync.question("Escolha uma opção: ");
  }

  processarLogin() {
    this.limparConsole();
    console.log("--- Login ---");
    const email = readlineSync.question("Email: ");
    const senha = readlineSync.question("Senha: ", { hideEchoBack: true });
    const resultado = this.authService.login(email, senha);
    console.log(resultado.message);
    if (resultado.success) {
      this.usuarioLogado = resultado.usuario;
    }
    this.pausar();
  }

  processarCadastroUsuario() {
    this.limparConsole();
    console.log("--- Cadastrar Novo Usuário ---");
    const nome = readlineSync.question("Nome completo: ");
    const email = readlineSync.questionEMail("Email: ");
    const senha = readlineSync.question("Senha: ", { hideEchoBack: true });
    // const confirmaSenha = readlineSync.question("Confirme a senha: ", { hideEchoBack: true });
    // if (senha !== confirmaSenha) {
    //     console.log("As senhas não coincidem.");
    //     this.pausar();
    //     return;
    // }
    const resultado = this.authService.cadastrar(nome, email, senha);
    console.log(resultado.message);
    this.pausar();
  }

  processarLogout() {
    if (this.usuarioLogado) {
      console.log(`\nAté logo, ${this.usuarioLogado.nome}!`);
      this.usuarioLogado = null;
    } else {
      console.log("\nNenhum usuário logado.");
    }
    this.pausar();
  }

  exibirMenuAchadosEPerdidos() {
    let loopAchadosPerdidos = true;
    while (loopAchadosPerdidos) {
      this.limparConsole();
      console.log("--- Achados e Perdidos ---");
      console.log("1. Listar todos os pets perdidos");
      console.log("2. Buscar pet perdido por Nome");
      console.log("3. Buscar pet perdido por Localidade");
      console.log("0. Voltar para o Menu Principal");
      console.log("---------------------------------");
      const opcao = readlineSync.question("Escolha uma opção: ");

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
          console.log("Opção inválida.");
          this.pausar();
      }
    }
  }

  listarPetsComDetalhes(pets, titulo) {
    this.limparConsole();
    console.log(`--- ${titulo} ---`);
    if (!pets || pets.length === 0) {
      console.log("Nenhum pet encontrado com os critérios informados.");
    } else {
      pets.forEach((pet) => {
        const tutor = this.authService.getUsuarioById(pet.idTutor);
        console.log(pet.getDetalhes());
        if (tutor) {
          console.log(`Tutor: ${tutor.nome}`);
        }
        console.log("====================================");
      });
    }
    this.pausar();
  }

  listarPetsPerdidos() {
    const petsPerdidos = this.petService.listarTodosOsPets("PERDIDO");
    this.listarPetsComDetalhes(petsPerdidos, "Pets Perdidos Registrados");
  }

  buscarPetPerdidoPorNome() {
    this.limparConsole();
    const nome = readlineSync.question(
      "Digite o nome (ou parte do nome) do pet: "
    );
    const petsEncontrados = this.petService.buscarPets({ nome }, "PERDIDO");
    this.listarPetsComDetalhes(
      petsEncontrados,
      `Pets Perdidos com nome contendo "${nome}"`
    );
  }

  buscarPetPerdidoPorLocalidade() {
    this.limparConsole();
    const localidade = readlineSync.question(
      "Digite a localidade (ou parte dela): "
    );
    const petsEncontrados = this.petService.buscarPets(
      { localidade },
      "PERDIDO"
    );
    this.listarPetsComDetalhes(
      petsEncontrados,
      `Pets Perdidos em localidade contendo "${localidade}"`
    );
  }

  processarRegistroPetPerdido() {
    if (!this.usuarioLogado) {
      console.log("\nVocê precisa estar logado para registrar um pet perdido.");
      this.pausar();
      return;
    }
    this.limparConsole();
    console.log("--- Registrar Novo Pet Perdido ---");
    const dadosPet = {
      nome: readlineSync.question("Nome do pet: "),
      especie: readlineSync.question("Espécie (ex: Cachorro, Gato): "),
      raca: readlineSync.question("Raça (ex: Labrador, SRD): "),
      genero: readlineSync.question("Gênero (Macho/Fêmea): "),
      idade: readlineSync.question("Idade aproximada: "),
      cor: readlineSync.question("Cor predominante: "),
      localPerdido: readlineSync.question("Último local visto: "),
      dataPerdido: readlineSync.question(
        "Data em que foi perdido (DD/MM/AAAA): "
      ),
      comentarioTutor: readlineSync.question(
        "Alguma observação importante? (ex: usa coleira, tem mancha específica): "
      ),
      foto:
        readlineSync.question(
          "Link para uma foto (opcional, deixe em branco se não tiver): "
        ) || undefined,
    };

    const novoPet = this.petService.registrarPetPerdido(
      dadosPet,
      this.usuarioLogado.id
    );
    this.usuarioLogado.adicionarPetRegistrado(novoPet.id); // Adiciona o ID do pet ao usuário

    console.log(
      `\n✅ Pet "${novoPet.nome}" (ID: ${novoPet.id}) registrado com sucesso pelo tutor ${this.usuarioLogado.nome}!`
    );
    this.pausar();
  }

  processarMarcarPetComoEncontrado() {
    if (!this.usuarioLogado) {
      console.log("\nVocê precisa estar logado para esta funcionalidade.");
      this.pausar();
      return;
    }
    this.limparConsole();
    console.log("--- Marcar Pet como Encontrado ---");

    // Lista apenas pets perdidos registrados PELO USUÁRIO LOGADO
    const petsDoUsuario = this.usuarioLogado.petsRegistrados
      .map((petId) => this.petService.buscarPetPorId(petId))
      .filter((pet) => pet && pet.status === "PERDIDO");

    if (petsDoUsuario.length === 0) {
      console.log("Você não possui pets registrados como perdidos no momento.");
      this.pausar();
      return;
    }

    console.log("Seus pets registrados como PERDIDOS:");
    petsDoUsuario.forEach((pet) => {
      console.log(`ID: ${pet.id} - Nome: ${pet.nome}`);
    });

    const idPetStr = readlineSync.question(
      "\nDigite o ID do pet que foi encontrado: "
    );
    const idPet = parseInt(idPetStr);

    // Verifica se o pet pertence ao usuário logado e está perdido
    const petParaMarcar = petsDoUsuario.find((p) => p.id === idPet);

    if (petParaMarcar) {
      const resultado = this.petService.marcarPetComoEncontrado(idPet);
      console.log(resultado.message);
    } else {
      console.log(
        "ID inválido ou o pet não pertence a você/não está como perdido."
      );
    }
    this.pausar();
  }

  processarHistoricoReencontros() {
    this.limparConsole();
    const petsReencontrados = this.petService.listarHistoricoReencontros();
    this.listarPetsComDetalhes(
      petsReencontrados,
      "Histórico de Pets Reencontrados"
    );
  }
}

export default ConsoleUI;
