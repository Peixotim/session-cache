import {createHash} from "crypto";
import redis from "../../../infra/database/redis";
import {UnauthorizedError} from "../../shared/errors";
import {JwtClaims} from "../../utils/jwt";
import {SessionData} from "../DTOs/session.dto";

export class SessionService {

    private hashToken(token: string): string {
        return createHash("sha256").update(token).digest("hex");
    }

    private sessionKey(tokenHash: string): string {
        return `session:${tokenHash}`;
    }

    private userSessionsKey(userId: string): string {
        return `user:${userId}:sessions`;
    }


    public async create(token: string, claims: JwtClaims): Promise<void> {
        const tokenHash = this.hashToken(token);
        const userId = claims.sub;

        const ttlSeconds = claims.exp - Math.floor(Date.now() / 1000);

        const data: SessionData = {
            userId,
            status: "active",
            createdAt: new Date().toISOString(),
        };

        await redis
            .multi()
            .set(this.sessionKey(tokenHash), JSON.stringify(data), "EX", ttlSeconds)
            .sadd(this.userSessionsKey(userId), tokenHash)
            .expire(this.userSessionsKey(userId), ttlSeconds)
            .exec();
    }

    public async validate(token: string): Promise<SessionData> {
        const raw = await redis.get(this.sessionKey(this.hashToken(token)));

        if (!raw) {
            throw new UnauthorizedError("No active session.");
        }

        const session = JSON.parse(raw) as SessionData;
        if (session.status !== "active") {
            throw new UnauthorizedError("Session is blocked.");
        }

        return session;
    }

    public async revoke(token: string): Promise<void> {
        const tokenHash = this.hashToken(token);
        const raw = await redis.get(this.sessionKey(tokenHash));
        await redis.del(this.sessionKey(tokenHash));

        if (raw) {
            const {userId} = JSON.parse(raw) as SessionData;
            await redis.srem(this.userSessionsKey(userId), tokenHash);
        }
    }

    public async getSessionsForUser(userId: string): Promise<SessionData[]> {
        const hashes = await redis.smembers(this.userSessionsKey(userId));
        if (hashes.length === 0) return [];

        // mget busca todos os valores em uma única viagem ao Redis.
        const raws = await redis.mget(...hashes.map((h) => this.sessionKey(h)));

        return raws
            .filter((raw): raw is string => raw !== null)
            .map((raw) => JSON.parse(raw) as SessionData);
    }

    public async revokeAllForUser(userId: string): Promise<void> {
        const indexKey = this.userSessionsKey(userId);
        const hashes = await redis.smembers(indexKey);

        if (hashes.length > 0) {
            await redis.del(...hashes.map((hash) => this.sessionKey(hash)));
        }
        await redis.del(indexKey);
    }
}
