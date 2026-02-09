
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI;

async function diagnoseUsers() {
    if (!MONGODB_URI) {
        console.error('ERROR: MONGODB_URI not found in .env');
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('--- Database Connected ---\n');

        const collections = ['consumidors', 'produtors', 'restaurantes'];
        const allUsers = [];

        for (const collName of collections) {
            const users = await mongoose.connection.collection(collName).find({}).toArray();
            console.log(`Collection [${collName}]: ${users.length} users`);
            users.forEach(u => allUsers.push({ ...u, source: collName }));
        }

        console.log('\n--- Duplicate Email Check ---');
        const emailMap = {};
        allUsers.forEach(u => {
            if (!emailMap[u.email]) emailMap[u.email] = [];
            emailMap[u.email].push({ id: u._id, source: u.source, tipo: u.tipo, nome: u.nome });
        });

        let duplicatesFound = false;
        Object.keys(emailMap).forEach(email => {
            if (emailMap[email].length > 1) {
                duplicatesFound = true;
                console.log(`[DUPLICATE] Email: ${email}`);
                emailMap[email].forEach(entry => {
                    console.log(`  - Source: ${entry.source}, Type: ${entry.tipo}, ID: ${entry.id}, Name: ${entry.nome}`);
                });
            }
        });

        if (!duplicatesFound) {
            console.log('No duplicate emails found across collections.');
        }

        console.log('\n--- Admin Check ---');
        const admins = allUsers.filter(u => u.tipo === 'admin');
        if (admins.length > 0) {
            console.log(`Found ${admins.length} admin(s):`);
            admins.forEach(a => console.log(`  - Name: ${a.nome}, Email: ${a.email}, Source: ${a.source}`));
        } else {
            console.log('No admin users found.');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Diagnosis failed:', err);
        process.exit(1);
    }
}

diagnoseUsers();
