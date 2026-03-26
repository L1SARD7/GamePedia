import { UserRepository } from '../repositories/user-db-repository';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { emailAdapter } from '../adapters/email-adapter';

const SaltRounds = 10;

export const UserService = {
    async CreateNewUser(login: string, email: string, password: string): Promise<any> {
        const passwordHash = await this.encodePassword(password);
        const newUser = {
            id: +new Date(),
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

    async authorizationUser(login: string, password: string) {
        const user = await UserRepository.FindUserByLogin(login);
        if (!user) {
            return null;
        }
        const vereficationResult = await this.checkCredentials(password, user.passwordHash);
        if (!vereficationResult) {
            return null;
        }
        if (user.emailVerification.isConfirmed === false) {
            return 'unconfirmed email';
        }
        const authorizatedUser = {
            id: user.id,
            username: user.login,
            email: user.email,
            isAdmin: user.isAdmin,
        };
        return authorizatedUser;
    },

    async encodePassword(password: string) {
        const salt = await bcrypt.genSalt(SaltRounds);
        const passwordHash = await bcrypt.hash(password, salt);
        return passwordHash;
    },

    async checkCredentials(enteredPassword: string, hash: string) {
        try {
            return await bcrypt.compare(enteredPassword, hash);
        } catch {
            return false;
        }
    },

    async confirmEmail(userId: number, confirmationCode: string) {
        const userInfo = await UserRepository.findUserById(userId);
        if (!userInfo || !userInfo.emailVerification) {
            return false;
        }
        if (userInfo.emailVerification.confirmationCode !== confirmationCode) {
            return null;
        }
        const result = await UserRepository.updateEmailConfirmationStatus(userId);
        return result;
    },
};
