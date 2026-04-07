import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connection from "../../../../lib/mongo";
import Notifications from "@lib/models/notifications";

export async function PATCH(req) {
  try {
    await connection();
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const ids = Array.isArray(body.ids) ? body.ids : null;
    const markAll = Boolean(body.all);

    if (markAll) {
      await Notifications.updateMany(
        { recipientClerkId: userId, read: false },
        { $set: { read: true } }
      );
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    if (!ids?.length) {
      return NextResponse.json({ error: "ids or all required" }, { status: 400 });
    }

    const oids = ids
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    await Notifications.updateMany(
      { _id: { $in: oids }, recipientClerkId: userId },
      { $set: { read: true } }
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("PATCH notifications/read", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
