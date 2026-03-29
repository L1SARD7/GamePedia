import { Filter, Sort } from 'mongodb';
import { client } from '../db/db';
import { CreateGameDbModel, GameViewModel, UpdateGameDbModel } from '../models/GameViewModel';

export const GamesRepository = {
    async GetGames(filter: Filter<GameViewModel>): Promise<GameViewModel[]> {
        return await client
            .db('GamePedia')
            .collection<GameViewModel>('games')
            .find(filter)
            .toArray();
    },

    async GetAllGames(): Promise<GameViewModel[]> {
        return await client.db('GamePedia').collection<GameViewModel>('games').find({}).toArray();
    },

    async FindGamesByTitle(title: string): Promise<GameViewModel[]> {
        return await client
            .db('GamePedia')
            .collection<GameViewModel>('games')
            .find({ title: { $regex: title, $options: 'i' } })
            .toArray();
    },

    async GetSortedGames(sortMethod: Sort): Promise<GameViewModel[]> {
        return await client
            .db('GamePedia')
            .collection<GameViewModel>('games')
            .find({})
            .sort(sortMethod)
            .toArray();
    },

    async GetManyGamesByID(gameIds: string[]): Promise<GameViewModel[]> {
        return await client
            .db('GamePedia')
            .collection<GameViewModel>('games')
            .find({ id: { $in: gameIds } })
            .toArray();
    },

    async GetGameByID(id: string): Promise<GameViewModel | null> {
        return await client.db('GamePedia').collection<GameViewModel>('games').findOne({ id: id });
    },

    async DeleteGame(id: string): Promise<boolean> {
        const result = await client.db('GamePedia').collection('games').deleteOne({ id: id });
        return result.deletedCount === 1;
    },

    async CreateNewGame(CreatedGame: CreateGameDbModel): Promise<GameViewModel> {
        await client.db('GamePedia').collection<GameViewModel>('games').insertOne(CreatedGame);
        return CreatedGame;
    },

    async UpdateGame(id: string, data: UpdateGameDbModel): Promise<boolean> {
        const result = await client
            .db('GamePedia')
            .collection<GameViewModel>('games')
            .updateOne({ id: id }, { $set: data });
        return result.modifiedCount === 1;
    },
};
