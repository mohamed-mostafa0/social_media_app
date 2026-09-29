import {Router} from 'express'
import LikeService from './Services/like.service.js'
import { authentication } from '../../Middlewares/authentication.middleware.js'

export const LikeController = Router()


LikeController.post("/:refId" , authentication , LikeService.toggleLike)