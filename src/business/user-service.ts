import { UserRepository } from '../repositories/user-db-repository';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { emailAdapter } from '../adapters/email-adapter';
import { UserDbModel } from '../models/UserDbViewModel';
import { UserInfoModel } from '../models/UserViewModel';

const SaltRounds = 10;

export const UserService = {
    async CreateNewUser(
        login: string,
        email: string,
        password: string,
    ): Promise<UserDbModel | null> {
        const passwordHash = await this.encodePassword(password);
        const newUser: UserDbModel = {
            id: crypto.randomUUID(),
            login: login,
            email: email,
            passwordHash: passwordHash,
            isAdmin: false,
            emailVerification: {
                isConfirmed: false,
                confirmationCode: crypto.randomUUID(),
            },
        };
        await UserRepository.CreateNewUser(newUser);
        emailAdapter.sendConfirmationCode(
            newUser.email,
            newUser.emailVerification.confirmationCode,
            newUser.id,
        );
        const CreatedUser = await UserRepository.FindUserByLogin(newUser.login);
        return CreatedUser;
    },

    async authorizationUser(
        login: string,
        password: string,
    ): Promise<UserInfoModel | 'unconfirmed email' | null> {
        const user = await UserRepository.FindUserByLogin(login);
        if (!user) {
            return null;
        }
        const verificationResult = await this.checkCredentials(password, user.passwordHash);
        if (!verificationResult) {
            return null;
        }
        if (user.emailVerification.isConfirmed === false) {
            return 'unconfirmed email';
        }
        return {
            id: user.id,
            username: user.login,
            email: user.email,
            isAdmin: user.isAdmin,
        };
    },

    async encodePassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(SaltRounds);
        const passwordHash = await bcrypt.hash(password, salt);
        return passwordHash;
    },

    async checkCredentials(enteredPassword: string, hash: string): Promise<boolean> {
        try {
            return await bcrypt.compare(enteredPassword, hash);
        } catch {
            return false;
        }
    },

    async confirmEmail(userId: string, confirmationCode: string): Promise<boolean> {
        const userInfo = await UserRepository.findUserById(userId);
        if (!userInfo || !userInfo.emailVerification) {
            return false;
        }
        if (userInfo.emailVerification.confirmationCode !== confirmationCode) {
            return false;
        }
        const result = await UserRepository.updateEmailConfirmationStatus(userId);
        return result;
    },
};
