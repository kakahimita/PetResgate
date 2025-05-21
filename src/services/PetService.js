import Pet from "../models/Pet.js";

class PetService {
  constructor(dbService) {
    this.dbService = dbService;
  }

  async registrarPetPerdido(dadosPet, idTutor) {
    try {
      const { nome, especie, raca, genero, idade, cor, localPerdido, dataPerdido, comentarioTutor, foto, } = dadosPet;

      const petId = await this.dbService.run(
        `
          INSERT INTO pets (
            nome, especie, raca, genero, idade, cor, localPerdido, dataPerdido,
            comentarioTutor, foto, idTutor, dataRegistro
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [nome, especie, raca, genero, idade, cor, localPerdido, dataPerdido, comentarioTutor, foto, idTutor, new Date().toLocaleDateString("pt-BR")]
      );

      const novoPet = new Pet(nome, especie, raca, genero, idade, cor, localPerdido, dataPerdido, comentarioTutor, foto, idTutor);
      novoPet.id = petId;
      return novoPet;
    } catch (error) {
      console.error("Erro ao registrar pet:", error);
      throw error;
    }
  }

  async listarTodosOsPets(status = null) {
    try {
      let query = "SELECT * FROM pets";
      const params = [];

      if (status) {
        query += " WHERE status = ?";
        params.push(status);
      }

      const rows = await this.dbService.all(query, params);
      return rows.map(row => this.mapRowToPet(row));
    } catch (error) {
      console.error("Erro ao listar pets:", error);
      throw error;
    }
  }

  async buscarPets(filtros, status = "PERDIDO") {
    try {
      let query = "SELECT * FROM pets WHERE status = ?";
      const params = [status];
      const conditions = [];

      if (filtros.nome) {
        conditions.push("nome LIKE ?");
        params.push(`%${filtros.nome}%`);
      }
      if (filtros.localidade) {
        conditions.push("localPerdido LIKE ?");
        params.push(`%${filtros.localidade}%`);
      }

      if (conditions.length > 0) {
        query += " AND " + conditions.join(" AND ");
      }

      const rows = await this.dbService.all(query, params);
      return rows.map(row => this.mapRowToPet(row));
    } catch (error) {
      console.error("Erro ao buscar pets:", error);
      throw error;
    }
  }

  async buscarPetPorId(id) {
    try {
      const row = await this.dbService.get(
        "SELECT * FROM pets WHERE id = ?",
        [id]
      );
      return row ? this.mapRowToPet(row) : null;
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

      await this.dbService.run(
        "UPDATE pets SET status = 'ENCONTRADO', dataReencontro = ? WHERE id = ?",
        [new Date().toLocaleDateString("pt-BR"), idPet]
      );

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
      const rows = await this.dbService.all(
        "SELECT * FROM pets WHERE status = 'ENCONTRADO'"
      );
      return rows.map(row => this.mapRowToPet(row));
    } catch (error) {
      console.error("Erro ao listar histórico de reencontros:", error);
      throw error;
    }
  }

  mapRowToPet(row) {
    const pet = new Pet(
      row.nome, row.especie, row.raca, row.genero, row.idade, row.cor,
      row.localPerdido, row.dataPerdido, row.comentarioTutor, row.foto, row.idTutor
    );
    pet.id = row.id;
    pet.status = row.status;
    pet.dataRegistro = row.dataRegistro;
    pet.dataReencontro = row.dataReencontro;
    return pet;
  }
}

export default PetService;
