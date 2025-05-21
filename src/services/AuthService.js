import Usuario from "../models/Usuario.js";

class AuthService {
  constructor(dbService) {
    this.dbService = dbService;
  }

  async cadastrar(nome, email, senha) {
    try {
      const existingUser = await this.dbService.get("SELECT * FROM usuarios WHERE email = ?", [email]);

      if (existingUser) {
        return { success: false, message: "Email já cadastrado." };
      }

      const userId = await this.dbService.run("INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)", [nome, email, senha]);

      const novoUsuario = new Usuario(nome, email, senha);
      novoUsuario.id = userId;

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
      const usuario = await this.dbService.get(
        "SELECT * FROM usuarios WHERE email = ? AND senha = ?",
        [email, senha]
      );

      if (usuario) {
        const usuarioLogado = new Usuario(usuario.nome, usuario.email, usuario.senha);
        usuarioLogado.id = usuario.id;
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
      const usuario = await this.dbService.get("SELECT * FROM usuarios WHERE id = ?", [id]);

      if (usuario) {
        const usuarioEncontrado = new Usuario(usuario.nome, usuario.email, usuario.senha);
        usuarioEncontrado.id = usuario.id;
        return usuarioEncontrado;
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar usuário por ID:", error);
      return null;
    }
  }
}

export default AuthService;
