import express from 'express';
import loanRoutes from './routes/loanRoutes';
import equipmentRoutes from './routes/equipmentRoutes';
import userRoutes from './routes/userRoutes';
import cors from 'cors';

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', loanRoutes);
app.use('/api', userRoutes);
app.use('/api', equipmentRoutes);



app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
