import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { NextResponse } from "next/server";
import postgres from "postgres";
import { chat } from "@/lib/db/schema";

const client = postgres(process.env.POSTGRES_URL ?? "");
const db = drizzle(client);

export async function POST(request: Request) {
  try {
    const { chatId, agentId } = await request.json();
    if (!chatId || !agentId) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    await db.update(chat).set({ agentId }).where(eq(chat.id, chatId));
    return NextResponse.json({ success: true });
  } catch (_e) {
    return NextResponse.json(
      { error: "Failed to link chat and agent" },
      { status: 500 }
    );
  }
}
