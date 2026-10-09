import type { Request, Response } from "express"
import { FollowRepository, LikeRepository, StoryRepository, StoryViewerRepository } from "../../../DB/Repositories/index.js"
import { fileTypeEnum, followStatusEnum, LikeOnModelEnum, REDIS_KEYS, type IRequest, type IStory } from "../../../Common/index.js"
import type { Multer } from "multer"
import { BadRequestException, deleteMediaFromCloudinary, NotFoundException, successResponse, UnauthorizedException, uploadMediaOnCloudinary } from "../../../Utils/index.js"
import { unlink } from "node:fs/promises"
import mongoose, { Types } from "mongoose"
import { redis } from "../../../DB/Connections/redis.connection.js"




class StoryService {
    private storyRepo:StoryRepository = new StoryRepository()
    private storyViewerRepo:StoryViewerRepository = new StoryViewerRepository()
    private followRepo:FollowRepository = new FollowRepository()
    private likeRepo:LikeRepository = new LikeRepository()


    addStory = async (req: Request, res: Response) => {
        const { user } = (req as IRequest).loggedInUser;
        const file = req.file;
        const { caption } = req.body;

        if (!file) {
            throw new BadRequestException("Media file (image or video) is required");
        }
        let uploadedMedia: any = null;
        try {
            uploadedMedia = await uploadMediaOnCloudinary(file.path, "stories");
        } finally {
            if (file?.path) {
                await unlink(file.path).catch(() => {});
            }
        }
        const mediaType =
            uploadedMedia.resource_type === fileTypeEnum.VIDEO? fileTypeEnum.VIDEO : fileTypeEnum.IMAGE;

        const createdStory: IStory = await this.storyRepo.createDocument({
            ownerId: user._id,
            media: {
                url: uploadedMedia.secure_url,
                publicId: uploadedMedia.public_id,
                mediaType,
            },
            ...(caption && { caption }),
        });
        return res.status(201).json(successResponse("Story added successfully", 201, createdStory));
    };

    deleteStory = async (req: Request, res: Response) => {
        const { user } = (req as IRequest).loggedInUser
        const { storyId } = req.params

        if (!storyId || !mongoose.isValidObjectId(storyId))
            throw new BadRequestException("Valid storyId is required")

        const story = await this.storyRepo.findDocumentById(storyId as string)
        if (!story) throw new NotFoundException("Story not found")
        if (user._id.toString() !== story.ownerId.toString())
            throw new UnauthorizedException("Unauthorized, You are not the owner of the story")

        await Promise.all([
            this.storyRepo.findDocumentByIdAndDelete(storyId as string),
            this.storyViewerRepo.deleteManyDocuments({ storyId: story._id }),
            story.media?.publicId ?
                await deleteMediaFromCloudinary(story.media.publicId).catch(() => { }) : Promise.resolve

        ])

        return res.status(200).json(successResponse("Story deleted", 200))
    }

    viewStory = async (req: Request, res: Response) => {
        const { user } = (req as IRequest).loggedInUser;
        const { storyId } = req.params;

        if (!storyId || !mongoose.isValidObjectId(storyId))
            throw new BadRequestException("Valid storyId is required");

        const story = await this.storyRepo.findDocumentById(storyId as string);
        if (!story) throw new NotFoundException("Story not found");

        if (new Date() > new Date(story.expiresAt)) {
            throw new NotFoundException("Story has expired");
        }

        const isOwner = user._id.toString() === story.ownerId.toString();
        let viewer: any = null;

        if (!isOwner) {

            const isNewView = await redis.sadd(REDIS_KEYS.storyViewers(storyId), user._id.toString())

            if (isNewView === 1) {
                const remainingSeconds = Math.max(
                60,
                Math.floor((new Date(story.expiresAt).getTime() - Date.now()) / 1000)
                );
                 await redis.expire(REDIS_KEYS.storyViewers(storyId), remainingSeconds);
                try {
                    [viewer] = await Promise.all([
                        this.storyViewerRepo.createDocument({
                            storyId: storyId as unknown as Types.ObjectId,
                            ownerId: user._id,
                            expiresAt: story.expiresAt,
                        }).catch(()=>{}),
                        this.storyRepo.findByIdAndUpdateDocument(storyId as string, {
                            $inc: { viewsCount: 1 },
                        }),
                    ]);
                } catch (error: any) {
                    if (error.code === 11000) {
                        viewer = await this.storyViewerRepo.findOneDocument({
                            storyId: storyId as unknown as Types.ObjectId,
                            ownerId: user._id,
                        });
                    } else {
                        throw error;
                    }
                }
            }
        }

        return res.status(200).json(successResponse("Story viewed", 200, viewer));
    };

