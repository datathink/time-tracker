import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldX } from "lucide-react";

interface AccessDeniedProps {
  message?: string;
}

export function AccessDenied({
  message = "You do not have permission to access this page.",
}: AccessDeniedProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldX className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}
