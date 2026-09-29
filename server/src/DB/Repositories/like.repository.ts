import type { ILike } from "../../Common/index.js";
import { BaseRepository } from "./base.repository.js";
import {LikeModel} from '../Models/like.model.js'




export class LikeRepository extends BaseRepository<ILike>{

    constructor(){
        super(LikeModel)
    }
}