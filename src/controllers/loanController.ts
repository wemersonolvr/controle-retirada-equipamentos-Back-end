import { Request, Response } from 'express';
import db from '../models/db';

// Registrar um novo empréstimo
export const createLoan = async (req: Request, res: Response) => {
  const { usuario_id, equipamento_id, nome_completo, telefone, setor } = req.body;

  try {
    // Inserir um novo empréstimo na tabela 'emprestimos'
    const [newLoan] = await db('emprestimos')
      .insert({
        usuario_id,
        equipamento_id,
        nome_completo,
        telefone,
        setor
      })
      .returning('*');

    // Retornar o novo empréstimo criado
    res.status(201).json(newLoan);
  } catch (error) {
    console.error('Erro ao criar empréstimo:', error);
    res.status(500).json({ error: 'Erro ao criar empréstimo' });
  }
};

// Obter todos os empréstimos
export const getLoans = async (req: Request, res: Response) => {
  try {
    // Buscar todos os registros na tabela 'emprestimos'
    const loans = await db('emprestimos').select('*');
    res.status(200).json(loans);
  } catch (error) {
    console.error('Erro ao buscar empréstimos:', error);
    res.status(500).json({ error: 'Erro ao buscar empréstimos' });
  }
};

// Atualizar status do empréstimo
export const updateLoanStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Atualizar o status do empréstimo e definir a data de devolução
    const [updatedLoan] = await db('emprestimos')
      .where({ id })
      .update({
        status,
        data_devolucao: db.fn.now(),
      })
      .returning('*');

    // Verificar se o empréstimo foi encontrado e atualizado
    if (!updatedLoan) {
      return res.status(404).json({ error: 'Empréstimo não encontrado' });
    }

    // Retornar o empréstimo atualizado
    res.status(200).json(updatedLoan);
  } catch (error) {
    console.error('Erro ao atualizar status do empréstimo:', error);
    res.status(500).json({ error: 'Erro ao atualizar status do empréstimo' });
  }
};
