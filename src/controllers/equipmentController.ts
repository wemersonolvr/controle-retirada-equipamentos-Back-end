import { Request, Response } from 'express';
import db from '../models/db';

// Cadastrar novo equipamento
export const createEquipment = async (req: Request, res: Response) => {
  const { nome, descricao } = req.body;

  try {
    const [newEquipment] = await db('equipamentos')
      .insert({
        nome,
        descricao,
      })
      .returning('*');

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
    const [newAccessory] = await db('acessorios')
      .insert({
        nome,
        equipamento_id,
        quantidade,
      })
      .returning('*');

    res.status(201).json(newAccessory);
  } catch (error) {
    console.error('Erro ao cadastrar acessório:', error);
    res.status(500).json({ error: 'Erro ao cadastrar acessório' });
  }
};

// Excluir equipamento (e seus acessórios)
export const deleteEquipment = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    

    // Excluir o equipamento
    const deletedEquipment = await db('equipamentos').where('id', id).del();

    if (!deletedEquipment) {
      return res.status(404).json({ error: 'Equipamento não encontrado' });
    }

    res.status(200).json({ message: 'Equipamento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir equipamento:', error);
    res.status(500).json({ error: 'Erro ao excluir equipamento' });
  }
};

// Excluir acessório
export const deleteAccessory = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deletedAccessory = await db('acessorios').where('id', id).del();

    if (!deletedAccessory) {
      return res.status(404).json({ error: 'Acessório não encontrado' });
    }

    res.status(200).json({ message: 'Acessório excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir acessório:', error);
    res.status(500).json({ error: 'Erro ao excluir acessório' });
  }
};

// Editar equipamento
export const updateEquipment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome, descricao, status } = req.body;

  try {
    const updatedEquipment = await db('equipamentos')
      .where('id', id)
      .update({
        nome,
        descricao,
        status,
      })
      .returning('*');

    if (!updatedEquipment) {
      return res.status(404).json({ error: 'Equipamento não encontrado' });
    }

    res.status(200).json(updatedEquipment);
  } catch (error) {
    console.error('Erro ao editar equipamento:', error);
    res.status(500).json({ error: 'Erro ao editar equipamento' });
  }
};

// Editar acessório
export const updateAccessory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome, quantidade } = req.body;

  try {
    const updatedAccessory = await db('acessorios')
      .where('id', id)
      .update({
        nome,
        quantidade,
      })
      .returning('*');

    if (!updatedAccessory) {
      return res.status(404).json({ error: 'Acessório não encontrado' });
    }

    res.status(200).json(updatedAccessory);
  } catch (error) {
    console.error('Erro ao editar acessório:', error);
    res.status(500).json({ error: 'Erro ao editar acessório' });
  }
};


// Defina o tipo para acessórios
type Acessorio = {
  id: number;
  nome: string;
  quantidade: number;
};

// Obter todos os equipamentos com seus acessórios, tanto disponíveis quanto emprestados
export const getEquipmentWithAccessories = async (req: Request, res: Response) => {
  try {
    const result = await db('equipamentos as e')
      .leftJoin('acessorios as a', 'e.id', 'a.equipamento_id')
      .leftJoin('emprestimos as emp', 'e.id', 'emp.equipamento_id')
      .select(
        'e.id as equipamento_id',
        'e.nome as equipamento_nome',
        'e.descricao as equipamento_descricao',
        'e.status',  // Status atual do equipamento
        'emp.status as emprestimo_status',  // Status do empréstimo
        'a.id as acessorio_id',
        'a.nome as acessorio_nome',
        'a.quantidade'
      )
      .orderBy('e.id');

    // Estrutura final para equipamentos
    const equipamentos = result.reduce((acc: { [key: number]: any }, row: any) => {
      const equipamentoId = row.equipamento_id;

      // Se o equipamento ainda não foi adicionado ao acumulador, crie-o
      if (!acc[equipamentoId]) {
        acc[equipamentoId] = {
          id: equipamentoId,
          nome: row.equipamento_nome,
          descricao: row.equipamento_descricao,
          // Se o equipamento estiver emprestado, usa o status do empréstimo
          status: row.emprestimo_status === 'emprestado' ? 'emprestado' : row.status, 
          acessorios: [] // Inicialmente vazio, será preenchido com acessórios se houver
        };
      }

      // Se houver um acessório associado e ele ainda não estiver no array, adicione-o
      if (row.acessorio_id && !acc[equipamentoId].acessorios.find((a: Acessorio) => a.id === row.acessorio_id)) {
        acc[equipamentoId].acessorios.push({
          id: row.acessorio_id,
          nome: row.acessorio_nome,
          quantidade: row.quantidade
        });
      }

      return acc;
    }, {});

    // Converta o objeto acumulador em um array para enviar como resposta
    res.status(200).json(Object.values(equipamentos));
  } catch (error) {
    console.error('Erro ao buscar equipamentos:', error);
    res.status(500).json({ error: 'Erro ao buscar equipamentos' });
  }
};
