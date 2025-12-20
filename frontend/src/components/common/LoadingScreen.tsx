import { motion } from "framer-motion";

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingScreen = ({ message = "Loading...", fullScreen = true }: LoadingScreenProps) => {
  return (
    <div className={fullScreen ? "min-h-screen flex items-center justify-center bg-background" : "flex items-center justify-center h-96"}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent animate-spin" style={{ animationDuration: '2s' }}>
            <div className="absolute inset-1 rounded-full bg-background" />
          </div>
          <img 
            src="/logo.png" 
            alt="Momentum" 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8"
          />
        </div>
        {message && <p className="text-muted-foreground">{message}</p>}
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
