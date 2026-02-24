import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="bg-brand-bg border-b border-subtle">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold tracking-tight">Boreal Financial</h2>

        <nav className="space-x-6 text-sm text-white/80">
          <Link to="/" className="hover:text-white">Home</Link>
          <Link to="/apply" className="hover:text-white">Apply</Link>
          <Link to="/faq" className="hover:text-white">FAQ</Link>
          <Link to="/contact" className="hover:text-white">Contact</Link>
        </nav>
      </div>
    </header>
  );
}
