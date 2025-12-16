import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getValidatedSession } from "@/lib/auth/getValidatedSession";

export default async function SettingsPage() {
  await getValidatedSession();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Update your account information</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Settings functionality coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
