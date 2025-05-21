// src/test/integration/services.test.js - Ajuste para lidar com acentos
import AuthService from '../../services/AuthService.js';
import PetService from '../../services/PetService.js';
import Usuario from '../../models/Usuario.js';
import Pet from '../../models/Pet.js';

describe('Integração entre AuthService e PetService', () => {
  let authService;
  let petService;
  let usuarioTeste;

  beforeEach(() => {
    // Reset dos contadores de IDs
    Usuario.proximoId = 1;
    Pet.proximoId = 1;
    
    // Inicializa os serviços antes de cada teste
    authService = new AuthService();
    petService = new PetService();
    
    // Cadastra um usuário para os testes
    const resultadoCadastro = authService.cadastrar('Tutor Teste', 'tutor@example.com', 'senha123');
    usuarioTeste = resultadoCadastro.usuario;
  });

  test('TC0001 - deve filtrar pets perdidos por nome e localidade', () => {
    // Registrar vários pets para o mesmo usuário
    const pet1 = petService.registrarPetPerdido({
      nome: 'Luna',
      especie: 'Gato', 
      raca: 'Persa',
      genero: 'Fêmea',
      idade: '2 anos',
      cor: 'Cinza',
      localPerdido: 'Parque da Jaqueira, Recife',
      dataPerdido: '10/07/2024',
      comentarioTutor: 'Muito tímida'
    }, usuarioTeste.id);
    
    const pet2 = petService.registrarPetPerdido({
      nome: 'Lunático',  // Nome com acento
      especie: 'Cachorro', 
      raca: 'Buldogue',
      genero: 'Macho',
      idade: '3 anos',
      cor: 'Marrom',
      localPerdido: 'Praia de Boa Viagem, Recife',
      dataPerdido: '12/07/2024',
      comentarioTutor: 'Usa coleira vermelha'
    }, usuarioTeste.id);
    
    const pet3 = petService.registrarPetPerdido({
      nome: 'Bolinha',
      especie: 'Cachorro', 
      raca: 'SRD',
      genero: 'Macho',
      idade: '1 ano',
      cor: 'Caramelo',
      localPerdido: 'Avenida Boa Viagem, Recife',
      dataPerdido: '15/07/2024',
      comentarioTutor: 'Muito agitado'
    }, usuarioTeste.id);
    
    // Adicionar pets ao usuário
    usuarioTeste.adicionarPetRegistrado(pet1.id);
    usuarioTeste.adicionarPetRegistrado(pet2.id);
    usuarioTeste.adicionarPetRegistrado(pet3.id);
    
    // Exibe os pets para depuração
    console.log("Pets registrados:", petService.pets.map(p => ({id: p.id, nome: p.nome, local: p.localPerdido})));
    
    // Verificar busca por nome - SEM acento no termo de busca
    const resultadoNome = petService.buscarPets({nome: 'luna'});
    console.log("Resultado da busca por 'luna':", resultadoNome.map(p => ({id: p.id, nome: p.nome})));
    
    // Verifica a quantidade de pets encontrados
    expect(resultadoNome.length).toBe(2);

    // Verificamos manualmente se cada pet foi encontrado para facilitar a depuração
    const encontrouLuna = resultadoNome.some(pet => pet.nome === 'Luna');
    const encontrouLunatico = resultadoNome.some(pet => pet.nome === 'Lunático');
    
    // Adicionamos mensagens de erro mais descritivas
    expect(encontrouLuna).toBe(true, "O pet 'Luna' deveria estar nos resultados");
    expect(encontrouLunatico).toBe(true, "O pet 'Lunático' deveria estar nos resultados");
    
    // Teste com acento no termo de busca
    const resultadoNomeComAcento = petService.buscarPets({nome: 'lunático'});
    console.log("Resultado da busca por 'lunático':", resultadoNomeComAcento.map(p => ({id: p.id, nome: p.nome})));
    expect(resultadoNomeComAcento.length).toBe(1);
    expect(resultadoNomeComAcento[0].nome).toBe('Lunático');
    
    // Verificar busca por localidade
    const resultadoLocalidade = petService.buscarPets({localidade: 'Boa Viagem'});
    console.log("Resultado da busca por 'Boa Viagem':", resultadoLocalidade.map(p => ({id: p.id, nome: p.nome, local: p.localPerdido})));
    
    expect(resultadoLocalidade.length).toBe(2);
    
    // Verificar se os pets em Boa Viagem estão presentes
    const temLunaticoEmBoaViagem = resultadoLocalidade.some(pet => pet.nome === 'Lunático');
    const temBolinhaEmBoaViagem = resultadoLocalidade.some(pet => pet.nome === 'Bolinha');
    
    expect(temLunaticoEmBoaViagem).toBe(true);
    expect(temBolinhaEmBoaViagem).toBe(true);
    
    // Verificar busca combinada (nome e localidade)
    const resultadoCombinado = petService.buscarPets({
      nome: 'Luna',
      localidade: 'Boa Viagem'
    });
    console.log("Resultado da busca combinada (Luna + Boa Viagem):", resultadoCombinado.map(p => ({id: p.id, nome: p.nome})));
    
    expect(resultadoCombinado.length).toBe(1);
    expect(resultadoCombinado[0].nome).toBe('Lunático');
    
    // Marcar um pet como encontrado e verificar que não aparece mais na busca de perdidos
    petService.marcarPetComoEncontrado(pet2.id);
    const resultadoAposEncontrar = petService.buscarPets({nome: 'Luna'});
    console.log("Resultado após marcar 'Lunático' como encontrado:", resultadoAposEncontrar.map(p => ({id: p.id, nome: p.nome})));
    
    expect(resultadoAposEncontrar.length).toBe(1);
    expect(resultadoAposEncontrar[0].nome).toBe('Luna');
  });

  // Mantendo os outros testes...
  test('TC0002 - deve permitir que um usuário registre e encontre seu pet', () => {
    // Verificar que o usuário foi cadastrado corretamente
    expect(usuarioTeste).toBeDefined();
    expect(usuarioTeste.id).toBeDefined();
    
    // Dados do pet a ser registrado
    const dadosPet = {
      nome: 'Pipoca',
      especie: 'Cachorro',
      raca: 'Poodle',
      genero: 'Fêmea',
      idade: '4 anos',
      cor: 'Branco',
      localPerdido: 'Shopping Recife',
      dataPerdido: '15/07/2024',
      comentarioTutor: 'Usa laço rosa na cabeça',
      foto: ''
    };
    
    // Registrar o pet perdido
    const petRegistrado = petService.registrarPetPerdido(dadosPet, usuarioTeste.id);
    usuarioTeste.adicionarPetRegistrado(petRegistrado.id);
    
    // Verificar que o pet foi registrado corretamente
    expect(petRegistrado.id).toBeDefined();
    expect(petRegistrado.nome).toBe('Pipoca');
    expect(petRegistrado.idTutor).toBe(usuarioTeste.id);
    expect(petRegistrado.status).toBe('PERDIDO');
    
    // Verificar que o pet está associado ao usuário
    expect(usuarioTeste.petsRegistrados).toContain(petRegistrado.id);
    
    // Marcar o pet como encontrado
    const resultado = petService.marcarPetComoEncontrado(petRegistrado.id);
    
    // Verificar que o pet foi marcado como encontrado
    expect(resultado.success).toBe(true);
    
    // Buscar o pet atualizado
    const petAtualizado = petService.buscarPetPorId(petRegistrado.id);
    
    // Verificar os dados atualizados
    expect(petAtualizado.status).toBe('ENCONTRADO');
    expect(petAtualizado.dataReencontro).not.toBeNull();
    
    // Verificar que o pet aparece no histórico de reencontros
    const historico = petService.listarHistoricoReencontros();
    expect(historico.length).toBe(1);
    expect(historico[0].id).toBe(petRegistrado.id);
  });

  test('TC0003 - deve permitir que diferentes usuários registrem pets', () => {
    // Cadastrar um segundo usuário
    const cadastroUsuario2 = authService.cadastrar('Segunda Tutora', 'tutora2@example.com', 'outrasenha');
    const usuarioTeste2 = cadastroUsuario2.usuario;
    
    // Registrar pet para o primeiro usuário
    const pet1 = petService.registrarPetPerdido({
      nome: 'Rex',
      especie: 'Cachorro',
      raca: 'Pastor Alemão',
      genero: 'Macho',
      idade: '5 anos',
      cor: 'Preto e Marrom',
      localPerdido: 'Centro da Cidade',
      dataPerdido: '05/07/2024',
      comentarioTutor: 'Usa coleira verde'
    }, usuarioTeste.id);
    usuarioTeste.adicionarPetRegistrado(pet1.id);
    
    // Registrar pet para o segundo usuário
    const pet2 = petService.registrarPetPerdido({
      nome: 'Mimi',
      especie: 'Gato',
      raca: 'SRD',
      genero: 'Fêmea',
      idade: '2 anos',
      cor: 'Tricolor',
      localPerdido: 'Condomínio Jardins',
      dataPerdido: '10/07/2024',
      comentarioTutor: 'Muito medrosa'
    }, usuarioTeste2.id);
    usuarioTeste2.adicionarPetRegistrado(pet2.id);
    
    // Verificar que os pets estão registrados corretamente
    expect(pet1.idTutor).toBe(usuarioTeste.id);
    expect(pet2.idTutor).toBe(usuarioTeste2.id);
    
    // Verificar que cada usuário tem apenas seu próprio pet na lista
    expect(usuarioTeste.petsRegistrados).toContain(pet1.id);
    expect(usuarioTeste.petsRegistrados).not.toContain(pet2.id);
    expect(usuarioTeste2.petsRegistrados).toContain(pet2.id);
    expect(usuarioTeste2.petsRegistrados).not.toContain(pet1.id);
    
    // Verificar que o sistema lista ambos os pets como perdidos
    const petsPerdidos = petService.listarTodosOsPets('PERDIDO');
    expect(petsPerdidos.length).toBe(2);
    expect(petsPerdidos.some(pet => pet.nome === 'Rex')).toBe(true);
    expect(petsPerdidos.some(pet => pet.nome === 'Mimi')).toBe(true);
  });
});