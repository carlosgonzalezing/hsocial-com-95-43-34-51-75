import { useState } from "react";

interface NavigationTabsProps {
  activeTab: "inbox" | "communities";
  onTabChange: (tab: "inbox" | "communities") => void;
}

export const NavigationTabs = ({ activeTab, onTabChange }: NavigationTabsProps) => {
  return (
    <div className="flex border-b border-border">
      <button
        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
          activeTab === "inbox"
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={() => onTabChange("inbox")}
      >
        Bandeja de entrada
        {activeTab === "inbox" && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
        )}
      </button>
      <button
        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
          activeTab === "communities"
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={() => onTabChange("communities")}
      >
        Comunidades
        {activeTab === "communities" && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
        )}
      </button>
    </div>
  );
};