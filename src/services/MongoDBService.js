import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

class MongoDBService {
  constructor() {
    this.connection = null;
    this.models = {};
  }

  async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI;
      
      if (!mongoUri) {
        throw new Error('MONGODB_URI não encontrada nas variáveis de ambiente');
      }

      this.connection = await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      console.log('✅ Conexão com MongoDB estabelecida.');
      await this.createSchemas();
    } catch (error) {
      console.error('❌ Erro ao conectar ao MongoDB:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect();
      console.log('✅ Conexão com MongoDB encerrada.');
      this.connection = null;
    }
  }

  async createSchemas() {
    // Schema para Usuários
    const usuarioSchema = new mongoose.Schema({
      nome: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      senha: { type: String, required: true }
    }, {
      timestamps: true // Adiciona createdAt e updatedAt automaticamente
    });

    // Schema para Pets
    const petSchema = new mongoose.Schema({
      nome: { type: String, required: true },
      especie: { type: String, required: true },
      raca: { type: String },
      genero: { type: String },
      idade: { type: String },
      cor: { type: String },
      localPerdido: { type: String },
      dataPerdido: { type: String },
      comentarioTutor: { type: String },
      foto: { type: String },
      idTutor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario',
        required: true 
      },
      status: { 
        type: String, 
        enum: ['PERDIDO', 'ENCONTRADO'], 
        default: 'PERDIDO' 
      },
      dataRegistro: { type: String },
      dataReencontro: { type: String, default: null }
    }, {
      timestamps: true
    });

    // Criar os modelos
    this.models.Usuario = mongoose.model('Usuario', usuarioSchema);
    this.models.Pet = mongoose.model('Pet', petSchema);

    console.log('✅ Schemas do MongoDB criados.');
  }

  // Métodos para compatibilidade com a interface SQLite existente

  async get(query, params = []) {
    // Este método será adaptado pelos serviços específicos
    throw new Error('Use métodos específicos do MongoDB nos serviços');
  }

  async all(query, params = []) {
    // Este método será adaptado pelos serviços específicos
    throw new Error('Use métodos específicos do MongoDB nos serviços');
  }

  async run(query, params = []) {
    // Este método será adaptado pelos serviços específicos
    throw new Error('Use métodos específicos do MongoDB nos serviços');
  }

  // Novos métodos específicos para MongoDB
  getModel(modelName) {
    return this.models[modelName];
  }

  async findById(modelName, id) {
    const Model = this.getModel(modelName);
    return await Model.findById(id);
  }

  async findOne(modelName, filter) {
    const Model = this.getModel(modelName);
    return await Model.findOne(filter);
  }

  async find(modelName, filter = {}) {
    const Model = this.getModel(modelName);
    return await Model.find(filter);
  }

  async create(modelName, data) {
    const Model = this.getModel(modelName);
    const document = new Model(data);
    return await document.save();
  }

  async updateById(modelName, id, data) {
    const Model = this.getModel(modelName);
    return await Model.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteById(modelName, id) {
    const Model = this.getModel(modelName);
    return await Model.findByIdAndDelete(id);
  }

  async count(modelName, filter = {}) {
    const Model = this.getModel(modelName);
    return await Model.countDocuments(filter);
  }
}

export default MongoDBService;