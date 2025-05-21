import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

class DatabaseService {
  constructor(dbFilePath = 'petresgate.db') {
    this.dbFilePath = dbFilePath;
    this.db = null;
  }

  async connect() {
    try {
      this.db = await open({
        filename: this.dbFilePath,
        driver: sqlite3.Database
      });
      console.log('✅ Conexão com o banco de dados estabelecida.');
      await this.createTables();
    } catch (error) {
      console.error('❌ Erro ao conectar ao banco de dados:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.db) {
      await this.db.close();
      console.log('✅ Conexão com o banco de dados encerrada.');
      this.db = null;
    }
  }

  async createTables() {
    if (!this.db) {
      throw new Error('Banco de dados não conectado.');
    }

    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL
      );
    `);

    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS pets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        especie TEXT NOT NULL,
        raca TEXT,
        genero TEXT,
        idade TEXT,
        cor TEXT,
        localPerdido TEXT,
        dataPerdido TEXT,
        comentarioTutor TEXT,
        foto TEXT,
        idTutor INTEGER,
        status TEXT NOT NULL DEFAULT 'PERDIDO',
        dataRegistro TEXT NOT NULL,
        dataReencontro TEXT,
        FOREIGN KEY (idTutor) REFERENCES usuarios(id)
      );
    `);
  }

  async get(query, params = []) {
    if (!this.db) {
      throw new Error('Banco de dados não conectado.');
    }
    return await this.db.get(query, params);
  }

  async all(query, params = []) {
    if (!this.db) {
      throw new Error('Banco de dados não conectado.');
    }
    return await this.db.all(query, params);
  }

  async run(query, params = []) {
    if (!this.db) {
      throw new Error('Banco de dados não conectado.');
    }
    const result = await this.db.run(query, params);
    return result.lastID;
  }

  async exec(query) {
    if (!this.db) {
      throw new Error('Banco de dados não conectado.');
    }
    await this.db.exec(query);
  }
}

export default DatabaseService;
