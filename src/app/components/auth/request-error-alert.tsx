import { Alert, AlertDescription } from "@/components/ui/alert";

type RequestErrorAlertProps = {
  message: string;
};

const RequestErrorAlert = ({ message }: RequestErrorAlertProps) => {
  return (
    <Alert variant="destructive">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};

export default RequestErrorAlert;
