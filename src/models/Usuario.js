class Usuario {
  static proximoId = 1;

  constructor(nome, email, senha, dadosExtras = {}) {
    this.id = Usuario.proximoId++;
    this.nome = nome;
    this.email = email; // Usado para login
    this.senha = senha; // Em um app real, isso seria hasheado
    this.petsRegistrados = []; // IDs dos pets que este usuário registrou como perdidos
    
    // Novos campos opcionais do perfil
    this.whatsapp = dadosExtras.whatsapp || '';
    this.descricao = dadosExtras.descricao || '';
    this.endereco = {
      rua: dadosExtras.endereco?.rua || '',
      bairro: dadosExtras.endereco?.bairro || '',
      cidade: dadosExtras.endereco?.cidade || '',
      estado: dadosExtras.endereco?.estado || ''
    };
    this.redesSociais = {
      facebook: dadosExtras.redesSociais?.facebook || '',
      instagram: dadosExtras.redesSociais?.instagram || '',
      twitter: dadosExtras.redesSociais?.twitter || ''
    };
    
    // Campos de controle
    this.dataCadastro = dadosExtras.dataCadastro || new Date();
    this.ultimoLogin = dadosExtras.ultimoLogin || new Date();
  }

  adicionarPetRegistrado(petId) {
    this.petsRegistrados.push(petId);
  }

  // Método para calcular completude do perfil
  calcularCompletudeProfile() {
    let campos = 0;
    let preenchidos = 0;
    
    // Campos básicos (sempre contam)
    campos += 3;
    if (this.nome) preenchidos++;
    if (this.email) preenchidos++;
    preenchidos++; // senha sempre existe
    
    // Campos opcionais
    campos += 7;
    if (this.whatsapp) preenchidos++;
    if (this.descricao) preenchidos++;
    if (this.endereco.bairro) preenchidos++;
    if (this.endereco.cidade) preenchidos++;
    if (this.redesSociais.facebook) preenchidos++;
    if (this.redesSociais.instagram) preenchidos++;
    if (this.redesSociais.twitter) preenchidos++;
    
    return Math.round((preenchidos / campos) * 100);
  }

  // Método para atualizar perfil
  atualizarPerfil(dadosNovos) {
    if (dadosNovos.nome) this.nome = dadosNovos.nome;
    if (dadosNovos.whatsapp !== undefined) this.whatsapp = dadosNovos.whatsapp;
    if (dadosNovos.descricao !== undefined) this.descricao = dadosNovos.descricao;
    
    if (dadosNovos.endereco) {
      this.endereco = { ...this.endereco, ...dadosNovos.endereco };
    }
    
    if (dadosNovos.redesSociais) {
      this.redesSociais = { ...this.redesSociais, ...dadosNovos.redesSociais };
    }
    
    this.ultimoLogin = new Date();
  }

  // Método para obter dados públicos (sem senha)
  getDadosPublicos() {
    const { senha, ...dadosPublicos } = this;
    return dadosPublicos;
  }
}

export default Usuario;
