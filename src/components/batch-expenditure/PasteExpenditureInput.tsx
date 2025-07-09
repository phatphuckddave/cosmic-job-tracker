
import { useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface PasteExpenditureInputProps {
  pastedData: string;
  onPaste: (value: string) => void;
}

const PasteExpenditureInput: React.FC<PasteExpenditureInputProps> = ({ pastedData, onPaste }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto focus the textarea when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-300">
        Paste EVE expenditure data (negative amounts):
      </label>
      <Textarea
        ref={textareaRef}
        value={pastedData}
        onChange={(e) => onPaste(e.target.value)}
        placeholder="Paste your EVE expenditure transaction data here..."
        className="min-h-32 bg-gray-800 border-gray-600 text-white"
      />
    </div>
  );
};

export default PasteExpenditureInput;
