export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded-md border bg-white p-6 text-center">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground mt-2 text-sm">We could not find the page you are looking for.</p>
      </div>
    </div>
  );
}
