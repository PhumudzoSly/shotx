"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type ChangeEvent,
} from "react";
import { toPng } from "html-to-image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { TweetCard, type Tweet } from "@/components/tweet-card";
import { BackgroundPicker } from "@/components/background-picker";
import { backgrounds } from "@/lib/backgrounds";
import {
  Download,
  Link2,
  Sparkles,
  ArrowRight,
  Loader2,
  ToggleLeft,
  ToggleRight,
  ImageIcon,
  AlertCircle,
  Upload,
  X,
  Contrast,
  Maximize2,
  Layers3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const demoTweet: Tweet = {
  author: {
    name: "Guillermo Rauch",
    handle: "rauchg",
    avatar:
      "https://pbs.twimg.com/profile_images/1783877012730830848/TdU1WJCG_400x400.jpg",
    verified: true,
  },
  content: "Ship fast, fix fast.\n\nThat's the real meta.",
  timestamp: "2h",
};

const demoReply: Tweet = {
  author: {
    name: "Lee Robinson",
    handle: "leeerob",
    avatar:
      "https://pbs.twimg.com/profile_images/1587647097670467584/adWRdqQ6_400x400.jpg",
    verified: true,
  },
  content: "This is the way. Deploy on Friday, fix on Saturday.",
  timestamp: "1h",
};

const framePresets = [
  {
    id: "landscape",
    label: "LinkedIn/X Post",
    aspectRatio: "1.91 / 1",
    previewMaxWidth: 980,
    cardMaxWidth: 620,
    basePadding: 56,
    maxPadding: 104,
    helper: "1200 × 628",
  },
  {
    id: "square",
    label: "Square",
    aspectRatio: "1 / 1",
    previewMaxWidth: 820,
    cardMaxWidth: 520,
    basePadding: 64,
    maxPadding: 92,
    helper: "1080 × 1080",
  },
  {
    id: "story",
    label: "Instagram Story",
    aspectRatio: "9 / 16",
    previewMaxWidth: 460,
    cardMaxWidth: 360,
    basePadding: 42,
    maxPadding: 64,
    helper: "1080 × 1920",
  },
] as const;

const shadowPresets = [
  {
    id: "soft",
    label: "Soft",
    helper: "Ambient depth",
  },
  {
    id: "floating",
    label: "Floating",
    helper: "Lifted 3D glow",
  },
  {
    id: "retro",
    label: "Retro",
    helper: "Hard offset",
  },
] as const;

type FramePresetId = (typeof framePresets)[number]["id"];
type TweetTheme = "light" | "dark";
type ShadowPreset = (typeof shadowPresets)[number]["id"];

function createShadow(style: ShadowPreset, depth: number, angle: number) {
  const radians = (angle * Math.PI) / 180;
  const intensity = depth / 100;
  const offsetX = Math.cos(radians) * depth * 0.28;
  const offsetY = Math.sin(radians) * depth * 0.28;

  if (style === "retro") {
    return `${offsetX.toFixed(1)}px ${offsetY.toFixed(1)}px 0 rgba(15, 23, 42, ${(0.18 + intensity * 0.5).toFixed(3)})`;
  }

  if (style === "floating") {
    const blur = 18 + depth * 0.9;
    const spread = -8 + depth * 0.12;
    const secondaryBlur = 10 + depth * 0.45;
    return [
      `${offsetX.toFixed(1)}px ${offsetY.toFixed(1)}px ${blur.toFixed(1)}px ${spread.toFixed(1)}px rgba(15, 23, 42, ${(0.14 + intensity * 0.26).toFixed(3)})`,
      `${(offsetX * 0.45).toFixed(1)}px ${(offsetY * 0.45 + depth * 0.1).toFixed(1)}px ${secondaryBlur.toFixed(1)}px rgba(15, 23, 42, ${(0.08 + intensity * 0.16).toFixed(3)})`,
    ].join(", ");
  }

  const blur = 12 + depth * 0.55;
  const spread = -6 + depth * 0.04;
  return `${offsetX.toFixed(1)}px ${offsetY.toFixed(1)}px ${blur.toFixed(1)}px ${spread.toFixed(1)}px rgba(15, 23, 42, ${(0.1 + intensity * 0.18).toFixed(3)})`;
}

export function ShotCreator() {
  const [url, setUrl] = useState("");
  const [selectedBackground, setSelectedBackground] = useState("midnight");
  const [showReply, setShowReply] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tweet, setTweet] = useState<Tweet | null>(null);
  const [parentTweet, setParentTweet] = useState<Tweet | null>(null);
  const [padding, setPadding] = useState(56);
  const [scale, setScale] = useState(1);
  const [roundness, setRoundness] = useState(18);
  const [showMedia, setShowMedia] = useState(true);
  const [framePreset, setFramePreset] = useState<FramePresetId>("landscape");
  const [glassmorphism, setGlassmorphism] = useState(false);
  const [tweetTheme, setTweetTheme] = useState<TweetTheme>("dark");
  const [shadowStyle, setShadowStyle] = useState<ShadowPreset>("floating");
  const [shadowDepth, setShadowDepth] = useState(52);
  const [shadowAngle, setShadowAngle] = useState(120);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundBlur, setBackgroundBlur] = useState(16);
  const [removeTags, setRemoveTags] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewScale, setPreviewScale] = useState(1);

  const selectedBg = backgrounds.find((bg) => bg.id === selectedBackground);
  const activeFrame =
    framePresets.find((preset) => preset.id === framePreset) ?? framePresets[0];
  const computedShadow = createShadow(shadowStyle, shadowDepth, shadowAngle);

  // When no URL is provided, show demo data where Lee replies to Guillermo
  const actualMainTweet = tweet || demoReply;
  const actualParentTweet = tweet ? parentTweet : demoTweet;

  const fetchTweet = useCallback(async (tweetUrl: string) => {
    if (!tweetUrl.includes("twitter.com") && !tweetUrl.includes("x.com")) {
      setError("Please enter a valid X/Twitter URL");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/tweet?url=${encodeURIComponent(tweetUrl)}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch tweet");
      }

      setTweet(data.tweet);

      if (data.parentTweet) {
        setParentTweet(data.parentTweet);
        setShowReply(true);
      } else {
        setParentTweet(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tweet");
      setTweet(null);
      setParentTweet(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleExport = useCallback(async () => {
    if (!captureRef.current) return;

    setIsExporting(true);
    try {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });

      const dataUrl = await toPng(captureRef.current, {
        quality: 1,
        pixelRatio: 3,
      });

      const link = document.createElement("a");
      link.download = `shotx-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export image:", err);
    } finally {
      setIsExporting(false);
    }
  }, []);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.includes("twitter.com") || text.includes("x.com")) {
        setUrl(text);
        fetchTweet(text);
      }
    } catch {
      // Clipboard access denied
    }
  }, [fetchTweet]);

  const handleSubmit = useCallback(() => {
    if (url) {
      fetchTweet(url);
    }
  }, [url, fetchTweet]);

  const handleBackgroundUpload = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setBackgroundImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
      event.target.value = "";
    },
    [],
  );

  useEffect(() => {
    const nextPadding = framePresets.find(
      (preset) => preset.id === framePreset,
    )?.basePadding;
    if (nextPadding) {
      setPadding(nextPadding);
    }
  }, [framePreset]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleExport();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleExport]);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      
      // Calculate available space, padding 32px (16px each side)
      const availableWidth = containerRef.current.clientWidth;
      const availableHeight = containerRef.current.clientHeight;
      
      const [w, h] = activeFrame.aspectRatio.split('/').map(Number);
      const ratio = w / h;
      
      const targetWidth = activeFrame.previewMaxWidth;
      const targetHeight = targetWidth / ratio;
      
      const scaleX = availableWidth / targetWidth;
      const scaleY = availableHeight / targetHeight;
      
      // Use the smaller scale to ensure it fits both horizontally and vertically
      const minScale = Math.min(scaleX, scaleY, 1);
      
      setPreviewScale(minScale);
    };

    updateScale();
    
    // Add resize observer for more reliable resize detection
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, [activeFrame]);

  return (
    <div className="flex min-h-screen flex-col bg-black text-foreground lg:h-screen lg:overflow-hidden">
      <header className="z-10 flex h-16 shrink-0 items-center justify-between border-b border-border/40 bg-background/95 px-6 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-foreground">
            <ImageIcon className="size-4 text-background" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-none tracking-tight text-foreground">
              ShotX
            </h1>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Beautiful screenshots
            </p>
          </div>
        </div>
        <Button
          onClick={handleExport}
          disabled={isExporting}
          size="sm"
          className="h-9 gap-2 rounded-full bg-foreground px-4 text-background hover:bg-foreground/90"
        >
          {isExporting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Download className="size-3.5" />
          )}
          <span className="text-sm font-medium">Export</span>
        </Button>
      </header>

      <div className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
        <aside className="order-2 flex w-full flex-col border-r border-border/40 bg-background/50 lg:order-1 lg:w-95 lg:shrink-0 lg:overflow-y-auto">
          <div className="flex-1 space-y-10 p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Link2 className="size-4 text-muted-foreground" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Target URL
                </h3>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Paste X/Twitter link..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    className="h-10 border-border/50 bg-secondary/50 text-sm focus-visible:ring-1"
                  />
                  <Button
                    variant="outline"
                    onClick={handlePaste}
                    className="h-10 shrink-0 border-border/50 bg-secondary/50 px-3 hover:bg-secondary"
                  >
                    Paste
                  </Button>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={!url || isLoading}
                  className="h-10 w-full gap-2 shadow-sm"
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
              </div>

              {error && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  {error}
                </div>
              )}
              {!tweet && !error && (
                <p className="mt-2 px-1 text-[13px] text-muted-foreground">
                  Showing demo preview. Paste a link to load real data.
                </p>
              )}
              {tweet && !error && (
                <p className="mt-2 px-1 text-[13px] text-emerald-500">
                  Tweet loaded successfully.
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-muted-foreground" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Background
                </h3>
              </div>
              <BackgroundPicker
                selected={selectedBackground}
                onSelect={setSelectedBackground}
              />
              <div className="rounded-2xl border border-border/40 bg-secondary/20 p-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundUpload}
                  className="hidden"
                />
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[14px] font-medium text-foreground">
                      Custom image background
                    </p>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      Upload a photo and blur it behind the tweet.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2 border-border/50 bg-background/60"
                  >
                    <Upload className="size-4" />
                    Upload
                  </Button>
                </div>

                {backgroundImage && (
                  <div className="mt-4 space-y-4">
                    <div className="overflow-hidden rounded-xl border border-border/50">
                      <img
                        src={backgroundImage}
                        alt="Uploaded background"
                        className="h-24 w-full object-cover"
                      />
                    </div>
                    <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[14px] font-medium text-foreground">
                      Remove @ tags
                    </span>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      Hide usernames at the start of replies.
                    </p>
                  </div>
                  <button
                    onClick={() => setRemoveTags(!removeTags)}
                    className="rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {removeTags ? (
                      <ToggleRight className="size-7 text-foreground" />
                    ) : (
                      <ToggleLeft className="size-7" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                        <span className="text-[14px] font-medium text-foreground">
                          Background blur
                        </span>
                        <button
                          onClick={() => setBackgroundImage(null)}
                          className="inline-flex items-center gap-1 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <X className="size-3.5" />
                          Remove image
                        </button>
                      </div>
                      <Slider
                        value={[backgroundBlur]}
                        min={0}
                        max={32}
                        step={1}
                        onValueChange={(vals) => setBackgroundBlur(vals[0])}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <ArrowRight className="size-4 text-muted-foreground" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Appearance
                </h3>
              </div>

              <div className="space-y-6 rounded-xl border border-border/40 bg-secondary/20 p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Maximize2 className="size-4 text-muted-foreground" />
                    <span className="text-[14px] font-medium text-foreground">
                      Magic layouts
                    </span>
                  </div>
                  <div className="grid gap-2">
                    {framePresets.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => setFramePreset(preset.id)}
                        className={cn(
                          "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all",
                          framePreset === preset.id
                            ? "border-foreground bg-foreground text-background"
                            : "border-border/50 bg-background/40 text-foreground hover:border-border hover:bg-background/60",
                        )}
                      >
                        <div>
                          <p className="text-[14px] font-medium">
                            {preset.label}
                          </p>
                          <p
                            className={cn(
                              "text-[12px]",
                              framePreset === preset.id
                                ? "text-background/70"
                                : "text-muted-foreground",
                            )}
                          >
                            {preset.helper}
                          </p>
                        </div>
                        <span className="text-xs opacity-70">
                          {preset.aspectRatio}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-border/40" />

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Contrast className="size-4 text-muted-foreground" />
                    <span className="text-[14px] font-medium text-foreground">
                      Tweet theme
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(["light", "dark"] as const).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setTweetTheme(theme)}
                        className={cn(
                          "rounded-xl border px-4 py-3 text-sm font-medium capitalize transition-all",
                          tweetTheme === theme
                            ? "border-foreground bg-foreground text-background"
                            : "border-border/50 bg-background/40 text-foreground hover:bg-background/60",
                        )}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Layers3 className="size-4 text-muted-foreground" />
                    <span className="text-[14px] font-medium text-foreground">
                      Shadow style
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {shadowPresets.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => setShadowStyle(preset.id)}
                        className={cn(
                          "rounded-lg border px-2 py-2 text-[12px] transition-colors",
                          shadowStyle === preset.id
                            ? "border-foreground/60 bg-background/60 text-foreground"
                            : "border-border/40 text-muted-foreground hover:bg-background/40",
                        )}
                      >
                        <p className="font-medium">{preset.label}</p>
                        <p className="mt-0.5">{preset.helper}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-medium text-foreground">
                      Shadow depth
                    </span>
                    <span className="rounded bg-secondary/50 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                      {shadowDepth}
                    </span>
                  </div>
                  <Slider
                    value={[shadowDepth]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(vals) => setShadowDepth(vals[0])}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-medium text-foreground">
                      Shadow angle
                    </span>
                    <span className="rounded bg-secondary/50 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                      {shadowAngle}&deg;
                    </span>
                  </div>
                  <Slider
                    value={[shadowAngle]}
                    min={0}
                    max={360}
                    step={1}
                    onValueChange={(vals) => setShadowAngle(vals[0])}
                  />
                </div>

                <div className="h-px bg-border/40" />

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[14px] font-medium text-foreground">
                      Frosted glass card
                    </span>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      Adds blur and a translucent edge to the tweet card.
                    </p>
                  </div>
                  <button
                    onClick={() => setGlassmorphism(!glassmorphism)}
                    className="rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {glassmorphism ? (
                      <ToggleRight className="size-7 text-foreground" />
                    ) : (
                      <ToggleLeft className="size-7" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[14px] font-medium text-foreground">
                      Include reply context
                    </span>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      Keeps the parent tweet attached when you want thread
                      context.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowReply(!showReply)}
                    className="rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {showReply ? (
                      <ToggleRight className="size-7 text-foreground" />
                    ) : (
                      <ToggleLeft className="size-7" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[14px] font-medium text-foreground">
                      Display media images
                    </span>
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      Hide attached images while keeping the tweet copy intact.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowMedia(!showMedia)}
                    className="rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {showMedia ? (
                      <ToggleRight className="size-7 text-foreground" />
                    ) : (
                      <ToggleLeft className="size-7" />
                    )}
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-medium text-foreground">
                      Padding
                    </span>
                    <span className="rounded bg-secondary/50 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                      {padding}px
                    </span>
                  </div>
                  <Slider
                    value={[padding]}
                    min={16}
                    max={activeFrame.maxPadding}
                    step={1}
                    onValueChange={(vals) => setPadding(vals[0])}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-medium text-foreground">
                      Scale
                    </span>
                    <span className="rounded bg-secondary/50 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                      {scale.toFixed(1)}x
                    </span>
                  </div>
                  <Slider
                    value={[scale]}
                    min={0.55}
                    max={1.45}
                    step={0.05}
                    onValueChange={(vals) => setScale(vals[0])}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-medium text-foreground">
                      Roundness
                    </span>
                    <span className="rounded bg-secondary/50 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                      {roundness}px
                    </span>
                  </div>
                  <Slider
                    value={[roundness]}
                    min={0}
                    max={40}
                    step={1}
                    onValueChange={(vals) => setRoundness(vals[0])}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border/40 bg-muted/10 p-6">
            <p className="text-[11px] text-muted-foreground">
              <span className="font-medium text-foreground">Pro tip:</span>{" "}
              Press{" "}
              <kbd className="rounded border border-border/50 bg-secondary/80 px-1.5 py-0.5 font-mono text-[10px]">
                ⌘S
              </kbd>{" "}
              to export the current frame instantly.
            </p>
          </div>
        </aside>

        <main className="relative order-1 flex min-h-[50vh] flex-1 flex-col bg-zinc-800/50 lg:order-2 lg:min-h-0 lg:min-w-0 lg:overflow-hidden">
          <div
            className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, black 1px, transparent 0)",
              backgroundSize: "16px 16px",
            }}
          />

          <div className="z-10 flex min-h-0 flex-1 items-center justify-center overflow-hidden p-4 sm:p-8 lg:p-12">
            <div 
              ref={containerRef}
              className="flex h-full w-full items-center justify-center overflow-hidden"
            >
              <div
                style={{
                  transform: `scale(${previewScale})`,
                  transformOrigin: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: `${activeFrame.previewMaxWidth}px`,
                  flexShrink: 0,
                }}
              >
                <div
                  ref={captureRef}
                  className={cn(
                    "relative flex w-full items-center justify-center overflow-hidden border border-white/10 shadow-[0_40px_120px_rgba(15,23,42,0.28)]",
                    isExporting ? "rounded-none" : "rounded-[32px]",
                  )}
                  style={{
                    aspectRatio: activeFrame.aspectRatio,
                  }}
                >
                  <div className={cn("absolute inset-0", selectedBg?.style)} />
                  {backgroundImage && (
                    <>
                      <div
                        className="absolute inset-[-3%] bg-center bg-cover opacity-90"
                        style={{
                          backgroundImage: `url(${backgroundImage})`,
                          filter: `blur(${backgroundBlur}px)`,
                          transform: "scale(1.08)",
                        }}
                      />
                      <div className="absolute inset-0 bg-black/20" />
                    </>
                  )}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_45%)]" />
                  <div
                    className="relative z-10 flex h-full w-full items-center justify-center"
                    style={{ padding: `${padding}px` }}
                  >
                    <div
                      style={{
                        transform: `scale(${scale})`,
                        transformOrigin: "center",
                        width: "100%",
                        maxWidth: `${activeFrame.cardMaxWidth}px`,
                      }}
                      className="flex justify-center"
                    >
                      <TweetCard
                        tweet={actualMainTweet}
                        reply={actualParentTweet || undefined}
                        showReply={showReply && !!actualParentTweet}
                        roundness={roundness}
                        showMedia={showMedia}
                        tweetTheme={tweetTheme}
                        glassmorphism={glassmorphism}
                        shadow={computedShadow}
                        maxWidth={activeFrame.cardMaxWidth}
                        removeTags={removeTags}
                      />
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
);
}
