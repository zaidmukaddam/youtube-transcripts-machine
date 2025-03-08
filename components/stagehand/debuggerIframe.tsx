"use client";

export default function DebuggerIframe({
  debugUrl,
  env,
}: {
  debugUrl?: string;
  env: "BROWSERBASE" | "LOCAL";
}) {
  if (!debugUrl && env === "LOCAL") {
    return (
      <div className="w-full aspect-video bg-[#121212] rounded-xl flex items-center justify-center overflow-hidden text-wrap border border-zinc-800/50">
        <span className="text-zinc-300 p-8 max-w-full whitespace-normal break-words">
          Running in local mode.
          <br />
          Set{" "}
          <code className="bg-black/[.1] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
            env: &quot;BROWSERBASE&quot;
          </code>
          in{" "}
          <code className="bg-black/[.1] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
            stagehand.config.ts
          </code>{" "}
          to see a live embedded browser.
        </span>
      </div>
    );
  }

  if (!debugUrl) {
    return (
      <div className="w-full aspect-video bg-[#121212] rounded-xl flex items-center justify-center overflow-hidden text-wrap border border-zinc-800/50">
        <span className="text-zinc-300 p-8 max-w-full whitespace-normal break-words">
          Loading...
        </span>
      </div>
    );
  }

  return <iframe src={debugUrl} className="h-full w-full aspect-video rounded-xl border border-zinc-800/50" />;
}
