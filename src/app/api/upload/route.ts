import { type NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { createAuditContext, logAudit } from "@/lib/audit";
import { getStorageProvider, validateFile } from "@/lib/storage";
import { UploadRequestSchema, validateUploadFile } from "@/schemas/upload.schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/upload
 * Upload a file to storage
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    // Parse optional parameters
    const rawParams = {
      folder: formData.get("folder")?.toString(),
      filename: formData.get("filename")?.toString(),
      access: formData.get("access")?.toString() as "private" | "public" | undefined,
      metadata: formData.get("metadata") ? JSON.parse(formData.get("metadata")!.toString()) : undefined,
    };

    // Validate parameters
    const paramsResult = UploadRequestSchema.safeParse(rawParams);
    if (!paramsResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid parameters",
          details: paramsResult.error.issues,
        },
        { status: 400 }
      );
    }

    const params = paramsResult.data;

    // Validate file
    const fileValidation = validateUploadFile({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!fileValidation.valid) {
      return NextResponse.json({ success: false, error: fileValidation.error }, { status: 400 });
    }

    // Additional validation using storage types
    const sizeValidation = validateFile(file.size, file.type);
    if (!sizeValidation.valid) {
      return NextResponse.json({ success: false, error: sizeValidation.error }, { status: 400 });
    }

    // Get storage provider and upload
    const storage = getStorageProvider();
    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await storage.upload(buffer, file.name, {
      folder: params.folder || `uploads/${session.user.id}`,
      filename: params.filename,
      access: params.access,
      contentType: file.type,
      metadata: {
        ...params.metadata,
        uploadedBy: session.user.id,
        originalName: file.name,
      },
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error, code: result.code }, { status: 500 });
    }

    // Log audit
    await logAudit({
      userId: session.user.id,
      action: "upload",
      resource: "system",
      resourceId: result.key,
      details: {
        filename: file.name,
        size: file.size,
        contentType: file.type,
        provider: storage.name,
        folder: params.folder,
      },
      ...createAuditContext(request),
    });

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
      size: result.size,
      contentType: result.contentType,
    });
  } catch (error) {
    console.error("[Upload API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/upload?key=<fileKey>
 * Delete a file from storage
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ success: false, error: "File key is required" }, { status: 400 });
    }

    // Only allow users to delete their own files (unless admin)
    const isOwnFile = key.includes(`uploads/${session.user.id}`);
    // Type-safe role access (extended session type)
    const userRole = (session.user as { role?: string }).role;
    const isAdmin = userRole === "admin";

    if (!isOwnFile && !isAdmin) {
      return NextResponse.json({ success: false, error: "Unauthorized to delete this file" }, { status: 403 });
    }

    const storage = getStorageProvider();
    const result = await storage.delete(key);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    // Log audit
    await logAudit({
      userId: session.user.id,
      action: "delete",
      resource: "system",
      resourceId: key,
      details: {
        provider: storage.name,
      },
      ...createAuditContext(request),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Upload API] Delete error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Delete failed",
      },
      { status: 500 }
    );
  }
}
