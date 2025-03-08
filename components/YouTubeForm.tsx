"use client";

import { useState, useRef } from "react";

export default function YouTubeForm({ onSubmit }: { onSubmit: (url: string) => Promise<void> }) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // YouTube URL regex pattern - matches standard youtube.com URLs and youtu.be short URLs
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=)|youtu\.be\/)([\w-]{11})(?:\S+)?$/;

  // Validate URL directly without useEffect
  const validateUrl = (inputUrl: string): boolean => {
    if (!inputUrl) {
      setValidationError(null);
      return false;
    }
    
    const isValid = youtubeRegex.test(inputUrl);
    setValidationError(isValid ? null : "Please enter a valid YouTube URL");
    return isValid;
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    validateUrl(newUrl);
  };

  const handleClearUrl = () => {
    setUrl("");
    setValidationError(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handlePasteUrl = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setUrl(clipboardText);
      validateUrl(clipboardText);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (err) {
      console.error("Failed to read clipboard: ", err);
      alert("Unable to access clipboard. Please paste the URL manually.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate again before submission
    if (!url) {
      setValidationError("Please enter a YouTube URL");
      return;
    }
    
    if (!validateUrl(url)) {
      return; // Error is already set by validateUrl
    }
    
    setIsLoading(true);
    
    try {
      await onSubmit(url);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if URL is valid
  const isValid = url.length > 0 && youtubeRegex.test(url);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-[#121212] rounded-xl overflow-hidden border border-zinc-800/50">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row">
            <div className="flex-grow relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className={`w-4 h-4 ${isValid ? 'text-green-500' : 'text-zinc-500'}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" fill="currentColor"/>
                </svg>
              </div>
              <input
                ref={inputRef}
                type="url"
                value={url}
                onChange={handleUrlChange}
                placeholder="Paste your YouTube video URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)"
                className={`w-full py-2.5 pl-9 pr-10 bg-transparent focus:outline-none text-zinc-100 placeholder-zinc-500 text-sm border-b ${
                  validationError ? 'border-red-500/50' : isValid ? 'border-green-500/50' : 'border-transparent'
                }`}
                required
                disabled={isLoading}
              />
              {url && (
                <button
                  type="button"
                  onClick={handleClearUrl}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 focus:outline-none"
                  aria-label="Clear URL"
                  title="Clear URL"
                  disabled={isLoading}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="flex border-t sm:border-t-0 sm:border-l border-zinc-800/50">
              <button
                type="button"
                onClick={handlePasteUrl}
                className="text-zinc-400 py-2.5 px-3 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap hover:bg-zinc-800/30 focus:outline-none focus:bg-zinc-800/50 border-r border-zinc-800/50"
                disabled={isLoading}
                title="Paste from clipboard"
                aria-label="Paste from clipboard"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </button>
              <button
                type="submit"
                disabled={isLoading || !isValid}
                className="text-white py-2.5 px-4 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap hover:bg-zinc-800/30 focus:outline-none focus:bg-zinc-800/50 flex-grow"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2 justify-center">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing</span>
                  </div>
                ) : (
                  "Extract"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {/* Help text */}
      <div className="mt-2 text-xs text-zinc-500 px-1 text-center">
        Supported format: youtube.com/watch?v=ID
      </div>
      
      {/* Validation error message */}
      {validationError && (
        <div className="mt-2 text-xs text-red-400 px-1">
          {validationError}
        </div>
      )}
    </div>
  );
} 