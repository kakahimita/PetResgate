// src/services/test/PetService.test.js
import PetService from '../PetService.js';

describe('PetService', () => {
  let petService;
  const dadosPetMock = {
    nome: 'Totó',
    especie: 'Cachorro',
    raca: 'SRD',
    genero: 'Macho',
    idade: '2 anos',
    cor: 'Caramelo',
    localPerdido: 'Praça Central, Recife',
    dataPerdido: '15/07/2024',
    comentarioTutor: 'Está com coleira azul',
    foto: 'http://exemplo.com/foto.jpg'
  };
  
  const tutorId = 1;

  beforeEach(() => {
    // Inicializa um novo PetService antes de cada teste
    petService = new PetService();
  });

  test('deve registrar um pet perdido corretamente', () => {
    const pet = petService.registrarPetPerdido(dadosPetMock, tutorId);
    
    expect(pet).toHaveProperty('id');
    expect(pet.nome).toBe('Totó');
    expect(pet.especie).toBe('Cachorro');
    expect(pet.idTutor).toBe(tutorId);
    expect(pet.status).toBe('PERDIDO');
    expect(pet.dataReencontro).toBeNull();
    expect(petService.pets.length).toBe(1);
  });

  test('deve listar todos os pets corretamente', () => {
    // Registrar alguns pets
    petService.registrarPetPerdido(dadosPetMock, tutorId);
    petService.registrarPetPerdido({...dadosPetMock, nome: 'Rex'}, tutorId);
    
    const todosPets = petService.listarTodosOsPets();
    
    expect(todosPets.length).toBe(2);
    expect(todosPets[0].nome).toBe('Totó');
    expect(todosPets[1].nome).toBe('Rex');
  });

  test('deve filtrar pets por status corretamente', () => {
    // Registrar alguns pets e marcar um como encontrado
    const pet1 = petService.registrarPetPerdido(dadosPetMock, tutorId);
    const pet2 = petService.registrarPetPerdido({...dadosPetMock, nome: 'Rex'}, tutorId);
    
    petService.marcarPetComoEncontrado(pet1.id);
    
    const petsPerdidos = petService.listarTodosOsPets('PERDIDO');
    const petsEncontrados = petService.listarTodosOsPets('ENCONTRADO');
    
    expect(petsPerdidos.length).toBe(1);
    expect(petsPerdidos[0].nome).toBe('Rex');
    expect(petsEncontrados.length).toBe(1);
    expect(petsEncontrados[0].nome).toBe('Totó');
  });

  test('deve buscar pets por nome corretamente', () => {
    // Registrar alguns pets
    petService.registrarPetPerdido(dadosPetMock, tutorId);
    petService.registrarPetPerdido({...dadosPetMock, nome: 'Rex'}, tutorId);
    petService.registrarPetPerdido({...dadosPetMock, nome: 'Thor'}, tutorId);
    
    const resultado = petService.buscarPets({nome: 'to'});
    
    expect(resultado.length).toBe(1);
    expect(resultado[0].nome).toBe('Totó');
  });

  test('deve buscar pets por localidade corretamente', () => {
    // Registrar alguns pets com localizações diferentes
    petService.registrarPetPerdido(dadosPetMock, tutorId);
    petService.registrarPetPerdido({
      ...dadosPetMock, 
      nome: 'Rex', 
      localPerdido: 'Boa Viagem, Recife'
    }, tutorId);
    
    const resultado = petService.buscarPets({localidade: 'Boa Viagem'});
    
    expect(resultado.length).toBe(1);
    expect(resultado[0].nome).toBe('Rex');
  });

  test('deve buscar pet por ID corretamente', () => {
    // Registrar um pet
    const petRegistrado = petService.registrarPetPerdido(dadosPetMock, tutorId);
    
    const petEncontrado = petService.buscarPetPorId(petRegistrado.id);
    
    expect(petEncontrado).not.toBeNull();
    expect(petEncontrado.id).toBe(petRegistrado.id);
    expect(petEncontrado.nome).toBe('Totó');
  });

  test('deve marcar pet como encontrado corretamente', () => {
    // Registrar um pet
    const pet = petService.registrarPetPerdido(dadosPetMock, tutorId);
    
    const resultado = petService.marcarPetComoEncontrado(pet.id);
    
    expect(resultado.success).toBe(true);
    expect(resultado.message).toContain('marcado como ENCONTRADO');
    
    const petAtualizado = petService.buscarPetPorId(pet.id);
    expect(petAtualizado.status).toBe('ENCONTRADO');
    expect(petAtualizado.dataReencontro).not.toBeNull();
  });

  test('não deve marcar como encontrado um pet que já está encontrado', () => {
    // Registrar um pet e já marcá-lo como encontrado
    const pet = petService.registrarPetPerdido(dadosPetMock, tutorId);
    petService.marcarPetComoEncontrado(pet.id);
    
    // Tentar marcar novamente
    const resultado = petService.marcarPetComoEncontrado(pet.id);
    
    expect(resultado.success).toBe(false);
    expect(resultado.message).toContain('não encontrado ou já marcado');
  });

  test('não deve marcar como encontrado um ID inexistente', () => {
    const resultado = petService.marcarPetComoEncontrado(999); // ID que não existe
    
    expect(resultado.success).toBe(false);
    expect(resultado.message).toContain('não encontrado');
  });

  test('deve listar histórico de reencontros corretamente', () => {
    // Registrar alguns pets
    const pet1 = petService.registrarPetPerdido(dadosPetMock, tutorId);
    const pet2 = petService.registrarPetPerdido({...dadosPetMock, nome: 'Rex'}, tutorId);
    
    // Marcar apenas um como encontrado
    petService.marcarPetComoEncontrado(pet1.id);
    
    const historico = petService.listarHistoricoReencontros();
    
    expect(historico.length).toBe(1);
    expect(historico[0].nome).toBe('Totó');
    expect(historico[0].status).toBe('ENCONTRADO');
  });
});