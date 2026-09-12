export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0a0c] px-6 text-center">
      {/* Subtle atmospheric ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[450px] w-[650px] -translate-x-1/2 rounded-full bg-gradient-to-b from-indigo-600/15 via-violet-600/10 to-transparent blur-3xl"
      />

      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/60 px-3.5 py-1 text-xs font-medium tracking-wide text-neutral-300 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>System Online</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl">
          ASCEND
        </h1>

        {/* Tagline */}
        <p className="mt-4 text-lg font-normal tracking-wide text-neutral-400 sm:text-xl md:text-2xl">
          Turn your real life into an RPG.
        </p>

        {/* Status indicator / info box */}
        <div className="mt-10 rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-4 text-xs font-mono text-neutral-400 backdrop-blur-sm sm:text-sm">
          <p className="text-neutral-300">Phase 0: Skeleton Deployment</p>
          <p className="mt-1 text-neutral-500">Core progression & authentication coming soon</p>
        </div>
      </div>
    </main>
  );
}
