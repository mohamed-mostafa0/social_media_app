

export const fileTypeEnum ={
    VIDEO:"video",
    IMAGE:"image",
    AUDIO:"audio",
    APPLICATION:"application"
}


export const AllowedFileExtenstionsEnum = {
    [fileTypeEnum.VIDEO]:["mp4","webm","mov","avi","mkv","m4v","mpeg","mpg","3gp"],
    [fileTypeEnum.IMAGE]:["jpg","jpeg","gif","webp","png","avif"],
    [fileTypeEnum.AUDIO]:["mp3" , "webm"],
    [fileTypeEnum.APPLICATION]:["pdf","doc","docx","xls","xlsx","ppt","pptx","txt","csv","zip","rar"]
}