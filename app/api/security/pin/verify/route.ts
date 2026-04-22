import { compare } from "bcrypt-ts";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { getUserPinHash } from "@/lib/db/queries";

const requestSchema = z.object({
  pin: z.string().min(1),
});

import { checkIpRateLimit } from "@/lib/ratelimit";
import { ipAddress } from "@vercel/functions";

export async function POST(request: Request) {
  try {
    const ip = ipAddress(request) ?? "unknown";
    await checkIpRateLimit(ip, 5); // Allow max 5 pin checks per hour to mitigate brute force

    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const { pin } = requestSchema.parse(json);

    const storedHash = await getUserPinHash(session.user.id);

    if (!storedHash) {
      return Response.json({ error: "No pin code configured" }, { status: 400 });
    }

    const isValid = await compare(pin, storedHash);

    return Response.json({ isValid }, { status: 200 });
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
}