    getStories = async (req: Request, res: Response) => {
        const { user } = (req as IRequest).loggedInUser;

        const followingsOfUser = await this.followRepo.findDocuments({
            followFromId: user._id,
            status: followStatusEnum.ACCEPTED,
        });
        const followingsIds = followingsOfUser.map((f) => f.followToId);

        const targetUserIds = [user._id, ...followingsIds];

        const activeStories = await this.storyRepo.findDocuments(
            {
                ownerId: { $in: targetUserIds },
                expiresAt: { $gt: new Date() },
            },
            {},
            {
                populate: {
                    path: "ownerId",
                    select: "firstName lastName profilePicture",
                },
                sort: { createdAt: 1 },
                lean: true,
            }
        );

        const storyIds = activeStories.map((story: any) => story._id);
        const [viewedRecords, likedRecords] = await Promise.all([
            storyIds.length > 0
                ? this.storyViewerRepo.findDocuments({
                      storyId: { $in: storyIds },
                      ownerId: user._id,
                  })
                : Promise.resolve([]),
            storyIds.length > 0
                ? this.likeRepo.findDocuments({
                      refId: { $in: storyIds },
                      userId: user._id,
                      onModel: LikeOnModelEnum.Story,
                  })
                : Promise.resolve([]),
        ]);

        const viewedStoryIds = new Set(
            viewedRecords.map((v: any) => v.storyId.toString())
        );
        const likedStoryIds = new Set(
            likedRecords.map((l: any) => l.refId.toString())
        );

        const loggedInUserIdStr = user._id.toString();
        const storiesGroupedByUser = new Map<string, {
            user: {
                _id: string;
                firstName: string;
                lastName: string;
                profilePicture?: string;
            };
            isUser: boolean;
            allViewed: boolean;
            stories: any[];
        }>();

        storiesGroupedByUser.set(loggedInUserIdStr, {
            user: {
                _id: loggedInUserIdStr,
                firstName: user.firstName,
                lastName: user.lastName,
                profilePicture: user.profilePicture,
            },
            isUser: true,
            allViewed: true,
            stories: [],
        });

        for (const story of activeStories as any[]) {
            const owner = story.ownerId;
            if (!owner) continue;

            const ownerIdStr = owner._id.toString();
            const isOwner = ownerIdStr === loggedInUserIdStr;
            const isViewed = isOwner ? true : viewedStoryIds.has(story._id.toString());

            if (!storiesGroupedByUser.has(ownerIdStr)) {
                storiesGroupedByUser.set(ownerIdStr, {
                    user: {
                        _id: ownerIdStr,
                        firstName: owner.firstName,
                        lastName: owner.lastName,
                        profilePicture: owner.profilePicture,
                    },
                    isUser: isOwner,
                    allViewed: true,
                    stories: [],
                });
            }

            const group = storiesGroupedByUser.get(ownerIdStr)!;
            if (!isViewed) {
                group.allViewed = false;
            }

            group.stories.push({
                _id: story._id,
                media: story.media,
                caption: story.caption,
                viewsCount: story.viewsCount || 0,
                likesCount: story.likesCount || 0,
                isLiked: likedStoryIds.has(story._id.toString()),
                createdAt: story.createdAt,
                expiresAt: story.expiresAt,
                isViewed,
            });
        }

        const groups = Array.from(storiesGroupedByUser.values());
        const currentUserGroup = groups.find((g) => g.isUser);
        const otherGroups = groups
            .filter((g) => !g.isUser)
            .sort((a, b) => {
                if (!a.allViewed && b.allViewed) return -1;
                if (a.allViewed && !b.allViewed) return 1;

                const lastStoryA = a.stories[a.stories.length - 1]?.createdAt;
                const lastStoryB = b.stories[b.stories.length - 1]?.createdAt;
                return new Date(lastStoryB).getTime() - new Date(lastStoryA).getTime();
            });

        const result = currentUserGroup ? [currentUserGroup, ...otherGroups] : otherGroups;

        return res.status(200).json(successResponse("Stories fetched successfully", 200, result));
    };

