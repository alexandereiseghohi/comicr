export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-6 bg-white border rounded-md text-center">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We could not find the page you are looking for.
        </p>
      </div>
    </div>
  );
}
