import Link from "next/link";
import { Gamepad2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900/50 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-slate-300">
            <Gamepad2 className="h-6 w-6 text-primary" />
            <span className="font-semibold tracking-wide">TicTac Arena</span>
          </div>
          
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} TicTac Arena. All rights reserved.
          </p>
          
          <div className="flex gap-4 text-sm text-slate-500">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
