import type { Request, Response } from "express";
import type { Socket } from "socket.io";
import { ConversationRepository, MessageRepository } from "../../../DB/Repositories/index.js";
import { ConversationModel, MessageModel } from "../../../DB/Models/index.js";
import { conversationTypeEnum, type IRequest } from "../../../Common/index.js";
import { connectedSockets, getIo, emitToUser } from "../../../Gateways/socket.gateway.js";
import { failedResponse, successResponse } from "../../../Utils/index.js";

export class ChatService {

    private conversationRepo: ConversationRepository = new ConversationRepository();
    private messageRepo: MessageRepository = new MessageRepository();

    async joinPrivateChat(socket: Socket, targetUserId: string) {
        let conversation = await this.conversationRepo.findOneDocument({
            type: conversationTypeEnum.DIRECT,
            members: { $all: [targetUserId, socket.data.userId] }
        });
        if (!conversation) {
            conversation = await this.conversationRepo.createDocument({
                type: conversationTypeEnum.DIRECT,
                members: [targetUserId, socket.data.userId]
            });
        }
        socket.join(conversation._id.toString());

        const targetSockets = connectedSockets.get(targetUserId);
        if (targetSockets?.length) {
            targetSockets.forEach((sockId) => {
                getIo()?.sockets.sockets.get(sockId)?.join(conversation._id.toString());
            });
        }

        return conversation;
    }

    async sendPrivateMessage(socket: Socket, data: unknown) {
        const { targetUserId, text } = data as { text: string; targetUserId: string };
        if (!targetUserId || !text?.trim()) return;

        const conversation = await this.joinPrivateChat(socket, targetUserId);

        const message = await this.messageRepo.createDocument({
            text: text.trim(),
            senderId: socket.data.userId,
            conversationId: conversation._id
        });

        // Update conversation's updatedAt timestamp
        await ConversationModel.findByIdAndUpdate(conversation._id, {
            updatedAt: new Date()
        });

        const senderId = socket.data.userId.toString();
        const receiverId = targetUserId.toString();

        // Broadcast to conversation room
        getIo()?.to(conversation._id.toString()).emit("message-sent", message);

        // Ensure all tabs of both sender and target receive message-sent
        emitToUser(senderId, "message-sent", message);
        emitToUser(receiverId, "message-sent", message);

        // Notify both users that their conversation list should be updated
        emitToUser(senderId, "conversation-updated", {
            conversationId: conversation._id,
            targetUserId: receiverId
        });
        emitToUser(receiverId, "conversation-updated", {
            conversationId: conversation._id,
            targetUserId: senderId
        });
    }

    getUserConversations = async (req: Request, res: Response) => {
        try {
            const { user } = (req as unknown as IRequest).loggedInUser;
            const currentUserId = user._id.toString();

            const conversations = await ConversationModel.find({
                members: user._id
            })
            .populate("members", "_id firstName lastName profilePicture")
            .sort({ updatedAt: -1 })
            .lean();

            const formattedConversations = await Promise.all(
                conversations.map(async (conv) => {
                    const members = (conv.members || []) as any[];
                    const otherUser = members.find(
                        (m) => m && m._id && m._id.toString() !== currentUserId
                    );

                    if (!otherUser) return null;

                    const lastMessage = await MessageModel.findOne({
                        conversationId: conv._id
                    })
                    .sort({ createdAt: -1 })
                    .lean();

                    const isOnline = Boolean(
                        connectedSockets.get(otherUser._id.toString())?.length
                    );

                    return {
                        _id: conv._id.toString(),
                        updatedAt:
                            (lastMessage as any)?.createdAt ||
                            (conv as any).updatedAt ||
                            (conv as any).createdAt,
                        otherUser: {
                            _id: otherUser._id.toString(),
                            name: `${otherUser.firstName} ${otherUser.lastName}`.trim(),
                            firstName: otherUser.firstName,
                            lastName: otherUser.lastName,
                            avatar: otherUser.profilePicture || null,
                            isOnline
                        },
                        lastMessage: lastMessage
                            ? {
                                  _id: lastMessage._id.toString(),
                                  text: lastMessage.text,
                                  senderId: lastMessage.senderId.toString(),
                                  createdAt: (lastMessage as any).createdAt
                              }
                            : null
                    };
                })
            );

            const filtered = formattedConversations
                .filter((c): c is NonNullable<typeof c> => c !== null)
                .sort((a, b) => {
                    const timeA = new Date(a.updatedAt || 0).getTime();
                    const timeB = new Date(b.updatedAt || 0).getTime();
                    return timeB - timeA;
                });

            return res
                .status(200)
                .json(successResponse("Conversations fetched successfully", 200, filtered));
        } catch (error) {
            return res
                .status(500)
                .json(failedResponse("Failed to fetch conversations", 500, error as object));
        }
    };

    getConversationMessages = async (req: Request, res: Response) => {
        try {
            const { user } = (req as unknown as IRequest).loggedInUser;
            const { targetUserId } = req.params;

            if (!targetUserId) {
                return res
                    .status(400)
                    .json(failedResponse("Target user ID is required", 400));
            }

            const conversation = await this.conversationRepo.findOneDocument({
                type: conversationTypeEnum.DIRECT,
                members: { $all: [targetUserId, user._id] }
            });

            if (!conversation) {
                return res
                    .status(200)
                    .json(successResponse("No messages found", 200, []));
            }

            const messages = await MessageModel.find({
                conversationId: conversation._id
            })
            .sort({ createdAt: 1 })
            .lean();

            return res
                .status(200)
                .json(successResponse("Messages fetched successfully", 200, messages));
        } catch (error) {
            return res
                .status(500)
                .json(failedResponse("Failed to fetch messages", 500, error as object));
        }
    };
}

