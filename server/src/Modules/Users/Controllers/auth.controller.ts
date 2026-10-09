import {Router} from "express"
import authService from '../Services/auth.service.js'
import { authentication, loginRateLimit, otpRateLimiter, validation } from "../../../Middlewares/index.js"
import { signUpValidator } from "../../../Validators/index.js"

const authController = Router()

authController.post('/signup' , otpRateLimiter , validation(signUpValidator), authService.signup)
authController.post('/signin' , loginRateLimit , authService.signin)
authController.patch('/confirm-email', otpRateLimiter , authService.confirmEmail);
authController.post('/logout' ,authentication, authService.logout)

export {authController}