import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

function currentTheme() {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(currentTheme);

  useEffect(() => {
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    try {
      localStorage.theme = theme;
    } catch {
      /* localStorage indisponible : on ignore */
    }
  }, [theme]);

  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Passer en thème clair" : "Passer en thème sombre"}
      title={isDark ? "Thème clair" : "Thème sombre"}
      className="grid h-9 w-9 place-items-center rounded-md text-body transition-colors hover:bg-surface-2 hover:text-ink"
    >
      {isDark ? (
        <Sun className="h-[18px] w-[18px]" strokeWidth={1.75} />
      ) : (
        <Moon className="h-[18px] w-[18px]" strokeWidth={1.75} />
      )}
    </button>
  );
}
