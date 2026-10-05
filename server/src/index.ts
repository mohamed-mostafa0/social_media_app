import 'dotenv/config'
import cors from "cors"
import morgan from 'morgan'
import fs from 'fs'
import express, { type NextFunction, type Request, type Response } from "express"
import * as controllers from './Modules/index.js'
import { dbConnection } from './DB/db.connection.js'
import { failedResponse, HttpException } from './Utils/index.js'
import { createHandler } from 'graphql-http/lib/use/express'
import { MainSchema } from './GraphQl/main.gql.js'
import { authentication } from './Middlewares/authentication.middleware.js'
import type { IRequest } from './Common/index.js'
import { ioIntializer } from './Gateways/socket.gateway.js'



const app = express()
dbConnection()
app.use(express.json())

const corsOptions = {
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true,
}

app.use(cors(corsOptions))
app.use(morgan("dev"))
var accessLogStream = fs.createWriteStream('access.log')
app.use(morgan('dev', { stream: accessLogStream }))

const graphqlHandler = createHandler({ schema: MainSchema, context: (req) => ({ user: (req.raw as IRequest).loggedInUser }) })
app.all("/graphql", authentication, graphqlHandler)
app.all("/api/graphql", authentication, graphqlHandler)

app.use("/api/auth", controllers.authController)
app.use("/api/profile", controllers.profileController)
app.use("/api/comment", controllers.CommentController)
app.use("/api/post", controllers.PostController)
app.use("/api/like", controllers.LikeController)
app.use("/api/chat", controllers.chatController)
app.use("/api/notification", controllers.NotificationController)



app.use((err: Error | HttpException | null, req: Request, res: Response, next: NextFunction) => {
    if (err) {
        if (err instanceof HttpException) {
            res.status(err.statusCode).json(failedResponse(err.message, err.statusCode, err.error))
        } else {
            console.error("SERVER ERROR:", err)
            res.status(500).json(failedResponse("Something Went Wrong", 500, err))
        }
    }
})

const port: number | string = process.env.PORT || 3000
const server = app.listen(port, () => {
    console.log(`server started on port ${port}`);

})

ioIntializer(server , corsOptions)
