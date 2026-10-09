
export const REDIS_KEYS = {
    userSession: (userId: string | object) => `user:session:${userId}`,
    tokenBlacklist: (jti: string) => `blacklist:token:${jti}`,
    otpConfirm: (email: string) => `otp:confirm:${email}`,
    userOnline: (userId: string | object) => `user:online:${userId}`,
    storyViewers: (storyId: string | object) => `story:viewers:${storyId}`,
    userTyping: (senderId: string | object, targetUserId: string | object) => 
    `chat:typing:${senderId}:${targetUserId}`,
} as const;


export const REDIS_TTL = {
    USER_SESSION: 1800,       
    OTP: 600,
    STORY_VIEWERS:86400                      
} as const;