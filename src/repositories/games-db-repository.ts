import type { Filter, Sort } from 'mongodb';
import { client } from '../db/db';
import type { CreateGameDbModel, GameViewModel, UpdateGameDbModel } from '../models/GameViewModel';

export const GamesRepository = {
    async getGames(filter: Filter<GameViewModel>): Promise<GameViewModel[]> {
        return await client
            .db('GamePedia')
            .collection<GameViewModel>('games')
            .find(filter)
            .toArray();
    },

    async getAllGames(): Promise<GameViewModel[]> {
        return await client.db('GamePedia').collection<GameViewModel>('games').find({}).toArray();
    },

    async findGamesByTitle(title: string): Promise<GameViewModel[]> {
        return await client
            .db('GamePedia')
            .collection<GameViewModel>('games')
            .find({ title: { $regex: title, $options: 'i' } })
            .toArray();
    },

    async getSortedGames(sortMethod: Sort): Promise<GameViewModel[]> {
        return await client
            .db('GamePedia')
            .collection<GameViewModel>('games')
            .find({})
            .sort(sortMethod)
            .toArray();
    },

    async getManyGamesByID(gameIds: string[]): Promise<GameViewModel[]> {
        return await client
            .db('GamePedia')
            .collection<GameViewModel>('games')
            .find({ id: { $in: gameIds } })
            .toArray();
    },

    async getGameByID(id: string): Promise<GameViewModel | null> {
        return await client.db('GamePedia').collection<GameViewModel>('games').findOne({ id: id });
    },

    async deleteGame(id: string): Promise<boolean> {
        const result = await client.db('GamePedia').collection('games').deleteOne({ id: id });
        return result.deletedCount === 1;
    },

    async createNewGame(CreatedGame: CreateGameDbModel): Promise<GameViewModel> {
        await client.db('GamePedia').collection<GameViewModel>('games').insertOne(CreatedGame);
        return CreatedGame;
    },

    async updateGame(id: string, data: UpdateGameDbModel): Promise<boolean> {
        const result = await client
            .db('GamePedia')
            .collection<GameViewModel>('games')
            .updateOne({ id: id }, { $set: data });
        return result.modifiedCount === 1;
    },
};
