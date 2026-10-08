import mongoose from "mongoose"


export const dbConnection = async()=>{
    try{
        await mongoose.connect(process.env.DB_LOCAL_URI as string)
        console.log("DB CONNECTED");
        
    }catch(err){
        console.log("FAILED TO CONNECT TO DB" , err);
    }
}