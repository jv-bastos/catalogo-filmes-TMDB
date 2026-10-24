import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <h1 className="title-display text-4xl sm:text-5xl">Página não encontrada</h1>
      <p className="text-suave">O endereço pode ter mudado ou não existe.</p>
      <Link href="/" className="btn-primary mt-2">
        Voltar ao catálogo
      </Link>
    </div>
  );
}
