import { hash } from "bcrypt-ts";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { updateUserPinHash } from "@/lib/db/queries";

const requestSchema = z.object({
  pin: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const { pin } = requestSchema.parse(json);

    const hashedPin = await hash(pin, 10);

    await updateUserPinHash(session.user.id, hashedPin);

    return Response.json({ hash: hashedPin }, { status: 200 });
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
}
