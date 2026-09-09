export default function DashboardLoading() {
  return (
    <main
      className="page-container py-10 sm:py-12"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="bg-muted h-10 w-56 animate-pulse rounded-xl" />
        <div className="bg-muted h-12 w-full animate-pulse rounded-2xl" />
        <div className="bg-muted h-56 w-full animate-pulse rounded-3xl" />
        <span className="sr-only">Loading dashboard</span>
      </div>
    </main>
  );
}
