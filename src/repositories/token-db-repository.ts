import { client } from '../db/db';
import { IgdbTokenDbModel } from '../models/IgdbModels';

export const igdbTokenRepository = {
    async getToken(): Promise<IgdbTokenDbModel | null> {
        return await client
            .db('GamePedia')
            .collection<IgdbTokenDbModel>('integrations')
            .findOne({ key: 'twitch_access_token' });
    },

    async saveToken(accessToken: string, expiresAt: number) {
        await client
            .db('GamePedia')
            .collection<IgdbTokenDbModel>('integrations')
            .updateOne(
                { key: 'twitch_access_token' },
                { $set: { accessToken, expiresAt } },
                { upsert: true },
            );
    },
};
