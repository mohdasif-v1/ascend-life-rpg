import Link from "next/link";

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

        {/* Auth CTA navigation */}
        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-lg border border-neutral-700 bg-neutral-800/80 px-5 py-2.5 text-sm font-semibold text-neutral-200 transition hover:border-neutral-600 hover:bg-neutral-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-neutral-500"
          >
            Create Account
          </Link>
        </div>

        {/* Status indicator / info box */}
        <div className="mt-12 rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-4 text-xs font-mono text-neutral-400 backdrop-blur-sm sm:text-sm">
          <p className="text-neutral-300">Phase 1: Authentication & Database</p>
          <p className="mt-1 text-neutral-500">Core progression & attributes coming next</p>
        </div>
      </div>
    </main>
  );
}
