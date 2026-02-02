"use client";

export default function GlobalError({ error }: { error: Error }) {
  // You can add logging here
   
  console.error(error);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center">
          <div className="rounded-md border bg-white p-6">
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="text-muted-foreground mt-2 text-sm">An unexpected error occurred.</p>
          </div>
        </div>
      </body>
    </html>
  );
}
