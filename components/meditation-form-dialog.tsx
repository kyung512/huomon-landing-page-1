"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { ReactNode } from "react"
import { JourneyForm } from "./journey-form"

interface MeditationFormDialogProps {
  children: ReactNode
  title?: string
  description?: string
}

export function MeditationFormDialog({
  children,
  title = "Customize Your Meditation Package",
  description = "Answer these questions to create your personalized meditation package.",
}: MeditationFormDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <JourneyForm />
      </DialogContent>
    </Dialog>
  )
}
