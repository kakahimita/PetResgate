// src/test/Pet.test.js
import Pet from '../Pet.js';

describe('Pet Model', () => {
  // Salvar o valor original de proximoId para restaurar após os testes
  const originalProximoId = Pet.proximoId;
  
  beforeEach(() => {
    // Resetar o contador de IDs antes de cada teste
    Pet.proximoId = 1;
  });
  
  afterAll(() => {
    // Restaurar o valor original após todos os testes
    Pet.proximoId = originalProximoId;
  });

  test('deve criar uma instância de Pet com valores corretos', () => {
    const pet = new Pet(
      'Max',
      'Cachorro',
      'Labrador',
      'Macho',
      '3 anos',
      'Preto',
      'Parque da Jaqueira',
      '10/07/2024',
      'Usa coleira vermelha',
      'http://exemplo.com/foto.jpg',
      2 // ID do tutor
    );
    
    expect(pet.id).toBe(1);
    expect(pet.nome).toBe('Max');
    expect(pet.especie).toBe('Cachorro');
    expect(pet.raca).toBe('Labrador');
    expect(pet.genero).toBe('Macho');
    expect(pet.idade).toBe('3 anos');
    expect(pet.cor).toBe('Preto');
    expect(pet.localPerdido).toBe('Parque da Jaqueira');
    expect(pet.dataPerdido).toBe('10/07/2024');
    expect(pet.comentarioTutor).toBe('Usa coleira vermelha');
    expect(pet.foto).toBe('http://exemplo.com/foto.jpg');
    expect(pet.idTutor).toBe(2);
    expect(pet.status).toBe('PERDIDO');
    expect(pet.dataReencontro).toBeNull();
    expect(typeof pet.dataRegistro).toBe('string'); // Verifica se a data de registro foi definida
  });

  test('deve usar valor padrão para foto quando não for fornecida', () => {
    const pet = new Pet(
      'Nina',
      'Gato',
      'Siamês',
      'Fêmea',
      '1 ano',
      'Branco',
      'Rua das Flores',
      '05/07/2024',
      'Tímida',
      undefined, // Sem foto
      3 // ID do tutor
    );
    
    expect(pet.foto).toContain('N/A');
  });

  test('deve incrementar IDs automaticamente para cada novo pet', () => {
    const pet1 = new Pet('Max', 'Cachorro', 'Labrador', 'Macho', '3 anos', 'Preto', 'Local', '10/07/2024', 'Obs', '', 1);
    const pet2 = new Pet('Nina', 'Gato', 'Siamês', 'Fêmea', '1 ano', 'Branco', 'Local', '10/07/2024', 'Obs', '', 1);
    const pet3 = new Pet('Rex', 'Cachorro', 'Pastor', 'Macho', '5 anos', 'Marrom', 'Local', '10/07/2024', 'Obs', '', 1);
    
    expect(pet1.id).toBe(1);
    expect(pet2.id).toBe(2);
    expect(pet3.id).toBe(3);
  });

  test('deve marcar o pet como encontrado corretamente', () => {
    const pet = new Pet('Max', 'Cachorro', 'Labrador', 'Macho', '3 anos', 'Preto', 'Local', '10/07/2024', 'Obs', '', 1);
    
    expect(pet.status).toBe('PERDIDO');
    expect(pet.dataReencontro).toBeNull();
    
    pet.marcarComoEncontrado();
    
    expect(pet.status).toBe('ENCONTRADO');
    expect(pet.dataReencontro).not.toBeNull();
    expect(typeof pet.dataReencontro).toBe('string');
  });

  test('deve retornar detalhes formatados corretamente', () => {
    const pet = new Pet('Max', 'Cachorro', 'Labrador', 'Macho', '3 anos', 'Preto', 'Local', '10/07/2024', 'Obs', '', 1);
    
    const detalhes = pet.getDetalhes();
    
    expect(detalhes).toContain('ID: 1');
    expect(detalhes).toContain('Nome: Max');
    expect(detalhes).toContain('Status: PERDIDO');
    expect(detalhes).not.toContain('Reencontrado em:'); // Não deve mostrar data de reencontro
    
    // Marcar como encontrado e verificar novamente
    pet.marcarComoEncontrado();
    const detalhesAtualizados = pet.getDetalhes();
    
    expect(detalhesAtualizados).toContain('Status: ENCONTRADO');
    expect(detalhesAtualizados).toContain('Reencontrado em:');
  });
});