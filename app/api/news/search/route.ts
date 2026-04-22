import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getSubscriptionPlan } from "@/lib/db/queries";
import { checkServerUsageLimit } from "@/lib/server-usage";
import { parsePlanKey, planDefinitions } from "@/lib/subscription";

interface SerpApiOrganicResult {
  link: string;
  snippet?: string;
  source?: string;
  title: string;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const planKey = await getSubscriptionPlan(session.user.id);
    const plan = parsePlanKey(planKey);
    const maxSearches = planDefinitions[plan].limits.newsSearchesPerDay;

    const canSearch = await checkServerUsageLimit(
      session.user.id,
      "news",
      "day",
      maxSearches
    );

    if (!canSearch) {
      return NextResponse.json(
        { error: "Limite de recherches atteinte pour aujourd'hui" },
        { status: 429 }
      );
    }

    const { query, fileContext } = (await request.json()) as {
      fileContext?: string;
      query?: string;
    };

    if (!query?.trim()) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const apiKey = process.env.SERPAPI_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "mSearch non configuré. Contactez l'administrateur.",
        },
        { status: 500 }
      );
    }

    const params = new URLSearchParams({
      api_key: apiKey,
      engine: "google",
      gl: "fr",
      hl: "fr",
      num: "8",
      q: fileContext?.trim()
        ? `${query} contexte fichier: ${fileContext.slice(0, 1000)}`
        : query,
    });

    const response = await fetch(
      `https://serpapi.com/search.json?${params.toString()}`
    );
    const data = (await response.json()) as {
      organic_results?: SerpApiOrganicResult[];
    };

    const organicResults = (data.organic_results ?? [])
      .slice(0, 8)
      .map((item) => ({
        link: item.link,
        snippet: item.snippet,
        source: item.source,
        title: item.title,
      }));

    const report = organicResults
      .map(
        (result, index) =>
          `${index + 1}. ${result.title}\nSource: ${result.source ?? "Web"}\nRésumé: ${result.snippet ?? "Aucun extrait disponible."}`
      )
      .join("\n\n");

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      organicResults,
      report,
    });
  } catch (error) {
    console.error("news search error", error);
    return NextResponse.json({ error: "News search failed" }, { status: 500 });
  }
}
