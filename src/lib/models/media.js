import mongoose from "mongoose";

const mediaSchema = new mmongoose.Schema ({
    ownerClerkId: { type: String, required: true, index: true }, // who uploaded it
    postId: { type: Schema.Types.ObjectId, ref: 'posts', required: true }, // link to post
    url: { type: String, required: true }, // UploadThing public URL

})


const Media = mongoose.models.media || mongoose.model("media", mediaSchema)

export default Media