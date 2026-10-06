import type { Request, Response } from "express";
import { type IRequest } from "../../../Common/index.js";
import { successResponse, NotFoundException } from "../../../Utils/index.js";
import { NotificationModel } from "../../../DB/Models/index.js";

class NotificationService {
    getNotifications = async (req: Request, res: Response) => {
        const { user: { _id } } = (req as IRequest).loggedInUser;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const notifications = await NotificationModel.find({ recipientId: _id })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("senderId", "firstName lastName profilePicture")
            .lean();

        const unreadCount = await NotificationModel.countDocuments({
            recipientId: _id,
            isRead: false,
        });

        return res.status(200).json(
            successResponse("Notifications fetched successfully", 200, {
                notifications,
                unreadCount,
                page,
                limit,
            })
        );
    };

    getUnreadCount = async (req: Request, res: Response) => {
        const { user: { _id } } = (req as IRequest).loggedInUser;
        const unreadCount = await NotificationModel.countDocuments({
            recipientId: _id,
            isRead: false,
        });

        return res.status(200).json(
            successResponse("Unread count fetched successfully", 200, { unreadCount })
        );
    };

    markAsRead = async (req: Request, res: Response) => {
        const { user: { _id } } = (req as IRequest).loggedInUser;
        const { id } = req.params;

        const notification = await NotificationModel.findOneAndUpdate(
            { _id: id, recipientId: _id },
            { isRead: true, readAt: new Date() },
            { new: true }
        );

        if (!notification) {
            throw new NotFoundException("Notification not found");
        }

        return res.status(200).json(
            successResponse("Notification marked as read", 200, notification)
        );
    };

    markAllAsRead = async (req: Request, res: Response) => {
        const { user: { _id } } = (req as IRequest).loggedInUser;

        await NotificationModel.updateMany(
            { recipientId: _id, isRead: false },
            { isRead: true, readAt: new Date() }
        );

        return res.status(200).json(
            successResponse("All notifications marked as read", 200)
        );
    };
}

export default new NotificationService();
