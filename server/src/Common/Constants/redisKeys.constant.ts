
export const REDIS_KEYS = {
    userSession: (userId: string | object) => `user:session:${userId}`,
    tokenBlacklist: (jti: string) => `blacklist:token:${jti}`,
    otpConfirm: (email: string) => `otp:confirm:${email}`,
    userOnline: (userId: string | object) => `user:online:${userId}`,
    storyViewers: (storyId: string | object) => `story:viewers:${storyId}`,
} as const;


export const REDIS_TTL = {
    USER_SESSION: 1800,       
    OTP: 600,                      
} as const;