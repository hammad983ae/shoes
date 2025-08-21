import React, { useState } from 'react';
import { useConnectionMonitor } from '../hooks/useSupabaseConnection';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { AlertCircle, CheckCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface ConnectionStatusIndicatorProps {
  showDetails?: boolean;
  className?: string;
}

export const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
  showDetails = false,
  className = ''
}) => {
  const { isConnected, connectionHistory, forceReconnect } = useConnectionMonitor();
  const [isReconnecting, setIsReconnecting] = useState(false);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      await forceReconnect();
    } finally {
      setIsReconnecting(false);
    }
  };

  const getStatusIcon = () => {
    if (isReconnecting) {
      return <RefreshCw className="h-4 w-4 animate-spin text-yellow-500" />;
    }
    
    if (isConnected) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusText = () => {
    if (isReconnecting) return 'Reconnecting...';
    if (isConnected) return 'Connected';
    return 'Disconnected';
  };

  const getStatusColor = () => {
    if (isReconnecting) return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
    if (isConnected) return 'bg-green-500/20 text-green-700 border-green-500/30';
    return 'bg-red-500/20 text-red-700 border-red-500/30';
  };

  const getLastEvent = () => {
    if (connectionHistory.length === 0) return null;
    return connectionHistory[connectionHistory.length - 1];
  };

  const lastEvent = getLastEvent();
  const timeSinceLastEvent = lastEvent 
    ? Math.floor((Date.now() - lastEvent.timestamp) / 1000)
    : null;

  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center gap-2 ${className}`}>
              {getStatusIcon()}
              <span className="text-sm font-medium">{getStatusText()}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <p className="font-medium">Connection Status</p>
              <p className="text-sm text-muted-foreground">
                {isConnected ? 'Connected to Supabase' : 'Disconnected from Supabase'}
              </p>
              {!isConnected && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReconnect}
                  disabled={isReconnecting}
                  className="mt-2 w-full"
                >
                  {isReconnecting ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                      Reconnecting...
                    </>
                  ) : (
                    <>
                      <Wifi className="h-3 w-3 mr-1" />
                      Reconnect
                    </>
                  )}
                </Button>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={`p-4 border rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          <h3 className="font-semibold">Connection Status</h3>
        </div>
        <Badge className={getStatusColor()}>
          {getStatusText()}
        </Badge>
      </div>

      <div className="space-y-3">
        {/* Current Status */}
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm">
            {isConnected 
              ? 'Successfully connected to Supabase'
              : 'Connection to Supabase lost'
            }
          </span>
        </div>

        {/* Last Event */}
        {lastEvent && (
          <div className="text-sm text-muted-foreground">
            <span>Last event: </span>
            <span className="font-medium">
              {lastEvent.event} 
              {timeSinceLastEvent !== null && (
                <span> ({timeSinceLastEvent}s ago)</span>
              )}
            </span>
          </div>
        )}

        {/* Connection History */}
        {connectionHistory.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Recent Connection Events:</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {connectionHistory.slice(-5).reverse().map((event, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${
                    event.status ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="capitalize">{event.event}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleReconnect}
            disabled={isReconnecting || isConnected}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            {isReconnecting ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                Reconnecting...
              </>
            ) : (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                Reconnect
              </>
            )}
          </Button>

          {isConnected && (
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh Page
            </Button>
          )}
        </div>

        {/* Connection Tips */}
        {!isConnected && (
          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            <p className="font-medium mb-1">Connection Tips:</p>
            <ul className="space-y-1">
              <li>• Check your internet connection</li>
              <li>• Try switching tabs and coming back</li>
              <li>• Refresh the page if the issue persists</li>
              <li>• Contact support if problems continue</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatusIndicator;
