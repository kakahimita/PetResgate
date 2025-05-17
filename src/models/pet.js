class Pet {
  constructor(idPet, nome, especie, raca, cor, comportamento, observacoes, foto, idade = null, vacinado = null) {
    this.idPet = idPet;
    this.nome = nome;
    this.especie = especie;
    this.raca = raca;
    this.idade = idade; 
    this.cor = cor;
    this.comportamento = comportamento;
    this.vacinado = vacinado;
    this.observacoes = observacoes;
    this.foto = foto;
  }
}