    getStory = async (req: Request, res: Response) => {
        const { user } = (req as IRequest).loggedInUser;
        const { storyId } = req.params;

        if (!storyId || !mongoose.isValidObjectId(storyId)) {
            throw new BadRequestException("Valid storyId is required");
        }

        const story: any = await this.storyRepo.findDocumentById(
            storyId as string,
            {},
            {
                populate: {
                    path: "ownerId",
                    select: "firstName lastName profilePicture isPrivate",
                },
                lean: true,
            }
        );

        if (!story) {
            throw new NotFoundException("Story not found");
        }

        if (new Date() > new Date(story.expiresAt)) {
            throw new NotFoundException("Story has expired");
        }

        const owner = story.ownerId;
        const isOwner = user._id.toString() === (owner?._id?.toString() || owner?.toString());

        if (!isOwner && owner?.isPrivate) {
            const isFollowing = await this.followRepo.findOneDocument({
                followFromId: user._id,
                followToId: owner._id,
                status: followStatusEnum.ACCEPTED,
            });

            if (!isFollowing) {
                throw new UnauthorizedException("This account is private. Follow this user to view their story");
            }
        }

        const [isViewed, isLiked] = await Promise.all([
            isOwner
                ? Promise.resolve(true)
                : this.storyViewerRepo.findOneDocument({
                      storyId: story._id,
                      ownerId: user._id,
                  }).then((doc) => !!doc),
            this.likeRepo.findOneDocument({
                refId: story._id,
                userId: user._id,
                onModel: LikeOnModelEnum.Story,
            }).then((doc) => !!doc),
        ]);

        return res.status(200).json(
            successResponse("Story fetched successfully", 200, {
                ...story,
                viewsCount: story.viewsCount || 0,
                likesCount: story.likesCount || 0,
                isLiked,
                isViewed,
            })
        );
    };

    getStoryViewers = async (req: Request, res: Response) => {
        const { user } = (req as IRequest).loggedInUser;
        const { storyId } = req.params;

        if (!storyId || !mongoose.isValidObjectId(storyId)) {
            throw new BadRequestException("Valid storyId is required");
        }

        const story = await this.storyRepo.findDocumentById(storyId as string);
        if (!story) throw new NotFoundException("Story not found");

        if (story.ownerId.toString() !== user._id.toString()) {
            throw new UnauthorizedException("Only the story owner can view story viewers");
        }

        const [viewers, likes] = await Promise.all([
            this.storyViewerRepo.findDocuments(
                { storyId: story._id },
                {},
                {
                    populate: {
                        path: "ownerId",
                        select: "firstName lastName profilePicture",
                    },
                    sort: { createdAt: -1 },
                    lean: true,
                }
            ),
            this.likeRepo.findDocuments({
                refId: story._id,
                onModel: LikeOnModelEnum.Story,
            }),
        ]);

        const likedUserIds = new Set(likes.map((l: any) => l.userId.toString()));

        const formatted = (viewers as any[]).map((v) => ({
            _id: v._id,
            viewedAt: v.viewedAt || v.createdAt,
            user: v.ownerId,
            hasLiked: likedUserIds.has(v.ownerId?._id?.toString()),
        }));

        return res.status(200).json(
            successResponse("Story viewers fetched successfully", 200, formatted)
        );
    };


}


export default new StoryService()