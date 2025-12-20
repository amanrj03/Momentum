import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-background text-foreground border border-border shadow-lg rounded-xl",
          description: "text-muted-foreground text-sm",
          actionButton: "bg-primary text-primary-foreground rounded-lg hover:opacity-90",
          cancelButton: "bg-muted text-muted-foreground rounded-lg hover:opacity-90",
          success: "bg-green-100 text-green-800 border-green-300",
          error: "bg-red-50 text-red-900 border-red-200",
          warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
          info: "bg-blue-50 text-blue-900 border-blue-200",
        },
        duration: 4000,
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
