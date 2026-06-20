"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type MenuItem = {
  id: string;
  label: string;
  items: {
    label: string;
    type?: "label" | "separator" | "item";
  }[];
};

const menuConfig: MenuItem[] = [
  {
    id: "account",
    label: "Account",
    items: [
      { label: "My Account", type: "label" },
      { label: "Profile", type: "item" },
      { label: "Billing", type: "item" },
      { label: "Team", type: "item" },
      { label: "Subscription", type: "item" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    items: [
      { label: "Settings", type: "label" },
      { label: "Preferences", type: "item" },
      { label: "Notifications", type: "item" },
      { label: "Privacy", type: "item" },
      { label: "Appearance", type: "item" },
      { label: "Language", type: "item" },
    ],
  },
];

export const DummyMeu = () => {
  const [open, setOpen] = useState<string | null>(null);
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Close dropdown if click is outside the ref
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutside = Object.values(contentRefs.current).every(
        (ref) => ref && !ref.contains(event.target as Node)
      );

      const isNotTrigger = Object.values(triggerRefs.current).every(
        (ref) => ref && !ref.contains(event.target as Node)
      );

      if (isOutside && isNotTrigger) {
        setOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTriggerEnter = (menuId: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpen(menuId);
  };

  const handleContentLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(null);
    }, 200); // Small delay to allow moving to another trigger
  };

  const handleTriggerLeave = (e: React.MouseEvent) => {
    // Check if we're moving to another trigger
    const relatedTarget = e.relatedTarget as HTMLElement;
    const isMovingToAnotherTrigger = Object.values(triggerRefs.current).some(
      (ref) => ref && ref.contains(relatedTarget)
    );

    if (
      !isMovingToAnotherTrigger &&
      !contentRefs.current[open || ""]?.contains(relatedTarget)
    ) {
      setOpen(null);
    }
  };

  return (
    <nav className="flex gap-4 p-4 border-b">
      {menuConfig.map((menu) => (
        <DropdownMenu
          key={menu.id}
          open={open === menu.id}
          onOpenChange={(isOpen) => {
            if (!isOpen) setOpen(null);
          }}
        >
          <DropdownMenuTrigger
            ref={(el) => {
              triggerRefs.current[menu.id] = el;
            }}
            onMouseEnter={() => handleTriggerEnter(menu.id)}
            onMouseLeave={handleTriggerLeave}
            className="px-4 py-2 hover:bg-gray-100 rounded border"
          >
            {menu.label}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            ref={(el) => {
              contentRefs.current[menu.id] = el;
            }}
            onMouseLeave={handleContentLeave}
            className="min-w-[200px] -translate-y-1"
          >
            {menu.items.map((item, index) => {
              if (item.type === "label") {
                return (
                  <DropdownMenuLabel key={index}>
                    {item.label}
                  </DropdownMenuLabel>
                );
              }
              if (item.type === "separator") {
                return <DropdownMenuSeparator key={index} />;
              }
              return (
                <DropdownMenuItem key={index}>{item.label}</DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </nav>
  );
};
