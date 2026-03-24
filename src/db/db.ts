import { MongoClient } from 'mongodb';
import { config } from '../config';

const MongoURI = config.MONGO_URI;

export const client = new MongoClient(MongoURI);

export async function runDB() {
    try {
        await client.connect();
        await client.db('GamePedia').command({ ping: 1 });
        console.log('Conecting to Mongo DataBase completed');
    } catch {
        await client.close();
    }
}
