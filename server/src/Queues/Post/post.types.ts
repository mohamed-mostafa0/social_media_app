

export enum PostJobName {
    DELETE_POST_DATA = "delete-post-data"
}

export interface DeletePostJobData {
    postId:string,
    ownerId:string
}