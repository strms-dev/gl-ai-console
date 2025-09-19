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

  // Special handling for scoping call file upload
  if (event.type === "scoping" && event.actions.manual?.label.includes("Upload")) {
    const scopingTranscriptFileType = getFileTypeById('scoping-call-transcript')
    if (scopingTranscriptFileType) {
      return (
        <div className="mt-4">
          <FileUpload
            fileType={scopingTranscriptFileType}
            existingFile={existingFile}
            onFileUploaded={onFileUploaded}
            onFileCleared={() => onFileCleared?.('scoping-call-transcript')}
          />
        </div>
      )
    }
  }

  // Special handling for developer overview file upload
  if (event.type === "dev-overview" && event.actions.manual?.label.includes("Upload")) {
    const devOverviewFileType = getFileTypeById('developer-audio-overview')
    if (devOverviewFileType) {
      return (
        <div className="mt-4">
          <FileUpload
            fileType={devOverviewFileType}
            existingFile={existingFile}
            onFileUploaded={onFileUploaded}
            onFileCleared={() => onFileCleared?.('developer-audio-overview')}
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

  // Special handling for scoping prep document stage
  if (event.type === "scoping-prep") {
    const scopingPrepFileType = getFileTypeById('scoping-prep-doc')
    if (scopingPrepFileType) {
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
                AI will generate a scoping prep document based on demo insights and readiness assessment
              </p>
            </div>
          )}

          {/* Manual Upload Option */}
          <div>
            <div className="mb-2">
              <p className="text-sm font-medium text-foreground">Or upload manually:</p>
            </div>
            <FileUpload
              fileType={scopingPrepFileType}
              existingFile={existingFile}
              onFileUploaded={onFileUploaded}
              onFileCleared={() => onFileCleared?.('scoping-prep-doc')}
            />
          </div>
        </div>
      )
    }
  }

  // Special handling for N8N workflow description stage
  if (event.type === "workflow-docs") {
    const workflowDescriptionFileType = getFileTypeById('workflow-description')
    if (workflowDescriptionFileType) {
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
                AI will generate a natural language description of the n8n workflow
              </p>
            </div>
          )}

          {/* Manual Upload Option */}
          <div>
            <div className="mb-2">
              <p className="text-sm font-medium text-foreground">Or upload manually:</p>
            </div>
            <FileUpload
              fileType={workflowDescriptionFileType}
              existingFile={existingFile}
              onFileUploaded={onFileUploaded}
              onFileCleared={() => onFileCleared?.('workflow-description')}
            />

            {/* Developer Note */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800 font-medium mb-2">💡 Developer Note:</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                Pass this description to a custom GPT to identify any gaps or missing edge cases that should be included.
                Then use the updated description with Claude Desktop and the n8n MCP to get a starting point for this automation in n8n.
              </p>
            </div>
          </div>
        </div>
      )
    }
  }

  // Special handling for Sprint Length & Price Estimate stage
  if (event.type === "sprint-pricing") {
    const sprintPricingFileType = getFileTypeById('sprint-pricing-estimate')
    if (sprintPricingFileType) {
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
                AI will generate sprint planning and pricing estimates based on project requirements
              </p>
            </div>
          )}

          {/* Manual Upload Option */}
          <div>
            <div className="mb-2">
              <p className="text-sm font-medium text-foreground">Or upload manually:</p>
            </div>
            <FileUpload
              fileType={sprintPricingFileType}
              existingFile={existingFile}
              onFileUploaded={onFileUploaded}
              onFileCleared={() => onFileCleared?.('sprint-pricing-estimate')}
            />
          </div>
        </div>
      )
    }
  }

  // Special handling for Internal & Client Documentation stage
  if (event.type === "internal-client-docs") {
    const internalClientDocsFileType = getFileTypeById('internal-client-documentation')
    if (internalClientDocsFileType) {
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
                AI will generate comprehensive scoping document for both internal team and client reference
              </p>
            </div>
          )}

          {/* Manual Upload Option */}
          <div>
            <div className="mb-2">
              <p className="text-sm font-medium text-foreground">Or upload manually:</p>
            </div>
            <FileUpload
              fileType={internalClientDocsFileType}
              existingFile={existingFile}
              onFileUploaded={onFileUploaded}
              onFileCleared={() => onFileCleared?.('internal-client-documentation')}
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

      {/* Decision Options - Handle both scoping decision and proposal decision */}
      {event.actions.decision && !showDeveloperSelection && !showNotAFitEmail && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-semibold text-gray-700 mb-4 text-center">
            {event.type === "proposal-decision" ? "📋 What's the client's response?" : "📋 Ready to make a decision?"}
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
                    ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0"
                    : option.variant === "destructive"
                    ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0"
                    : option.variant === "secondary"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
                    : "border-2 hover:bg-gray-50"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  {option.label}
                </span>
              </Button>
            ))}
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">
            {event.type === "proposal-decision"
              ? "This will determine how to proceed with the client engagement"
              : "This decision will determine the next steps in your client onboarding process"}
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

                {/* Action Zone - Show for non-completed stages OR for demo/readiness/scoping-prep/scoping/dev-overview/workflow-docs/sprint-pricing/internal-client-docs stages with uploaded files OR for completed decision/proposal-decision stages */}
                {(event.status !== "completed" && event.status !== "skipped") ||
                 ((event.id === "demo" || event.id === "readiness" || event.id === "scoping-prep" || event.id === "scoping" || event.id === "dev-overview" || event.id === "workflow-docs" || event.id === "sprint-pricing" || event.id === "internal-client-docs") && event.status === "completed") ||
                 ((event.id === "decision" || event.id === "proposal-decision") && event.status === "completed") ? (
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

    // Handle proposal decision actions
    if (eventId === 'proposal-decision') {
      console.log(`Proposal decision: ${action}`)

      // Mark proposal-decision stage as completed regardless of decision
      setCompletedStages(prev => new Set(prev).add('proposal-decision'))

      if (action === 'accept') {
        console.log('Proposal accepted - proceeding to Internal & Client Scoping Document')
        // Advance to Internal & Client Scoping Document
        setCollapsedItems(prev => {
          const newSet = new Set(prev)
          newSet.add('proposal-decision') // Collapse proposal-decision stage
          newSet.delete('internal-client-docs') // Expand internal-client-docs stage
          return newSet
        })
      } else if (action === 'decline') {
        console.log('Proposal declined - marking remaining stages as skipped')
        // Mark all remaining stages as skipped
        // This would typically end the onboarding process
      } else if (action === 'adjust') {
        console.log('Proposal adjusted and accepted - proceeding to Internal & Client Scoping Document')
        // Advance to Internal & Client Scoping Document
        setCollapsedItems(prev => {
          const newSet = new Set(prev)
          newSet.add('proposal-decision') // Collapse proposal-decision stage
          newSet.delete('internal-client-docs') // Expand internal-client-docs stage
          return newSet
        })
      }
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

    // If scoping prep document is uploaded, mark scoping prep stage as completed
    if (file.fileTypeId === 'scoping-prep-doc') {
      console.log('Scoping prep document uploaded - marking stage as completed')

      // Mark scoping prep stage as completed
      setCompletedStages(prev => new Set(prev).add('scoping-prep'))

      // Collapse the scoping prep stage and expand the next stage (scoping)
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.add('scoping-prep') // Collapse scoping prep stage
        newSet.delete('scoping') // Expand scoping stage
        return newSet
      })
    }

    // If scoping call transcript is uploaded, mark scoping stage as completed
    if (file.fileTypeId === 'scoping-call-transcript') {
      console.log('Scoping call transcript uploaded - marking stage as completed')

      // Mark scoping stage as completed
      setCompletedStages(prev => new Set(prev).add('scoping'))

      // Collapse the scoping stage and expand the next stage (dev-overview)
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.add('scoping') // Collapse scoping stage
        newSet.delete('dev-overview') // Expand dev-overview stage
        return newSet
      })
    }

    // If developer overview is uploaded, mark dev-overview stage as completed
    if (file.fileTypeId === 'developer-audio-overview') {
      console.log('Developer overview uploaded - marking stage as completed')

      // Mark dev-overview stage as completed
      setCompletedStages(prev => new Set(prev).add('dev-overview'))

      // Collapse the dev-overview stage and expand the next stage (workflow-docs)
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.add('dev-overview') // Collapse dev-overview stage
        newSet.delete('workflow-docs') // Expand workflow-docs stage
        return newSet
      })
    }

    // If N8N workflow description is uploaded, mark workflow-docs stage as completed
    if (file.fileTypeId === 'workflow-description') {
      console.log('N8N workflow description uploaded - marking stage as completed')

      // Mark workflow-docs stage as completed
      setCompletedStages(prev => new Set(prev).add('workflow-docs'))

      // Collapse the workflow-docs stage and expand the next stage (sprint-pricing)
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.add('workflow-docs') // Collapse workflow-docs stage
        newSet.delete('sprint-pricing') // Expand sprint-pricing stage
        return newSet
      })
    }

    // If Sprint Length & Price Estimate is uploaded, mark sprint-pricing stage as completed
    if (file.fileTypeId === 'sprint-pricing-estimate') {
      console.log('Sprint Length & Price Estimate uploaded - marking stage as completed')

      // Mark sprint-pricing stage as completed
      setCompletedStages(prev => new Set(prev).add('sprint-pricing'))

      // Collapse the sprint-pricing stage and expand the next stage (proposal)
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.add('sprint-pricing') // Collapse sprint-pricing stage
        newSet.delete('proposal') // Expand proposal stage
        return newSet
      })
    }

    // If Internal & Client Scoping Document is uploaded, mark internal-client-docs stage as completed
    if (file.fileTypeId === 'internal-client-documentation') {
      console.log('Internal & Client Scoping Document uploaded - marking stage as completed')

      // Mark internal-client-docs stage as completed
      setCompletedStages(prev => new Set(prev).add('internal-client-docs'))

      // Collapse the internal-client-docs stage and expand the next stage (ea)
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.add('internal-client-docs') // Collapse internal-client-docs stage
        newSet.delete('ea') // Expand ea stage
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

    // If scoping prep document is cleared, mark scoping prep stage as pending
    if (fileTypeId === 'scoping-prep-doc') {
      console.log('Scoping prep document cleared - marking stage as pending')

      // Remove scoping prep stage from completed stages
      setCompletedStages(prev => {
        const newSet = new Set(prev)
        newSet.delete('scoping-prep')
        return newSet
      })

      // Expand the scoping prep stage and collapse the scoping stage
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete('scoping-prep') // Expand scoping prep stage
        newSet.add('scoping') // Collapse scoping stage
        return newSet
      })
    }

    // If scoping call transcript is cleared, mark scoping stage as pending
    if (fileTypeId === 'scoping-call-transcript') {
      console.log('Scoping call transcript cleared - marking stage as pending')

      // Remove scoping stage from completed stages
      setCompletedStages(prev => {
        const newSet = new Set(prev)
        newSet.delete('scoping')
        return newSet
      })

      // Expand the scoping stage and collapse the dev-overview stage
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete('scoping') // Expand scoping stage
        newSet.add('dev-overview') // Collapse dev-overview stage
        return newSet
      })
    }

    // If developer overview is cleared, mark dev-overview stage as pending
    if (fileTypeId === 'developer-audio-overview') {
      console.log('Developer overview cleared - marking stage as pending')

      // Remove dev-overview stage from completed stages
      setCompletedStages(prev => {
        const newSet = new Set(prev)
        newSet.delete('dev-overview')
        return newSet
      })

      // Expand the dev-overview stage and collapse the workflow-docs stage
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete('dev-overview') // Expand dev-overview stage
        newSet.add('workflow-docs') // Collapse workflow-docs stage
        return newSet
      })
    }

    // If N8N workflow description is cleared, mark workflow-docs stage as pending
    if (fileTypeId === 'workflow-description') {
      console.log('N8N workflow description cleared - marking stage as pending')

      // Remove workflow-docs stage from completed stages
      setCompletedStages(prev => {
        const newSet = new Set(prev)
        newSet.delete('workflow-docs')
        return newSet
      })

      // Expand the workflow-docs stage and collapse the sprint-pricing stage
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete('workflow-docs') // Expand workflow-docs stage
        newSet.add('sprint-pricing') // Collapse sprint-pricing stage
        return newSet
      })
    }

    // If Sprint Length & Price Estimate is cleared, mark sprint-pricing stage as pending
    if (fileTypeId === 'sprint-pricing-estimate') {
      console.log('Sprint Length & Price Estimate cleared - marking stage as pending')

      // Remove sprint-pricing stage from completed stages
      setCompletedStages(prev => {
        const newSet = new Set(prev)
        newSet.delete('sprint-pricing')
        return newSet
      })

      // Expand the sprint-pricing stage and collapse the proposal stage
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete('sprint-pricing') // Expand sprint-pricing stage
        newSet.add('proposal') // Collapse proposal stage
        return newSet
      })
    }

    // If Internal & Client Scoping Document is cleared, mark internal-client-docs stage as pending
    if (fileTypeId === 'internal-client-documentation') {
      console.log('Internal & Client Scoping Document cleared - marking stage as pending')

      // Remove internal-client-docs stage from completed stages
      setCompletedStages(prev => {
        const newSet = new Set(prev)
        newSet.delete('internal-client-docs')
        return newSet
      })

      // Expand the internal-client-docs stage and collapse the ea stage
      setCollapsedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete('internal-client-docs') // Expand internal-client-docs stage
        newSet.add('ea') // Collapse ea stage
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
            } else if (event.type === "scoping-prep") {
              existingFile = uploadedFiles['scoping-prep-doc']
            } else if (event.type === "scoping") {
              existingFile = uploadedFiles['scoping-call-transcript']
            } else if (event.type === "dev-overview") {
              existingFile = uploadedFiles['developer-audio-overview']
            } else if (event.type === "workflow-docs") {
              existingFile = uploadedFiles['workflow-description']
            } else if (event.type === "sprint-pricing") {
              existingFile = uploadedFiles['sprint-pricing-estimate']
            } else if (event.type === "internal-client-docs") {
              existingFile = uploadedFiles['internal-client-documentation']
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