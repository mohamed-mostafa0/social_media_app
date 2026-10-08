import {Router} from "express"
import authService from '../Services/auth.service.js'
import { authentication, validation } from "../../../Middlewares/index.js"
import { signUpValidator } from "../../../Validators/index.js"

const authController = Router()

authController.post('/signup' ,validation(signUpValidator), authService.signup)
authController.post('/signin' , authService.signin)
authController.patch('/confirm-email', authService.confirmEmail);
authController.post('/logout' ,authentication, authService.logout)

export {authController}