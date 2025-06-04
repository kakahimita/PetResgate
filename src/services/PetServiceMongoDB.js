import Pet from "../models/Pet.js";

class PetServiceMongoDB {
  constructor(dbService) {
    this.dbService = dbService;
  }

  async registrarPetPerdido(dadosPet, idTutor) {
    try {
      const {
        nome,
        especie,
        raca,
        genero,
        idade,
        cor,
        localPerdido,
        dataPerdido,
        comentarioTutor,
        foto,
      } = dadosPet;

      // Criar pet no MongoDB
      const novoPetMongo = await this.dbService.create("Pet", {
        nome,
        especie,
        raca,
        genero,
        idade,
        cor,
        localPerdido,
        dataPerdido,
        comentarioTutor,
        foto,
        idTutor,
        status: "PERDIDO",
        dataRegistro: new Date().toLocaleDateString("pt-BR"),
        dataReencontro: null,
      });

      // Criar instância do modelo para compatibilidade
      const novoPet = new Pet(
        nome,
        especie,
        raca,
        genero,
        idade,
        cor,
        localPerdido,
        dataPerdido,
        comentarioTutor,
        foto,
        idTutor
      );
      novoPet.id = novoPetMongo._id.toString();
      novoPet.status = novoPetMongo.status;
      novoPet.dataRegistro = novoPetMongo.dataRegistro;

      return novoPet;
    } catch (error) {
      console.error("Erro ao registrar pet:", error);
      throw error;
    }
  }

  async listarTodosOsPets(status = null) {
    try {
      const filter = status ? { status } : {};
      const petsMongo = await this.dbService.find("Pet", filter);

      return petsMongo.map((petMongo) => this.mapMongoToPet(petMongo));
    } catch (error) {
      console.error("Erro ao listar pets:", error);
      throw error;
    }
  }

  async buscarPets(filtros, status = "PERDIDO") {
    try {
      const filter = { status };

      // Aplicar filtros de busca
      if (filtros.nome) {
        filter.nome = { $regex: filtros.nome, $options: "i" }; // Case insensitive
      }

      if (filtros.localidade) {
        filter.localPerdido = { $regex: filtros.localidade, $options: "i" };
      }

      const petsMongo = await this.dbService.find("Pet", filter);
      return petsMongo.map((petMongo) => this.mapMongoToPet(petMongo));
    } catch (error) {
      console.error("Erro ao buscar pets:", error);
      throw error;
    }
  }

  async buscarPetPorId(id) {
    try {
      const petMongo = await this.dbService.findById("Pet", id);
      return petMongo ? this.mapMongoToPet(petMongo) : null;
    } catch (error) {
      console.error("Erro ao buscar pet por ID:", error);
      throw error;
    }
  }

  async marcarPetComoEncontrado(idPet) {
    try {
      const pet = await this.buscarPetPorId(idPet);
      if (!pet || pet.status !== "PERDIDO") {
        return {
          success: false,
          message: "Pet não encontrado ou já marcado como encontrado.",
        };
      }

      const dataReencontro = new Date().toLocaleDateString("pt-BR");

      await this.dbService.updateById("Pet", idPet, {
        status: "ENCONTRADO",
        dataReencontro,
      });

      return {
        success: true,
        message: `Pet "${pet.nome}" marcado como ENCONTRADO.`,
      };
    } catch (error) {
      console.error("Erro ao marcar pet como encontrado:", error);
      return {
        success: false,
        message: "Erro ao marcar pet como encontrado.",
      };
    }
  }

  async listarHistoricoReencontros() {
    try {
      const petsMongo = await this.dbService.find("Pet", {
        status: "ENCONTRADO",
      });
      return petsMongo.map((petMongo) => this.mapMongoToPet(petMongo));
    } catch (error) {
      console.error("Erro ao listar histórico de reencontros:", error);
      throw error;
    }
  }

  // Métodos auxiliares
  mapMongoToPet(petMongo) {
    const pet = new Pet(
      petMongo.nome,
      petMongo.especie,
      petMongo.raca,
      petMongo.genero,
      petMongo.idade,
      petMongo.cor,
      petMongo.localPerdido,
      petMongo.dataPerdido,
      petMongo.comentarioTutor,
      petMongo.foto,
      petMongo.idTutor.toString()
    );

    pet.id = petMongo._id.toString();
    pet.status = petMongo.status;
    pet.dataRegistro = petMongo.dataRegistro;
    pet.dataReencontro = petMongo.dataReencontro;

    return pet;
  }

  // Método para buscar pets por tutor
  async buscarPetsPorTutor(idTutor) {
    try {
      const petsMongo = await this.dbService.find("Pet", { idTutor });
      return petsMongo.map((petMongo) => this.mapMongoToPet(petMongo));
    } catch (error) {
      console.error("Erro ao buscar pets por tutor:", error);
      throw error;
    }
  }

  // Método para obter estatísticas
  async obterEstatisticas() {
    try {
      const total = await this.dbService.count("Pet");
      const perdidos = await this.dbService.count("Pet", { status: "PERDIDO" });
      const encontrados = await this.dbService.count("Pet", {
        status: "ENCONTRADO",
      });

      return {
        total,
        perdidos,
        encontrados,
      };
    } catch (error) {
      console.error("Erro ao obter estatísticas:", error);
      throw error;
    }
  }
}

export default PetServiceMongoDB;
