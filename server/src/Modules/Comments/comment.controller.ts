import {Router} from "express"
import { authentication, uploadImage } from "../../Middlewares/index.js"
import CommentService from "./Services/comment.service.js"

export const CommentController = Router()



CommentController.post("/:postId" , authentication , uploadImage().single("attachment") , CommentService.addComment)
CommentController.delete("/:commentId" , authentication , CommentService.deleteComment)
CommentController.patch("/:commentId", authentication, uploadImage().single("attachment"), CommentService.editComment)