import { client } from '../db/db';
import { GameViewModel } from '../models/GameViewModel';

export const GamesRepository = {
    async GetGames(filter: any) {
        return await client.db('GamePedia').collection('games').find(filter).toArray();
    },

    async GetAllGames() {
        return await client.db('GamePedia').collection('games').find({}).toArray();
    },

    async FindGamesByTitle(title: string) {
        return await client
            .db('GamePedia')
            .collection('games')
            .find({ title: { $regex: title, $options: 'i' } })
            .toArray();
    },

    async GetSortedGames(sortMethod: any) {
        return await client.db('GamePedia').collection('games').find({}).sort(sortMethod).toArray();
    },

    async GetManyGamesByID(gameIds: any) {
        return await client
            .db('GamePedia')
            .collection('games')
            .find({ id: { $in: gameIds } })
            .toArray();
    },

    async GetGameByID(id: number) {
        return await client.db('GamePedia').collection('games').findOne({ id: id });
    },

    async DeleteGame(id: number): Promise<boolean> {
        const result = await client.db('GamePedia').collection('games').deleteOne({ id: id });
        return result.deletedCount === 1;
    },

    async CreateNewGame(CreatedGame: any): Promise<GameViewModel> {
        await client.db('GamePedia').collection('games').insertOne(CreatedGame);
        return CreatedGame;
    },

    async UpdateGame(id: number, data: any) {
        const result = await client
            .db('GamePedia')
            .collection('games')
            .updateOne({ id: id }, { $set: data });
        return result.modifiedCount === 1;
    },
};
