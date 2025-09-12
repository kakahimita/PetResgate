import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
app.use(cors());
app.use(express.json());

// === SCHEMAS MONGODB ===
const UsuarioSchema = new mongoose.Schema({
  nome: String,
  email: { type: String, unique: true },
  senha: String,
  whatsapp: { type: String, default: '' },
  descricao: { type: String, default: '' },
  endereco: {
    rua: { type: String, default: '' },
    bairro: { type: String, default: '' },
    cidade: { type: String, default: '' },
    estado: { type: String, default: '' }
  },
  redesSociais: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' }
  },
  dataCadastro: { type: Date, default: Date.now },
  ultimoLogin: { type: Date, default: Date.now },
  petsRegistrados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pet' }]
}, { timestamps: true });

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
}, { timestamps: true });

// Conectar MongoDB e inicializar dados
let Usuario, Pet;
let isInitialized = false;

async function initializeMongoDB() {
  if (isInitialized) return;
  
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI não encontrada');
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    Usuario = mongoose.model('Usuario', UsuarioSchema);
    Pet = mongoose.model('Pet', PetSchema);

    // Popular dados se necessário
    await popularDadosIniciais();
    
    isInitialized = true;
    console.log('✅ MongoDB inicializado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar MongoDB:', error);
    throw error;
  }
}

async function popularDadosIniciais() {
  try {
    const countUsuarios = await Usuario.countDocuments();
    
    if (countUsuarios === 0) {
      console.log('🌱 Populando dados iniciais...');

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
      await Pet.create({
        nome: "Bolinha",
        especie: "Cachorro",
        raca: "Poodle",
        genero: "Macho",
        idade: "3 anos",
        cor: "Branco",
        localPerdido: "Parque Central, São Paulo",
        dataPerdido: "10/07/2024",
        comentarioTutor: "Muito dócil, fugiu durante passeio.",
        foto: "https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?w=400",
        idTutor: ana._id,
        status: "PERDIDO",
        dataRegistro: new Date().toLocaleDateString("pt-BR"),
        dataReencontro: null
      });

      await Pet.create({
        nome: "Mia",
        especie: "Gato",
        raca: "Siamês",
        genero: "Fêmea",
        idade: "1 ano",
        cor: "Creme com pontas escuras",
        localPerdido: "Telhado da vizinhança, Rua das Flores, 123, Rio de Janeiro",
        dataPerdido: "12/07/2024",
        comentarioTutor: "Assustada, pode estar escondida.",
        foto: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400",
        idTutor: ana._id,
        status: "PERDIDO",
        dataRegistro: new Date().toLocaleDateString("pt-BR"),
        dataReencontro: null
      });

      await Pet.create({
        nome: "Rex",
        especie: "Cachorro",
        raca: "Pastor Alemão",
        genero: "Macho",
        idade: "5 anos",
        cor: "Preto e Marrom",
        localPerdido: "Rua das Palmeiras, Belo Horizonte",
        dataPerdido: "05/07/2024",
        comentarioTutor: "Usa coleira vermelha.",
        foto: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400",
        idTutor: bruno._id,
        status: "PERDIDO",
        dataRegistro: new Date().toLocaleDateString("pt-BR"),
        dataReencontro: null
      });

      await Pet.create({
        nome: "Fred",
        especie: "Cachorro",
        raca: "SRD",
        genero: "Macho",
        idade: "2 anos",
        cor: "Caramelo",
        localPerdido: "Praça da Sé, Salvador",
        dataPerdido: "01/06/2024",
        comentarioTutor: "Amigável, mas um pouco medroso.",
        foto: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400",
        idTutor: carlos._id,
        status: "ENCONTRADO",
        dataRegistro: new Date().toLocaleDateString("pt-BR"),
        dataReencontro: new Date().toLocaleDateString("pt-BR")
      });

      console.log('✅ Dados iniciais populados');
    }
  } catch (error) {
    console.error('❌ Erro ao popular dados:', error);
  }
}

// Middleware para garantir inicialização
app.use(async (req, res, next) => {
  try {
    await initializeMongoDB();
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao inicializar banco de dados',
      details: error.message
    });
  }
});

