import ConsoleUI from "./ui/ConsoleUI.js";
import PetService from "./services/PetService.js";
import AuthService from "./services/AuthService.js";
import DatabaseService from "./services/DatabaseService.js";
import popularDadosIniciais from "./seed/initialData.js";

class PetResgateApp {
  constructor() {
    this.dbService = new DatabaseService();
    this.authService = new AuthService(this.dbService);
    this.petService = new PetService(this.dbService);
    this.ui = new ConsoleUI(this.petService, this.authService);
  }

  async iniciar() {
    try {
      await this.dbService.connect();
      await popularDadosIniciais(this.authService, this.petService, this.dbService);

      let executando = true;
      while (executando) {
        const opcao = this.ui.exibirMenuPrincipal();
        switch (opcao) {
          case "1":
            await this.ui.processarLogin();
            break;
          case "2":
            await this.ui.processarCadastroUsuario();
            break;
          case "3":
            await this.ui.exibirMenuAchadosEPerdidos();
            break;
          case "4":
            await this.ui.processarRegistroPetPerdido();
            break;
          case "5":
            await this.ui.processarMarcarPetComoEncontrado();
            break;
          case "6":
            await this.ui.processarHistoricoReencontros();
            break;
          case "7":
            this.ui.processarSobre();
            break;
          case "8":
            if (this.ui.usuarioLogado) {
              this.ui.processarLogout();
            } else {
              this.ui.renderer.exibirMensagem("Opção inválida.", "warning");
              this.ui.pausar();
            }
            break;
          case "0":
            executando = false;
            this.ui.limparConsole();
            console.log("🐾 Obrigado por usar o PetResgate! Até a próxima! 🐾");
            break;
          default:
            this.ui.renderer.exibirMensagem("Opção inválida. Tente novamente.", "warning");
            this.ui.pausar();
        }
      }
    } catch (error) {
      console.error("Erro ao iniciar o aplicativo:", error);
    } finally {
      if (this.dbService) {
        await this.dbService.disconnect();
      }
    }
  }
}

const app = new PetResgateApp();
app.iniciar();
