type OpenApiOperation = {
  summary?: string;
  description?: string;
  tags?: readonly string[];
  requestBody?: unknown;
  parameters?: readonly unknown[];
  responses?: Record<string, { description?: string }>;
};

type OpenApiSpec = {
  info: {
    title: string;
    version: string;
    description?: string;
  };
  paths: Readonly<Record<string, Readonly<Record<string, OpenApiOperation>>>>;
};

const methodStyles: Record<string, string> = {
  get: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-200',
  post: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200',
  put: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-200',
  patch: 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-200',
  delete: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-200',
};

function responseText(operation: OpenApiOperation) {
  const responses = Object.entries(operation.responses ?? {});
  if (responses.length === 0) return 'No responses documented';
  return responses.map(([status, response]) => `${status} ${response.description ?? ''}`.trim()).join(' · ');
}

export function ApiReference({ spec }: { spec: OpenApiSpec }) {
  const paths = Object.entries(spec.paths).flatMap(([path, operations]) =>
    Object.entries(operations).map(([method, operation]) => ({
      path,
      method,
      operation,
      tag: operation.tags?.[0] ?? 'General',
    }))
  );

  const grouped = paths.reduce<Record<string, typeof paths>>((groups, item) => {
    groups[item.tag] ??= [];
    groups[item.tag].push(item);
    return groups;
  }, {});

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="border-b border-secondary/10 pb-6 dark:border-white/10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">OpenAPI {spec.info.version}</p>
        <h1 className="mt-2 text-3xl font-bold text-secondary dark:text-white">{spec.info.title}</h1>
        {spec.info.description ? (
          <p className="mt-3 max-w-3xl text-sm leading-6 text-secondary/62 dark:text-white/62">
            {spec.info.description}
          </p>
        ) : null}
      </header>

      <div className="mt-8 grid gap-8">
        {Object.entries(grouped).map(([tag, operations]) => (
          <section key={tag} className="grid gap-3">
            <h2 className="text-xl font-semibold text-secondary dark:text-white">{tag}</h2>
            <div className="grid gap-3">
              {operations.map(({ path, method, operation }) => (
                <article
                  key={`${method}-${path}`}
                  className="rounded-lg border border-secondary/10 bg-background/78 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-md border px-2.5 py-1 text-xs font-bold uppercase ${
                        methodStyles[method] ?? 'border-secondary/20 bg-secondary/5 text-secondary dark:text-white'
                      }`}
                    >
                      {method}
                    </span>
                    <code className="break-all text-sm font-semibold text-secondary dark:text-white">{path}</code>
                  </div>
                  {operation.summary ? (
                    <p className="mt-3 text-sm font-medium text-secondary/82 dark:text-white/82">{operation.summary}</p>
                  ) : null}
                  {operation.description ? (
                    <p className="mt-2 text-sm leading-6 text-secondary/60 dark:text-white/60">{operation.description}</p>
                  ) : null}
                  <p className="mt-3 text-xs text-secondary/48 dark:text-white/48">{responseText(operation)}</p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
