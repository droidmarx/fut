export function Logo({ showText = true }: { showText?: boolean }) {
  return (
    <div className="flex items-center gap-2 font-headline text-xl font-bold text-primary">
      <span className="text-2xl">🌵</span>
      {showText && <span className="text-foreground">MANDACARU</span>}
    </div>
  );
}
