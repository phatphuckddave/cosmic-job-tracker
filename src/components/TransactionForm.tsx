
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { parseTransactionLine, formatISK } from '@/utils/priceUtils';
import { IndTransactionRecordNoId } from '@/lib/pbtypes';
import { Check, X } from 'lucide-react';

interface TransactionFormProps {
  jobId: string;
  onTransactionsAdded: (transactions: IndTransactionRecordNoId[], type: 'expenditure' | 'income') => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ jobId, onTransactionsAdded }) => {
  const [pastedData, setPastedData] = useState('');
  const [parsedTransactions, setParsedTransactions] = useState<IndTransactionRecordNoId[]>([]);
  const [transactionType, setTransactionType] = useState<'expenditure' | 'income'>('expenditure');

  const handlePaste = (value: string) => {
    setPastedData(value);

    const lines = value.trim().split('\n');
    const transactions: IndTransactionRecordNoId[] = [];

    lines.forEach((line, index) => {
      const parsed = parseTransactionLine(line);
      if (parsed) {
        transactions.push({
          date: parsed.date.toISOString(),
          quantity: parsed.quantity,
          itemName: parsed.itemName,
          unitPrice: parsed.unitPrice,
          totalPrice: Math.abs(parsed.totalAmount),
          buyer: parsed.buyer,
          location: parsed.location,
          corporation: parsed.corporation,
          wallet: parsed.wallet,
          job: jobId
        });
      }
    });

    setParsedTransactions(transactions);
  };

  const handleSubmit = () => {
    if (parsedTransactions.length > 0) {
      onTransactionsAdded(parsedTransactions, transactionType);
      setPastedData('');
      setParsedTransactions([]);
    }
  };

  const totalAmount = parsedTransactions.reduce((sum, tx) => sum + tx.totalPrice, 0);

  return (
    <Card className="bg-gray-900 border-gray-700 text-white">
      <CardHeader>
        <CardTitle className="text-blue-400">Add Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={transactionType} onValueChange={(value) => setTransactionType(value as 'expenditure' | 'income')}>
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="expenditure" className="data-[state=active]:bg-red-600">
              Expenditures
            </TabsTrigger>
            <TabsTrigger value="income" className="data-[state=active]:bg-green-600">
              Income
            </TabsTrigger>
          </TabsList>

          <TabsContent value={transactionType} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Paste EVE transaction data (Ctrl+V):
              </label>
              <Textarea
                value={pastedData}
                onChange={(e) => handlePaste(e.target.value)}
                placeholder="Paste your EVE transaction data here..."
                className="min-h-32 bg-gray-800 border-gray-600 text-white"
              />
            </div>

            {parsedTransactions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-blue-400 border-blue-400">
                    {parsedTransactions.length} transactions parsed
                  </Badge>
                  <Badge variant={transactionType === 'expenditure' ? 'destructive' : 'default'}>
                    Total: {formatISK(totalAmount)}
                  </Badge>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Date</TableHead>
                        <TableHead className="text-gray-300">Item</TableHead>
                        <TableHead className="text-gray-300">Qty</TableHead>
                        <TableHead className="text-gray-300">Unit Price</TableHead>
                        <TableHead className="text-gray-300">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedTransactions.map((tx, index) => (
                        <TableRow key={index} className="border-gray-700">
                          <TableCell className="text-gray-300">
                            {new Date(tx.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-white">{tx.itemName}</TableCell>
                          <TableCell className="text-gray-300">
                            {tx.quantity.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {formatISK(tx.unitPrice)}
                          </TableCell>
                          <TableCell className={`font-semibold ${transactionType === 'expenditure' ? 'text-red-400' : 'text-green-400'}`}>
                            {formatISK(tx.totalPrice)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmit}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Add Transactions
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPastedData('');
                      setParsedTransactions([]);
                    }}
                    className="border-gray-600 hover:bg-gray-800"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TransactionForm;
