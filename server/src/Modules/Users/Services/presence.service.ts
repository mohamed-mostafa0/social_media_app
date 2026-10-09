import { REDIS_KEYS } from "../../../Common/index.js";
import { redis } from "../../../DB/Connections/redis.connection.js";
import { UserModel } from "../../../DB/Models/index.js";

class PresenceService {
    markUserOnline = async (userId: string): Promise<void> => {
        const id = userId.toString();
        await Promise.all([
            redis.sadd("users:online", id),
            redis.set(REDIS_KEYS.userOnline(id), "1"),
            UserModel.updateOne({ _id: id }, { isOnline: true }).exec().catch(() => {})
        ]);
    };

    markUserOffline = async (userId: string): Promise<string> => {
        const id = userId.toString();
        const lastSeen = new Date().toISOString();

        await Promise.all([
            redis.srem("users:online", id),
            redis.del(REDIS_KEYS.userOnline(id)),
            redis.set(`user:last_seen:${id}`, lastSeen),
            UserModel.updateOne({ _id: id }, { isOnline: false }).exec().catch(() => {})
        ]);
        return lastSeen;
    };

    isUserOnline = async (userId: string): Promise<boolean> => {
        const isMember = await redis.sismember("users:online", userId.toString());
        return isMember === 1;
    };

    getOnlineUsersBatch = async (userIds: string[]): Promise<Map<string, boolean>> => {
        const onlineMap = new Map<string, boolean>();
        if (!userIds.length) return onlineMap;

        const pipeline = redis.pipeline();
        userIds.forEach((id) => pipeline.sismember("users:online", id.toString()));
        const results = await pipeline.exec();

        if (results) {
            results.forEach(([err, isMember], index) => {
                const userId = userIds[index];
                if (userId) {
                    onlineMap.set(userId.toString(), isMember === 1);
                }
            });
        }
        return onlineMap;
    };
}

export default new PresenceService();