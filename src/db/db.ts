import { MongoClient } from "mongodb"

const MongoURI = process.env.MongoURI || "mongodb://0.0.0.0:27016"

export const client = new MongoClient(MongoURI)

export async function runDB() {
    try {
        await client.connect();
        await client.db('GamePedia').command({ping: 1})
        console.log('Conecting to Mongo DataBase completed')
    }
    catch {
        await client.close()
    }
}