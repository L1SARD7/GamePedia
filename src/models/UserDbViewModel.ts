export type UserDbModel = {
    id: number;
    login: string;
    email: string;
    passwordHash: string;
    isAdmin: boolean;
    emailVerification: {
        isConfirmed: boolean;
        confirmationCode: string;
    };
};
