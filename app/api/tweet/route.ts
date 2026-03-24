import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")
  
  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 })
  }

  // Extract tweet ID from URL
  const tweetIdMatch = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/)
  if (!tweetIdMatch) {
    return NextResponse.json({ error: "Invalid tweet URL" }, { status: 400 })
  }

  const tweetId = tweetIdMatch[1]

  try {
    // Use Twitter's syndication API (no auth required)
    const response = await fetch(
      `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&token=0`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ShotX/1.0)",
        },
        next: { revalidate: 60 },
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: "Tweet not found or unavailable" },
        { status: 404 }
      )
    }

    const data = await response.json()

    // Helper to extract user info
    const extractUser = (user: {
      name: string
      screen_name: string
      profile_image_url_https?: string
      is_blue_verified?: boolean
      verified?: boolean
    }) => ({
      name: user.name,
      handle: user.screen_name,
      avatar: user.profile_image_url_https?.replace("_normal", "_400x400") || "",
      verified: user.is_blue_verified || user.verified || false,
    })

    // Helper to extract media
    const extractMedia = (mediaDetails?: { media_url_https: string; type: string }[]) =>
      mediaDetails?.map((m) => ({
        url: m.media_url_https,
        type: m.type,
      }))

    // Build main tweet
    const tweet = {
      id: data.id_str,
      author: extractUser(data.user),
      content: data.text,
      timestamp: formatTimestamp(new Date(data.created_at)),
      media: extractMedia(data.mediaDetails),
      quotedTweet: data.quoted_tweet ? {
        author: extractUser(data.quoted_tweet.user),
        content: data.quoted_tweet.text,
        media: extractMedia(data.quoted_tweet.mediaDetails),
      } : undefined,
    }

    // Check if this is a reply and fetch parent if available
    let parentTweet = null
    if (data.in_reply_to_status_id_str) {
      try {
        const parentResponse = await fetch(
          `https://cdn.syndication.twimg.com/tweet-result?id=${data.in_reply_to_status_id_str}&token=0`,
          {
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; ShotX/1.0)",
            },
            next: { revalidate: 60 },
          }
        )
        
        if (parentResponse.ok) {
          const parentData = await parentResponse.json()
          parentTweet = {
            author: extractUser(parentData.user),
            content: parentData.text,
            timestamp: formatTimestamp(new Date(parentData.created_at)),
            media: extractMedia(parentData.mediaDetails),
            quotedTweet: parentData.quoted_tweet ? {
              author: extractUser(parentData.quoted_tweet.user),
              content: parentData.quoted_tweet.text,
              media: extractMedia(parentData.quoted_tweet.mediaDetails),
            } : undefined,
          }
        }
      } catch {
        // Parent tweet unavailable, continue without it
      }
    }

    return NextResponse.json({ tweet, parentTweet })
  } catch (error) {
    console.error("Error fetching tweet:", error)
    return NextResponse.json(
      { error: "Failed to fetch tweet" },
      { status: 500 }
    )
  }
}

function formatTimestamp(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return `${diffSecs}s`
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
