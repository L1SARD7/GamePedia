export type UserDbModel = {
    id: string;
    login: string;
    email: string;
    passwordHash: string;
    isAdmin: boolean;
    emailVerification: {
        isConfirmed: boolean;
        confirmationCode: string;
    };
    createdAt: string;
};
