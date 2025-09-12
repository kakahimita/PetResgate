// serverMongoDB.js - API REST para Pet Resgate com MongoDB
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Importar serviços MongoDB
import MongoDBService from './src/services/MongoDBService.js';
import AuthServiceMongoDB from './src/services/AuthServiceMongoDB.js';
import PetServiceMongoDB from './src/services/PetServiceMongoDB.js';
import popularDadosIniciaisMongoDB from './src/seed/initialDataMongoDB.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Inicializar serviços MongoDB
const dbService = new MongoDBService();
const authService = new AuthServiceMongoDB(dbService);
const petService = new PetServiceMongoDB(dbService);

app.get('/api/debug', (req, res) => {
  res.json({
    mongodb_uri_exists: !!process.env.MONGODB_URI,
    mongodb_uri_length: process.env.MONGODB_URI?.length || 0,
    mongodb_uri_preview: process.env.MONGODB_URI?.substring(0, 30) + '...',
    node_env: process.env.NODE_ENV,
    vercel_region: process.env.VERCEL_REGION || 'local',
    timestamp: new Date().toISOString(),
    status: 'API funcionando'
  });
});

// Rota de teste de conexão MongoDB
app.get('/api/test-mongodb', async (req, res) => {
  try {
    console.log('🧪 Testando conexão MongoDB...');
    
    if (!process.env.MONGODB_URI) {
      return res.status(500).json({
        success: false,
        error: 'MONGODB_URI não encontrada',
        details: 'Variável de ambiente não configurada'
      });
    }

    // Tentar conectar
    const mongoose = await import('mongoose');
    
    console.log('🔗 Tentando conectar...');
    await mongoose.default.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 segundos timeout
      connectTimeoutMS: 5000
    });

    console.log('✅ MongoDB conectado com sucesso!');
    
    // Desconectar para não deixar conexões abertas
    await mongoose.default.disconnect();
    
    res.json({
      success: true,
      message: 'MongoDB conectado com sucesso!',
      mongodb_uri_preview: process.env.MONGODB_URI.substring(0, 30) + '...',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao conectar MongoDB:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      details: {
        name: error.name,
        code: error.code,
        mongodb_uri_exists: !!process.env.MONGODB_URI,
        mongodb_uri_length: process.env.MONGODB_URI?.length || 0
      },
      timestamp: new Date().toISOString()
    });
  }
});

// Inicializar banco e dados
async function initializeServices() {
  try {
    console.log("🚀 Iniciando PetResgate com MongoDB...");
    console.log("🔍 MONGODB_URI existe:", !!process.env.MONGODB_URI);
    console.log("🔍 MONGODB_URI length:", process.env.MONGODB_URI?.length || 0);
    
    if (!process.env.MONGODB_URI) {
      throw new Error('❌ MONGODB_URI não encontrada nas variáveis de ambiente');
    }
    
    console.log("🔗 Conectando ao MongoDB...");
    await dbService.connect();
    console.log("✅ MongoDB conectado com sucesso!");
    
    console.log("🌱 Populando dados iniciais...");
    await popularDadosIniciaisMongoDB(authService, petService, dbService);
    
    console.log('✅ Serviços MongoDB inicializados com sucesso!');
  } catch (error) {
    console.error('❌ ERRO DETALHADO ao inicializar:', {
      message: error.message,
      stack: error.stack,
      mongodb_uri_exists: !!process.env.MONGODB_URI,
      mongodb_uri_preview: process.env.MONGODB_URI?.substring(0, 20) + '...'
    });
    
    // NO VERCEL: Não fazer process.exit, deixar API rodar mesmo com erro de DB
    console.log('⚠️  API continuará rodando mesmo com erro de DB para diagnóstico');
  }
}

// === ROTAS DE AUTENTICAÇÃO ===

