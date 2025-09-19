import mongoose from "mongoose";

const postsSchema = new mmongoose.Schema ({

    authorClerkId: { type: String, required: true, index: true },
    title: { type: String, trim: true },
    body: { type: String, required: true },
    // ordered array of media references (keeps post doc small but references media)
    media: [{
        type: Schema.Types.ObjectId,
        ref: 'media'
    }],
    // simple attachments metadata for quick access (optional denormalized)
    
    tags: [{ type: String, index: true }],
    visibility: { type: String, enum: ['public','unlisted','private'], default: 'public' },
    status: { type: String, enum: ['active','archived','moderation'], default: 'active' },
    pinned: { type: Boolean, default: false },
    
    // Denormalized counters for fast feeds
    commentsCount: { type: Number, default: 0 },
    reactionsCount: { type: Number, default: 0 },
    
    deleted: { type: Boolean, default: false },
}, { timestamps: true });



const Posts = mongoose.models.posts || mongoose.model("posts", postsSchema)

export default Posts