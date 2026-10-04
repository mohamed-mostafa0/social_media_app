import type { IMessage } from "../../Common/index.js";
import { MessageModel } from "../Models/message.model.js";
import { BaseRepository } from "./base.repository.js";




export class MessageRepository extends BaseRepository<IMessage>{

    constructor(){
        super(MessageModel)
    }
}