import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { parseTransactionData, deduplicateTransactions } from '@/utils/transactionParser';
import { IndTransactionRecord } from '@/types';
import { formatISK } from '@/utils/currency';

interface TransactionImportFormProps {
  onImport: (transactions: Omit<IndTransactionRecord, 'id' | 'created' | 'updated' | 'job'>[]) => void;
  existingTransactions: IndTransactionRecord[];
  title?: string;
  type: 'income' | 'expenditure';
}

export function TransactionImportForm({ 
  onImport, 
  existingTransactions, 
  title,
  type 
}: TransactionImportFormProps) {
  const [rawData, setRawData] = useState('');
  const [parsedTransactions, setParsedTransactions] = useState<Omit<IndTransactionRecord, 'id' | 'created' | 'updated' | 'job'>[]>([]);
  const [duplicateCount, setDuplicateCount] = useState(0);

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedData = e.clipboardData.getData('text');
    setRawData(pastedData);
    
    const parsed = parseTransactionData(pastedData);
    const deduplicated = deduplicateTransactions(existingTransactions, parsed);
    
    setParsedTransactions(deduplicated);
    setDuplicateCount(parsed.length - deduplicated.length);
  };

  const handleManualChange = (value: string) => {
    setRawData(value);
    
    if (value.trim()) {
      const parsed = parseTransactionData(value);
      const deduplicated = deduplicateTransactions(existingTransactions, parsed);
      
      setParsedTransactions(deduplicated);
      setDuplicateCount(parsed.length - deduplicated.length);
    } else {
      setParsedTransactions([]);
      setDuplicateCount(0);
    }
  };

  const handleImport = () => {
    onImport(parsedTransactions);
    setRawData('');
    setParsedTransactions([]);
    setDuplicateCount(0);
  };

  const handleClear = () => {
    setRawData('');
    setParsedTransactions([]);
    setDuplicateCount(0);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          {title || `Import ${type === 'income' ? 'Income' : 'Expenditure'} Transactions`}
          {parsedTransactions.length > 0 && (
            <Badge variant="secondary">
              {parsedTransactions.length} new
            </Badge>
          )}
          {duplicateCount > 0 && (
            <Badge variant="outline">
              {duplicateCount} duplicates filtered
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            placeholder="Paste transaction data here (Ctrl+V) or type manually..."
            value={rawData}
            onChange={(e) => handleManualChange(e.target.value)}
            onPaste={handlePaste}
            className="min-h-[120px] font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Expected format: Date	Quantity	Item	Unit Price	Total Price	Buyer	Location	Corporation	Wallet
          </p>
        </div>

        {parsedTransactions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Preview ({parsedTransactions.length} transactions):</h4>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {parsedTransactions.slice(0, 5).map((tx, index) => (
                <div key={index} className="text-sm p-2 bg-muted rounded flex justify-between">
                  <span>{tx.quantity} × {tx.itemName}</span>
                  <span className="font-mono">{formatISK(tx.totalPrice)}</span>
                </div>
              ))}
              {parsedTransactions.length > 5 && (
                <div className="text-xs text-muted-foreground text-center">
                  ... and {parsedTransactions.length - 5} more
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleImport} 
            disabled={parsedTransactions.length === 0}
            className="flex-1"
          >
            Import {parsedTransactions.length} Transactions
          </Button>
          <Button 
            onClick={handleClear} 
            variant="outline"
            disabled={!rawData.trim()}
          >
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}