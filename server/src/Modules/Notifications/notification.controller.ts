import { Router } from "express";
import { authentication } from "../../Middlewares/authentication.middleware.js";
import NotificationService from "./Services/notification.service.js";

export const NotificationController = Router();

NotificationController.use(authentication);

NotificationController.get("/", NotificationService.getNotifications);
NotificationController.get("/unread-count", NotificationService.getUnreadCount);
NotificationController.patch("/read-all", NotificationService.markAllAsRead);
NotificationController.patch("/:id/read", NotificationService.markAsRead);
