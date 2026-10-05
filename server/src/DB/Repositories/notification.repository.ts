import type { INotification } from "../../Common/index.js";
import { BaseRepository } from "./base.repository.js";
import { NotificationModel } from "../Models/index.js";
import type { PaginateOptions, QueryFilter } from 'mongoose';




export class NotificationRepository extends BaseRepository<INotification>{

    constructor(){
        super(NotificationModel)
    }

    async paginateNotifications(filter:QueryFilter<INotification> ,options?:PaginateOptions){
        return await NotificationModel.paginate(filter , options)
    } 
}