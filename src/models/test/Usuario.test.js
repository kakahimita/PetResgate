// src/test/Usuario.test.js
import Usuario from '../Usuario.js';

describe('Usuario Model', () => {
  // Guardar o valor original de proximoId para restaurar após os testes
  const originalProximoId = Usuario.proximoId;
  
  beforeEach(() => {
    // Resetar o contador de IDs antes de cada teste
    Usuario.proximoId = 1;
  });
  
  afterAll(() => {
    // Restaurar o valor original de proximoId após todos os testes
    Usuario.proximoId = originalProximoId;
  });

  test('deve criar uma instância de Usuario com valores corretos', () => {
    const usuario = new Usuario('João Silva', 'joao@example.com', 'senha123');
    
    expect(usuario.id).toBe(1);
    expect(usuario.nome).toBe('João Silva');
    expect(usuario.email).toBe('joao@example.com');
    expect(usuario.senha).toBe('senha123');
    expect(usuario.petsRegistrados).toEqual([]);
  });

  test('deve incrementar IDs automaticamente para cada novo usuário', () => {
    const usuario1 = new Usuario('João Silva', 'joao@example.com', 'senha123');
    const usuario2 = new Usuario('Maria Santos', 'maria@example.com', 'senha456');
    const usuario3 = new Usuario('Pedro Oliveira', 'pedro@example.com', 'senha789');
    
    expect(usuario1.id).toBe(1);
    expect(usuario2.id).toBe(2);
    expect(usuario3.id).toBe(3);
  });

  test('deve adicionar ID de pet registrado corretamente', () => {
    const usuario = new Usuario('João Silva', 'joao@example.com', 'senha123');
    
    expect(usuario.petsRegistrados.length).toBe(0);
    
    usuario.adicionarPetRegistrado(101);
    expect(usuario.petsRegistrados.length).toBe(1);
    expect(usuario.petsRegistrados[0]).toBe(101);
    
    usuario.adicionarPetRegistrado(102);
    expect(usuario.petsRegistrados.length).toBe(2);
    expect(usuario.petsRegistrados).toEqual([101, 102]);
  });

  test('deve manter registros de múltiplos pets corretamente', () => {
    const usuario = new Usuario('João Silva', 'joao@example.com', 'senha123');
    
    // Adicionar vários pets
    for (let i = 1; i <= 5; i++) {
      usuario.adicionarPetRegistrado(100 + i);
    }
    
    expect(usuario.petsRegistrados.length).toBe(5);
    expect(usuario.petsRegistrados).toContain(101);
    expect(usuario.petsRegistrados).toContain(105);
    
    // Verificar se a ordem é mantida
    expect(usuario.petsRegistrados[0]).toBe(101);
    expect(usuario.petsRegistrados[4]).toBe(105);
  });

  test('deve permitir adicionar o mesmo ID de pet mais de uma vez', () => {
    // Este teste verifica se a implementação atual permite adicionar o mesmo pet mais de uma vez
    // Se no futuro isso não for desejado, o teste precisará ser alterado
    const usuario = new Usuario('João Silva', 'joao@example.com', 'senha123');
    
    usuario.adicionarPetRegistrado(101);
    usuario.adicionarPetRegistrado(101); // Adicionar o mesmo ID novamente
    
    expect(usuario.petsRegistrados.length).toBe(2);
    expect(usuario.petsRegistrados[0]).toBe(101);
    expect(usuario.petsRegistrados[1]).toBe(101);
  });
});