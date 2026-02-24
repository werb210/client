import { ReactNode } from "react";
import { Link } from "react-router-dom";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-bg text-white flex flex-col">
      <header className="bg-brand-bg border-b border-subtle">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold tracking-tight hover:opacity-90">
            Boreal Financial
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-white/80">
            <Link to="/apply" className="hover:text-white">
              Apply
            </Link>
            <Link to="/faq" className="hover:text-white">
              FAQ
            </Link>
            <Link to="/contact" className="hover:text-white">
              Contact
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-14 md:py-20">{children}</div>
      </main>

      <footer className="bg-brand-bgAlt border-t border-subtle py-8 text-center text-sm text-white/60">
        © {new Date().getFullYear()} Boreal Financial
      </footer>
    </div>
  );
}
