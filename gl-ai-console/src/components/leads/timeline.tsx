"use client"

import { useState } from "react"
import { TimelineEvent } from "@/lib/timeline-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getFileTypeById, UploadedFile } from "@/lib/file-types"
import { FileUpload } from "@/components/leads/file-upload"

interface TimelineProps {
  events: TimelineEvent[]
}

const getStatusColor = (status: TimelineEvent["status"]) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 border-green-200"
    case "in_progress":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "action-required":
      return "bg-amber-100 text-amber-800 border-amber-200"
    case "pending":
      return "bg-gray-100 text-gray-800 border-gray-200"
    case "failed":
      return "bg-red-100 text-red-800 border-red-200"
    case "skipped":
      return "bg-gray-100 text-gray-500 border-gray-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getStatusIcon = (status: TimelineEvent["status"]) => {
  switch (status) {
    case "completed":
      return "✅"
    case "in_progress":
      return "🔄"
    case "action-required":
      return "⚠️"
    case "pending":
      return "⏳"
    case "failed":
      return "❌"
    case "skipped":
      return "⏭️"
    default:
      return "⏳"
  }
}

const getConnectorStyles = (currentStatus: TimelineEvent["status"], nextStatus?: TimelineEvent["status"]) => {
  if (currentStatus === "completed") {
    return "bg-green-500"
  }
  if (currentStatus === "in_progress") {
    return "bg-blue-500"
  }
  if (currentStatus === "skipped") {
    return "bg-gray-300 border-l-2 border-dashed border-gray-400"
  }
  return "bg-gray-300"
}

const ProgressBar = ({ percentage }: { percentage: number }) => (
  <div className="w-full bg-muted rounded-full h-2 mb-4">
    <div
      className="bg-primary h-2 rounded-full transition-all duration-300"
      style={{ width: `${percentage}%` }}
    />
  </div>
)

const LoadingSpinner = () => (
  <div className="flex items-center space-x-2">
    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
    <span className="text-sm text-blue-600">Processing...</span>
  </div>
)

