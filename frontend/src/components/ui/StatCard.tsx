import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: "up" | "down" | "neutral"
}

export function StatCard({ title, value, icon: Icon, description, trend }: StatCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-colors duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-slate-500 mt-1">
            {trend === "up" && <span className="text-success mr-1">↑</span>}
            {trend === "down" && <span className="text-destructive mr-1">↓</span>}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
