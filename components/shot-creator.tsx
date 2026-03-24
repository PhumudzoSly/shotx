"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { toPng } from "html-to-image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TweetCard, type Tweet } from "@/components/tweet-card"
import { BackgroundPicker, backgrounds } from "@/components/background-picker"
import { Download, Link2, Sparkles, ArrowRight, Loader2, ToggleLeft, ToggleRight, ImageIcon, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

// Demo tweets for preview
const demoTweet: Tweet = {
  author: {
    name: "Guillermo Rauch",
    handle: "rauchg",
    avatar: "https://pbs.twimg.com/profile_images/1783877012730830848/TdU1WJCG_400x400.jpg",
    verified: true,
  },
  content: "Ship fast, fix fast.\n\nThat's the real meta.",
  timestamp: "2h",
}

const demoReply: Tweet = {
  author: {
    name: "Lee Robinson",
    handle: "leeerob",
    avatar: "https://pbs.twimg.com/profile_images/1587647097670467584/adWRdqQ6_400x400.jpg",
    verified: true,
  },
  content: "This is the way. Deploy on Friday, fix on Saturday.",
  timestamp: "1h",
}

export function ShotCreator() {
  const [url, setUrl] = useState("")
  const [selectedBackground, setSelectedBackground] = useState("midnight")
  const [showReply, setShowReply] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tweet, setTweet] = useState<Tweet | null>(null)
  const [parentTweet, setParentTweet] = useState<Tweet | null>(null)
  const [padding, setPadding] = useState(48)
  const [scale, setScale] = useState(1)
  const captureRef = useRef<HTMLDivElement>(null)

  const selectedBg = backgrounds.find((bg) => bg.id === selectedBackground)

  // The tweet to display - fetched or demo
  const displayTweet = tweet || demoTweet
  const displayReply = parentTweet ? tweet : (tweet ? null : demoReply)

  const fetchTweet = useCallback(async (tweetUrl: string) => {
    if (!tweetUrl.includes("twitter.com") && !tweetUrl.includes("x.com")) {
      setError("Please enter a valid X/Twitter URL")
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/tweet?url=${encodeURIComponent(tweetUrl)}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch tweet")
      }
      
      setTweet(data.tweet)
      
      // If tweet has a parent (is a reply), set it
      if (data.parentTweet) {
        setParentTweet(data.parentTweet)
        setShowReply(true)
      } else {
        setParentTweet(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tweet")
      setTweet(null)
      setParentTweet(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleExport = useCallback(async () => {
    if (!captureRef.current) return
    
    setIsExporting(true)
    try {
      const dataUrl = await toPng(captureRef.current, {
        quality: 1,
        pixelRatio: 3,
      })
      
      const link = document.createElement("a")
      link.download = `shotx-${Date.now()}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error("Failed to export image:", err)
    } finally {
      setIsExporting(false)
    }
  }, [])

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text.includes("twitter.com") || text.includes("x.com")) {
        setUrl(text)
        fetchTweet(text)
      }
    } catch {
      // Clipboard access denied
    }
  }, [fetchTweet])

  const handleSubmit = useCallback(() => {
    if (url) {
      fetchTweet(url)
    }
  }, [url, fetchTweet])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        handleExport()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleExport])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-foreground flex items-center justify-center">
              <ImageIcon className="size-5 text-background" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">ShotX</h1>
              <p className="text-xs text-muted-foreground">Beautiful tweet screenshots</p>
            </div>
          </div>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="gap-2 bg-foreground text-background hover:bg-foreground/90"
          >
            {isExporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Export PNG
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr,400px] gap-8">
          {/* Preview Area */}
          <div className="flex flex-col items-center">
            <div className="w-full rounded-2xl bg-secondary/30 border border-border p-6 flex items-center justify-center min-h-[500px]">
              <div
                ref={captureRef}
                className={cn(
                  "flex items-center justify-center transition-all duration-300",
                  selectedBg?.style
                )}
                style={{ padding: `${padding}px` }}
              >
                <div style={{ transform: `scale(${scale})`, transformOrigin: "center" }}>
                  {parentTweet ? (
                    <TweetCard tweet={parentTweet} reply={displayTweet} showReply={showReply} />
                  ) : (
                    <TweetCard tweet={displayTweet} reply={displayReply || undefined} showReply={showReply && !!displayReply} />
                  )}
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Press <kbd className="px-2 py-1 bg-secondary rounded text-xs font-mono">⌘S</kbd> to save
            </p>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* URL Input */}
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <Link2 className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Tweet URL</span>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Paste X/Twitter link..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="bg-secondary border-none"
                />
                <Button variant="secondary" onClick={handlePaste} className="shrink-0">
                  Paste
                </Button>
              </div>
              <Button 
                onClick={handleSubmit} 
                disabled={!url || isLoading}
                className="w-full mt-3 gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  "Fetch Tweet"
                )}
              </Button>
              {error && (
                <div className="flex items-center gap-2 mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                  <AlertCircle className="size-4 shrink-0" />
                  {error}
                </div>
              )}
              {!tweet && (
                <p className="text-xs text-muted-foreground mt-2">
                  Showing demo preview. Paste a tweet URL and click Fetch to load real data.
                </p>
              )}
              {tweet && (
                <p className="text-xs text-green-500 mt-2">
                  Tweet loaded successfully
                </p>
              )}
            </div>

            {/* Background Selection */}
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Background</span>
              </div>
              <BackgroundPicker
                selected={selectedBackground}
                onSelect={setSelectedBackground}
              />
            </div>

            {/* Options */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Options</span>
              </div>

              {/* Show Reply Toggle */}
              <button
                onClick={() => setShowReply(!showReply)}
                className="w-full flex items-center justify-between py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>Include reply</span>
                {showReply ? (
                  <ToggleRight className="size-6 text-foreground" />
                ) : (
                  <ToggleLeft className="size-6" />
                )}
              </button>

              {/* Padding Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Padding</span>
                  <span className="text-foreground font-mono text-xs">{padding}px</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="96"
                  value={padding}
                  onChange={(e) => setPadding(Number(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-foreground"
                />
              </div>

              {/* Scale Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Scale</span>
                  <span className="text-foreground font-mono text-xs">{scale.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-foreground"
                />
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-secondary/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-foreground mb-2">Quick Tips</h3>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-foreground">•</span>
                  Toggle reply to include conversation threads
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground">•</span>
                  Adjust padding for different social platforms
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-foreground">•</span>
                  Exports at 3x resolution for crisp images
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
