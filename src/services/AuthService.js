import Usuario from "../models/Usuario.js";

class AuthService {
  constructor() {
    this.usuarios = []; // Em um app real, viria de um banco de dados
  }

  cadastrar(nome, email, senha) {
    if (this.usuarios.find((u) => u.email === email)) {
      return { success: false, message: "Email já cadastrado." };
    }
    const novoUsuario = new Usuario(nome, email, senha);
    this.usuarios.push(novoUsuario);
    return {
      success: true,
      message: "Usuário cadastrado com sucesso!",
      usuario: novoUsuario,
    };
  }

  login(email, senha) {
    const usuario = this.usuarios.find(
      (u) => u.email === email && u.senha === senha
    ); // Senha em texto plano (NÃO FAÇA ISSO EM PRODUÇÃO)
    if (usuario) {
      return {
        success: true,
        message: "Login bem-sucedido!",
        usuario: usuario,
      };
    }
    return { success: false, message: "Email ou senha inválidos." };
  }

  getUsuarioById(id) {
    return this.usuarios.find((u) => u.id === id);
  }
}

export default AuthService;
