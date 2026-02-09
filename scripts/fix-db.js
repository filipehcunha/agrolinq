const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function fix() {
    const uri = process.env.DATABASE_URL || process.env.MONGODB_URI;
    if (!uri) {
        console.error('DATABASE_URL or MONGODB_URI not found in .env');
        console.log('Current __dirname:', __dirname);
        console.log('Env variables keys:', Object.keys(process.env).filter(k => k.includes('DB') || k.includes('URL')));
        process.exit(1);
    }

    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const collection = mongoose.connection.collection('produtors');
        const indexes = await collection.indexes();
        console.log('Indexes before:', indexes.map(i => i.name));

        // Remove cpfCnpj_1 if exists
        if (indexes.some(idx => idx.name === 'cpfCnpj_1')) {
            await collection.dropIndex('cpfCnpj_1');
            console.log('Dropped index: cpfCnpj_1');
        } else {
            console.log('Index cpfCnpj_1 not found.');
        }

        // List again
        console.log('Indexes after:', (await collection.indexes()).map(i => i.name));

    } catch (error) {
        console.error('Error fixing DB:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
}

fix();
