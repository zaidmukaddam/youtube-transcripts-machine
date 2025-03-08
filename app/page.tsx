"use client";

import { runStagehand } from "@/app/api/stagehand/run";
import YouTubeForm from "@/components/YouTubeForm";
import TranscriptDisplay from "@/components/TranscriptDisplay";
import DebuggerIframe from "@/components/stagehand/debuggerIframe";
import { Suspense, useState, useEffect } from "react";
import { startBBSSession, generateSummary } from "@/app/actions";
import { XLogo, GithubLogo } from "@phosphor-icons/react";
import { Toaster, toast } from "sonner";

interface Transcript {
  text: string;
  timestamp: string;
}

export default function Home() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [debugUrl, setDebugUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isSummaryCopied, setIsSummaryCopied] = useState(false);

  // Get the launch post URL from environment variable
  const launchPostUrl = process.env.NEXT_PUBLIC_LAUNCH_POST_URL || "https://twitter.com";
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/yourusername/yt-operator";
  const xAccountUrl = process.env.NEXT_PUBLIC_X_ACCOUNT_URL || "https://twitter.com/yourusername";

  // Dismiss all toasts when component unmounts
  useEffect(() => {
    return () => {
      dismissAllToasts();
    };
  }, []);

  // Helper function to dismiss all toasts
  const dismissAllToasts = () => {
    toast.dismiss("initialization");
    toast.dismiss("extraction");
    toast.dismiss("summary");
    toast.dismiss(); // Dismiss all toasts without IDs
  };

  // Reset all state
  const resetState = () => {
    // Dismiss any pending toasts
    dismissAllToasts();
    
    setTranscripts([]);
    setError(null);
    setDebugUrl(undefined);
    setSummary(null);
    setSummaryError(null);
    
    toast("Results have been reset", {
      duration: 2000,
      icon: "🔄",
    });
  };

  const handleSubmit = async (url: string) => {
    try {
      // If submitting a new URL or resubmitting the same URL, reset everything
      if (url !== currentUrl || transcripts.length > 0) {
        resetState();
      } else {
        // Just dismiss any pending toasts without resetting state
        dismissAllToasts();
      }
      
      setCurrentUrl(url);
      setError(null);
      setIsLoading(true);
      
      toast.loading("Initializing extraction process...", {
        id: "initialization",
      });
      
      // Get session ID using server action
      const { sessionId, debugUrl } = await startBBSSession();
      
      setDebugUrl(debugUrl);
      
      // Dismiss the initialization toast and show extraction toast
      toast.dismiss("initialization");
      toast.loading("Extracting transcript from YouTube...", {
        id: "extraction",
      });
      
      // Then run the extraction
      const result = await runStagehand(url, sessionId);
      setTranscripts(result.transcripts);
      
      toast.success(`Successfully extracted ${result.transcripts.length} transcript segments`, {
        id: "extraction",
        duration: 3000,
      });
    } catch (error) {
      // Dismiss any pending toasts
      dismissAllToasts();
      
      setError((error as Error).message);
      toast.error(`Failed to extract transcript: ${(error as Error).message}`, {
        id: "extraction",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!transcripts.length) return;
    
    try {
      setIsSummaryLoading(true);
      setSummaryError(null);
      
      // Dismiss any existing toasts before starting
      dismissAllToasts();
      
      toast.loading("Generating AI summary...", {
        id: "summary",
      });
      
      const summaryText = await generateSummary(transcripts);
      setSummary(summaryText);
      
      toast.success("Summary generated successfully", {
        id: "summary",
        duration: 3000,
      });
    } catch (error) {
      setSummaryError((error as Error).message || "Failed to generate summary");
      console.error("Summary generation error:", error);
      
      toast.error(`Failed to generate summary: ${(error as Error).message || "Unknown error"}`, {
        id: "summary",
        duration: 4000,
      });
    } finally {
      setIsSummaryLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
      <Toaster 
        theme="dark" 
        position="top-center"
        toastOptions={{
          style: {
            background: "#121212",
            border: "1px solid rgba(63, 63, 70, 0.5)",
            color: "#e4e4e7"
          }
        }}
      />
      {/* Main content area with flex-grow to push footer down */}
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 md:py-12 space-y-8 md:space-y-12">
          {/* Hero Section - Modern and clean design */}
          <div className="text-center space-y-4 md:space-y-5 mb-6 md:mb-10">
            <div className="inline-block mb-2">
              <a 
                href={launchPostUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-800/60 border border-zinc-700/50 text-xs font-medium text-zinc-300 hover:bg-zinc-700/60 transition-colors"
              >
                <XLogo className="h-3.5 w-3.5 mr-1.5 text-zinc-400"  />
                Launch Post
              </a>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              YouTube Transcripts Machine
            </h1>
            <p className="text-sm md:text-base text-zinc-400 max-w-2xl mx-auto px-2">
              Extract timestamps and transcripts from any YouTube video with AI doing the heavy lifting
            </p>
          </div>

          {/* Form Section - Moved to top */}
          <div className="pt-0">
            {/* <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-center text-zinc-200">Extract Transcript Now</h2> */}
            <YouTubeForm onSubmit={handleSubmit} />
            
            {/* Current URL display */}
            {currentUrl && transcripts.length > 0 && !isLoading && (
              <div className="mt-2 text-center">
                <button 
                  onClick={resetState}
                  className="text-xs text-zinc-400 hover:text-zinc-300 underline"
                >
                  Reset results
                </button>
              </div>
            )}
          </div>

          {/* Debug Iframe - Only shown during loading */}
          {debugUrl && isLoading && (
            <div className="w-full max-w-2xl mx-auto">
              <div className="bg-[#121212] rounded-xl overflow-hidden border border-zinc-800/50">
                <div className="p-2.5 border-b border-zinc-800/50">
                  <h3 className="text-xs font-medium text-zinc-300 pl-2">
                    Processing Video
                  </h3>
                </div>
                <div className="aspect-video w-full">
                  <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-zinc-300 text-sm">Loading...</div>}>
                    <DebuggerIframe debugUrl={debugUrl} env="BROWSERBASE" />
                  </Suspense>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4">
              <div className="bg-[#121212] rounded-xl overflow-hidden border border-red-500/20 p-2.5 text-red-400 text-xs">
                {error}
              </div>
            </div>
          )}

          {/* Transcript Display */}
          {transcripts.length > 0 && currentUrl && (
            <div className="mt-6">
              <TranscriptDisplay transcripts={transcripts} videoUrl={currentUrl} />
              
              {/* Summary Section */}
              <div className="w-full max-w-2xl mx-auto mt-6">
                <div className="bg-[#121212] rounded-xl overflow-hidden border border-zinc-800/50 shadow-lg">
                  <div className="p-3 md:p-4 border-b border-zinc-800/50 flex flex-row items-center justify-between">
                    <div className="flex items-center">
                      <h3 className="text-sm md:text-base font-medium text-zinc-300">
                        AI Summary
                      </h3>
                    </div>
                    {!summary && !isSummaryLoading && (
                      <button
                        onClick={handleGenerateSummary}
                        className="py-1.5 px-3 rounded-md transition-colors duration-200 text-xs font-medium flex items-center gap-1.5 bg-zinc-800/30 text-zinc-300 hover:bg-zinc-800/70 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                        disabled={isSummaryLoading}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Generate Summary</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="p-4">
                    {isSummaryLoading ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="relative w-16 h-16">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center animate-pulse opacity-30">
                            <svg className="h-12 w-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          </div>
                        </div>
                        <p className="text-zinc-400 text-sm mt-4">Generating AI summary...</p>
                        <p className="text-zinc-500 text-xs mt-2">This may take a few moments</p>
                      </div>
                    ) : summaryError ? (
                      <div className="py-4 px-3 bg-red-900/20 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        <p>Error generating summary: {summaryError}</p>
                        <button
                          onClick={handleGenerateSummary}
                          className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
                        >
                          Try again
                        </button>
                      </div>
                    ) : summary ? (
                      <div className="prose prose-sm prose-invert max-w-none">
                        <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {summary}
                        </div>
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(summary);
                                toast.success("Summary copied to clipboard", {
                                  duration: 2000,
                                  icon: "📋",
                                });
                                setIsSummaryCopied(true);
                                setTimeout(() => setIsSummaryCopied(false), 2000);
                              } catch (err) {
                                console.error("Failed to copy summary:", err);
                                toast.error("Failed to copy to clipboard", {
                                  duration: 3000,
                                });
                              }
                            }}
                            className={`py-1.5 px-3 rounded-md transition-colors duration-200 text-xs font-medium flex items-center gap-1.5 ${
                              isSummaryCopied ? 'bg-green-900/20 text-green-400' : 'bg-zinc-800/30 text-zinc-300 hover:bg-zinc-800/70'
                            } focus:outline-none focus:ring-1 focus:ring-zinc-500`}
                            disabled={isSummaryCopied}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              {isSummaryCopied ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              )}
                            </svg>
                            <span>{isSummaryCopied ? "Copied!" : "Copy Summary"}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mb-3">
                          <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <h4 className="text-zinc-300 font-medium mb-1">Generate AI Summary</h4>
                        <p className="text-zinc-500 text-xs max-w-sm">
                          Use AI to create a concise summary of this video&apos;s content based on the transcript
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isLoading && transcripts.length === 0 && (
            <div className="max-w-4xl mx-auto pt-4 md:pt-8">
              <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-center text-zinc-200">How It Works</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-[#121212] rounded-xl p-4 md:p-6 border border-zinc-800/50 flex flex-col items-center text-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-3 md:mb-4">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <h3 className="text-base md:text-lg font-medium text-zinc-200 mb-1 md:mb-2">1. Paste URL</h3>
                  <p className="text-xs md:text-sm text-zinc-400">Enter any YouTube video URL in the input field</p>
                </div>
                <div className="bg-[#121212] rounded-xl p-4 md:p-6 border border-zinc-800/50 flex flex-col items-center text-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500/10 rounded-full flex items-center justify-center mb-3 md:mb-4">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <h3 className="text-base md:text-lg font-medium text-zinc-200 mb-1 md:mb-2">2. AI Processing</h3>
                  <p className="text-xs md:text-sm text-zinc-400">Our AI automatically extracts the transcript</p>
                </div>
                <div className="bg-[#121212] rounded-xl p-4 md:p-6 border border-zinc-800/50 flex flex-col items-center text-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-3 md:mb-4">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-base md:text-lg font-medium text-zinc-200 mb-1 md:mb-2">3. Get Results</h3>
                  <p className="text-xs md:text-sm text-zinc-400">View and use the timestamped transcript</p>
                </div>
              </div>
            </div>
          )}

          {!isLoading && transcripts.length === 0 && (
            <div className="max-w-4xl mx-auto pt-4 md:pt-8">
              <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-center text-zinc-200">Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-[#121212] rounded-xl p-4 md:p-6 border border-zinc-800/50">
                  <div className="flex items-start">
                    <div className="mr-3 md:mr-4 mt-1">
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-medium text-zinc-200 mb-1 md:mb-2">Accurate Timestamps</h3>
                      <p className="text-xs md:text-sm text-zinc-400">Get precise timestamps for each segment of the video transcript</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#121212] rounded-xl p-4 md:p-6 border border-zinc-800/50">
                  <div className="flex items-start">
                    <div className="mr-3 md:mr-4 mt-1">
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-medium text-zinc-200 mb-1 md:mb-2">AI-Powered Extraction</h3>
                      <p className="text-xs md:text-sm text-zinc-400">Our AI handles the complex task of navigating YouTube and extracting transcript data</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#121212] rounded-xl p-4 md:p-6 border border-zinc-800/50">
                  <div className="flex items-start">
                    <div className="mr-3 md:mr-4 mt-1">
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-medium text-zinc-200 mb-1 md:mb-2">Faster Than Human Processing</h3>
                      <p className="text-xs md:text-sm text-zinc-400">Get results faster than manual human review without having to search through videos yourself</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#121212] rounded-xl p-4 md:p-6 border border-zinc-800/50">
                  <div className="flex items-start">
                    <div className="mr-3 md:mr-4 mt-1">
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-medium text-zinc-200 mb-1 md:mb-2">Any YouTube Video</h3>
                      <p className="text-xs md:text-sm text-zinc-400">Works with any public YouTube video that has transcripts available</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer - Now in its own section outside the main content */}
      <footer className="w-full py-6 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center space-x-4">
              <a 
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-zinc-300 transition-colors"
                aria-label="GitHub Repository"
              >
                <GithubLogo className="w-5 h-5" />
              </a>
              <a 
                href={xAccountUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-zinc-300 transition-colors"
                aria-label="X (Twitter) Account"
              >
                <XLogo className="w-5 h-5" />
              </a>
            </div>
            <p className="text-center text-zinc-500 text-xs">
              © {new Date().getFullYear()} YTM (YouTube Transcripts Machine). <span className="mx-1">•</span> 
              <a 
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-zinc-300 transition-colors"
              >
                Open Source
              </a> <span className="mx-1">•</span> Powered by <a 
                href={"https://stagehand.dev"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-zinc-300 transition-colors"
              >
                Stagehand
              </a> <span className="mx-1">•</span> <a 
                href={"https://browserbase.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-zinc-300 transition-colors"
              >
                BrowserBase
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
