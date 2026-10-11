import nodemailer from "nodemailer";
import type { IEmail } from "../../Common/index.js";
import EventEmitter from "node:events";



export const sendEmail = ({
    content,
    attachments=[],
    to,
    subject
}:IEmail)=>{
    
    const transporter = nodemailer.createTransport({
        host:"smtp.gmail.com",
        port:465,
        secure:true,
        service:"gmail",
        auth:{
            pass:process.env.EMAIL_PASS,
            user:process.env.EMAIL_USER
        }
    })

    const info = transporter.sendMail({
        from:process.env.EMAIL_USER as string,
        html:content,
        to,
        subject,
        attachments
    })
}


export const eventEmiiter = new EventEmitter()
eventEmiiter.on("send-email" , (args:IEmail)=>{
    sendEmail(args)
})