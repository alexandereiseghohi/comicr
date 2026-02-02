"use client";
import { Link, Upload } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ImageUploadFieldProps {
  label?: string;
  onChange: (url: string) => void;
  value: string;
}

export function ImageUploadField({ value, onChange, label = "Image" }: ImageUploadFieldProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "url">("url");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await response.json();
      if (data.url) {
        onChange(data.url);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Tabs onValueChange={(v) => setActiveTab(v as "upload" | "url")} value={activeTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url">
            <Link className="mr-2 h-4 w-4" />
            URL
          </TabsTrigger>
          <TabsTrigger value="upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </TabsTrigger>
        </TabsList>
        <TabsContent value="url">
          <Input onChange={(e) => onChange(e.target.value)} placeholder="https://example.com/image.jpg" value={value} />
        </TabsContent>
        <TabsContent value="upload">
          <Input
            accept="image/*"
            disabled={isUploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
            type="file"
          />
        </TabsContent>
      </Tabs>
      {value && (
        <Image
          alt="Preview"
          className="mt-2 h-20 w-20 rounded object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          src={value}
        />
      )}
    </div>
  );
}
