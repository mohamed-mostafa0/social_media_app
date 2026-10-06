import {Router} from 'express'
import storyService from './Services/story.service.js'
import { authentication, uploadMedia } from '../../Middlewares/index.js'

export const storyController = Router()


storyController.post("/add-story" , authentication ,uploadMedia().single("media")  , storyService.addStory)