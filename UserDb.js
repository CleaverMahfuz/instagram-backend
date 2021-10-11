import mongoose from "mongoose"

const instance = mongoose.Schema({
    username: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      password: {
        type: String,
        required: true
      },
      usericon:String,
      createdAt: {
        type: Date,
        default: Date.now()
      }
});

export default mongoose.model("user",instance)

