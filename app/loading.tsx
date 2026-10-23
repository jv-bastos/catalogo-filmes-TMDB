export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Carregando" className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="aspect-[2/3] animate-pulse rounded bg-neutral-200" />
      ))}
    </div>
  );
}
