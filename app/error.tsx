'use client';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-4 py-12 text-center">
      <h1 className="text-2xl font-bold">Algo deu errado</h1>
      {error.message && <p className="text-sm text-neutral-600">{error.message}</p>}
      <button
        type="button"
        onClick={() => reset()}
        className="rounded border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-100"
      >
        Tentar novamente
      </button>
    </div>
  );
}
