import mongoose from "mongoose";

const connection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL)
    console.log("Connected")
  } catch (error) {
    console.log(err)
  }
}

export default connection