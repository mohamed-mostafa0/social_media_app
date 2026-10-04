import type { IConversation } from "../../Common/index.js";
import { ConversationModel } from "../Models/conversation.model.js";
import { BaseRepository } from "./base.repository.js";




export class ConversationRepository extends BaseRepository<IConversation>{

    constructor(){
        super(ConversationModel)
    }
}