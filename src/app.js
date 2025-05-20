// src/app.js (Atualizado para demonstrar o uso da logo configurável)
import ConsoleUI from "./ui/ConsoleUI.js";
import PetService from "./services/PetService.js";
import AuthService from "./services/AuthService.js";
import popularDadosIniciais from "./seed/initialData.js";

class PetResgateApp {
  constructor() {
    this.authService = new AuthService();
    this.petService = new PetService();
    this.ui = new ConsoleUI(this.petService, this.authService);
    
    // Configuração da logo do app - Exemplo de como alterá-la
    // Descomente uma das linhas abaixo para testar uma logo diferente
    // this.ui.renderer.carregarLogoPredefinida("simples");
    // this.ui.renderer.carregarLogoPredefinida("mini");
    
    // Ou defina uma logo personalizada
    /* 
    this.ui.renderer.atualizarLogo([
      "╔═══════════════════╗",
      "║   PET RESGATE     ║",
      "║   🐕 🐈 🐩 🐾      ║",
      "╚═══════════════════╝"
    ]);
    */
  }

  iniciar() {
    popularDadosIniciais(this.authService, this.petService);

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
        case "7": // NOVA OPÇÃO: Sobre
          this.ui.processarSobre();
          break;
        case "8": // Logout (agora é 8 se logado)
          if (this.ui.usuarioLogado) {
            this.ui.processarLogout();
          } else {
            // Se 8 for digitado e não houver usuário logado, é inválido
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
  }
}

const app = new PetResgateApp();
app.iniciar();