// POST /api/auth/register - Cadastrar usuário
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    
    if (!nome || !email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios'
      });
    }

    const resultado = await authService.cadastrar(nome, email, senha);
    
    if (resultado.success) {
      res.status(201).json(resultado);
    } else {
      res.status(400).json(resultado);
    }
  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/auth/login - Fazer login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    const resultado = await authService.login(email, senha);
    
    if (resultado.success) {
      res.json(resultado);
    } else {
      res.status(401).json(resultado);
    }
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/auth/user/:id - Buscar usuário por ID
app.get('/api/auth/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await authService.getUsuarioById(id);
    
    if (usuario) {
      res.json({
        success: true,
        usuario
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/usuario/:id - Atualizar perfil do usuário
app.put('/api/usuario/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const dadosUpdate = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuário é obrigatório'
      });
    }
    
    const resultado = await authService.atualizarPerfil(id, dadosUpdate);
    
    if (resultado.success) {
      res.json(resultado);
    } else {
      res.status(400).json(resultado);
    }
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// === ROTAS DE PETS ===

// GET /api/pets - Listar todos os pets ou filtrar por status
app.get('/api/pets', async (req, res) => {
  try {
    const { status } = req.query;
    const pets = await petService.listarTodosOsPets(status || null);
    
    res.json({
      success: true,
      pets
    });
  } catch (error) {
    console.error('Erro ao listar pets:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/pets/search - Buscar pets por filtros
app.get('/api/pets/search', async (req, res) => {
  try {
    const { nome, localidade, status = 'PERDIDO' } = req.query;
    const filtros = {};
    
    if (nome) filtros.nome = nome;
    if (localidade) filtros.localidade = localidade;
    
    const pets = await petService.buscarPets(filtros, status);
    
    res.json({
      success: true,
      pets
    });
  } catch (error) {
    console.error('Erro ao buscar pets:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/pets/:id - Buscar pet por ID
app.get('/api/pets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pet = await petService.buscarPetPorId(id);
    
    if (pet) {
      res.json({
        success: true,
        pet
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Pet não encontrado'
      });
    }
  } catch (error) {
    console.error('Erro ao buscar pet:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/pets - Registrar novo pet perdido
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

    const novoPet = await petService.registrarPetPerdido(dadosPet, idTutor);
    
    res.status(201).json({
      success: true,
      message: 'Pet registrado com sucesso!',
      pet: novoPet
    });
  } catch (error) {
    console.error('Erro ao registrar pet:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/pets/:id/encontrado - Marcar pet como encontrado
app.put('/api/pets/:id/encontrado', async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await petService.marcarPetComoEncontrado(id);
    
    if (resultado.success) {
      res.json(resultado);
    } else {
      res.status(400).json(resultado);
    }
  } catch (error) {
    console.error('Erro ao marcar pet como encontrado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/pets/historico/reencontros - Listar histórico de reencontros
app.get('/api/pets/historico/reencontros', async (req, res) => {
  try {
    const pets = await petService.listarHistoricoReencontros();
    
    res.json({
      success: true,
      pets
    });
  } catch (error) {
    console.error('Erro ao listar histórico:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// === ROTA PARA ESTATÍSTICAS ===

// GET /api/stats - Estatísticas gerais
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await petService.obterEstatisticas();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// === ROTA PRINCIPAL (servir HTML) ===

// GET / - Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  });
});

// Middleware para shutdown gracioso
process.on('SIGINT', async () => {
  console.log('\n🛑 Recebido sinal de encerramento...');
  try {
    await dbService.disconnect();
    console.log('👋 Servidor encerrado graciosamente.');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao encerrar:', error);
    process.exit(1);
  }
});

// Inicializar servidor
async function startServer() {
  await initializeServices();
  
  app.listen(PORT, () => {
    console.log(`🚀 Servidor PetResgate MongoDB rodando na porta ${PORT}`);
    console.log(`🌐 Acesse: http://localhost:${PORT}`);
    console.log(`📋 API: http://localhost:${PORT}/api/pets`);
    console.log(`🔗 MongoDB: ${process.env.MONGODB_URI ? 'Conectado' : 'Configurar MONGODB_URI'}`);
  });
}

startServer().catch(console.error);

export default app;