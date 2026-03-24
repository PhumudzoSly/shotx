"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface Tweet {
  author: {
    name: string;
    handle: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  timestamp: string;
  media?: { url: string; type: string }[];
  quotedTweet?: {
    author: {
      name: string;
      handle: string;
      avatar: string;
      verified: boolean;
    };
    content: string;
    media?: { url: string; type: string }[];
  };
}

interface TweetCardProps {
  tweet: Tweet;
  reply?: Tweet;
  showReply?: boolean;
  roundness?: number;
  showMedia?: boolean;
  tweetTheme?: "light" | "dark";
  glassmorphism?: boolean;
  shadow?: string;
  maxWidth?: number;
}

interface TweetVisualTheme {
  card: string;
  text: string;
  muted: string;
  subtleBg: string;
  border: string;
  divider: string;
  fallback: string;
}

const tweetThemes: Record<"light" | "dark", TweetVisualTheme> = {
  light: {
    card: "bg-[rgba(255,255,255,0.96)] text-[#0f1419]",
    text: "text-[#0f1419]",
    muted: "text-[#536471]",
    subtleBg: "bg-[#f7f9f9]",
    border: "border-[rgba(15,20,25,0.08)]",
    divider: "bg-black/10",
    fallback: "bg-[#eff3f4] text-[#0f1419]",
  },
  dark: {
    card: "bg-[rgba(0,0,0,0.92)] text-[#e7e9ea]",
    text: "text-[#e7e9ea]",
    muted: "text-[#71767b]",
    subtleBg: "bg-white/5",
    border: "border-[rgba(255,255,255,0.12)]",
    divider: "bg-white/12",
    fallback: "bg-white/8 text-[#e7e9ea]",
  },
};

function VerifiedBadge() {
  return (
    <svg viewBox="0 0 22 22" className="size-4 fill-[#1D9BF0]">
      <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681.132-.637.075-1.299-.165-1.903.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
    </svg>
  );
}

function QuotedTweet({
  tweet,
  showMedia,
  theme,
}: {
  tweet: NonNullable<Tweet["quotedTweet"]>;
  showMedia?: boolean;
  theme: TweetVisualTheme;
}) {
  return (
    <div
      className={cn(
        "mt-3 rounded-xl border p-3",
        theme.border,
        theme.subtleBg,
      )}
    >
      <div className="flex items-center gap-2">
        <Avatar className="size-5">
          <AvatarImage src={tweet.author.avatar} alt={tweet.author.name} />
          <AvatarFallback className={cn("text-xs", theme.fallback)}>
            {tweet.author.name[0]}
          </AvatarFallback>
        </Avatar>
        <span className={cn("text-sm font-semibold tracking-tight", theme.text)}>
          {tweet.author.name}
        </span>
        {tweet.author.verified && <VerifiedBadge />}
        <span className={cn("text-sm", theme.muted)}>
          @{tweet.author.handle}
        </span>
      </div>
      <p
        className={cn(
          "mt-2 whitespace-pre-wrap text-sm leading-relaxed",
          theme.text,
        )}
      >
        {tweet.content}
      </p>
      {showMedia && tweet.media && tweet.media.length > 0 && (
        <div className="mt-2 rounded-xl overflow-hidden">
          <img
            src={tweet.media[0].url}
            alt="Quoted tweet media"
            className="w-full h-auto object-cover"
            crossOrigin="anonymous"
          />
        </div>
      )}
    </div>
  );
}

function SingleTweet({
  tweet,
  isReply,
  showMedia,
  theme,
}: {
  tweet: Tweet;
  isReply?: boolean;
  showMedia?: boolean;
  theme: TweetVisualTheme;
}) {
  // Regex to remove tweet URLs from the content if media is being hidden
  const content = showMedia
    ? tweet.content
    : tweet.content.replace(/https:\/\/t\.co\/[a-zA-Z0-9]+/g, "").trim();

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <Avatar className="size-11 shrink-0">
          <AvatarImage src={tweet.author.avatar} alt={tweet.author.name} />
          <AvatarFallback className={theme.fallback}>
            {tweet.author.name[0]}
          </AvatarFallback>
        </Avatar>
        {isReply && <div className={cn("mt-2 w-0.5 flex-1", theme.divider)} />}
      </div>
      <div className="flex-1 min-w-0 pb-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={cn("font-semibold tracking-tight", theme.text)}>
            {tweet.author.name}
          </span>
          {tweet.author.verified && <VerifiedBadge />}
          <span className={cn("text-sm", theme.muted)}>
            @{tweet.author.handle}
          </span>
          <span className={theme.muted}>·</span>
          <span className={cn("text-sm", theme.muted)}>
            {tweet.timestamp}
          </span>
        </div>
        <p
          className={cn(
            "mt-1 whitespace-pre-wrap text-[15px] leading-relaxed",
            theme.text,
          )}
        >
          {content}
        </p>
        {showMedia && tweet.media && tweet.media.length > 0 && (
          <div className="mt-3 rounded-2xl overflow-hidden">
            <img
              src={tweet.media[0].url}
              alt="Tweet media"
              className="w-full h-auto object-cover"
              crossOrigin="anonymous"
            />
          </div>
        )}
        {tweet.quotedTweet && (
          <QuotedTweet
            tweet={tweet.quotedTweet}
            showMedia={showMedia}
            theme={theme}
          />
        )}
      </div>
    </div>
  );
}

export function TweetCard({
  tweet,
  reply,
  showReply,
  roundness = 16,
  showMedia = true,
  tweetTheme = "dark",
  glassmorphism = false,
  shadow,
  maxWidth = 500,
}: TweetCardProps) {
  const theme = tweetThemes[tweetTheme];

  return (
    <div
      className={cn(
        "w-full border p-5 transition-all duration-300",
        theme.card,
        theme.border,
        glassmorphism && "backdrop-blur-2xl",
      )}
      style={{
        borderRadius: `${roundness}px`,
        boxShadow: shadow,
        maxWidth: `${maxWidth}px`,
      }}
    >
      {showReply && reply ? (
        <>
          <SingleTweet
            tweet={reply}
            isReply
            showMedia={showMedia}
            theme={theme}
          />
          <div className="mt-3" />
          <SingleTweet
            tweet={tweet}
            showMedia={showMedia}
            theme={theme}
          />
        </>
      ) : (
        <SingleTweet
          tweet={tweet}
          showMedia={showMedia}
          theme={theme}
        />
      )}
    </div>
  );
}
