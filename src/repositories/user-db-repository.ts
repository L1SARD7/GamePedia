import { client } from '../db/db';
import type { UserDbModel } from '../models/UserDbViewModel';

export const UserRepository = {
    async FindUserByLogin(login: string): Promise<UserDbModel | null> {
        return await client
            .db('GamePedia')
            .collection<UserDbModel>('users')
            .findOne({ login: login });
    },

    async findUserById(id: string): Promise<UserDbModel | null> {
        return await client.db('GamePedia').collection<UserDbModel>('users').findOne({ id: id });
    },

    async CreateNewUser(newUser: UserDbModel): Promise<boolean> {
        const result = await client
            .db('GamePedia')
            .collection<UserDbModel>('users')
            .insertOne(newUser);
        return result.acknowledged;
    },

    async updateEmailConfirmationStatus(userId: string): Promise<boolean> {
        const result = await client
            .db('GamePedia')
            .collection<UserDbModel>('users')
            .updateOne({ id: userId }, { $set: { 'emailVerification.isConfirmed': true } });
        return result.modifiedCount === 1;
    },
};
