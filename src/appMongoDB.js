import ConsoleUI from "./ui/ConsoleUI.js";
import PetServiceMongoDB from "./services/PetServiceMongoDB.js";
import AuthServiceMongoDB from "./services/AuthServiceMongoDB.js";
import MongoDBService from "./services/MongoDBService.js";
import popularDadosIniciaisMongoDB from "./seed/initialDataMongoDB.js";

class PetResgateAppMongoDB {
  constructor() {
    this.dbService = new MongoDBService();
    this.authService = new AuthServiceMongoDB(this.dbService);
    this.petService = new PetServiceMongoDB(this.dbService);
    this.ui = new ConsoleUI(this.petService, this.authService);
  }

  async iniciar() {
    try {
      console.log("🚀 Iniciando PetResgate com MongoDB...");

      await this.dbService.connect();
      await popularDadosIniciaisMongoDB(
        this.authService,
        this.petService,
        this.dbService
      );

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
            this.ui.renderer.exibirMensagem(
              "Opção inválida. Tente novamente.",
              "warning"
            );
            this.ui.pausar();
        }
      }
    } catch (error) {
      console.error("❌ Erro ao iniciar o aplicativo:", error);
    } finally {
      if (this.dbService) {
        await this.dbService.disconnect();
      }
    }
  }
}

// Para testar o app com MongoDB
if (process.argv.includes("--mongodb")) {
  const app = new PetResgateAppMongoDB();
  app.iniciar();
}

export default PetResgateAppMongoDB;
