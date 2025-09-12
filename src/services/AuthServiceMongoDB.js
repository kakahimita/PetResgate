import Usuario from "../models/Usuario.js";

class AuthServiceMongoDB {
  constructor(dbService) {
    this.dbService = dbService;
  }

  async cadastrar(nome, email, senha, dadosExtras = {}) {
    try {
      // Verificar se já existe usuário com esse email
      const existingUser = await this.dbService.findOne('Usuario', { email });

      if (existingUser) {
        return { success: false, message: "Email já cadastrado." };
      }

      // Criar novo usuário no MongoDB com campos expandidos
      const dadosUsuario = {
        nome,
        email,
        senha,
        whatsapp: dadosExtras.whatsapp || '',
        descricao: dadosExtras.descricao || '',
        endereco: {
          rua: dadosExtras.endereco?.rua || '',
          bairro: dadosExtras.endereco?.bairro || '',
          cidade: dadosExtras.endereco?.cidade || '',
          estado: dadosExtras.endereco?.estado || ''
        },
        redesSociais: {
          facebook: dadosExtras.redesSociais?.facebook || '',
          instagram: dadosExtras.redesSociais?.instagram || '',
          twitter: dadosExtras.redesSociais?.twitter || ''
        },
        dataCadastro: new Date(),
        ultimoLogin: new Date(),
        petsRegistrados: []
      };

      const novoUsuarioMongo = await this.dbService.create('Usuario', dadosUsuario);

      // Criar instância do modelo para compatibilidade
      const novoUsuario = new Usuario(nome, email, senha, dadosExtras);
      novoUsuario.id = novoUsuarioMongo._id.toString();

      return {
        success: true,
        message: "Usuário cadastrado com sucesso!",
        usuario: novoUsuario,
      };
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      return { success: false, message: "Erro ao cadastrar usuário." };
    }
  }

  async login(email, senha) {
    try {
      const usuarioMongo = await this.dbService.findOne('Usuario', { 
        email, 
        senha 
      });

      if (usuarioMongo) {
        // Criar instância com todos os dados expandidos
        const dadosExtras = {
          whatsapp: usuarioMongo.whatsapp,
          descricao: usuarioMongo.descricao,
          endereco: usuarioMongo.endereco,
          redesSociais: usuarioMongo.redesSociais,
          dataCadastro: usuarioMongo.dataCadastro,
          ultimoLogin: usuarioMongo.ultimoLogin
        };
        
        const usuarioLogado = new Usuario(usuarioMongo.nome, usuarioMongo.email, usuarioMongo.senha, dadosExtras);
        usuarioLogado.id = usuarioMongo._id.toString();
        usuarioLogado.petsRegistrados = usuarioMongo.petsRegistrados || [];
        
        // Atualizar último login
        await this.dbService.updateById('Usuario', usuarioMongo._id, { 
          ultimoLogin: new Date() 
        });
        
        return {
          success: true,
          message: "Login bem-sucedido!",
          usuario: usuarioLogado,
        };
      }
      return { success: false, message: "Email ou senha inválidos." };
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return { success: false, message: "Erro ao fazer login." };
    }
  }

  async getUsuarioById(id) {
    try {
      const usuarioMongo = await this.dbService.findById('Usuario', id);

      if (usuarioMongo) {
        const usuarioEncontrado = new Usuario(usuarioMongo.nome, usuarioMongo.email, usuarioMongo.senha);
        usuarioEncontrado.id = usuarioMongo._id.toString();
        return usuarioEncontrado;
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar usuário por ID:", error);
      return null;
    }
  }

  // Método adicional para buscar por email
  async getUsuarioByEmail(email) {
    try {
      const usuarioMongo = await this.dbService.findOne('Usuario', { email });

      if (usuarioMongo) {
        const usuarioEncontrado = new Usuario(usuarioMongo.nome, usuarioMongo.email, usuarioMongo.senha);
        usuarioEncontrado.id = usuarioMongo._id.toString();
        return usuarioEncontrado;
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar usuário por email:", error);
      return null;
    }
  }

  // Método para atualizar perfil do usuário
  async atualizarPerfil(userId, dadosNovos) {
    try {
      const dadosUpdate = {};
      
      if (dadosNovos.nome) dadosUpdate.nome = dadosNovos.nome;
      if (dadosNovos.whatsapp !== undefined) dadosUpdate.whatsapp = dadosNovos.whatsapp;
      if (dadosNovos.descricao !== undefined) dadosUpdate.descricao = dadosNovos.descricao;
      
      if (dadosNovos.endereco) {
        dadosUpdate.endereco = dadosNovos.endereco;
      }
      
      if (dadosNovos.redesSociais) {
        dadosUpdate.redesSociais = dadosNovos.redesSociais;
      }
      
      dadosUpdate.ultimoLogin = new Date();
      
      const usuarioAtualizado = await this.dbService.updateById('Usuario', userId, dadosUpdate);
      
      if (usuarioAtualizado) {
        return {
          success: true,
          message: "Perfil atualizado com sucesso!",
          usuario: usuarioAtualizado
        };
      }
      
      return { success: false, message: "Erro ao atualizar perfil." };
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      return { success: false, message: "Erro ao atualizar perfil." };
    }
  }

  // Método para listar todos os usuários (para compatibilidade com testes)
  async listarTodosUsuarios() {
    try {
      const usuariosMongo = await this.dbService.find('Usuario');
      
      return usuariosMongo.map(usuarioMongo => {
        const dadosExtras = {
          whatsapp: usuarioMongo.whatsapp,
          descricao: usuarioMongo.descricao,
          endereco: usuarioMongo.endereco,
          redesSociais: usuarioMongo.redesSociais,
          dataCadastro: usuarioMongo.dataCadastro,
          ultimoLogin: usuarioMongo.ultimoLogin
        };
        const usuario = new Usuario(usuarioMongo.nome, usuarioMongo.email, usuarioMongo.senha, dadosExtras);
        usuario.id = usuarioMongo._id.toString();
        usuario.petsRegistrados = usuarioMongo.petsRegistrados || [];
        return usuario;
      });
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      return [];
    }
  }
}

export default AuthServiceMongoDB;