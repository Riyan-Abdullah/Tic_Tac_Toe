import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Gamepad2 } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center px-4 text-center">
      <Gamepad2 className="h-24 w-24 text-slate-700 mb-8 animate-pulse" />
      <h1 className="text-6xl font-extrabold tracking-tight mb-4 text-slate-100">404</h1>
      <h2 className="text-3xl font-semibold mb-6 text-slate-300">Game Over - Page Not Found</h2>
      <p className="text-slate-500 max-w-md mb-10 text-lg">
        It looks like you've wandered out of bounds. The page you are looking for doesn't exist or has been moved to a different arena.
      </p>
      <Link href="/">
        <Button size="lg" variant="gaming">
          Return to Base
        </Button>
      </Link>
    </div>
  );
}
