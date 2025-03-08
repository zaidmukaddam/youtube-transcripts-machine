"use client";

import { useState } from "react";
import { toast } from "sonner";

interface Transcript {
  text: string;
  timestamp: string;
}

export default function TranscriptDisplay({
  transcripts,
  videoUrl,
}: {
  transcripts: Transcript[];
  videoUrl: string;
}) {
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!transcripts?.length) return null;

  // Extract video ID from URL
  const getVideoId = (url: string): string | null => {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=)|youtu\.be\/)([\w-]{11})(?:\S+)?$/;
    const match = url.match(regex);
    return match ? match[4] : null;
  };

  const videoId = getVideoId(videoUrl);

  // Convert timestamp (MM:SS) to seconds
  const timestampToSeconds = (timestamp: string): number => {
    const parts = timestamp.split(':');
    if (parts.length === 2) {
      // MM:SS format
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    } else if (parts.length === 3) {
      // HH:MM:SS format
      return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    }
    return 0;
  };

  // Generate YouTube URL with timestamp
  const getYouTubeUrlWithTimestamp = (timestamp: string): string => {
    const seconds = timestampToSeconds(timestamp);
    return `https://www.youtube.com/watch?v=${videoId}&t=${seconds}`;
  };

  // Format transcript for copying and downloading
  const formatTranscript = () => {
    return transcripts
      .map((transcript) => `${transcript.timestamp}: ${transcript.text}`)
      .join('\n\n');
  };

  // Copy transcript to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatTranscript());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      
      toast.success("Transcript copied to clipboard", {
        duration: 2000,
        icon: "📋",
      });
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast.error("Failed to copy transcript to clipboard", {
        duration: 3000,
      });
    }
  };

  // Download transcript as a text file
  const handleDownload = () => {
    try {
      setIsDownloading(true);
      const element = document.createElement("a");
      const file = new Blob([formatTranscript()], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      
      // Use video ID in the filename if available
      const filename = videoId 
        ? `youtube-transcript-${videoId}.txt` 
        : "youtube-transcript.txt";
      
      element.download = filename;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      toast.success(`Transcript downloaded as ${filename}`, {
        duration: 2000,
        icon: "💾",
      });
    } catch (err) {
      console.error("Failed to download: ", err);
      toast.error("Failed to download transcript", {
        duration: 3000,
      });
    } finally {
      setTimeout(() => setIsDownloading(false), 1000);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      <div className="bg-[#121212] rounded-xl overflow-hidden border border-zinc-800/50 shadow-lg">
        {/* Header with improved mobile responsiveness */}
        <div className="p-3 md:p-4 border-b border-zinc-800/50 flex flex-row items-center justify-between">
          <div className="flex items-center">
            <h3 className="text-sm md:text-base font-medium text-zinc-300">
              Video Transcript
            </h3>
            <span className="text-xs text-zinc-500 ml-2 px-2 py-0.5 bg-zinc-800/50 rounded-full">
              {transcripts.length} segments
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Copy button with improved accessibility */}
            <button
              onClick={handleCopy}
              className={`py-1.5 px-3 rounded-md transition-colors duration-200 text-xs font-medium flex items-center gap-1.5 hover:bg-zinc-800/70 focus:outline-none focus:ring-1 focus:ring-zinc-500 ${
                isCopied ? 'bg-green-900/20 text-green-400' : 'bg-zinc-800/30 text-zinc-300'
              }`}
              title="Copy to clipboard"
              disabled={isCopied}
              aria-label={isCopied ? "Copied to clipboard" : "Copy to clipboard"}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {isCopied ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                )}
              </svg>
              <span className="hidden sm:inline">{isCopied ? "Copied!" : "Copy"}</span>
            </button>
            
            {/* Download button with improved accessibility */}
            <button
              onClick={handleDownload}
              className={`py-1.5 px-3 rounded-md transition-colors duration-200 text-xs font-medium flex items-center gap-1.5 hover:bg-zinc-800/70 focus:outline-none focus:ring-1 focus:ring-zinc-500 ${
                isDownloading ? 'bg-green-900/20 text-green-400' : 'bg-zinc-800/30 text-zinc-300'
              }`}
              title={videoId ? `Download as text file (youtube-transcript-${videoId}.txt)` : "Download as text file"}
              disabled={isDownloading}
              aria-label={isDownloading ? "Downloaded" : "Download as text file"}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {isDownloading ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                )}
              </svg>
              <span className="hidden sm:inline">{isDownloading ? "Downloaded!" : "Download"}</span>
            </button>
          </div>
        </div>
        
        {/* Transcript content with improved scrolling and responsive design */}
        <div className="max-h-[400px] overflow-y-auto">
          {transcripts.map((transcript, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row py-3 px-4 hover:bg-zinc-800/20 transition-colors duration-200 border-b border-zinc-800/30 last:border-b-0"
            >
              <div className="flex-shrink-0 w-full sm:w-20 mb-1 sm:mb-0">
                {videoId ? (
                  <a 
                    href={getYouTubeUrlWithTimestamp(transcript.timestamp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-800/50 rounded text-zinc-400 hover:text-blue-400 font-mono text-xs transition-colors duration-200 group"
                    title={`Jump to ${transcript.timestamp} in the video`}
                  >
                    <span>{transcript.timestamp}</span>
                    <svg 
                      className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ) : (
                  <span className="inline-block px-2 py-0.5 bg-zinc-800/50 rounded text-zinc-500 font-mono text-xs">
                    {transcript.timestamp}
                  </span>
                )}
              </div>
              <p className="text-zinc-300 flex-grow text-sm leading-relaxed sm:pl-2">
                {transcript.text}
              </p>
            </div>
          ))}
        </div>
      </div>
      {videoId && (
        <div className="mt-2 text-xs text-zinc-500 px-1 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Click on any timestamp to jump to that point in the video</span>
        </div>
      )}
    </div>
  );
} 