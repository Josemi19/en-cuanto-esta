const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

export default function sitemap() {
    return [
        {
            url: siteUrl,
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${siteUrl}/promedios`,
            changeFrequency: "weekly",
            priority: 0.7,
        },
    ];
}