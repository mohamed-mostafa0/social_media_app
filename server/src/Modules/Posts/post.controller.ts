import {Router} from "express"
import postService from './Services/post.service.js'
import { authentication, uploadImage } from "../../Middlewares/index.js"

export const PostController = Router()


PostController.post("/add" , authentication , uploadImage().array("images") , postService.addPost)
PostController.delete("/:postId" , authentication , postService.deletePost)
PostController.post("/:postId/comment" , authentication , uploadImage().single("attachment") , postService.addComment)
PostController.delete("/comment/:commentId" , authentication , postService.deleteComment)
PostController.patch("/comment/:commentId", authentication, uploadImage().single("attachment"), postService.editComment)
// PostController.get("/home" , authentication , postService.listHomePosts)