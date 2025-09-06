import { useState } from "react"

export const useTheme = () => {
    const [theme, setTheme] = useState<string>(() => {
        const savedTheme = localStorage.getItem("theme");
        const startTheme = savedTheme ? savedTheme : "light";
        document.documentElement.setAttribute("data-theme", startTheme)
        return startTheme
    });

    const toggleTheme = () => {
        const newTheme = theme == "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.setAttribute("data-theme", newTheme)
    }
    return {theme, toggleTheme};
}

