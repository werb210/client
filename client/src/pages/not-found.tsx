import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-modern-primary">
      <Card className="w-full max-w-md mx-4 card-modern">
        <CardContent className="p-modern-xl">
          <div className="flex items-center gap-modern-md mb-modern-lg">
            <AlertCircle className="h-8 w-8 text-error-500" />
            <h1 className="heading-modern-h2 text-modern-primary">404 Page Not Found</h1>
          </div>

          <p className="body-modern-small text-modern-secondary">
            Did you forget to add the page to the router?
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
