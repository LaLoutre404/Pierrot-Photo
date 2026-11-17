import "server-only";

type GoogleReview = {
  reviewId?: string;
  name?: string;
  reviewer?: { displayName?: string; isAnonymous?: boolean };
  starRating?: string;
  comment?: string;
  createTime?: string;
};

type ReviewPage = {
  reviews?: GoogleReview[];
  averageRating?: number;
  totalReviewCount?: number;
  nextPageToken?: string;
};

export type PublicReview = {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string | null;
};

export type GoogleReviewsResult = {
  reviews: PublicReview[];
  averageRating: number | null;
  totalReviewCount: number;
};

const ratingValues: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

function getConfig() {
  const accountId = process.env.GOOGLE_BUSINESS_ACCOUNT_ID;
  const locationId = process.env.GOOGLE_BUSINESS_LOCATION_ID;
  const clientId = process.env.GOOGLE_BUSINESS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_BUSINESS_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_BUSINESS_REFRESH_TOKEN;
  if (!accountId || !locationId || !clientId || !clientSecret || !refreshToken) return null;
  if (!/^\d+$/.test(accountId) || !/^\d+$/.test(locationId)) return null;
  return { accountId, locationId, clientId, clientSecret, refreshToken };
}

async function getAccessToken(config: NonNullable<ReturnType<typeof getConfig>>) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: config.refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Google OAuth : HTTP ${response.status}`);
  const data = await response.json() as { access_token?: string };
  if (!data.access_token) throw new Error("Google OAuth : jeton d'accès absent");
  return data.access_token;
}

export async function getGoogleBusinessReviews(): Promise<GoogleReviewsResult | null> {
  const config = getConfig();
  if (!config) return null;

  try {
    const accessToken = await getAccessToken(config);
    const reviews: PublicReview[] = [];
    const seenTokens = new Set<string>();
    let nextPageToken: string | undefined;
    let averageRating: number | null = null;
    let totalReviewCount = 0;
    let pageNumber = 0;

    do {
      const url = new URL(`https://mybusiness.googleapis.com/v4/accounts/${config.accountId}/locations/${config.locationId}/reviews`);
      url.searchParams.set("pageSize", "50");
      url.searchParams.set("orderBy", "updateTime desc");
      if (nextPageToken) url.searchParams.set("pageToken", nextPageToken);
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) throw new Error(`Google Business Profile : HTTP ${response.status}`);
      const page = await response.json() as ReviewPage;
      if (pageNumber === 0) {
        averageRating = typeof page.averageRating === "number" ? page.averageRating : null;
        totalReviewCount = typeof page.totalReviewCount === "number" ? page.totalReviewCount : 0;
      }
      for (const item of page.reviews ?? []) {
        reviews.push({
          id: item.reviewId ?? item.name ?? `review-${reviews.length}`,
          author: item.reviewer?.isAnonymous ? "Client Google" : item.reviewer?.displayName || "Client Google",
          rating: ratingValues[item.starRating ?? ""] ?? 0,
          comment: item.comment ?? "",
          date: item.createTime ?? null,
        });
      }
      nextPageToken = page.nextPageToken;
      if (nextPageToken) {
        if (seenTokens.has(nextPageToken)) throw new Error("Google Business Profile : pagination répétée");
        seenTokens.add(nextPageToken);
      }
      pageNumber += 1;
      if (pageNumber >= 100 && nextPageToken) throw new Error("Google Business Profile : plus de 5 000 avis à paginer");
    } while (nextPageToken);

    return { reviews, averageRating, totalReviewCount };
  } catch (error) {
    // Le détail des réponses Google et les jetons ne doivent pas apparaître dans les logs.
    console.error(error instanceof Error ? error.message : "Lecture des avis Google impossible");
    return null;
  }
}
