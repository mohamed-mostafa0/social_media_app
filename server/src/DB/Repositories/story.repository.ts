import type { IStory } from "../../Common/index.js";
import { StoryModel } from "../Models/story.model.js";
import { BaseRepository } from "./base.repository.js";




export class StoryRepository extends BaseRepository<IStory>{

    constructor(){
        super(StoryModel)
    }
}