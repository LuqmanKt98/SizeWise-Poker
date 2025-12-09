
"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ModeToggle({ className, ...props }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    // Render a placeholder or nothing on the server to avoid hydration mismatch
    return (
        <div className={cn("grid grid-cols-3 gap-2", className)} {...props}>
            <Button variant="outline" size="sm" disabled>
                <Sun className="mr-2 h-4 w-4" />
                Light
            </Button>
            <Button variant="outline" size="sm" disabled>
                <Moon className="mr-2 h-4 w-4" />
                Dark
            </Button>
            <Button variant="outline" size="sm" disabled>
                <Monitor className="mr-2 h-4 w-4" />
                System
            </Button>
        </div>
    )
  }

  return (
    <div className={cn("grid grid-cols-3 gap-2", className)} {...props}>
        <Button
            variant={theme === 'light' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme("light")}
        >
            <Sun className="mr-2 h-4 w-4" />
            Light
        </Button>
        <Button
            variant={theme === 'dark' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme("dark")}
        >
            <Moon className="mr-2 h-4 w-4" />
            Dark
        </Button>
        <Button
            variant={theme === 'system' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme("system")}
        >
            <Monitor className="mr-2 h-4 w-4" />
            System
        </Button>
    </div>
  )
}