// === ROTAS DE DEBUG ===
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

// === ROTAS DE ESTATÍSTICAS ===
app.get('/api/stats', async (req, res) => {
  try {
    const total = await Pet.countDocuments();
    const perdidos = await Pet.countDocuments({ status: 'PERDIDO' });
    const encontrados = await Pet.countDocuments({ status: 'ENCONTRADO' });

    res.json({
      success: true,
      stats: { total, perdidos, encontrados }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// === ROTAS DE AUTENTICAÇÃO ===
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    
    if (!nome || !email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios'
      });
    }

    const existingUser = await Usuario.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    const usuario = await Usuario.create({ nome, email, senha });
    
    res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso!',
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    const usuario = await Usuario.findOne({ email, senha });
    
    if (usuario) {
      res.json({
        success: true,
        message: 'Login bem-sucedido!',
        usuario: {
          id: usuario._id,
          nome: usuario.nome,
          email: usuario.email
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Email ou senha inválidos'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// === ROTAS DE PETS ===
app.get('/api/pets', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const pets = await Pet.find(filter).populate('idTutor', 'nome');
    
    const petsFormatted = pets.map(pet => ({
      id: pet._id,
      nome: pet.nome,
      especie: pet.especie,
      raca: pet.raca,
      genero: pet.genero,
      idade: pet.idade,
      cor: pet.cor,
      localPerdido: pet.localPerdido,
      dataPerdido: pet.dataPerdido,
      comentarioTutor: pet.comentarioTutor,
      foto: pet.foto,
      idTutor: pet.idTutor._id,
      status: pet.status,
      dataRegistro: pet.dataRegistro,
      dataReencontro: pet.dataReencontro
    }));

    res.json({
      success: true,
      pets: petsFormatted
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

app.get('/api/pets/search', async (req, res) => {
  try {
    const { nome, localidade, status = 'PERDIDO' } = req.query;
    const filter = { status };
    
    if (nome) {
      filter.nome = { $regex: nome, $options: 'i' };
    }
    
    if (localidade) {
      filter.localPerdido = { $regex: localidade, $options: 'i' };
    }
    
    const pets = await Pet.find(filter).populate('idTutor', 'nome');
    
    const petsFormatted = pets.map(pet => ({
      id: pet._id,
      nome: pet.nome,
      especie: pet.especie,
      raca: pet.raca,
      genero: pet.genero,
      idade: pet.idade,
      cor: pet.cor,
      localPerdido: pet.localPerdido,
      dataPerdido: pet.dataPerdido,
      comentarioTutor: pet.comentarioTutor,
      foto: pet.foto,
      idTutor: pet.idTutor._id,
      status: pet.status,
      dataRegistro: pet.dataRegistro,
      dataReencontro: pet.dataReencontro
    }));

    res.json({
      success: true,
      pets: petsFormatted
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

app.get('/api/pets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pet = await Pet.findById(id).populate('idTutor', 'nome');
    
    if (pet) {
      const petFormatted = {
        id: pet._id,
        nome: pet.nome,
        especie: pet.especie,
        raca: pet.raca,
        genero: pet.genero,
        idade: pet.idade,
        cor: pet.cor,
        localPerdido: pet.localPerdido,
        dataPerdido: pet.dataPerdido,
        comentarioTutor: pet.comentarioTutor,
        foto: pet.foto,
        idTutor: pet.idTutor._id,
        status: pet.status,
        dataRegistro: pet.dataRegistro,
        dataReencontro: pet.dataReencontro
      };

      res.json({
        success: true,
        pet: petFormatted
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Pet não encontrado'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

app.post('/api/pets', async (req, res) => {
  try {
    const dadosPet = req.body;
    const { idTutor } = dadosPet;
    
    if (!idTutor) {
      return res.status(400).json({
        success: false,
        message: 'ID do tutor é obrigatório'
      });
    }

    // Validações básicas
    const camposObrigatorios = ['nome', 'especie', 'localPerdido', 'dataPerdido'];
    for (const campo of camposObrigatorios) {
      if (!dadosPet[campo]) {
        return res.status(400).json({
          success: false,
          message: `Campo ${campo} é obrigatório`
        });
      }
    }

    const novoPet = await Pet.create({
      ...dadosPet,
      status: 'PERDIDO',
      dataRegistro: new Date().toLocaleDateString("pt-BR"),
      dataReencontro: null
    });
    
    res.status(201).json({
      success: true,
      message: 'Pet registrado com sucesso!',
      pet: {
        id: novoPet._id,
        ...dadosPet,
        status: 'PERDIDO',
        dataRegistro: novoPet.dataRegistro
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

app.put('/api/pets/:id/encontrado', async (req, res) => {
  try {
    const { id } = req.params;
    const pet = await Pet.findById(id);
    
    if (!pet || pet.status !== 'PERDIDO') {
      return res.status(400).json({
        success: false,
        message: 'Pet não encontrado ou já marcado como encontrado'
      });
    }

    const dataReencontro = new Date().toLocaleDateString("pt-BR");
    
    await Pet.findByIdAndUpdate(id, {
      status: 'ENCONTRADO',
      dataReencontro
    });

    res.json({
      success: true,
      message: `Pet "${pet.nome}" marcado como ENCONTRADO`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

app.get('/api/pets/historico/reencontros', async (req, res) => {
  try {
    const pets = await Pet.find({ status: 'ENCONTRADO' }).populate('idTutor', 'nome');
    
    const petsFormatted = pets.map(pet => ({
      id: pet._id,
      nome: pet.nome,
      especie: pet.especie,
      raca: pet.raca,
      genero: pet.genero,
      idade: pet.idade,
      cor: pet.cor,
      localPerdido: pet.localPerdido,
      dataPerdido: pet.dataPerdido,
      comentarioTutor: pet.comentarioTutor,
      foto: pet.foto,
      idTutor: pet.idTutor._id,
      status: pet.status,
      dataRegistro: pet.dataRegistro,
      dataReencontro: pet.dataReencontro
    }));

    res.json({
      success: true,
      pets: petsFormatted
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// === ATUALIZAR PERFIL DO USUÁRIO ===
app.put('/api/usuario/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const dadosUpdate = req.body;
    
    // Validar se o ID é válido
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuário inválido'
      });
    }
    
    // Buscar usuário existente
    const usuarioExistente = await Usuario.findById(id);
    if (!usuarioExistente) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    // Preparar dados para atualização
    const updateData = {};
    
    if (dadosUpdate.whatsapp !== undefined) updateData.whatsapp = dadosUpdate.whatsapp;
    if (dadosUpdate.descricao !== undefined) updateData.descricao = dadosUpdate.descricao;
    
    if (dadosUpdate.endereco) {
      updateData.endereco = {
        rua: dadosUpdate.endereco.rua || '',
        bairro: dadosUpdate.endereco.bairro || '',
        cidade: dadosUpdate.endereco.cidade || '',
        estado: dadosUpdate.endereco.estado || ''
      };
    }
    
    if (dadosUpdate.redesSociais) {
      updateData.redesSociais = {
        facebook: dadosUpdate.redesSociais.facebook || '',
        instagram: dadosUpdate.redesSociais.instagram || '',
        twitter: dadosUpdate.redesSociais.twitter || ''
      };
    }
    
    updateData.ultimoLogin = new Date();
    
    // Atualizar usuário
    const usuarioAtualizado = await Usuario.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!usuarioAtualizado) {
      return res.status(404).json({
        success: false,
        message: 'Erro ao atualizar usuário'
      });
    }
    
    // Retornar usuário atualizado (sem a senha)
    const usuarioResponse = {
      id: usuarioAtualizado._id,
      nome: usuarioAtualizado.nome,
      email: usuarioAtualizado.email,
      whatsapp: usuarioAtualizado.whatsapp,
      descricao: usuarioAtualizado.descricao,
      endereco: usuarioAtualizado.endereco,
      redesSociais: usuarioAtualizado.redesSociais,
      dataCadastro: usuarioAtualizado.dataCadastro,
      ultimoLogin: usuarioAtualizado.ultimoLogin,
      petsRegistrados: usuarioAtualizado.petsRegistrados
    };
    
    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso!',
      usuario: usuarioResponse
    });
    
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default app;