import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, LucideIcon } from "lucide-react"

interface ComingSoonProps {
  departmentName: string
  departmentIcon: string | LucideIcon
  description: string
  features: string[]
}

export function ComingSoon({ departmentName, departmentIcon, description, features }: ComingSoonProps) {
  const IconComponent = typeof departmentIcon === 'string' ? null : departmentIcon

  return (
    <div className="p-8 bg-muted/30">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="mb-4 flex justify-center">
            {IconComponent ? (
              <IconComponent className="w-16 h-16 text-[#407B9D]" />
            ) : (
              <div className="text-6xl">{departmentIcon}</div>
            )}
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {departmentName} Console
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {description}
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              We&apos;re building an AI-powered console for {departmentName} that will revolutionize how you work.
              Here&apos;s what&apos;s coming:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 text-left">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}