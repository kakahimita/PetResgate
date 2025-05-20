// src/app.js

import ConsoleUI from "./ui/ConsoleUI.js";
import PetService from "./services/PetService.js";
import AuthService from "./services/AuthService.js";
import popularDadosIniciais from "./seed/initialData.js"; // <--- IMPORTAR AQUI

class PetResgateApp {
  constructor() {
    this.authService = new AuthService();
    this.petService = new PetService();
    this.ui = new ConsoleUI(this.petService, this.authService);
  }

  // A função de popular dados foi movida para src/seed/initialData.js

  iniciar() {
    // Chamar a função de popular dados, passando os serviços necessários
    popularDadosIniciais(this.authService, this.petService);
    this.ui.pausar(); // Pausa para ver a mensagem de dados populados

    let executando = true;
    while (executando) {
      const opcao = this.ui.exibirMenuPrincipal();
      switch (opcao) {
        case "1":
          this.ui.processarLogin();
          break;
        case "2":
          this.ui.processarCadastroUsuario();
          break;
        case "3":
          this.ui.exibirMenuAchadosEPerdidos();
          break;
        case "4":
          this.ui.processarRegistroPetPerdido();
          break;
        case "5":
          this.ui.processarMarcarPetComoEncontrado();
          break;
        case "6":
          this.ui.processarHistoricoReencontros();
          break;
        case "7":
          if (this.ui.usuarioLogado) {
            this.ui.processarLogout();
          } else {
            console.log("Opção inválida.");
            this.ui.pausar();
          }
          break;
        case "0":
          executando = false;
          this.ui.limparConsole();
          console.log("🐾 Obrigado por usar o PetResgate! Até a próxima! 🐾");
          break;
        default:
          console.log("Opção inválida. Tente novamente.");
          this.ui.pausar();
      }
    }
  }
}

const app = new PetResgateApp();
app.iniciar();
