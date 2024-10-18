import { Request, Response } from 'express';
import db from '../models/db';

export const createLoan = async (req: Request, res: Response) => {
  const { usuario_id, equipamentos_ids, nome, sobrenome, telefone, data_devolucao, setor, acessorios } = req.body;

  try {
    const equipamentos = await db('equipamentos').whereIn('id', equipamentos_ids);
    const equipamentosEmprestados = equipamentos.filter(equip => equip.status === 'emprestado');

    if (equipamentosEmprestados.length > 0) {
      return res.status(400).json({ error: 'Alguns equipamentos já estão emprestados', equipamentosEmprestados });
    }

      // Inicializar a variável loans com o tipo correto
    const loans: Array<{ id: number, usuario_id: number, equipamento_id: number, nome: string, sobrenome: string, telefone: string, setor: string, data_emprestimo: Date, data_devolucao: Date, status: string }> = [];


    for (const equipamento_id of equipamentos_ids) {
      const [newLoan] = await db('emprestimos')
        .insert({
          usuario_id,
          equipamento_id,
          nome,
          sobrenome,
          telefone,
          setor,
          data_emprestimo: new Date(),
          data_devolucao,
          status: 'emprestado',
        })
        .returning(['id', 'equipamento_id', 'nome', 'sobrenome', 'telefone', 'setor', 'data_emprestimo', 'data_devolucao', 'status']);

      await db('equipamentos')
        .where({ id: equipamento_id })
        .update({ status: 'emprestado' });

      loans.push(newLoan);
    }

    if (acessorios && acessorios.length > 0) {
      const emprestimosAcessoriosData = acessorios.map((acessorio_id: number) => ({
        emprestimo_id: loans[0].id,
        acessorio_id
      }));
      await db('emprestimos_acessorios').insert(emprestimosAcessoriosData);
    }

    // **Aqui você retorna o array de empréstimos com seus IDs**
    res.status(201).json({ loans });
  } catch (error) {
    console.error('Erro ao criar empréstimos:', error);
    res.status(500).json({ error: 'Erro ao criar empréstimos' });
  }
};



export const getLoans = async (req: Request, res: Response) => {
  try {
    const loans = await db('emprestimos')
      .join('equipamentos', 'emprestimos.equipamento_id', 'equipamentos.id')
      .join('usuarios', 'emprestimos.usuario_id', 'usuarios.id')
      .leftJoin('emprestimos_acessorios', 'emprestimos.id', 'emprestimos_acessorios.emprestimo_id')
      .leftJoin('acessorios', 'emprestimos_acessorios.acessorio_id', 'acessorios.id')
      .select(
        'emprestimos.id', // Incluir o ID do empréstimo
        'usuarios.nome as usuario_nome',
        'emprestimos.nome', 
        'emprestimos.sobrenome',
        'emprestimos.telefone',
        'emprestimos.setor',
        'emprestimos.data_emprestimo',
        'emprestimos.status',
        'emprestimos.data_devolucao',
        db.raw(`STRING_AGG(equipamentos.nome, ', ') as equipamentos_nomes`), // Agrupar os nomes dos equipamentos separados por vírgula
        db.raw(`
          COALESCE(
            ARRAY_REMOVE(ARRAY_AGG(acessorios.nome), NULL), 
            ARRAY[]::text[]
          ) as acessorios_nomes
        `) // Agrega os nomes dos acessórios ou retorna um array vazio
      )
      .groupBy(
        'emprestimos.id',  // Agora agrupar também pelo ID do empréstimo
        'usuarios.nome', 
        'emprestimos.nome', 
        'emprestimos.sobrenome', 
        'emprestimos.telefone', 
        'emprestimos.setor', 
        'emprestimos.status', 
        'emprestimos.data_devolucao'
      );

    res.status(200).json(loans);
  } catch (error) {
    console.error('Erro ao buscar empréstimos:', error);
    res.status(500).json({ error: 'Erro ao buscar empréstimos' });
  }
};




// Atualizar o status do equipamento para "disponível" com base no empréstimo
export const returnEquipment = async (req: Request, res: Response) => {
  const { id } = req.params; // ID do empréstimo

  try {
    // Buscar o empréstimo pelo ID
    const loan = await db('emprestimos').where({ id }).first();

    if (!loan) {
      return res.status(404).json({ error: 'Empréstimo não encontrado' });
    }

    // Atualizar o status do empréstimo para "devolvido"
    await db('emprestimos')
      .where({ id })
      .update({
        status: 'devolvido',
        data_devolucao: db.fn.now(), // Define a data de devolução
      });

    // Atualizar o status do equipamento relacionado para "disponível"
    await db('equipamentos')
      .where({ id: loan.equipamento_id }) // Utiliza o equipamento_id do empréstimo
      .update({ status: 'disponivel' });

    // Retornar uma resposta de sucesso
    res.status(200).json({ message: 'Equipamento devolvido e agora disponível.', equipamento_id: loan.equipamento_id });
  } catch (error) {
    console.error('Erro ao atualizar status do equipamento:', error);
    res.status(500).json({ error: 'Erro ao atualizar status do equipamento' });
  }
};





