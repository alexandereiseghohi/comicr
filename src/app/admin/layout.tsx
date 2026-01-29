import React from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header>
        <h1>Admin (placeholder)</h1>
      </header>
      <main>{children}</main>
    </div>
  );
}
