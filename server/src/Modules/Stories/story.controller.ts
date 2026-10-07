import {Router} from 'express'
import storyService from './Services/story.service.js'
import { authentication, uploadMedia } from '../../Middlewares/index.js'

export const storyController = Router()


storyController.post("/add" , authentication ,uploadMedia().single("media")  , storyService.addStory)
storyController.post("/view/:storyId" , authentication , storyService.viewStory)
storyController.delete("/:storyId" , authentication , storyService.deleteStory)
storyController.get("/stories" , authentication , storyService.getStories)
storyController.get("/:storyId/viewers" , authentication , storyService.getStoryViewers)
storyController.get("/:storyId" , authentication , storyService.getStory)