export default function TowTrucksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 space-y-4 p-2">
      {children}
    </div>
  );
} 