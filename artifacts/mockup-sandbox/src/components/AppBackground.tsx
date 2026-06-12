export function AppBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#FBFBFD]" />
      <div className="absolute inset-0 bg-gradient-to-b from-white to-[#F5F5F7]" />
      <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.04),transparent_70%)]" />
    </div>
  );
}
