import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, X } from 'lucide-react';

interface SuccessMessageProps {
  title?: string;
  message: string;
  variant?: 'toast' | 'banner' | 'card';
  duration?: number;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function SuccessMessage({
  title = 'Success',
  message,
  variant = 'banner',
  duration,
  onClose,
  action,
  className,
}: SuccessMessageProps) {
  React.useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const renderCloseButton = () =>
    onClose && (
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="h-8 w-8 p-0 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </Button>
    );

  const renderActionButton = () =>
    action && (
      <Button
        variant="outline"
        size="sm"
        onClick={action.onClick}
        className="text-green-700 border-green-300 hover:bg-green-50 dark:text-green-300 dark:border-green-600 dark:hover:bg-green-900/20"
      >
        {action.label}
      </Button>
    );

  switch (variant) {
    case 'card':
      return (
        <Card
          className={cn(
            'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50',
            className
          )}
        >
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-green-800 dark:text-green-300 mb-2">
                {title}
              </h2>
              <p className="text-green-700 dark:text-green-400 mb-4">{message}</p>
              {action && (
                <Button
                  onClick={action.onClick}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {action.label}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      );

    case 'toast':
      return (
        <div
          className={cn(
            'fixed top-4 right-4 z-50 border border-green-200 bg-green-50 px-4 py-3 shadow-md dark:border-green-800 dark:bg-green-950/90',
            className
          )}
        >
          <Alert className="border-0 bg-transparent p-0">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div className="flex items-center justify-between w-full">
              <AlertDescription className="text-green-800 dark:text-green-300">
                {message}
              </AlertDescription>
              {renderCloseButton()}
            </div>
          </Alert>
        </div>
      );

    case 'banner':
    default:
      return (
        <Alert
          className={cn(
            'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50',
            className
          )}
        >
          <CheckCircle className="h-4 w-4 text-green-600" />
          <div className="flex items-center justify-between w-full">
            <div className="flex-1">
              <AlertTitle className="text-green-800 dark:text-green-300">{title}</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-400">
                {message}
              </AlertDescription>
              {action && <div className="mt-2">{renderActionButton()}</div>}
            </div>
            {renderCloseButton()}
          </div>
        </Alert>
      );
  }
}
