import Usuario from "../models/Usuario.js";

class AuthServiceMongoDB {
  constructor(dbService) {
    this.dbService = dbService;
  }

  async cadastrar(nome, email, senha) {
    try {
      // Verificar se já existe usuário com esse email
      const existingUser = await this.dbService.findOne('Usuario', { email });

      if (existingUser) {
        return { success: false, message: "Email já cadastrado." };
      }

      // Criar novo usuário no MongoDB
      const novoUsuarioMongo = await this.dbService.create('Usuario', {
        nome,
        email,
        senha
      });

      // Criar instância do modelo para compatibilidade
      const novoUsuario = new Usuario(nome, email, senha);
      novoUsuario.id = novoUsuarioMongo._id.toString();

      return {
        success: true,
        message: "Usuário cadastrado com sucesso!",
        usuario: novoUsuario,
      };
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      return { success: false, message: "Erro ao cadastrar usuário." };
    }
  }

  async login(email, senha) {
    try {
      const usuarioMongo = await this.dbService.findOne('Usuario', { 
        email, 
        senha 
      });

      if (usuarioMongo) {
        const usuarioLogado = new Usuario(usuarioMongo.nome, usuarioMongo.email, usuarioMongo.senha);
        usuarioLogado.id = usuarioMongo._id.toString();
        
        return {
          success: true,
          message: "Login bem-sucedido!",
          usuario: usuarioLogado,
        };
      }
      return { success: false, message: "Email ou senha inválidos." };
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return { success: false, message: "Erro ao fazer login." };
    }
  }

  async getUsuarioById(id) {
    try {
      const usuarioMongo = await this.dbService.findById('Usuario', id);

      if (usuarioMongo) {
        const usuarioEncontrado = new Usuario(usuarioMongo.nome, usuarioMongo.email, usuarioMongo.senha);
        usuarioEncontrado.id = usuarioMongo._id.toString();
        return usuarioEncontrado;
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar usuário por ID:", error);
      return null;
    }
  }

  // Método adicional para buscar por email
  async getUsuarioByEmail(email) {
    try {
      const usuarioMongo = await this.dbService.findOne('Usuario', { email });

      if (usuarioMongo) {
        const usuarioEncontrado = new Usuario(usuarioMongo.nome, usuarioMongo.email, usuarioMongo.senha);
        usuarioEncontrado.id = usuarioMongo._id.toString();
        return usuarioEncontrado;
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar usuário por email:", error);
      return null;
    }
  }

  // Método para listar todos os usuários (para compatibilidade com testes)
  async listarTodosUsuarios() {
    try {
      const usuariosMongo = await this.dbService.find('Usuario');
      
      return usuariosMongo.map(usuarioMongo => {
        const usuario = new Usuario(usuarioMongo.nome, usuarioMongo.email, usuarioMongo.senha);
        usuario.id = usuarioMongo._id.toString();
        return usuario;
      });
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      return [];
    }
  }
}

export default AuthServiceMongoDB;