import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { TypeForm } from "@/components/admin/type-form";
import { db } from "@/database/db";
import { type as typeTable } from "@/database/schema";

export const metadata = {
  title: "Edit Type - Admin",
  description: "Edit comic type details",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTypePage({ params }: PageProps) {
  const { id } = await params;
  const typeId = Number(id);

  if (isNaN(typeId)) {
    notFound();
  }

  const [typeData] = await db.select().from(typeTable).where(eq(typeTable.id, typeId)).limit(1);

  if (!typeData) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Type</h1>
        <p className="text-muted-foreground">Update type: {typeData.name}</p>
      </div>
      <TypeForm comicType={typeData} />
    </div>
  );
}
