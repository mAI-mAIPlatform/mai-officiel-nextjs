import { auth } from "@/app/(auth)/auth";
import { getUser } from "@/lib/db/queries";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ plan: "free" });
  }

  try {
    const users = await getUser(session.user.email ?? "");
    const user = users.length > 0 ? users[0] : null;

    if (!user) {
      return Response.json({ plan: "free" });
    }

    return Response.json({ plan: user.plan });
  } catch {
    return Response.json({ plan: "free" });
  }
}
