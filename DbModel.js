import mongoose from "mongoose"

const instance = mongoose.Schema({
    avater:String,
    comments:[],
    status:String,
    UserName:String,
    likes:Number,
    file:[],
});

export default mongoose.model("posts",instance)

