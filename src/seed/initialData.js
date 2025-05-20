// src/seed/initialData.js

// Esta função receberá as instâncias dos serviços como parâmetros
function popularDadosIniciais(authService, petService) {
  console.log("🌱 Populando dados iniciais...");

  // Cadastrar alguns usuários
  const cadastroUser1 = authService.cadastrar(
    "Ana Silva",
    "ana@example.com",
    "senha123"
  );
  const cadastroUser2 = authService.cadastrar(
    "Bruno Costa",
    "bruno@example.com",
    "senha456"
  );
  const cadastroUser3 = authService.cadastrar(
    "Carlos Lima",
    "carlos@example.com",
    "senha789"
  );

  const user1 = cadastroUser1.success ? cadastroUser1.usuario : null;
  const user2 = cadastroUser2.success ? cadastroUser2.usuario : null;
  const user3 = cadastroUser3.success ? cadastroUser3.usuario : null;

  if (user1) {
    // Registrar alguns pets para Ana
    const pet1Ana = petService.registrarPetPerdido(
      {
        nome: "Bolinha",
        especie: "Cachorro",
        raca: "Poodle",
        genero: "Macho",
        idade: "3 anos",
        cor: "Branco",
        localPerdido: "Parque Central, São Paulo",
        dataPerdido: "10/07/2024",
        comentarioTutor: "Muito dócil, fugiu durante passeio.",
      },
      user1.id
    );
    user1.adicionarPetRegistrado(pet1Ana.id);

    const pet2Ana = petService.registrarPetPerdido(
      {
        nome: "Mia",
        especie: "Gato",
        raca: "Siamês",
        genero: "Fêmea",
        idade: "1 ano",
        cor: "Creme com pontas escuras",
        localPerdido:
          "Telhado da vizinhança, Rua das Flores, 123, Rio de Janeiro",
        dataPerdido: "12/07/2024",
        comentarioTutor: "Assustada, pode estar escondida.",
      },
      user1.id
    );
    user1.adicionarPetRegistrado(pet2Ana.id);
  }

  if (user2) {
    // Registrar um pet para Bruno
    const pet1Bruno = petService.registrarPetPerdido(
      {
        nome: "Rex",
        especie: "Cachorro",
        raca: "Pastor Alemão",
        genero: "Macho",
        idade: "5 anos",
        cor: "Preto e Marrom",
        localPerdido: "Rua das Palmeiras, Belo Horizonte",
        dataPerdido: "05/07/2024",
        comentarioTutor: "Usa coleira vermelha.",
      },
      user2.id
    );
    user2.adicionarPetRegistrado(pet1Bruno.id);
  }

  if (user3) {
    // Registrar um pet para Carlos e marcá-lo como encontrado para o histórico
    const pet1Carlos = petService.registrarPetPerdido(
      {
        nome: "Fred",
        especie: "Cachorro",
        raca: "SRD",
        genero: "Macho",
        idade: "2 anos",
        cor: "Caramelo",
        localPerdido: "Praça da Sé, Salvador",
        dataPerdido: "01/06/2024",
        comentarioTutor: "Amigável, mas um pouco medroso.",
      },
      user3.id
    );
    user3.adicionarPetRegistrado(pet1Carlos.id);
    // Marcar como encontrado para popular o histórico
    petService.marcarPetComoEncontrado(pet1Carlos.id); // Supõe que o ID é o mesmo, o que é verdade pela implementação atual
  }
  console.log("✅ Dados iniciais populados com sucesso.");
}

export default popularDadosIniciais;
