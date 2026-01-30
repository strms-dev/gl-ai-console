"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { HelpCircle, BookOpen, MessageCircle, ExternalLink, ChevronRight } from "lucide-react"
import { LucideIcon } from "lucide-react"

interface FAQ {
  question: string
  answer: string
}

interface HelpSection {
  title: string
  icon: LucideIcon
  content: string
}

interface AppHelpModalProps {
  appName: string
  appDescription: string
  isOpen: boolean
  onClose: () => void
  sections?: HelpSection[]
  faqs?: FAQ[]
  documentationUrl?: string
  supportEmail?: string
}

export function AppHelpModal({
  appName,
  appDescription,
  isOpen,
  onClose,
  sections = [],
  faqs = [],
  documentationUrl,
  supportEmail,
}: AppHelpModalProps) {
  // Default placeholder sections if none provided
  const defaultSections: HelpSection[] = [
    {
      title: "Getting Started",
      icon: BookOpen,
      content: "Documentation coming soon. This section will contain step-by-step guides on how to use the application effectively.",
    },
    {
      title: "Tips & Best Practices",
      icon: ChevronRight,
      content: "Documentation coming soon. This section will include helpful tips and best practices for optimal usage.",
    },
  ]

  // Default placeholder FAQs if none provided
  const defaultFaqs: FAQ[] = [
    {
      question: "How do I get started?",
      answer: "Documentation coming soon. Detailed instructions will be provided here.",
    },
    {
      question: "Who do I contact for support?",
      answer: supportEmail
        ? `For support, please contact ${supportEmail}`
        : "Documentation coming soon. Support contact information will be provided here.",
    },
    {
      question: "Where can I find more documentation?",
      answer: documentationUrl
        ? "Click the documentation link below for detailed guides and resources."
        : "Documentation coming soon. Links to additional resources will be provided here.",
    },
  ]

  const displaySections = sections.length > 0 ? sections : defaultSections
  const displayFaqs = faqs.length > 0 ? faqs : defaultFaqs

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle
            className="text-2xl text-[#463939] flex items-center gap-3"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <div className="w-10 h-10 rounded-lg bg-[#407B9D]/10 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-[#407B9D]" />
            </div>
            {appName} Help
          </DialogTitle>
          <DialogDescription
            className="text-[#666666] mt-2"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {appDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Help Sections */}
          <div className="space-y-4">
            {displaySections.map((section, index) => {
              const IconComponent = section.icon
              return (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-[#FAF9F9] border border-border"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-[#407B9D]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <IconComponent className="w-4 h-4 text-[#407B9D]" />
                    </div>
                    <div>
                      <h3
                        className="font-semibold text-[#463939] mb-1"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {section.title}
                      </h3>
                      <p
                        className="text-sm text-[#666666]"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {section.content}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* FAQs */}
          <div>
            <h3
              className="font-semibold text-[#463939] mb-3 flex items-center gap-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <MessageCircle className="w-4 h-4 text-[#407B9D]" />
              Frequently Asked Questions
            </h3>
            <div className="space-y-3">
              {displayFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-white border border-border"
                >
                  <p
                    className="font-medium text-[#463939] text-sm mb-1"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {faq.question}
                  </p>
                  <p
                    className="text-sm text-[#666666]"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            {documentationUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(documentationUrl, "_blank")}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View Full Documentation
              </Button>
            )}
            {supportEmail && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = `mailto:${supportEmail}`}
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Contact Support
              </Button>
            )}
            <Button
              onClick={onClose}
              className="bg-[#407B9D] hover:bg-[#407B9D]/90 ml-auto"
            >
              Got it
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Export a simple help button that can be used in headers
interface HelpButtonProps {
  onClick: () => void
}

export function HelpButton({ onClick }: HelpButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="flex items-center gap-2 text-[#666666] hover:text-[#407B9D] hover:bg-[#407B9D]/10"
    >
      <HelpCircle className="w-4 h-4" />
      <span style={{ fontFamily: "var(--font-body)" }}>Need help?</span>
    </Button>
  )
}
