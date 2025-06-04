async function popularDadosIniciaisMongoDB(authService, petService, dbService) {
  console.log("🌱 Verificando e populando dados iniciais no MongoDB...");

  try {
    // Verificar se já existem usuários
    const countUsuarios = await dbService.count('Usuario');
    
    if (countUsuarios === 0) {
      console.log("   Coleção 'usuarios' vazia. Inserindo usuários iniciais...");

      // Cadastrar usuários
      const cadastroUser1 = await authService.cadastrar(
        "Ana Silva",
        "ana@example.com",
        "senha123"
      );
      const cadastroUser2 = await authService.cadastrar(
        "Bruno Costa",
        "bruno@example.com",
        "senha456"
      );
      const cadastroUser3 = await authService.cadastrar(
        "Carlos Lima",
        "carlos@example.com",
        "senha789"
      );

      const user1 = cadastroUser1.success ? cadastroUser1.usuario : null;
      const user2 = cadastroUser2.success ? cadastroUser2.usuario : null;
      const user3 = cadastroUser3.success ? cadastroUser3.usuario : null;

      console.log("   ✅ Usuários criados:", { user1: user1?.nome, user2: user2?.nome, user3: user3?.nome });

      // Pets para Ana Silva
      if (user1) {
        const pet1Ana = await petService.registrarPetPerdido(
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
            foto: "/images/pets/amor.jpg",
          },
          user1.id
        );

        const pet2Ana = await petService.registrarPetPerdido(
          {
            nome: "Mia",
            especie: "Gato",
            raca: "Siamês",
            genero: "Fêmea",
            idade: "1 ano",
            cor: "Creme com pontas escuras",
            localPerdido: "Telhado da vizinhança, Rua das Flores, 123, Rio de Janeiro",
            dataPerdido: "12/07/2024",
            comentarioTutor: "Assustada, pode estar escondida.",
            foto: "/images/pets/gatoo.jpg",
          },
          user1.id
        );

        console.log("   ✅ Pets da Ana criados:", { pet1: pet1Ana.nome, pet2: pet2Ana.nome });
      }

      // Pets para Bruno Costa
      if (user2) {
        const pet1Bruno = await petService.registrarPetPerdido(
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
            foto: "/images/pets/cachorroo.jpg"
          },
          user2.id
        );

        console.log("   ✅ Pet do Bruno criado:", pet1Bruno.nome);
      }

      // Pets para Carlos Lima
      if (user3) {
        const pet1Carlos = await petService.registrarPetPerdido(
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

        // Marcar Fred como encontrado para histórico
        await petService.marcarPetComoEncontrado(pet1Carlos.id);
        
        console.log("   ✅ Pet do Carlos criado e marcado como encontrado:", pet1Carlos.nome);
      }

      // Verificar estatísticas finais
      const stats = await petService.obterEstatisticas();
      console.log("   📊 Estatísticas finais:", stats);

      console.log("✅ Dados iniciais populados com sucesso no MongoDB!");
    } else {
      console.log(`   MongoDB já possui ${countUsuarios} usuários. Pulando a inserção inicial.`);
    }
  } catch (error) {
    console.error("❌ Erro ao popular dados iniciais no MongoDB:", error);
    throw error;
  }
}

export default popularDadosIniciaisMongoDB;