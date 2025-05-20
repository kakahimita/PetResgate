class Usuario {
  static proximoId = 1;

  constructor(nome, email, senha) {
    this.id = Usuario.proximoId++;
    this.nome = nome;
    this.email = email; // Usado para login
    this.senha = senha; // Em um app real, isso seria hasheado
    this.petsRegistrados = []; // IDs dos pets que este usuário registrou como perdidos
  }

  adicionarPetRegistrado(petId) {
    this.petsRegistrados.push(petId);
  }

  // Poderíamos adicionar mais métodos conforme necessário
}

export default Usuario;
