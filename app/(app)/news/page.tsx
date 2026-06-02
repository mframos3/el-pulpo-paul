import { fetchTimPayneNews, type NewsArticle } from "@/lib/google-news";

const RSS_URL =
  "https://news.google.com/rss/search?q=Tim+Payne&hl=en-US&gl=US&ceid=US:en";

function formatRelativeDate(pubDate: string): string {
  if (!pubDate) return "";
  const date = new Date(pubDate);
  if (Number.isNaN(date.getTime())) return pubDate;

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);

  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes} min`;
  if (hours < 24) return `Hace ${hours} h`;
  if (days < 7) return `Hace ${days} d`;

  return date.toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

export default async function NewsPage() {
  let articles: NewsArticle[] = [];
  let error: string | null = null;

  try {
    articles = await fetchTimPayneNews();
  } catch (e) {
    error = e instanceof Error ? e.message : "No se pudieron cargar las noticias";
  }

  const [featured, ...rest] = articles;

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-border/40 bg-brand/15 backdrop-blur px-3 py-1 text-xs font-medium tracking-widest uppercase text-brand-text">
          <span className="size-1.5 rounded-full bg-brand animate-pulse" />
          Tim Payne · Google News
        </span>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-text-strong leading-tight">
              Noticias
            </h1>
            <p className="text-sm text-muted mt-2 max-w-xl leading-relaxed">
              Cobertura reciente sobre Tim Payne, agregada desde Google News RSS.
            </p>
          </div>
          <a
            href={RSS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border-default/40 bg-surface-1/40 hover:bg-surface-2/60 backdrop-blur text-text-strong text-sm font-medium px-4 py-2 transition"
          >
            Ver feed RSS
            <span className="text-subtle">↗</span>
          </a>
        </div>
      </header>

      {error && (
        <div className="card p-6 border-danger/30 bg-danger-surface/30">
          <p className="text-sm text-danger-text">{error}</p>
          <p className="text-xs text-muted mt-2">Intenta recargar la página en unos minutos.</p>
        </div>
      )}

      {!error && articles.length === 0 && (
        <div className="card p-10 text-center">
          <p className="font-display text-xl text-text-strong mb-2">Sin artículos por ahora</p>
          <p className="text-sm text-muted">
            No hay noticias recientes para esta búsqueda. Vuelve más tarde.
          </p>
        </div>
      )}

      {featured && (
        <section>
          <div className="text-xs uppercase tracking-[0.2em] text-brand-text mb-3">Destacado</div>
          <FeaturedArticle article={featured} />
        </section>
      )}

      {rest.length > 0 && (
        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold text-text-strong">Más noticias</h2>
            <span className="text-xs text-subtle tabular">{rest.length} artículos</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map((article) => (
              <ArticleCard key={article.link} article={article} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function FeaturedArticle({ article }: { article: NewsArticle }) {
  return (
    <article className="card-elevated relative overflow-hidden p-8 sm:p-10 brand-glow group">
      <div className="absolute inset-0 pitch-grid opacity-[0.06] pointer-events-none" />
      <div className="relative space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <SourceBadge source={article.source} />
          {article.pubDate && (
            <time
              dateTime={new Date(article.pubDate).toISOString()}
              className="text-[10px] uppercase tracking-widest text-subtle"
            >
              {formatRelativeDate(article.pubDate)}
            </time>
          )}
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-text-strong leading-snug max-w-3xl">
          {article.title}
        </h2>
        {article.description && (
          <p className="text-base text-muted leading-relaxed max-w-2xl">
            {truncate(article.description, 280)}
          </p>
        )}
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-brand hover:bg-brand-hover text-on-brand font-semibold px-5 py-2.5 text-sm transition shadow-lg shadow-brand/20"
        >
          Leer artículo
          <span className="transition group-hover:translate-x-0.5">→</span>
        </a>
      </div>
    </article>
  );
}

function ArticleCard({ article }: { article: NewsArticle }) {
  return (
    <article className="card p-6 sm:p-7 group hover:border-brand-border/40 transition flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 mb-4">
        <SourceBadge source={article.source} />
        {article.pubDate && (
          <time
            dateTime={new Date(article.pubDate).toISOString()}
            className="text-[10px] uppercase tracking-widest text-subtle shrink-0"
          >
            {formatRelativeDate(article.pubDate)}
          </time>
        )}
      </div>
      <h3 className="font-display text-lg font-semibold text-text-strong mb-2 leading-snug line-clamp-3">
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-brand-text transition"
        >
          {article.title}
        </a>
      </h3>
      {article.description && (
        <p className="text-sm text-muted leading-relaxed line-clamp-3 flex-1">
          {article.description}
        </p>
      )}
      <div className="mt-4 pt-4 border-t border-border-subtle/30 flex items-center justify-between">
        <span className="text-xs text-subtle">Google News</span>
        <span className="text-warning-text opacity-0 group-hover:opacity-100 transition text-sm">
          →
        </span>
      </div>
    </article>
  );
}

function SourceBadge({ source }: { source: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-brand-border/30 bg-brand/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-brand-text">
      {source}
    </span>
  );
}
