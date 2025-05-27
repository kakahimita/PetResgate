// server.js - API REST para Pet Resgate
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar serviços existentes
import DatabaseService from './src/services/DatabaseService.js';
import AuthService from './src/services/AuthService.js';
import PetService from './src/services/PetService.js';
import popularDadosIniciais from './src/seed/initialData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Inicializar serviços
const dbService = new DatabaseService();
const authService = new AuthService(dbService);
const petService = new PetService(dbService);

// Inicializar banco e dados
async function initializeServices() {
  try {
    await dbService.connect();
    await popularDadosIniciais(authService, petService, dbService);
    console.log('✅ Serviços inicializados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar serviços:', error);
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
    const usuario = await authService.getUsuarioById(parseInt(id));
    
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
    const pet = await petService.buscarPetPorId(parseInt(id));
    
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
    const resultado = await petService.marcarPetComoEncontrado(parseInt(id));
    
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
    const todosPets = await petService.listarTodosOsPets();
    const petsPerdidos = await petService.listarTodosOsPets('PERDIDO');
    const petsEncontrados = await petService.listarTodosOsPets('ENCONTRADO');
    
    res.json({
      success: true,
      stats: {
        total: todosPets.length,
        perdidos: petsPerdidos.length,
        encontrados: petsEncontrados.length
      }
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

// Inicializar servidor
async function startServer() {
  await initializeServices();
  
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🌐 Acesse: http://localhost:${PORT}`);
    console.log(`📋 API: http://localhost:${PORT}/api/pets`);
  });
}

startServer().catch(console.error);

export default app;