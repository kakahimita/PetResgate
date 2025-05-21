// src/test/integration/full-flow.test.js
import AuthService from '../../services/AuthService.js';
import PetService from '../../services/PetService.js';

describe('Teste de Fluxo Completo do Aplicativo', () => {
  let authService;
  let petService;

  beforeEach(() => {
    // Inicializa os serviços antes de cada teste
    authService = new AuthService();
    petService = new PetService();
  });

  test('TC0001 - deve simular um fluxo completo do aplicativo', () => {
    // 1. Cadastrar três usuários
    const cadastroUser1 = authService.cadastrar('Carolina Mendes', 'carolina@example.com', 'senha123');
    const cadastroUser2 = authService.cadastrar('Rodrigo Alves', 'rodrigo@example.com', 'senha456');
    const cadastroUser3 = authService.cadastrar('Fernanda Santos', 'fernanda@example.com', 'senha789');
    
    expect(cadastroUser1.success).toBe(true);
    expect(cadastroUser2.success).toBe(true);
    expect(cadastroUser3.success).toBe(true);
    
    const user1 = cadastroUser1.usuario;
    const user2 = cadastroUser2.usuario;
    const user3 = cadastroUser3.usuario;
    
    // 2. Carolina registra dois pets perdidos
    const pet1 = petService.registrarPetPerdido({
      nome: 'Simba',
      especie: 'Cachorro',
      raca: 'Golden Retriever',
      genero: 'Macho',
      idade: '3 anos',
      cor: 'Dourado',
      localPerdido: 'Parque das Graças, Recife',
      dataPerdido: '15/07/2024',
      comentarioTutor: 'Usa coleira azul com plaquinha de identificação'
    }, user1.id);
    
    const pet2 = petService.registrarPetPerdido({
      nome: 'Oliver',
      especie: 'Gato',
      raca: 'Maine Coon',
      genero: 'Macho',
      idade: '2 anos',
      cor: 'Cinza Tigrado',
      localPerdido: 'Condomínio Villa Real, Boa Viagem',
      dataPerdido: '16/07/2024',
      comentarioTutor: 'Gato grande e peludo, muito medroso'
    }, user1.id);
    
    user1.adicionarPetRegistrado(pet1.id);
    user1.adicionarPetRegistrado(pet2.id);
    
    // 3. Rodrigo registra um pet perdido
    const pet3 = petService.registrarPetPerdido({
      nome: 'Bidu',
      especie: 'Cachorro',
      raca: 'Schnauzer',
      genero: 'Macho',
      idade: '5 anos',
      cor: 'Sal e Pimenta',
      localPerdido: 'Shopping Recife, estacionamento',
      dataPerdido: '12/07/2024',
      comentarioTutor: 'Cachorro de porte médio, muito amigável'
    }, user2.id);
    
    user2.adicionarPetRegistrado(pet3.id);
    
    // 4. Fernanda registra um pet perdido
    const pet4 = petService.registrarPetPerdido({
      nome: 'Flora',
      especie: 'Gato',
      raca: 'SRD',
      genero: 'Fêmea',
      idade: '1 ano',
      cor: 'Preta',
      localPerdido: 'Rua da Aurora, centro',
      dataPerdido: '10/07/2024',
      comentarioTutor: 'Gata pequena e ágil, costuma se esconder'
    }, user3.id);
    
    user3.adicionarPetRegistrado(pet4.id);
    
    // 5. Verificar quantidade total de pets registrados
    expect(petService.listarTodosOsPets().length).toBe(4);
    expect(petService.listarTodosOsPets('PERDIDO').length).toBe(4);
    
    // 6. Buscar por nome com resultados
    const buscaNomeSi = petService.buscarPets({nome: 'Si'});
    expect(buscaNomeSi.length).toBe(1);
    expect(buscaNomeSi[0].nome).toBe('Simba');
    
    // 7. Buscar por localidade com resultados
    const buscaLocalBoa = petService.buscarPets({localidade: 'Boa Viagem'});
    expect(buscaLocalBoa.length).toBe(1);
    expect(buscaLocalBoa[0].nome).toBe('Oliver');
    
    // 8. Carolina marca um de seus pets como encontrado
    const resultadoMarcar = petService.marcarPetComoEncontrado(pet1.id);
    expect(resultadoMarcar.success).toBe(true);
    
    // 9. Verificar quantidades após marcar como encontrado
    expect(petService.listarTodosOsPets().length).toBe(4); // Total ainda é 4
    expect(petService.listarTodosOsPets('PERDIDO').length).toBe(3); // Perdidos agora são 3
    expect(petService.listarTodosOsPets('ENCONTRADO').length).toBe(1); // Encontrados agora é 1
    
    // 10. Verificar o histórico de reencontros
    const historico = petService.listarHistoricoReencontros();
    expect(historico.length).toBe(1);
    expect(historico[0].nome).toBe('Simba');
    
    // 11. Executar uma busca com múltiplos filtros (dois filtros, sem resultados)
    const buscaCombinada = petService.buscarPets({
      nome: 'Oliver',
      localidade: 'Centro'
    });
    expect(buscaCombinada.length).toBe(0);
    
    // 12. Tentar marcar como encontrado um pet que já está encontrado
    const remarcarPet = petService.marcarPetComoEncontrado(pet1.id);
    expect(remarcarPet.success).toBe(false);
    
    // 13. Verificar dados dos tutores após todas as operações
    expect(user1.petsRegistrados.length).toBe(2);
    expect(user2.petsRegistrados.length).toBe(1);
    expect(user3.petsRegistrados.length).toBe(1);
    
    // 14. Verificar que os status dos pets são consistentes com as ações
    const pet1Atualizado = petService.buscarPetPorId(pet1.id);
    expect(pet1Atualizado.status).toBe('ENCONTRADO');
    expect(pet1Atualizado.dataReencontro).not.toBeNull();
    
    const pet2Atualizado = petService.buscarPetPorId(pet2.id);
    expect(pet2Atualizado.status).toBe('PERDIDO');
    expect(pet2Atualizado.dataReencontro).toBeNull();
  });
});