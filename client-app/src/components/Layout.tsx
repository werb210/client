import { useState } from "react";
import { Link } from "react-router-dom";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-bg text-white flex flex-col">

      <header className="bg-brand-bg border-b border-subtle">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <Link
            to="/"
            className="text-xl font-semibold tracking-tight hover:opacity-90"
          >
            Boreal Financial
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/80">
            <Link to="/apply" className="hover:text-white">Apply</Link>
            <Link to="/faq" className="hover:text-white">FAQ</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
          </nav>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white"
            onClick={() => setOpen(!open)}
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden bg-brand-bgAlt border-t border-subtle px-6 py-4 space-y-4">
            <Link to="/apply" className="block text-white/80 hover:text-white">Apply</Link>
            <Link to="/faq" className="block text-white/80 hover:text-white">FAQ</Link>
            <Link to="/contact" className="block text-white/80 hover:text-white">Contact</Link>
          </div>
        )}
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-14 md:py-20">
          {children}
        </div>
      </main>

      <footer className="bg-brand-bgAlt border-t border-subtle py-8 text-center text-sm text-white/60">
        © {new Date().getFullYear()} Boreal Financial
      </footer>

    </div>
  );
}
