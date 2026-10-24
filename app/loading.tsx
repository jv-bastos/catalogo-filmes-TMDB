export default function Loading() {
  return (
    <div
      aria-busy="true"
      aria-label="Carregando"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7"
    >
      {Array.from({ length: 14 }, (_, i) => (
        <div key={i} className="aspect-[2/3] animate-pulse rounded-lg bg-palco" />
      ))}
    </div>
  );
}
