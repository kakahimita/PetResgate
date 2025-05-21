// src/services/test/AuthService.test.js
import AuthService from '../AuthService.js';

describe('AuthService', () => {
  let authService;

  beforeEach(() => {
    // Inicializa um novo AuthService antes de cada teste
    authService = new AuthService();
  });

  test('deve cadastrar um novo usuário com sucesso', () => {
    const resultado = authService.cadastrar('Teste Silva', 'teste@example.com', 'senha123');
    
    expect(resultado.success).toBe(true);
    expect(resultado.message).toContain('sucesso');
    expect(resultado.usuario).toHaveProperty('id');
    expect(resultado.usuario.nome).toBe('Teste Silva');
    expect(resultado.usuario.email).toBe('teste@example.com');
    expect(authService.usuarios.length).toBe(1);
  });

  test('não deve cadastrar usuário com email duplicado', () => {
    // Primeiro cadastro
    authService.cadastrar('Teste Silva', 'teste@example.com', 'senha123');
    
    // Tentativa de cadastro com mesmo email
    const resultado = authService.cadastrar('Outro Nome', 'teste@example.com', 'outrasenha');
    
    expect(resultado.success).toBe(false);
    expect(resultado.message).toContain('já cadastrado');
    expect(authService.usuarios.length).toBe(1);
  });

  test('deve realizar login com sucesso com credenciais corretas', () => {
    // Cadastrar usuário primeiro
    authService.cadastrar('Teste Silva', 'teste@example.com', 'senha123');
    
    // Tentar login
    const resultado = authService.login('teste@example.com', 'senha123');
    
    expect(resultado.success).toBe(true);
    expect(resultado.message).toContain('Login bem-sucedido!');
    expect(resultado.usuario).toHaveProperty('id');
    expect(resultado.usuario.email).toBe('teste@example.com');
  });

  test('não deve permitir login com email incorreto', () => {
    // Cadastrar usuário primeiro
    authService.cadastrar('Teste Silva', 'teste@example.com', 'senha123');
    
    // Tentar login com email errado
    const resultado = authService.login('errado@example.com', 'senha123');
    
    expect(resultado.success).toBe(false);
    expect(resultado.message).toContain('inválidos');
  });

  test('não deve permitir login com senha incorreta', () => {
    // Cadastrar usuário primeiro
    authService.cadastrar('Teste Silva', 'teste@example.com', 'senha123');
    
    // Tentar login com senha errada
    const resultado = authService.login('teste@example.com', 'senhaerrada');
    
    expect(resultado.success).toBe(false);
    expect(resultado.message).toContain('inválidos');
  });

  test('deve buscar usuário por ID corretamente', () => {
    // Cadastrar usuário
    const cadastro = authService.cadastrar('Teste Silva', 'teste@example.com', 'senha123');
    const userId = cadastro.usuario.id;
    
    // Buscar por ID
    const usuario = authService.getUsuarioById(userId);
    
    expect(usuario).not.toBeNull();
    expect(usuario.id).toBe(userId);
    expect(usuario.nome).toBe('Teste Silva');
  });

  test('deve retornar undefined ao buscar ID inexistente', () => {
    const usuario = authService.getUsuarioById(999); // ID que não existe
    expect(usuario).toBeUndefined();
  });
});