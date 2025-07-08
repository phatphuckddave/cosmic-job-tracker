
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useClipboard = () => {
  const [copying, setCopying] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, key: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopying(key);
      toast({
        title: "Copied!",
        description: successMessage,
        duration: 2000,
      });
      setTimeout(() => setCopying(null), 1000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  return { copying, copyToClipboard };
};
