import Pet from "../models/Pet.js";

class PetService {
  constructor() {
    this.pets = []; // Em um app real, viria de um banco de dados
  }

  registrarPetPerdido(dadosPet, idTutor) {
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
    this.pets.push(novoPet);
    return novoPet;
  }

  listarTodosOsPets(status = null) {
    // Pode filtrar por status (PERDIDO, ENCONTRADO)
    if (status) {
      return this.pets.filter((pet) => pet.status === status);
    }
    return this.pets;
  }

  buscarPets(filtros, status = "PERDIDO") {
    let petsFiltrados = this.pets.filter((pet) => pet.status === status);

    if (filtros.nome) {
      petsFiltrados = petsFiltrados.filter((pet) =>
        pet.nome.toLowerCase().includes(filtros.nome.toLowerCase())
      );
    }
    if (filtros.localidade) {
      petsFiltrados = petsFiltrados.filter((pet) =>
        pet.localPerdido
          .toLowerCase()
          .includes(filtros.localidade.toLowerCase())
      );
    }
    return petsFiltrados;
  }

  buscarPetPorId(id) {
    return this.pets.find((pet) => pet.id === parseInt(id));
  }

  marcarPetComoEncontrado(idPet) {
    const pet = this.buscarPetPorId(idPet);
    if (pet && pet.status === "PERDIDO") {
      pet.marcarComoEncontrado();
      return {
        success: true,
        message: `Pet "${pet.nome}" marcado como ENCONTRADO.`,
      };
    }
    return {
      success: false,
      message: "Pet não encontrado ou já marcado como encontrado.",
    };
  }

  listarHistoricoReencontros() {
    return this.pets.filter((pet) => pet.status === "ENCONTRADO");
  }
}

export default PetService;
