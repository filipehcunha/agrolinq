const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdmin() {
    try {
        const mongoUri = process.env.DATABASE_URL || process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('DATABASE_URL ou MONGODB_URI não encontrado no .env');
        }
        await mongoose.connect(mongoUri);
        console.log('✅ Conectado ao MongoDB');

        // Verificar se admin já existe
        const Consumidor = mongoose.model('Consumidor', new mongoose.Schema({
            nome: String,
            email: String,
            cpf: String,
            senhaHash: String,
            tipo: String
        }));

        const adminExistente = await Consumidor.findOne({ email: 'admin@admin.com' });

        if (adminExistente) {
            console.log('⚠️  Admin já existe com email: admin@admin.com');
            process.exit(0);
        }

        // Criar hash da senha
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash('admin', salt);

        // Criar admin
        await Consumidor.create({
            nome: 'Administrador',
            email: 'admin@admin.com',
            cpf: '000.000.000-00',
            senhaHash,
            tipo: 'admin'
        });

        console.log('✅ Admin criado com sucesso!');
        console.log('📧 Email: admin@admin.com');
        console.log('🔑 Senha: admin');
        console.log('\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!');

    } catch (error) {
        console.error('❌ Erro ao criar admin:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

createAdmin();
