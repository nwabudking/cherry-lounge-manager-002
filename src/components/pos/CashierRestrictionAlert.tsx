import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CashierRestrictionAlertProps {
  userName?: string;
}

export const CashierRestrictionAlert = ({ userName }: CashierRestrictionAlertProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-[calc(100vh-4rem)] p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
          <ShieldAlert className="h-10 w-10 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">POS Access Restricted</h1>
          <p className="text-muted-foreground">
            {userName ? `${userName}, you are` : "You are"} not currently assigned to any bar location.
          </p>
        </div>

        <Alert className="bg-amber-500/10 border-amber-500/30 text-left">
          <Store className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-500">Bar Assignment Required</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            To process sales, you must be assigned to a bar by a manager. 
            Please contact your supervisor to get assigned to a bar location.
          </AlertDescription>
        </Alert>

        <div className="flex flex-col gap-2">
          <Button variant="outline" onClick={() => navigate("/")}>
            Go to Dashboard
          </Button>
          <p className="text-xs text-muted-foreground">
            If you believe this is an error, please contact management.
          </p>
        </div>
      </div>
    </div>
  );
};