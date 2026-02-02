import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

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

("use client");

interface ReaderSettingsProps {
  onOpenChange: (open: boolean) => void;
  onSettingsChange?: (settings: {
    backgroundMode: "dark" | "sepia" | "white";
    defaultQuality: "high" | "low" | "medium";
    readingMode: "horizontal" | "vertical";
  }) => void;
  open: boolean;
}

export function ReaderSettings({
  open,
  onOpenChange,
  onSettingsChange,
}: ReaderSettingsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [backgroundMode, setBackgroundMode] = useState<
    "dark" | "sepia" | "white"
  >("white");
  const [readingMode, setReadingMode] = useState<"horizontal" | "vertical">(
    "vertical",
  );
  const [defaultQuality, setDefaultQuality] = useState<
    "high" | "low" | "medium"
  >("medium");

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
      if (result.ok && result.data) {
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

      if (result.ok) {
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
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="w-full sm:max-w-md" side="right">
        <SheetHeader>
          <SheetTitle>Reader Settings</SheetTitle>
          <SheetDescription>
            Customize your reading experience. Settings will sync across
            devices.
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6 py-6">
            {/* Background Mode */}
            <div className="space-y-3">
              <Label>Background Color</Label>
              <RadioGroup
                onValueChange={(value) =>
                  setBackgroundMode(value as typeof backgroundMode)
                }
                value={backgroundMode}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem id="bg-white" value="white" />
                  <Label
                    className="flex cursor-pointer items-center gap-2"
                    htmlFor="bg-white"
                  >
                    <div className="border-border h-8 w-8 rounded border-2 bg-white" />
                    White
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem id="bg-dark" value="dark" />
                  <Label
                    className="flex cursor-pointer items-center gap-2"
                    htmlFor="bg-dark"
                  >
                    <div className="border-border h-8 w-8 rounded border-2 bg-gray-900" />
                    Dark
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem id="bg-sepia" value="sepia" />
                  <Label
                    className="flex cursor-pointer items-center gap-2"
                    htmlFor="bg-sepia"
                  >
                    <div className="border-border h-8 w-8 rounded border-2 bg-amber-50" />
                    Sepia
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Reading Mode */}
            <div className="space-y-3">
              <Label>Reading Mode</Label>
              <RadioGroup
                onValueChange={(value) =>
                  setReadingMode(value as typeof readingMode)
                }
                value={readingMode}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem id="mode-vertical" value="vertical" />
                  <Label className="cursor-pointer" htmlFor="mode-vertical">
                    Vertical (Infinite Scroll)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem id="mode-horizontal" value="horizontal" />
                  <Label className="cursor-pointer" htmlFor="mode-horizontal">
                    Horizontal (Page by Page)
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-muted-foreground text-sm">
                {readingMode === "vertical"
                  ? "Scroll continuously through all pages"
                  : "Navigate one page at a time with arrow keys or swipe"}
              </p>
            </div>

            {/* Image Quality */}
            <div className="space-y-3">
              <Label htmlFor="quality">Default Image Quality</Label>
              <Select
                onValueChange={(value) =>
                  setDefaultQuality(value as typeof defaultQuality)
                }
                value={defaultQuality}
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
              <p className="text-muted-foreground text-sm">
                Higher quality uses more bandwidth but provides better image
                clarity
              </p>
            </div>

            {/* Save Button */}
            <div className="flex gap-2 pt-4">
              <Button className="flex-1" disabled={saving} onClick={handleSave}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Settings"
                )}
              </Button>
              <Button onClick={() => onOpenChange(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
