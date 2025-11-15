"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const API_KEY_STORAGE_KEY = "openai_api_key"

interface ApiKeyDialogProps {
  open: boolean
  onSave: (apiKey: string) => void
  onCancel: () => void
}

export function ApiKeyDialog({ open, onSave, onCancel }: ApiKeyDialogProps) {
  const [apiKey, setApiKey] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  // Load existing API key when dialog opens
  React.useEffect(() => {
    if (open) {
      const storedKey = getStoredApiKey()
      if (storedKey) {
        setApiKey(storedKey)
      }
      setError(null)
    }
  }, [open])

  const handleSave = () => {
    // Validate API key format
    if (!validateApiKeyFormat(apiKey)) {
      setError("Invalid API key format. OpenAI API keys start with 'sk-'")
      return
    }

    // Save to local storage
    saveApiKey(apiKey)
    
    // Call the onSave callback
    onSave(apiKey)
    
    // Reset state
    setApiKey("")
    setError(null)
  }

  const handleCancel = () => {
    // Reset state
    setApiKey("")
    setError(null)
    onCancel()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Configure OpenAI API Key</DialogTitle>
          <DialogDescription>
            Enter your OpenAI API key to enable voice chat. Your key will be
            stored locally in your browser.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value)
                setError(null)
              }}
              onKeyDown={handleKeyDown}
              aria-invalid={!!error}
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Helper functions for API key management

/**
 * Validates that the API key follows OpenAI's format (starts with "sk-")
 */
export function validateApiKeyFormat(apiKey: string): boolean {
  return apiKey.trim().startsWith("sk-") && apiKey.trim().length > 3
}

/**
 * Saves the API key to local storage
 */
export function saveApiKey(apiKey: string): void {
  try {
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim())
  } catch (error) {
    console.error("Failed to save API key to local storage:", error)
    throw new Error("Failed to save API key")
  }
}

/**
 * Retrieves the stored API key from local storage
 */
export function getStoredApiKey(): string | null {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY)
  } catch (error) {
    console.error("Failed to retrieve API key from local storage:", error)
    return null
  }
}

/**
 * Validates the stored API key (checks both existence and format)
 */
export function validateStoredApiKey(): boolean {
  const apiKey = getStoredApiKey()
  return apiKey !== null && validateApiKeyFormat(apiKey)
}

/**
 * Removes the API key from local storage
 */
export function clearStoredApiKey(): void {
  try {
    localStorage.removeItem(API_KEY_STORAGE_KEY)
  } catch (error) {
    console.error("Failed to clear API key from local storage:", error)
  }
}