const ActionZone = ({ event, onAction, onFileUploaded, onFileCleared, existingFile, showDeveloperSelection, showEmailDraft, selectedDeveloper, showNotAFitEmail, decisionMade }: {
  event: TimelineEvent,
  onAction: (action: string) => void,
  onFileUploaded?: (file: UploadedFile) => void,
  onFileCleared?: (fileTypeId: string) => void,
  existingFile?: UploadedFile,
  showDeveloperSelection?: boolean,
  showEmailDraft?: boolean,
  selectedDeveloper?: string | null,
  showNotAFitEmail?: boolean,
  decisionMade?: string | null
}) => {
  const [emailCopied, setEmailCopied] = useState(false)

  if (!event.actions) return null

  // Special handling for demo call file upload
  if (event.type === "demo" && event.actions.manual?.label.includes("Upload")) {
    const demoTranscriptFileType = getFileTypeById('demo-call-transcript')
    if (demoTranscriptFileType) {
      return (
        <div className="mt-4">
          <FileUpload
            fileType={demoTranscriptFileType}
            existingFile={existingFile}
            onFileUploaded={onFileUploaded}
            onFileCleared={() => onFileCleared?.('demo-call-transcript')}
          />
        </div>
      )
    }
  }

  // Special handling for readiness assessment stage
  if (event.type === "readiness") {
    const readinessPdfFileType = getFileTypeById('readiness-pdf')
    if (readinessPdfFileType) {
      return (
        <div className="mt-4 p-3 bg-muted/30 rounded-lg border">
          {/* AI Generation Button */}
          {event.actions.automated && (
            <div className="mb-4">
              <Button
                variant="default"
                size="sm"
                onClick={() => onAction('automated')}
                className="w-full sm:w-auto"
              >
                {event.actions.automated.label}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                AI will analyze the demo transcript and generate a readiness assessment
              </p>
            </div>
          )}

          {/* Manual Upload Option */}
          <div>
            <div className="mb-2">
              <p className="text-sm font-medium text-foreground">Or upload manually:</p>
            </div>
            <FileUpload
              fileType={readinessPdfFileType}
              existingFile={existingFile}
              onFileUploaded={onFileUploaded}
              onFileCleared={() => onFileCleared?.('readiness-pdf')}
            />
          </div>
        </div>
      )
    }
  }

  // Email Draft Screen - show after developer selection
  if (event.type === "decision" && showEmailDraft && selectedDeveloper) {
    const developerData = {
      nick: {
        name: "Nick",
        title: "The Growth Architect",
        bookingLink: "https://calendly.com/nick-growthlab/scoping-call",
        specialty: "Marketing & Growth Systems"
      },
      gon: {
        name: "Gon",
        title: "The Numbers Ninja",
        bookingLink: "https://calendly.com/gon-growthlab/scoping-call",
        specialty: "Finance & Operations Systems"
      }
    }

    const developer = developerData[selectedDeveloper as keyof typeof developerData]
    const emailContent = `Subject: Ready to Move Forward with Your Automation Project!

Hi there!

Great news! After reviewing your demo call and readiness assessment, we're excited to move forward with your automation project.

I've assigned ${developer.name} (${developer.title}) to work with you. ${developer.name} specializes in ${developer.specialty} and will be perfect for your project needs.

Please use the link below to schedule your scoping call with ${developer.name}:
${developer.bookingLink}

During this call, we'll dive deep into your specific requirements and create a detailed technical plan for your automation solution.

Looking forward to working with you!

Best regards,
The GrowthLab Team`

    return (
      <div className="mt-4 p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📧</span>
            <h3 className="font-bold text-lg text-gray-800">Email Draft Ready</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            📋 A HubSpot deal card has been created for this lead
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded border">
{emailContent}
          </pre>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => {
              navigator.clipboard.writeText(emailContent)
              setEmailCopied(true)
              // Reset after 2 seconds
              setTimeout(() => setEmailCopied(false), 2000)
            }}
            variant="outline"
            className={`flex-1 transition-all duration-200 ${
              emailCopied
                ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            }`}
          >
            {emailCopied ? "✅ Email Copied!" : "📋 Copy Email"}
          </Button>
          <Button
            onClick={() => onAction('email_sent')}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0"
          >
            ✅ Email Sent
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-3">
          Click "Copy Email" to copy the draft, then "Email Sent" when you've sent it to the client
        </p>
      </div>
    )
  }

  // Not a Fit Email Draft Screen
  if (event.type === "decision" && showNotAFitEmail) {
    const notAFitEmailContent = `Subject: Thank You for Your Interest in GrowthLab Automation

Hi there,

Thank you for taking the time to explore automation opportunities with GrowthLab. We really appreciate your interest in our services.

After reviewing your demo call and completing our readiness assessment, we've determined that your current needs and our automation expertise may not be the perfect match at this time.

This doesn't reflect on your business in any way - it simply means that our specific automation solutions might not align with your current operational structure and requirements.

We encourage you to revisit automation opportunities in the future as your business evolves. Feel free to reach out again if your needs change or if you'd like to discuss alternative approaches.

We wish you all the best with your business growth!

Best regards,
The GrowthLab Team`

    return (
      <div className="mt-4 p-6 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📧</span>
            <h3 className="font-bold text-lg text-gray-800">Not a Fit - Email Draft Ready</h3>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded border">
{notAFitEmailContent}
          </pre>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => {
              navigator.clipboard.writeText(notAFitEmailContent)
              setEmailCopied(true)
              // Reset after 2 seconds
              setTimeout(() => setEmailCopied(false), 2000)
            }}
            variant="outline"
            className={`flex-1 transition-all duration-200 ${
              emailCopied
                ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                : "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
            }`}
          >
            {emailCopied ? "✅ Email Copied!" : "📋 Copy Email"}
          </Button>
          <Button
            onClick={() => onAction('not_a_fit_email_sent')}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0"
          >
            ✅ Email Sent
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-3">
          Click "Copy Email" to copy the draft, then "Email Sent" when you've sent it to the client
        </p>
      </div>
    )
  }

  // Decision Recap - show for completed decision stage when expanded
  if (event.type === "decision" && event.status === "completed" && decisionMade) {
    const getDeveloperInfo = (dev: string) => {
      if (dev === 'nick') return { name: 'Nick', title: 'The Growth Architect', specialty: 'Marketing & Growth Systems' }
      if (dev === 'gon') return { name: 'Gon', title: 'The Numbers Ninja', specialty: 'Finance & Operations Systems' }
      return null
    }

    return (
      <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">✅</span>
            <h3 className="font-bold text-lg text-gray-800">Decision Complete - Recap</h3>
          </div>
        </div>

        {decisionMade === 'reject' ? (
          <div className="bg-white rounded-lg border border-orange-200 p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">❌</span>
              <div>
                <h4 className="font-semibold text-gray-800">Not a Fit</h4>
                <p className="text-sm text-gray-600">Lead was marked as not suitable for our automation services</p>
              </div>
            </div>
            <div className="text-sm text-gray-700">
              <p>• Rejection email was sent to the prospect</p>
              <p>• All remaining stages have been marked as not applicable</p>
            </div>
          </div>
        ) : decisionMade?.startsWith('proceed_') ? (
          <div className="bg-white rounded-lg border border-blue-200 p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">✅</span>
              <div>
                <h4 className="font-semibold text-gray-800">Proceeding with Scoping</h4>
                <p className="text-sm text-gray-600">Lead was approved and developer assigned</p>
              </div>
            </div>

            {(() => {
              const developerKey = decisionMade.replace('proceed_', '')
              const developer = getDeveloperInfo(developerKey)
              return developer ? (
                <div className="text-sm text-gray-700">
                  <p className="mb-2"><strong>Assigned Developer:</strong></p>
                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <p className="font-medium text-blue-800">{developer.name} - {developer.title}</p>
                    <p className="text-sm text-blue-600">{developer.specialty}</p>
                  </div>
                  <div className="mt-3">
                    <p>• Acceptance email was sent to the prospect</p>
                    <p>• Booking link shared for scoping call</p>
                    <p>• Next stage: Scoping Preparation</p>
                  </div>
                </div>
              ) : null
            })()}
          </div>
        ) : null}

        <div className="flex justify-center">
          <Button
            onClick={() => onAction('restart_decision')}
            variant="outline"
            size="sm"
            className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
          >
            🔄 Restart Decision Stage
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4 p-3 bg-muted/30 rounded-lg border">
      {/* Automated Action */}
      {event.actions.automated && (
        <div className="mb-3">
          <Button
            variant={event.actions.automated.inProgress ? "outline" : "default"}
            size="sm"
            onClick={() => onAction('automated')}
            disabled={event.actions.automated.inProgress}
            className="w-full sm:w-auto"
          >
            {event.actions.automated.inProgress ? (
              <div className="flex items-center space-x-2">
                <LoadingSpinner />
                <span>{event.actions.automated.label}</span>
                {event.actions.automated.timeLeft && (
                  <span className="text-xs opacity-75">({event.actions.automated.timeLeft})</span>
                )}
              </div>
            ) : (
              event.actions.automated.label
            )}
          </Button>
        </div>
      )}

      {/* Decision Options */}
      {event.actions.decision && !showDeveloperSelection && !showNotAFitEmail && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-semibold text-gray-700 mb-4 text-center">
            📋 Ready to make a decision?
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            {event.actions.decision.options.map((option, index) => (
              <Button
                key={index}
                variant={option.variant === "primary" ? "default" :
                        option.variant === "destructive" ? "destructive" : "outline"}
                size="default"
                onClick={() => onAction(option.action)}
                className={`flex-1 font-medium transition-all duration-200 hover:scale-105 shadow-md ${
                  option.variant === "primary"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
                    : option.variant === "destructive"
                    ? "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white border-0"
                    : "border-2 hover:bg-gray-50"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  {option.variant === "primary" && "📅"}
                  {option.variant === "destructive" && "⏸️"}
                  {option.label.replace(/[✅❌]/g, '').trim()}
                </span>
              </Button>
            ))}
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">
            This decision will determine the next steps in your client onboarding process
          </p>
        </div>
      )}

      {/* Developer Selection */}
      {event.actions.decision && showDeveloperSelection && (
        <div className="mt-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
          <p className="text-lg font-bold text-gray-800 mb-2 text-center">
            🎯 Choose Your Scoping Champion!
          </p>
          <p className="text-sm text-gray-600 mb-6 text-center">
            Who would you like to handle this scoping call?
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Nick Option */}
            <div className="bg-white rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-all duration-200 hover:shadow-lg">
              <div className="p-4 text-center">
                <div className="text-4xl mb-3">🚀</div>
                <h3 className="font-bold text-lg text-blue-800 mb-2">Nick</h3>
                <p className="text-sm text-gray-600 mb-2">The Growth Architect</p>
                <p className="text-xs text-gray-500 mb-1 font-medium">Marketing & Growth Systems</p>
                <p className="text-xs text-gray-500 mb-4 text-left">
                  🚀 Onboarding & client experience<br/>
                  📧 Marketing automation<br/>
                  🎯 CRM & sales workflows<br/>
                  👥 Customer journey optimization
                </p>
                <Button
                  onClick={() => onAction('select_developer_nick')}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 transition-all duration-200 hover:scale-105"
                >
                  Choose Nick 🎯
                </Button>
              </div>
            </div>

            {/* Gon Option */}
            <div className="bg-white rounded-lg border-2 border-green-200 hover:border-green-400 transition-all duration-200 hover:shadow-lg">
              <div className="p-4 text-center">
                <div className="text-4xl mb-3">🥷</div>
                <h3 className="font-bold text-lg text-green-800 mb-2">Gon</h3>
                <p className="text-sm text-gray-600 mb-2">The Numbers Ninja</p>
                <p className="text-xs text-gray-500 mb-1 font-medium">Finance & Operations Systems</p>
                <p className="text-xs text-gray-500 mb-4 text-left">
                  💰 Accounting integrations<br/>
                  📊 Financial reporting<br/>
                  🧮 Invoice & payment automation<br/>
                  📈 Revenue operations
                </p>
                <Button
                  onClick={() => onAction('select_developer_gon')}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 transition-all duration-200 hover:scale-105"
                >
                  Choose Gon 💰
                </Button>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            🤔 Both are awesome! Your choice will determine the scoping style and approach.
          </p>
        </div>
      )}

      {/* Manual Action */}
      {event.actions.manual && !event.actions.manual.label.includes("Upload") && (
        <div className="mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction('manual')}
            className="w-full sm:w-auto"
          >
            {event.actions.manual.label}
          </Button>
        </div>
      )}
    </div>
  )
}

const ArtifactsSection = ({ event }: { event: TimelineEvent }) => {
  if (!event.artifacts || event.artifacts.length === 0) return null

  return (
    <div className="mt-3">
      <p className="text-sm font-medium text-foreground mb-2">📁 Artifacts:</p>
      <div className="space-y-1">
        {event.artifacts.map((artifact, idx) => (
          <div key={idx} className="flex items-center space-x-2 text-sm">
            {artifact.type === "score" ? (
              <div className="flex items-center space-x-2">
                <span className="text-lg">📊</span>
                <span className="font-medium text-blue-600">{artifact.name}</span>
              </div>
            ) : (
              <Button variant="ghost" size="sm" className="h-auto p-1 justify-start">
                <span className="mr-1">
                  {artifact.type === "pdf" ? "📄" :
                   artifact.type === "audio" ? "🎵" :
                   artifact.type === "document" ? "📝" : "📎"}
                </span>
                {artifact.name}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const StageCard = ({
  event,
  index,
  isLast,
  nextEvent,
  onToggleCollapse,
  onAction,
  onFileUploaded,
  onFileCleared,
  existingFile,
  showDeveloperSelection,
  showEmailDraft,
  selectedDeveloper,
  showNotAFitEmail,
  decisionMade
}: {
  event: TimelineEvent
  index: number
  isLast: boolean
  nextEvent?: TimelineEvent
  onToggleCollapse: (id: string) => void
  onAction: (eventId: string, action: string) => void
  onFileUploaded?: (file: UploadedFile) => void
  onFileCleared?: (fileTypeId: string) => void
  existingFile?: UploadedFile
  showDeveloperSelection?: boolean
  showEmailDraft?: boolean
  selectedDeveloper?: string | null
  showNotAFitEmail?: boolean
  decisionMade?: string | null
}) => {
  const isActive = event.status === "in_progress" || event.status === "action-required"

  return (
    <div className={cn(
      "relative transition-all duration-300",
      isActive && "ring-2 ring-blue-200 ring-opacity-50 rounded-lg"
    )}>
      {/* Connector Line */}
      {!isLast && (
        <div
          className={cn(
            "absolute left-6 top-16 w-px h-full transition-all duration-300",
            getConnectorStyles(event.status, nextEvent?.status)
          )}
        />
      )}

      <div className="flex items-start space-x-4">
        {/* Status Circle */}
        <div className={cn(
          "flex items-center justify-center w-12 h-12 rounded-full border-2 bg-background relative z-10 transition-all duration-300",
          event.status === "completed" ? "border-green-500 bg-green-50" :
          event.status === "in_progress" ? "border-blue-500 bg-blue-50" :
          event.status === "action-required" ? "border-amber-500 bg-amber-50" :
          event.status === "failed" ? "border-red-500 bg-red-50" :
          event.status === "skipped" ? "border-gray-300 bg-gray-50 opacity-50" :
          "border-gray-300 bg-gray-50",
          isActive && "animate-pulse"
        )}>
          <span className="text-lg">{event.icon}</span>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className={cn(
            "p-4 border rounded-lg bg-background transition-all duration-300",
            event.status === "completed" && event.isCollapsed ? "border-green-200 bg-green-50/30" :
            event.status === "skipped" ? "border-gray-200 bg-gray-50/50 opacity-60" :
            isActive ? "border-blue-200 bg-blue-50/30" : "border-gray-200"
          )}>
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h3 className={cn(
                  "text-lg font-medium",
                  event.status === "skipped" ? "line-through text-gray-500" : "text-foreground"
                )}>
                  {event.title}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleCollapse(event.id)}
                  className="h-6 w-6 p-0"
                >
                  {event.isCollapsed ? "+" : "−"}
                </Button>
              </div>
              <span className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                getStatusColor(event.status)
              )}>
                {getStatusIcon(event.status)} {event.status.replace(/[-_]/g, " ")}
              </span>
            </div>

            {/* Content - show when not collapsed */}
            {!event.isCollapsed && (
              <>
                <p className={cn(
                  "text-sm mb-3",
                  event.status === "skipped" ? "text-gray-500" : "text-muted-foreground"
                )}>
                  {event.description}
                </p>

                {event.timestamp && (
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                    <span>
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Readiness Score Display */}
                {event.readinessScore && (
                  <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Readiness Score</span>
                      <span className="text-lg font-bold text-blue-600">{event.readinessScore}/100</span>
                    </div>
                    <div className="mt-1 w-full bg-white rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${event.readinessScore}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Zone - Show for non-completed stages OR for demo/readiness stages with uploaded files OR for completed decision stage */}
                {(event.status !== "completed" && event.status !== "skipped") ||
                 ((event.id === "demo" || event.id === "readiness") && event.status === "completed") ||
                 (event.id === "decision" && event.status === "completed") ? (
                  <ActionZone
                    event={event}
                    onAction={(action) => onAction(event.id, action)}
                    onFileUploaded={onFileUploaded}
                    onFileCleared={onFileCleared}
                    existingFile={existingFile}
                    showDeveloperSelection={event.id === "decision" ? showDeveloperSelection : false}
                    showEmailDraft={event.id === "decision" ? showEmailDraft : false}
                    selectedDeveloper={selectedDeveloper}
                    showNotAFitEmail={event.id === "decision" ? showNotAFitEmail : false}
                    decisionMade={event.id === "decision" ? decisionMade : null}
                  />
                ) : null}

                {/* Artifacts */}
                <ArtifactsSection event={event} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Timeline({ events }: TimelineProps) {
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(
    new Set(events.filter(e => e.isCollapsed).map(e => e.id))
  )
  const [completedStages, setCompletedStages] = useState<Set<string>>(
    new Set(events.filter(e => e.status === "completed").map(e => e.id))
  )
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile>>({})
  const [showDeveloperSelection, setShowDeveloperSelection] = useState(false)
  const [selectedDeveloper, setSelectedDeveloper] = useState<string | null>(null)
  const [showEmailDraft, setShowEmailDraft] = useState(false)
  const [showNotAFitEmail, setShowNotAFitEmail] = useState(false)
  const [leadRejected, setLeadRejected] = useState(false)
  const [decisionMade, setDecisionMade] = useState<string | null>(null)

  const completedCount = completedStages.size
  const totalCount = events.length
  const progressPercentage = (completedCount / totalCount) * 100

  const handleToggleCollapse = (id: string) => {
    setCollapsedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleAction = (eventId: string, action: string) => {
    console.log(`Action triggered: ${action} for event ${eventId}`)

    // Handle scoping decision - show developer selection
    if (action === 'proceed' && eventId === 'decision') {
      setShowDeveloperSelection(true)
      return
    }

    // Handle developer selection
    if (action.startsWith('select_developer_')) {
      const developer = action.replace('select_developer_', '')
      console.log(`Selected developer: ${developer}`)
      setSelectedDeveloper(developer)
      setShowDeveloperSelection(false)
      setShowEmailDraft(true)
      return
    }

    // Handle email sent
    if (action === 'email_sent' && eventId === 'decision') {
      console.log('Email sent - completing decision stage')
      setShowEmailDraft(false)
      setDecisionMade(`proceed_${selectedDeveloper}`) // Track the decision with developer
      setSelectedDeveloper(null)

      // Mark decision stage as completed and advance to scoping
      setCompletedStages(prev => new Set(prev).add('decision'))
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.add('decision') // Collapse decision stage
        newSet.delete('scoping-prep') // Expand scoping prep stage (now above scoping)
        return newSet
      })
      return
    }

    // Handle rejection - show not a fit email
    if (action === 'reject' && eventId === 'decision') {
      console.log('Lead marked as not a fit - showing email draft')
      setShowNotAFitEmail(true)
      return
    }

    // Handle not a fit email sent
    if (action === 'not_a_fit_email_sent' && eventId === 'decision') {
      console.log('Not a fit email sent - completing decision and marking lead as rejected')
      setShowNotAFitEmail(false)
      setLeadRejected(true)
      setDecisionMade('reject') // Track the rejection decision
      setCompletedStages(prev => new Set(prev).add('decision'))
      return
    }

    // Handle restart decision
    if (action === 'restart_decision' && eventId === 'decision') {
      console.log('Restarting decision stage')
      setDecisionMade(null)
      setLeadRejected(false)
      setShowDeveloperSelection(false)
      setShowEmailDraft(false)
      setShowNotAFitEmail(false)
      setSelectedDeveloper(null)
      setCompletedStages(prev => {
        const newSet = new Set(prev)
        newSet.delete('decision') // Mark as not completed
        return newSet
      })
      return
    }

    // Simulate automation delay for demo purposes
    if (action === 'automated') {
      setTimeout(() => {
        console.log(`Automation completed for ${eventId}`)
      }, 2000)
    }
  }

  const handleFileUploaded = (file: UploadedFile) => {
    console.log(`File uploaded: ${file.fileName} for ${file.fileTypeId}`)

    // Store the uploaded file
    setUploadedFiles(prev => ({
      ...prev,
      [file.fileTypeId]: file
    }))

    // If demo call transcript is uploaded, mark demo stage as completed
    if (file.fileTypeId === 'demo-call-transcript') {
      console.log('Demo call transcript uploaded - marking stage as completed')

      // Mark demo stage as completed
      setCompletedStages(prev => new Set(prev).add('demo'))

      // Collapse the demo stage and expand the next stage (readiness)
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.add('demo') // Collapse demo stage
        newSet.delete('readiness') // Expand readiness stage
        return newSet
      })
    }

    // If readiness assessment is uploaded, mark readiness stage as completed
    if (file.fileTypeId === 'readiness-pdf') {
      console.log('Readiness assessment uploaded - marking stage as completed')

      // Mark readiness stage as completed
      setCompletedStages(prev => new Set(prev).add('readiness'))

      // Collapse the readiness stage and expand the next stage (decision)
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.add('readiness') // Collapse readiness stage
        newSet.delete('decision') // Expand decision stage
        return newSet
      })
    }
  }

  const handleFileCleared = (fileTypeId: string) => {
    console.log(`File cleared: ${fileTypeId}`)

    // Remove the specific uploaded file from state
    setUploadedFiles(prev => {
      const updated = { ...prev }
      delete updated[fileTypeId]
      return updated
    })

    // If demo call transcript is cleared, mark demo stage as pending
    if (fileTypeId === 'demo-call-transcript') {
      console.log('Demo call transcript cleared - marking stage as pending')

      // Remove demo stage from completed stages
      setCompletedStages(prev => {
        const newSet = new Set(prev)
        newSet.delete('demo')
        return newSet
      })

      // Expand the demo stage and collapse the readiness stage
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete('demo') // Expand demo stage
        newSet.add('readiness') // Collapse readiness stage
        return newSet
      })
    }

    // If readiness assessment is cleared, mark readiness stage as pending
    if (fileTypeId === 'readiness-pdf') {
      console.log('Readiness assessment cleared - marking stage as pending')

      // Remove readiness stage from completed stages
      setCompletedStages(prev => {
        const newSet = new Set(prev)
        newSet.delete('readiness')
        return newSet
      })

      // Expand the readiness stage and collapse the decision stage
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete('readiness') // Expand readiness stage
        newSet.add('decision') // Collapse decision stage
        return newSet
      })
    }
  }

  // Update events with current collapse and completion state
  const updatedEvents = events.map(event => {
    // If lead is rejected and this is a stage after decision, mark as not applicable
    if (leadRejected && event.id !== "demo" && event.id !== "readiness" && event.id !== "decision") {
      return {
        ...event,
        isCollapsed: true,
        status: "skipped" as const,
        description: "Not applicable - Lead marked as not a fit"
      }
    }

    return {
      ...event,
      isCollapsed: collapsedItems.has(event.id),
      status: completedStages.has(event.id) ? "completed" as const : event.status
    }
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Onboarding Timeline</CardTitle>
          <div className="text-sm text-muted-foreground">
            {completedCount} of {totalCount} completed
          </div>
        </div>
        <ProgressBar percentage={progressPercentage} />
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {updatedEvents.map((event, index) => {
            // Determine which file to show based on the event type
            let existingFile = undefined
            if (event.type === "demo") {
              existingFile = uploadedFiles['demo-call-transcript']
            } else if (event.type === "readiness") {
              existingFile = uploadedFiles['readiness-pdf']
            }

            return (
              <StageCard
                key={event.id}
                event={event}
                index={index}
                isLast={index === updatedEvents.length - 1}
                nextEvent={updatedEvents[index + 1]}
                onToggleCollapse={handleToggleCollapse}
                onAction={handleAction}
                onFileUploaded={handleFileUploaded}
                onFileCleared={handleFileCleared}
                existingFile={existingFile}
                showDeveloperSelection={event.id === "decision" ? showDeveloperSelection : false}
                showEmailDraft={event.id === "decision" ? showEmailDraft : false}
                selectedDeveloper={selectedDeveloper}
                showNotAFitEmail={event.id === "decision" ? showNotAFitEmail : false}
                decisionMade={decisionMade}
              />
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}