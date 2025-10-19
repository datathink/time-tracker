import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-gray-600">View your time tracking reports and analytics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Time Summary</CardTitle>
            <CardDescription>Total hours tracked</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center py-4">
              No data available yet
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue Summary</CardTitle>
            <CardDescription>Total billable amount</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center py-4">
              No data available yet
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
