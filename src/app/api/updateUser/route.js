import { createClerkClient } from '@clerk/backend'

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

export async function POST(req) {
    const { birthday, bio, userId } = await req.json()
  
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        birthday,
        bio,
      },
    })
  
    return Response.json({ success: true })
  }