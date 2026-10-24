import Link from 'next/link';

export default function MovieNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <h1 className="title-display text-4xl sm:text-5xl">Filme não encontrado</h1>
      <p className="text-suave">Este filme não está no TMDB ou o link está incompleto.</p>
      <Link href="/" className="btn-primary mt-2">
        Voltar ao catálogo
      </Link>
    </div>
  );
}
