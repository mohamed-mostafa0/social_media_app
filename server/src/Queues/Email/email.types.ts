export enum EmailJobName {
    SEND_OTP = "send-otp",
    SEND_WELCOME = "send-welcome",
}

export interface SendOtpJobData {
    to: string;
    otp: string;
    subject?: string;
}
