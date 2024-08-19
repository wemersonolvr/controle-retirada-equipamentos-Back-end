import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../models/db';

// Criação de uma nova conta de administrador
export const createAdmin = async (req: Request, res: Response) => {
  const { nome, login, senha } = req.body;

  try {
    // Hash da senha antes de armazenar no banco
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Inserir novo usuário no banco de dados usando Knex
    const [newUser] = await db('usuarios')
      .insert({
        nome,
        login,
        senha: hashedPassword,
      })
      .returning('*');

    // Retornar o novo usuário criado
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Erro ao criar conta de administrador:', error);
    res.status(500).json({ error: 'Erro ao criar conta de administrador' });
  }
};

// Login de administrador
export const loginAdmin = async (req: Request, res: Response) => {
  const { login, senha } = req.body;

  try {
    // Buscar o usuário no banco de dados pelo login usando Knex
    const user = await db('usuarios')
      .where({ login })
      .first();

    if (!user) {
      return res.status(401).json({ error: 'Login ou senha incorretos' });
    }

    // Comparar a senha fornecida com a senha armazenada (hash)
    const isValidPassword = await bcrypt.compare(senha, user.senha);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Login ou senha incorretos' });
    }

    // Gerar um token JWT
    const token = jwt.sign(
      { id: user.id, nome: user.nome },
      process.env.JWT_SECRET || 'seuSegredoJWT',
      { expiresIn: '1h' }
    );

    // Retornar o token gerado
    res.status(200).json({ token });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

