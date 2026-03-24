"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export interface Tweet {
  author: {
    name: string
    handle: string
    avatar: string
    verified: boolean
  }
  content: string
  timestamp: string
  media?: { url: string; type: string }[]
  quotedTweet?: {
    author: {
      name: string
      handle: string
      avatar: string
      verified: boolean
    }
    content: string
    media?: { url: string; type: string }[]
  }
}

interface TweetCardProps {
  tweet: Tweet
  reply?: Tweet
  showReply?: boolean
}

function VerifiedBadge() {
  return (
    <svg viewBox="0 0 22 22" className="size-4 fill-[#1D9BF0]">
      <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681.132-.637.075-1.299-.165-1.903.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
    </svg>
  )
}

function QuotedTweet({ tweet }: { tweet: NonNullable<Tweet["quotedTweet"]> }) {
  return (
    <div className="mt-3 border border-border rounded-xl p-3 bg-secondary/30">
      <div className="flex items-center gap-2">
        <Avatar className="size-5">
          <AvatarImage src={tweet.author.avatar} alt={tweet.author.name} />
          <AvatarFallback className="bg-muted text-foreground text-xs">{tweet.author.name[0]}</AvatarFallback>
        </Avatar>
        <span className="font-semibold text-sm text-foreground">{tweet.author.name}</span>
        {tweet.author.verified && <VerifiedBadge />}
        <span className="text-muted-foreground text-sm">@{tweet.author.handle}</span>
      </div>
      <p className="text-foreground mt-2 text-sm leading-relaxed whitespace-pre-wrap">
        {tweet.content}
      </p>
      {tweet.media && tweet.media.length > 0 && (
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
  )
}

function SingleTweet({ tweet, isReply }: { tweet: Tweet; isReply?: boolean }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <Avatar className="size-11 shrink-0">
          <AvatarImage src={tweet.author.avatar} alt={tweet.author.name} />
          <AvatarFallback className="bg-secondary text-foreground">{tweet.author.name[0]}</AvatarFallback>
        </Avatar>
        {isReply && (
          <div className="w-0.5 flex-1 bg-border mt-2" />
        )}
      </div>
      <div className="flex-1 min-w-0 pb-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-foreground">{tweet.author.name}</span>
          {tweet.author.verified && <VerifiedBadge />}
          <span className="text-muted-foreground text-sm">@{tweet.author.handle}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground text-sm">{tweet.timestamp}</span>
        </div>
        <p className="text-foreground mt-1 whitespace-pre-wrap text-[15px] leading-relaxed">
          {tweet.content}
        </p>
        {tweet.media && tweet.media.length > 0 && (
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
          <QuotedTweet tweet={tweet.quotedTweet} />
        )}
      </div>
    </div>
  )
}

export function TweetCard({ tweet, reply, showReply }: TweetCardProps) {
  return (
    <div className="bg-card rounded-2xl p-5 w-full max-w-[500px] shadow-2xl">
      {showReply && reply ? (
        <>
          <SingleTweet tweet={reply} isReply />
          <div className="mt-3" />
          <SingleTweet tweet={tweet} />
        </>
      ) : (
        <SingleTweet tweet={tweet} />
      )}
    </div>
  )
}
