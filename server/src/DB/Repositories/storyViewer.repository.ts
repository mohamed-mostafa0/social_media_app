import type { IStoryViewer } from "../../Common/index.js";
import { StoryViewerModel } from "../Models/storyViewer.model.js";
import { BaseRepository } from "./base.repository.js";




export class StoryViewerRepository extends BaseRepository<IStoryViewer>{

    constructor(){
        super(StoryViewerModel)
    }
}