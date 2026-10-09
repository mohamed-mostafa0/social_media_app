import { HttpException } from "./http.exception.utils.js";



export class BadRequestException extends HttpException{
    constructor(message:string , error?:object){
        super(message , 400 , error)
    }
}
export class ConflictException extends HttpException{
    constructor(message:string , error?:object){
        super(message , 409 , error)
    }
}
export class NotFoundException extends HttpException{
    constructor(message:string , error?:object){
        super(message , 404 , error)
    }
}
export class UnauthorizedException extends HttpException{
    constructor(message:string , error?:object){
        super(message , 401 , error)
    }
}
export class TooManyRequestsException extends HttpException {
    constructor(message: string = "Too many requests, please try again later", error?: object) {
        super(message, 429, error);
    }
}