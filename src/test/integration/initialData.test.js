// src/test/integration/initialData.test.js
import AuthService from '../../services/AuthService.js';
import PetService from '../../services/PetService.js';
import popularDadosIniciais from '../../seed/initialData.js';
import Usuario from '../../models/Usuario.js';
import Pet from '../../models/Pet.js';

describe('Integração - População de Dados Iniciais', () => {
  let authService;
  let petService;

  beforeEach(() => {
    // Reseta os contadores de IDs antes de cada teste
    Usuario.proximoId = 1;
    Pet.proximoId = 1;
    
    // Inicializa os serviços antes de cada teste
    authService = new AuthService();
    petService = new PetService();
  });

  test('TC0001 - deve popular usuários e pets corretamente', () => {
    // Verifica que não há usuários antes da população
    expect(authService.usuarios.length).toBe(0);
    expect(petService.pets.length).toBe(0);
    
    // Popula os dados iniciais
    popularDadosIniciais(authService, petService);
    
    // Verifica que os usuários foram cadastrados
    expect(authService.usuarios.length).toBe(3);
    
    // Verifica que os usuários têm os nomes esperados
    const nomes = authService.usuarios.map(u => u.nome);
    expect(nomes).toContain('Ana Silva');
    expect(nomes).toContain('Bruno Costa');
    expect(nomes).toContain('Carlos Lima');
    
    // Verifica que os pets foram registrados
    expect(petService.pets.length).toBeGreaterThan(0);
    
    // Verifica detalhes específicos dos pets
    const bolinha = petService.pets.find(p => p.nome === 'Bolinha');
    expect(bolinha).toBeDefined();
    expect(bolinha.especie).toBe('Cachorro');
    expect(bolinha.raca).toBe('Poodle');
    
    const mia = petService.pets.find(p => p.nome === 'Mia');
    expect(mia).toBeDefined();
    expect(mia.especie).toBe('Gato');
    expect(mia.raca).toBe('Siamês');
    
    // Verifica que o histórico de reencontros tem um pet
    const reencontros = petService.listarHistoricoReencontros();
    expect(reencontros.length).toBe(1);
    expect(reencontros[0].nome).toBe('Fred');
    expect(reencontros[0].status).toBe('ENCONTRADO');
    
    // Verifica a associação correta entre usuários e pets
    const anaId = authService.usuarios.find(u => u.nome === 'Ana Silva').id;
    const ana = authService.getUsuarioById(anaId);
    expect(ana.petsRegistrados.length).toBe(2);
    
    const brunoId = authService.usuarios.find(u => u.nome === 'Bruno Costa').id;
    const bruno = authService.getUsuarioById(brunoId);
    expect(bruno.petsRegistrados.length).toBe(1);
    
    const carlosId = authService.usuarios.find(u => u.nome === 'Carlos Lima').id;
    const carlos = authService.getUsuarioById(carlosId);
    expect(carlos.petsRegistrados.length).toBe(1);
  });

  test('TC0002 - deve manter IDs incrementais ao popular dados', () => {
    // Popula os dados iniciais
    popularDadosIniciais(authService, petService);
    
    // Verifica que os IDs dos usuários são incrementais
    const usuarioIds = authService.usuarios.map(u => u.id);
    // Ordenar os IDs para garantir que a comparação seja consistente
    const sortedIds = [...usuarioIds].sort((a, b) => a - b);
    
    // Verificar que temos 3 IDs consecutivos, começando do 1
    expect(sortedIds).toEqual([1, 2, 3]);
    
    // Verifica que os IDs dos pets também são incrementais e começam do 1
    const petIds = petService.pets.map(p => p.id);
    // Ordenar os IDs
    const sortedPetIds = [...petIds].sort((a, b) => a - b);
    
    // Verificar o primeiro e último ID para garantir sequência
    expect(sortedPetIds[0]).toBe(1);
    expect(sortedPetIds[sortedPetIds.length - 1]).toBe(petIds.length);
    
    // Cadastra um novo usuário e verifica o próximo ID
    const novoUsuario = authService.cadastrar('Novo Usuário', 'novo@example.com', 'senha').usuario;
    expect(novoUsuario.id).toBe(4);  // Próximo ID após os 3 usuários já cadastrados
    
    // Registra um novo pet e verifica o próximo ID
    const novoPet = petService.registrarPetPerdido({
      nome: 'Novo Pet',
      especie: 'Cachorro',
      raca: 'SRD',
      genero: 'Macho',
      idade: '1 ano',
      cor: 'Preto',
      localPerdido: 'Parque',
      dataPerdido: '20/07/2024',
      comentarioTutor: 'Teste'
    }, novoUsuario.id);
    
    expect(novoPet.id).toBe(5);  // Próximo ID após os 4 pets já cadastrados
  });

  test('TC0003 - deve permitir login com usuários populados', () => {
    // Popula os dados iniciais
    popularDadosIniciais(authService, petService);
    
    // Tenta fazer login com um dos usuários populados
    const resultado = authService.login('ana@example.com', 'senha123');
    
    expect(resultado.success).toBe(true);
    expect(resultado.usuario.nome).toBe('Ana Silva');
    
    // Tenta fazer login com credenciais incorretas
    const resultadoFalha = authService.login('ana@example.com', 'senhaerrada');
    expect(resultadoFalha.success).toBe(false);
  });
});