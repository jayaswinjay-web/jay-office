import { useState, useRef, useEffect } from "react"
import { Building2, GraduationCap, ChevronDown } from "lucide-react"
import { Button } from "@/design-system"

const workspaces = [
  { id: "1", name: "My Workspace", type: "workspace" as const },
  { id: "2", name: "Acme Corp", type: "workspace" as const },
  { id: "3", name: "JAY Campus", type: "campus" as const },
]

const typeIcons = {
  workspace: Building2,
  campus: GraduationCap,
}

export function WorkspaceSwitcher() {
  const [open, setOpen] = useState(false)
  const [currentWorkspace, setCurrentWorkspace] = useState(workspaces[0]!)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const CurrentIcon = typeIcons[currentWorkspace.type]

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        style={{ display: "flex", alignItems: "center", gap: 6 }}
      >
        <CurrentIcon size={16} />
        <span>{currentWorkspace.name}</span>
        <ChevronDown size={14} />
      </Button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: 4,
            backgroundColor: "var(--color-bg-surface)",
            border: "1px solid var(--color-border-default)",
            borderRadius: 6,
            padding: 4,
            minWidth: 220,
            zIndex: 50,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {workspaces.map((ws) => {
            const ItemIcon = typeIcons[ws.type]
            return (
              <button
                key={ws.id}
                onClick={() => {
                  setCurrentWorkspace(ws)
                  setOpen(false)
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "8px 12px",
                  textAlign: "left",
                  backgroundColor: ws.id === currentWorkspace!.id ? "var(--color-bg-subtle)" : "transparent",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  color: ws.type === "campus" ? "#2e7d32" : "var(--color-text-primary)",
                }}
              >
                <ItemIcon size={16} />
                <span>{ws.name}</span>
                {ws.type === "campus" && (
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "#2e7d32", fontWeight: 500 }}>
                    Free
                  </span>
                )}
              </button>
            )
          })}
          <div style={{ borderTop: "1px solid var(--color-border-default)", marginTop: 4, paddingTop: 4 }}>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                padding: "8px 12px",
                textAlign: "left",
                border: "none",
                backgroundColor: "transparent",
                color: "var(--color-brand)",
                cursor: "pointer",
                borderRadius: 4,
                fontSize: 13,
              }}
            >
              <Building2 size={14} />
              + Create workspace
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
