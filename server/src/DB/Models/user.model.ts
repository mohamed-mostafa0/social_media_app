import mongoose from "mongoose";
import { GenderEnum, OtpTypeEnum, ProviderEnum, RoleEnum, type IUser } from "../../Common/index.js";
import { generateHash } from "../../Utils/Hashing/hash.utils.js";




const userSchema = new mongoose.Schema<IUser>({
    firstName: {
        type: String,
        required: true,
        minLength: [4, "first name must be at least 4 chars"]

    },
    lastName: {
        type: String,
        required: true,
        minLength: [4, "Last name must be at least 4 chars"]
    },
    email: {
        type: String,
        required: true,
        index: {
            unique: true,
            name: "idx_email_unique"
        }
    },
    password: {
        type: String,
        required: true
    },
    age: Number,
    role: {
        type: String,
        enum: RoleEnum,
        default: RoleEnum.USER
    },
    gender: {
        type: String,
        enum: GenderEnum,
        default: GenderEnum.MALE
    },
    DOB: Date,
    location: {
        country:{type:String , trim:true},
        city: { type: String, trim: true },
        governrate: { type: String, trim: true },
        street: { type: String, trim: true }
    },
    education: {
        university: { type: String, trim: true },
        college: { type: String, trim: true },
        major:{type:String , trim:true},
        graduationYear:{type:Number}
    },
    socialLinks:[{
        platformName:{type:String ,trim:true },
        link:{type:String}
    }],
    profilePicture: String,
    profilePictureId: String,
    coverPicture: String,
    coverPictureId: String,
    provider: {
        type: String,
        enum: ProviderEnum,
        default: ProviderEnum.LOCAL
    },
    googleId: String,
    isVerified: {
        type: Boolean,
        default: false
    },
    phoneNumber: String,
    OTPs: [{
        value: { type: String, required: true },
        expiresAt: { type: Date, default: Date.now() + 600000 },
        otpType: { type: String, enum: OtpTypeEnum, required: true }
    }],
    followersCount: {
        type: Number,
        default: 0
    },
    followingCount: {
        type: Number,
        default: 0
    },
    postsCount: {
        type: Number,
        default: 0
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isDeactivated: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})


userSchema.pre('save', function () {
    if (this.isModified('password')) {
        this.password = generateHash(this.password)
    }

})
export const UserModel = mongoose.model<IUser>('User', userSchema)
