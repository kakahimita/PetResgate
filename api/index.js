import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api', (req, res) => {
  res.json({ message: 'API PetResgate funcionando!', status: 'OK' });
});

app.get('/api/debug', (req, res) => {
  res.json({
    mongodb_uri_exists: !!process.env.MONGODB_URI,
    mongodb_uri_length: process.env.MONGODB_URI?.length || 0,
    mongodb_uri_preview: process.env.MONGODB_URI?.substring(0, 30) + '...',
    node_env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    status: 'Debug funcionando'
  });
});

app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    stats: { total: 0, perdidos: 0, encontrados: 0 },
    message: 'Mock stats - MongoDB não conectado ainda'
  });
});

import mongoose from 'mongoose';

// Rota para investigar o que há no banco
app.get('/api/investigate', async (req, res) => {
  try {
    if (!process.env.MONGODB_URI) {
      return res.status(500).json({ error: 'MONGODB_URI não configurada' });
    }

    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });

    // Verificar qual banco estamos usando
    const dbName = mongoose.connection.db.databaseName;
    
    // Listar todas as coleções
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    // Verificar dados em cada coleção relevante
    const investigations = {};
    
    // Investigar coleções possíveis
    const possibleCollections = ['pets', 'usuarios', 'Pet', 'Usuario', 'user', 'pet'];
    
    for (const collectionName of possibleCollections) {
      if (collectionNames.includes(collectionName)) {
        const collection = mongoose.connection.db.collection(collectionName);
        const count = await collection.countDocuments();
        const sample = await collection.findOne();
        
        investigations[collectionName] = {
          count,
          sample: sample ? Object.keys(sample) : null,
          sampleData: sample
        };
      }
    }

    await mongoose.disconnect();

    res.json({
      success: true,
      database_name: dbName,
      connection_string_preview: process.env.MONGODB_URI.substring(0, 50) + '...',
      all_collections: collectionNames,
      investigations,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// Rota para re-popular dados
app.post('/api/repopulate', async (req, res) => {
  try {
    if (!process.env.MONGODB_URI) {
      return res.status(500).json({ error: 'MONGODB_URI não configurada' });
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Definir schemas básicos
    const UsuarioSchema = new mongoose.Schema({
      nome: String,
      email: String,
      senha: String
    });

    const PetSchema = new mongoose.Schema({
      nome: String,
      especie: String,
      raca: String,
      genero: String,
      idade: String,
      cor: String,
      localPerdido: String,
      dataPerdido: String,
      comentarioTutor: String,
      foto: String,
      idTutor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
      status: { type: String, default: 'PERDIDO' },
      dataRegistro: String,
      dataReencontro: String
    });

    const Usuario = mongoose.model('Usuario', UsuarioSchema);
    const Pet = mongoose.model('Pet', PetSchema);

    // Limpar dados existentes (cuidado!)
    await Usuario.deleteMany({});
    await Pet.deleteMany({});

    // Criar usuários
    const ana = await Usuario.create({
      nome: "Ana Silva",
      email: "ana@example.com",
      senha: "senha123"
    });

    const bruno = await Usuario.create({
      nome: "Bruno Costa", 
      email: "bruno@example.com",
      senha: "senha456"
    });

    const carlos = await Usuario.create({
      nome: "Carlos Lima",
      email: "carlos@example.com", 
      senha: "senha789"
    });

    // Criar pets
    const bolinha = await Pet.create({
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
      idTutor: ana._id,
      status: "PERDIDO",
      dataRegistro: new Date().toLocaleDateString("pt-BR"),
      dataReencontro: null
    });

    const mia = await Pet.create({
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
      idTutor: ana._id,
      status: "PERDIDO", 
      dataRegistro: new Date().toLocaleDateString("pt-BR"),
      dataReencontro: null
    });

    const rex = await Pet.create({
      nome: "Rex",
      especie: "Cachorro",
      raca: "Pastor Alemão",
      genero: "Macho",
      idade: "5 anos", 
      cor: "Preto e Marrom",
      localPerdido: "Rua das Palmeiras, Belo Horizonte",
      dataPerdido: "05/07/2024",
      comentarioTutor: "Usa coleira vermelha.",
      foto: "/images/pets/cachorroo.jpg",
      idTutor: bruno._id,
      status: "PERDIDO",
      dataRegistro: new Date().toLocaleDateString("pt-BR"),
      dataReencontro: null
    });

    const fred = await Pet.create({
      nome: "Fred",
      especie: "Cachorro", 
      raca: "SRD",
      genero: "Macho",
      idade: "2 anos",
      cor: "Caramelo",
      localPerdido: "Praça da Sé, Salvador",
      dataPerdido: "01/06/2024",
      comentarioTutor: "Amigável, mas um pouco medroso.",
      idTutor: carlos._id,
      status: "ENCONTRADO",
      dataRegistro: new Date().toLocaleDateString("pt-BR"),
      dataReencontro: new Date().toLocaleDateString("pt-BR")
    });

    await mongoose.disconnect();

    res.json({
      success: true,
      message: 'Dados re-populados com sucesso!',
      created: {
        usuarios: 3,
        pets: 4
      },
      pets: [
        { nome: bolinha.nome, status: bolinha.status },
        { nome: mia.nome, status: mia.status },
        { nome: rex.nome, status: rex.status },
        { nome: fred.nome, status: fred.status }
      ]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// Rota para verificar estatísticas atualizadas
app.get('/api/stats-real', async (req, res) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const Pet = mongoose.model('Pet', new mongoose.Schema({}, { strict: false }));
    
    const total = await Pet.countDocuments();
    const perdidos = await Pet.countDocuments({ status: 'PERDIDO' });
    const encontrados = await Pet.countDocuments({ status: 'ENCONTRADO' });
    
    await mongoose.disconnect();
    
    res.json({
      success: true,
      stats: { total, perdidos, encontrados },
      message: 'Estatísticas reais do MongoDB'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default app;
