"use client";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import React from "react";
import { Button } from "./ui/button";

export default function ThemeSwitchButton() {
  const { setTheme, theme } = useTheme();

  if (theme)
    return (
      <Button
        className="bg-transparent font-semibold fixed bottom-0 right-0 m-4 text-foreground hover:bg-transparent shadow-none"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {`${theme.charAt(0).toUpperCase()}${theme.slice(1)}`}
      </Button>
    );
}
