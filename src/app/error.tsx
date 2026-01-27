"use client";

export default function GlobalError({ error }: { error: Error }) {
  // You can add logging here
   
  console.error(error);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center">
          <div className="p-6 bg-white border rounded-md">
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="mt-2 text-sm text-muted-foreground">An unexpected error occurred.</p>
          </div>
        </div>
      </body>
    </html>
  );
}
