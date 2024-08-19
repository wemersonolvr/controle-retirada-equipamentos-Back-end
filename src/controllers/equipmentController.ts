import { Request, Response } from 'express';
import db from '../models/db';

// Cadastrar novo equipamento
export const createEquipment = async (req: Request, res: Response) => {
  const { nome, descricao } = req.body;

  try {
    // Inserir novo equipamento na tabela 'equipamentos'
    const [newEquipment] = await db('equipamentos')
      .insert({
        nome,
        descricao,
      })
      .returning('*');

    // Retornar o novo equipamento criado
    res.status(201).json(newEquipment);
  } catch (error) {
    console.error('Erro ao cadastrar equipamento:', error);
    res.status(500).json({ error: 'Erro ao cadastrar equipamento' });
  }
};

// Cadastrar novo acessório
export const createAccessory = async (req: Request, res: Response) => {
  const { nome, equipamento_id, quantidade } = req.body;

  try {
    // Inserir novo acessório na tabela 'acessorios'
    const [newAccessory] = await db('acessorios')
      .insert({
        nome,
        equipamento_id,
        quantidade,
      })
      .returning('*');

    // Retornar o novo acessório criado
    res.status(201).json(newAccessory);
  } catch (error) {
    console.error('Erro ao cadastrar acessório:', error);
    res.status(500).json({ error: 'Erro ao cadastrar acessório' });
  }
};

// Obter todos os equipamentos disponíveis com seus acessórios
export const getAvailableEquipmentWithAccessories = async (req: Request, res: Response) => {
  try {
    // Buscar todos os equipamentos disponíveis e seus acessórios relacionados
    const result = await db('equipamentos as e')
      .leftJoin('acessorios as a', 'e.id', 'a.equipamento_id')
      .select(
        'e.id as equipamento_id',
        'e.nome as equipamento_nome',
        'e.descricao as equipamento_descricao',
        'e.status',
        'a.id as acessorio_id',
        'a.nome as acessorio_nome',
        'a.quantidade'
      )
      .where('e.status', 'disponivel')
      .orderBy('e.id');

    // Agrupar acessórios por equipamento
    const equipamentos = result.reduce((acc: any, row: any) => {
      const equipamentoId = row.equipamento_id;

      if (!acc[equipamentoId]) {
        acc[equipamentoId] = {
          id: equipamentoId,
          nome: row.equipamento_nome,
          descricao: row.equipamento_descricao,
          status: row.status,
          acessorios: []
        };
      }

      if (row.acessorio_id) {
        acc[equipamentoId].acessorios.push({
          id: row.acessorio_id,
          nome: row.acessorio_nome,
          quantidade: row.quantidade
        });
      }

      return acc;
    }, {});

    // Retornar a lista de equipamentos com seus acessórios
    res.status(200).json(Object.values(equipamentos));
  } catch (error) {
    console.error('Erro ao buscar equipamentos disponíveis:', error);
    res.status(500).json({ error: 'Erro ao buscar equipamentos disponíveis' });
  }
};
