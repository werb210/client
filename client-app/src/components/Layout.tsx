import { useState } from "react";
import { Link } from "react-router-dom";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-bg text-white flex flex-col">
      <header className="border-b border-subtle">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-semibold tracking-tight">
            Boreal Financial
          </Link>

          <nav className="hidden md:flex gap-8 text-sm text-white/80">
            <Link to="/apply">Apply</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/contact">Contact</Link>
          </nav>

          <button
            className="md:hidden text-2xl"
            onClick={() => setOpen(!open)}
          >
            ☰
          </button>
        </div>

        {open && (
          <div className="md:hidden px-6 pb-4 space-y-3">
            <Link to="/apply" className="block">Apply</Link>
            <Link to="/faq" className="block">FAQ</Link>
            <Link to="/contact" className="block">Contact</Link>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-14 md:py-20">
        {children}
      </main>

      <footer className="border-t border-subtle text-sm text-white/60 py-6 text-center">
        © {new Date().getFullYear()} Boreal Financial
      </footer>
    </div>
  );
}
