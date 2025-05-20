class Pet {
    static proximoId = 1;

    constructor(nome, especie, raca, genero, idade, cor, localPerdido, dataPerdido, comentarioTutor, foto, idTutor) {
        this.id = Pet.proximoId++;
        this.nome = nome;
        this.especie = especie;
        this.raca = raca;
        this.genero = genero; // Macho, Fêmea
        this.idade = idade;   // ex: "2 anos", "Aproximadamente 5 meses"
        this.cor = cor;
        this.localPerdido = localPerdido;
        this.dataPerdido = dataPerdido; // DD/MM/AAAA
        this.comentarioTutor = comentarioTutor;
        this.foto = foto || "N/A (Console não suporta imagens)"; // Placeholder para foto
        this.idTutor = idTutor; // ID do usuário que registrou
        this.status = "PERDIDO"; // PERDIDO, ENCONTRADO
        this.dataRegistro = new Date().toLocaleDateString('pt-BR');
        this.dataReencontro = null;
    }

    marcarComoEncontrado() {
        this.status = "ENCONTRADO";
        this.dataReencontro = new Date().toLocaleDateString('pt-BR');
    }

    getDetalhes() {
        return `
------------------------------------
ID: ${this.id} | Status: ${this.status}
Nome: ${this.nome} (${this.especie} - ${this.raca})
Gênero: ${this.genero} | Idade: ${this.idade} | Cor: ${this.cor}
Perdido em: ${this.localPerdido} (Data: ${this.dataPerdido})
Foto: ${this.foto}
Comentário do Tutor: ${this.comentarioTutor}
Registrado no sistema em: ${this.dataRegistro}
${this.status === "ENCONTRADO" ? `Reencontrado em: ${this.dataReencontro}` : ''}
------------------------------------`;
    }
}

module.exports = Pet;