"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCustomerTheme, updateCustomerTheme, deleteCustomerTheme } from "@/lib/api";
import { Palette, Sidebar, FileCode, RotateCcw, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Define some harmonic theme presets
const PRESETS = [
  {
    name: "Default Pink",
    primaryColor: "#cc176b",
    secondaryColor: "#62182d",
    backgroundColor: "#ffffff",
    surfaceColor: "#ffffff",
    borderColor: "#e0e0e0",
    headingColor: "#161615",
    textColor: "#161615",
    mutedColor: "#454645",
    sidebarBgColor: "#f5f5f5",
    sidebarTextColor: "#161615",
    sidebarActiveBgColor: "#cc176b",
    sidebarActiveTextColor: "#ffffff",
    sidebarHoverBgColor: "#fde7f3",
    sidebarHoverTextColor: "#ac2a58",
    fontFamily: "Inter, sans-serif",
    headingFontFamily: "Orbitron, Inter, sans-serif",
    baseFontSize: "14px",
    customCss: "",
  },
  {
    name: "Ocean Breeze",
    primaryColor: "#0284c7",
    secondaryColor: "#0f172a",
    backgroundColor: "#f0f9ff",
    surfaceColor: "#ffffff",
    borderColor: "#bae6fd",
    headingColor: "#0f172a",
    textColor: "#1e293b",
    mutedColor: "#64748b",
    sidebarBgColor: "#0f172a",
    sidebarTextColor: "#94a3b8",
    sidebarActiveBgColor: "#0284c7",
    sidebarActiveTextColor: "#ffffff",
    sidebarHoverBgColor: "#1e293b",
    sidebarHoverTextColor: "#38bdf8",
    fontFamily: "Inter, sans-serif",
    headingFontFamily: "Inter, sans-serif",
    baseFontSize: "14px",
    customCss: "",
  },
  {
    name: "Autumn Amber",
    primaryColor: "#d97706",
    secondaryColor: "#7c2d12",
    backgroundColor: "#fdf8f6",
    surfaceColor: "#ffffff",
    borderColor: "#ffedd5",
    headingColor: "#7c2d12",
    textColor: "#431407",
    mutedColor: "#854d0e",
    sidebarBgColor: "#fbf5f0",
    sidebarTextColor: "#7c2d12",
    sidebarActiveBgColor: "#d97706",
    sidebarActiveTextColor: "#ffffff",
    sidebarHoverBgColor: "#ffedd5",
    sidebarHoverTextColor: "#7c2d12",
    fontFamily: "Inter, sans-serif",
    headingFontFamily: "Inter, sans-serif",
    baseFontSize: "14px",
    customCss: "",
  },
  {
    name: "Forest Green",
    primaryColor: "#059669",
    secondaryColor: "#064e3b",
    backgroundColor: "#f0fdf4",
    surfaceColor: "#ffffff",
    borderColor: "#bbf7d0",
    headingColor: "#064e3b",
    textColor: "#064e3b",
    mutedColor: "#15803d",
    sidebarBgColor: "#f4fbf7",
    sidebarTextColor: "#064e3b",
    sidebarActiveBgColor: "#059669",
    sidebarActiveTextColor: "#ffffff",
    sidebarHoverBgColor: "#d1fae5",
    sidebarHoverTextColor: "#064e3b",
    fontFamily: "Inter, sans-serif",
    headingFontFamily: "Inter, sans-serif",
    baseFontSize: "14px",
    customCss: "",
  },
  {
    name: "Classic Midnight",
    primaryColor: "#ec4899",
    secondaryColor: "#be185d",
    backgroundColor: "#0f172a",
    surfaceColor: "#1e293b",
    borderColor: "#334155",
    headingColor: "#f8fafc",
    textColor: "#cbd5e1",
    mutedColor: "#64748b",
    sidebarBgColor: "#1e293b",
    sidebarTextColor: "#94a3b8",
    sidebarActiveBgColor: "#ec4899",
    sidebarActiveTextColor: "#ffffff",
    sidebarHoverBgColor: "#334155",
    sidebarHoverTextColor: "#f472b6",
    fontFamily: "Inter, sans-serif",
    headingFontFamily: "Orbitron, Inter, sans-serif",
    baseFontSize: "14px",
    customCss: "",
  },
];

export function ThemeCustomizer() {
  const queryClient = useQueryClient();

  // 1. Fetch current custom theme
  const { data: themeRes, isLoading } = useQuery({
    queryKey: ["theme", "authenticated"],
    queryFn: fetchCustomerTheme,
  });

  const [form, setForm] = useState({
    panelType: "WEB",
    siteName: "Gift Factory",
    tagline: "Gifts, Hampers & Corporate Gifting",
    logoUrl: "/favicon.png?v=2",
    primaryColor: "#cc176b",
    secondaryColor: "#62182d",
    backgroundColor: "#ffffff",
    surfaceColor: "#ffffff",
    borderColor: "#e0e0e0",
    headingColor: "#161615",
    textColor: "#161615",
    mutedColor: "#454645",
    sidebarBgColor: "#f5f5f5",
    sidebarTextColor: "#161615",
    sidebarActiveBgColor: "#cc176b",
    sidebarActiveTextColor: "#ffffff",
    sidebarHoverBgColor: "#fde7f3",
    sidebarHoverTextColor: "#ac2a58",
    fontFamily: "Inter, sans-serif",
    headingFontFamily: "Orbitron, Inter, sans-serif",
    baseFontSize: "14px",
    customCss: "",
  });

  // Sync state with loaded theme data
  useEffect(() => {
    if (themeRes?.data) {
      setForm((prev) => ({
        ...prev,
        ...themeRes.data,
      }));
    }
  }, [themeRes]);

  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleFieldChange = (key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setForm((prev) => ({
      ...prev,
      ...preset,
    }));
    toast.success(`Preset "${preset.name}" applied (click save to persist)`);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateCustomerTheme(form);
      toast.success("Theme settings saved successfully!");
      // Invalidate the query key so the changes apply instantly throughout the client
      queryClient.invalidateQueries({ queryKey: ["theme"] });
    } catch (err) {
      console.error(err);
      toast.error("Failed to update theme overrides");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await deleteCustomerTheme();
      toast.success("Theme overrides removed. Reverted to default.");
      // Reset form to default preset
      setForm((prev) => ({
        ...prev,
        ...PRESETS[0],
      }));
      queryClient.invalidateQueries({ queryKey: ["theme"] });
    } catch (err) {
      console.error(err);
      toast.error("Failed to reset theme settings");
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-1/4 bg-muted rounded-md" />
        <div className="h-32 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Palette className="h-4 w-4 text-pink-500" /> Theme Customization
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">Customize your personal visual experience across the portal.</p>
      </div>

      {/* Theme Presets */}
      <div>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-amber-500" /> Cohesive Presets
        </span>
        <div className="flex flex-wrap gap-3">
          {PRESETS.map((preset) => {
            const isMatch =
              form.primaryColor?.toLowerCase() === preset.primaryColor.toLowerCase() &&
              form.backgroundColor?.toLowerCase() === preset.backgroundColor.toLowerCase();

            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`
                  flex items-center gap-2.5 px-3 py-1.5 rounded-full border text-xs font-semibold
                  transition-all duration-150 cursor-pointer
                  ${isMatch 
                    ? "border-pink-500 bg-pink-50/50 text-pink-700 shadow-sm" 
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                  }
                `}
              >
                <span className="flex items-center gap-0.5">
                  <span className="h-3.5 w-3.5 rounded-full border border-black/10 inline-block" style={{ backgroundColor: preset.primaryColor }} />
                  <span className="h-3.5 w-3.5 rounded-full border border-black/10 inline-block -ml-1.5" style={{ backgroundColor: preset.backgroundColor }} />
                </span>
                {preset.name}
                {isMatch && <Check className="h-3.5 w-3.5 text-pink-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Colors sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Brand & Layout Colors */}
          <div className="space-y-4 rounded-xl border border-gray-100 p-4 bg-gray-50/50">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Palette className="h-3.5 w-3.5 text-gray-400" /> Brand & Layout Colors
            </h4>
            
            <div className="space-y-3">
              {/* Primary Color */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Primary Theme Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={form.primaryColor || ""}
                    onChange={(e) => handleFieldChange("primaryColor", e.target.value)}
                    className="w-20 px-2 py-1 text-xs border border-gray-200 rounded-md font-mono"
                  />
                  <input
                    type="color"
                    value={form.primaryColor || "#cc176b"}
                    onChange={(e) => handleFieldChange("primaryColor", e.target.value)}
                    className="h-7 w-7 rounded-md cursor-pointer border-0 p-0 overflow-hidden"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Secondary Accent</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={form.secondaryColor || ""}
                    onChange={(e) => handleFieldChange("secondaryColor", e.target.value)}
                    className="w-20 px-2 py-1 text-xs border border-gray-200 rounded-md font-mono"
                  />
                  <input
                    type="color"
                    value={form.secondaryColor || "#62182d"}
                    onChange={(e) => handleFieldChange("secondaryColor", e.target.value)}
                    className="h-7 w-7 rounded-md cursor-pointer border-0 p-0 overflow-hidden"
                  />
                </div>
              </div>

              {/* Background Color */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Background Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={form.backgroundColor || ""}
                    onChange={(e) => handleFieldChange("backgroundColor", e.target.value)}
                    className="w-20 px-2 py-1 text-xs border border-gray-200 rounded-md font-mono"
                  />
                  <input
                    type="color"
                    value={form.backgroundColor || "#ffffff"}
                    onChange={(e) => handleFieldChange("backgroundColor", e.target.value)}
                    className="h-7 w-7 rounded-md cursor-pointer border-0 p-0 overflow-hidden"
                  />
                </div>
              </div>

              {/* Surface Color */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Surface Card Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={form.surfaceColor || ""}
                    onChange={(e) => handleFieldChange("surfaceColor", e.target.value)}
                    className="w-20 px-2 py-1 text-xs border border-gray-200 rounded-md font-mono"
                  />
                  <input
                    type="color"
                    value={form.surfaceColor || "#ffffff"}
                    onChange={(e) => handleFieldChange("surfaceColor", e.target.value)}
                    className="h-7 w-7 rounded-md cursor-pointer border-0 p-0 overflow-hidden"
                  />
                </div>
              </div>

              {/* Border Color */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Border Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={form.borderColor || ""}
                    onChange={(e) => handleFieldChange("borderColor", e.target.value)}
                    className="w-20 px-2 py-1 text-xs border border-gray-200 rounded-md font-mono"
                  />
                  <input
                    type="color"
                    value={form.borderColor || "#e0e0e0"}
                    onChange={(e) => handleFieldChange("borderColor", e.target.value)}
                    className="h-7 w-7 rounded-md cursor-pointer border-0 p-0 overflow-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar & Styling Parameters */}
          <div className="space-y-4 rounded-xl border border-gray-100 p-4 bg-gray-50/50">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Sidebar className="h-3.5 w-3.5 text-gray-400" /> Sidebar & Layout Accents
            </h4>

            <div className="space-y-3">
              {/* Sidebar Background */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Sidebar Background</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={form.sidebarBgColor || ""}
                    onChange={(e) => handleFieldChange("sidebarBgColor", e.target.value)}
                    className="w-20 px-2 py-1 text-xs border border-gray-200 rounded-md font-mono"
                  />
                  <input
                    type="color"
                    value={form.sidebarBgColor || "#f5f5f5"}
                    onChange={(e) => handleFieldChange("sidebarBgColor", e.target.value)}
                    className="h-7 w-7 rounded-md cursor-pointer border-0 p-0 overflow-hidden"
                  />
                </div>
              </div>

              {/* Sidebar Text */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Sidebar Link Text</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={form.sidebarTextColor || ""}
                    onChange={(e) => handleFieldChange("sidebarTextColor", e.target.value)}
                    className="w-20 px-2 py-1 text-xs border border-gray-200 rounded-md font-mono"
                  />
                  <input
                    type="color"
                    value={form.sidebarTextColor || "#161615"}
                    onChange={(e) => handleFieldChange("sidebarTextColor", e.target.value)}
                    className="h-7 w-7 rounded-md cursor-pointer border-0 p-0 overflow-hidden"
                  />
                </div>
              </div>

              {/* Sidebar Active BG */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Sidebar Active BG</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={form.sidebarActiveBgColor || ""}
                    onChange={(e) => handleFieldChange("sidebarActiveBgColor", e.target.value)}
                    className="w-20 px-2 py-1 text-xs border border-gray-200 rounded-md font-mono"
                  />
                  <input
                    type="color"
                    value={form.sidebarActiveBgColor || "#cc176b"}
                    onChange={(e) => handleFieldChange("sidebarActiveBgColor", e.target.value)}
                    className="h-7 w-7 rounded-md cursor-pointer border-0 p-0 overflow-hidden"
                  />
                </div>
              </div>

              {/* Sidebar Active Text */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Sidebar Active Text</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={form.sidebarActiveTextColor || ""}
                    onChange={(e) => handleFieldChange("sidebarActiveTextColor", e.target.value)}
                    className="w-20 px-2 py-1 text-xs border border-gray-200 rounded-md font-mono"
                  />
                  <input
                    type="color"
                    value={form.sidebarActiveTextColor || "#ffffff"}
                    onChange={(e) => handleFieldChange("sidebarActiveTextColor", e.target.value)}
                    className="h-7 w-7 rounded-md cursor-pointer border-0 p-0 overflow-hidden"
                  />
                </div>
              </div>

              {/* Font Family Selection */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Font Family</span>
                <select
                  value={form.fontFamily || "Inter, sans-serif"}
                  onChange={(e) => handleFieldChange("fontFamily", e.target.value)}
                  className="px-2.5 py-1 text-xs border border-gray-200 rounded-md bg-white font-sans w-28"
                >
                  <option value="Inter, sans-serif">Inter (Sans)</option>
                  <option value="Lora, serif">Lora (Serif)</option>
                  <option value="Inconsolata, monospace">Inconsolata (Mono)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Custom CSS overrides */}
        <div className="space-y-2 rounded-xl border border-gray-100 p-4 bg-gray-50/50">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <FileCode className="h-3.5 w-3.5 text-gray-400" /> Advanced Custom CSS Overrides
          </h4>
          <textarea
            value={form.customCss || ""}
            onChange={(e) => handleFieldChange("customCss", e.target.value)}
            placeholder="/* e.g., body { font-size: 15px !important; } */"
            className="w-full min-h-[90px] border border-gray-200 rounded-lg p-2.5 font-mono text-xs bg-white text-gray-800"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSaving} className="rounded-full px-8 bg-pink-500 hover:bg-pink-600 text-white font-semibold">
            {isSaving ? "Saving..." : "Save Custom Theme"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isResetting}
            className="rounded-full px-5 border-gray-300 text-gray-600 hover:bg-gray-100 flex items-center gap-1.5"
          >
            <RotateCcw className="h-4 w-4" />
            {isResetting ? "Resetting..." : "Revert to Default"}
          </Button>
        </div>
      </form>
    </div>
  );
}
