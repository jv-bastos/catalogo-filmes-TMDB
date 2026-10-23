import Link from 'next/link';

export default function MovieNotFound() {
  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-2xl font-bold">Filme não encontrado</h1>
      <Link href="/" className="underline">
        Voltar ao catálogo
      </Link>
    </div>
  );
}
