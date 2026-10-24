'use client';

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-4 py-20 text-center">
      <h1 className="title-display text-4xl sm:text-5xl">Algo deu errado</h1>
      {error.message && <p className="max-w-md text-sm text-suave">{error.message}</p>}
      <button type="button" onClick={() => retry()} className="btn-primary mt-2">
        Tentar novamente
      </button>
    </div>
  );
}
