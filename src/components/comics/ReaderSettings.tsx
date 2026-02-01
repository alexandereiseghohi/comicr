"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import {
  getReaderSettingsAction,
  updateReaderSettingsAction,
} from "@/lib/actions/reading-progress.actions";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ReaderSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSettingsChange?: (settings: {
    backgroundMode: "white" | "dark" | "sepia";
    readingMode: "vertical" | "horizontal";
    defaultQuality: "low" | "medium" | "high";
  }) => void;
}

export function ReaderSettings({ open, onOpenChange, onSettingsChange }: ReaderSettingsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [backgroundMode, setBackgroundMode] = useState<"white" | "dark" | "sepia">("white");
  const [readingMode, setReadingMode] = useState<"vertical" | "horizontal">("vertical");
  const [defaultQuality, setDefaultQuality] = useState<"low" | "medium" | "high">("medium");

  // Load settings on mount
  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const result = await getReaderSettingsAction();
      if (result.success && result.data) {
        // Map API values to component state types
        const bgMode = result.data.backgroundMode;
        if (bgMode === "dark" || bgMode === "white" || bgMode === "sepia") {
          setBackgroundMode(bgMode);
        }
        const rdMode = result.data.readingMode;
        if (rdMode === "vertical" || rdMode === "horizontal") {
          setReadingMode(rdMode);
        }
        const quality = result.data.defaultQuality;
        if (quality === "low" || quality === "medium" || quality === "high") {
          setDefaultQuality(quality);
        }
      }
    } catch {
      console.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateReaderSettingsAction({
        backgroundMode,
        readingMode,
        defaultQuality,
      });

      if (result.success) {
        toast.success("Your reader preferences have been updated");
        onSettingsChange?.({
          backgroundMode,
          readingMode,
          defaultQuality,
        });
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to save settings");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Reader Settings</SheetTitle>
          <SheetDescription>
            Customize your reading experience. Settings will sync across devices.
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6 py-6">
            {/* Background Mode */}
            <div className="space-y-3">
              <Label>Background Color</Label>
              <RadioGroup
                value={backgroundMode}
                onValueChange={(value) => setBackgroundMode(value as typeof backgroundMode)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="white" id="bg-white" />
                  <Label htmlFor="bg-white" className="flex items-center gap-2 cursor-pointer">
                    <div className="w-8 h-8 rounded border-2 border-border bg-white" />
                    White
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="bg-dark" />
                  <Label htmlFor="bg-dark" className="flex items-center gap-2 cursor-pointer">
                    <div className="w-8 h-8 rounded border-2 border-border bg-gray-900" />
                    Dark
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sepia" id="bg-sepia" />
                  <Label htmlFor="bg-sepia" className="flex items-center gap-2 cursor-pointer">
                    <div className="w-8 h-8 rounded border-2 border-border bg-amber-50" />
                    Sepia
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Reading Mode */}
            <div className="space-y-3">
              <Label>Reading Mode</Label>
              <RadioGroup
                value={readingMode}
                onValueChange={(value) => setReadingMode(value as typeof readingMode)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vertical" id="mode-vertical" />
                  <Label htmlFor="mode-vertical" className="cursor-pointer">
                    Vertical (Infinite Scroll)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="horizontal" id="mode-horizontal" />
                  <Label htmlFor="mode-horizontal" className="cursor-pointer">
                    Horizontal (Page by Page)
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-sm text-muted-foreground">
                {readingMode === "vertical"
                  ? "Scroll continuously through all pages"
                  : "Navigate one page at a time with arrow keys or swipe"}
              </p>
            </div>

            {/* Image Quality */}
            <div className="space-y-3">
              <Label htmlFor="quality">Default Image Quality</Label>
              <Select
                value={defaultQuality}
                onValueChange={(value) => setDefaultQuality(value as typeof defaultQuality)}
              >
                <SelectTrigger id="quality">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (Faster loading)</SelectItem>
                  <SelectItem value="medium">Medium (Balanced)</SelectItem>
                  <SelectItem value="high">High (Best quality)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Higher quality uses more bandwidth but provides better image clarity
              </p>
            </div>

            {/* Save Button */}
            <div className="pt-4 flex gap-2">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Settings"
                )}
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
