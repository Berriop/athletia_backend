export declare class BcryptService {
    private readonly saltRounds;
    hash(password: string): Promise<string>;
    compare(password: string, hash: string): Promise<boolean>;
}
