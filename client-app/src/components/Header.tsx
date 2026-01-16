export function Header() {
  return (
    <header className="bg-borealBlue text-white px-6 h-16 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center text-sm font-semibold">
          BF
        </div>
        <div className="leading-tight">
          <div className="text-sm uppercase tracking-[0.2em] text-white/70">
            Boreal
          </div>
          <div className="text-lg font-semibold">Financial</div>
        </div>
      </div>
    </header>
  );
}
