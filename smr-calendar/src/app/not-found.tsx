// src/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-sm text-muted-foreground mt-2">
          The page you’re looking for doesn’t exist.
        </p>

        <Link
          href="/home"
          className="inline-flex mt-5 rounded-xl border border-white/10 bg-white/10 px-4 py-2 hover:bg-white/15"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}
