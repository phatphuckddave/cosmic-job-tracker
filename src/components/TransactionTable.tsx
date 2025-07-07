import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { IndTransactionRecord } from '@/lib/pbtypes';
import { formatISK } from '@/utils/priceUtils';
import { Edit, Save, X, Trash2 } from 'lucide-react';

interface TransactionTableProps {
  title: string;
  transactions: IndTransactionRecord[];
  type: 'expenditure' | 'income';
  onUpdateTransaction: (transactionId: string, updates: Partial<IndTransactionRecord>) => void;
  onDeleteTransaction: (transactionId: string) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  title,
  transactions,
  type,
  onUpdateTransaction,
  onDeleteTransaction
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<IndTransactionRecord | null>(null);

  // Sort transactions by date descending
  const sortedTransactions = [...transactions].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalAmount = sortedTransactions.reduce((sum, tx) => sum + tx.totalPrice, 0);

  const handleEdit = (transaction: IndTransactionRecord) => {
    setEditingId(transaction.id);
    setEditingTransaction({ ...transaction });
  };

  const handleSave = () => {
    if (editingTransaction && editingId) {
      onUpdateTransaction(editingId, editingTransaction);
      setEditingId(null);
      setEditingTransaction(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingTransaction(null);
  };

  const handleDelete = (transactionId: string, event: React.MouseEvent) => {
    if (event.shiftKey) {
      onDeleteTransaction(transactionId);
    } else if (confirm('Are you sure you want to delete this transaction?')) {
      onDeleteTransaction(transactionId);
    }
  };

  const updateEditingField = (field: keyof IndTransactionRecord, value: any) => {
    if (editingTransaction) {
      setEditingTransaction({
        ...editingTransaction,
        [field]: value
      });
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-700 text-white">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-blue-400">{title}</CardTitle>
          <Badge variant={type === 'expenditure' ? 'destructive' : 'default'}>
            Total: {formatISK(totalAmount)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No transactions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Date</TableHead>
                  <TableHead className="text-gray-300">Item</TableHead>
                  <TableHead className="text-gray-300">Qty</TableHead>
                  <TableHead className="text-gray-300">Unit Price</TableHead>
                  <TableHead className="text-gray-300">Total</TableHead>
                  <TableHead className="text-gray-300">Buyer/Seller</TableHead>
                  <TableHead className="text-gray-300">Location</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="border-gray-700">
                    <TableCell className="text-gray-300">
                      {editingId === transaction.id ? (
                        <Input
                          type="datetime-local"
                          value={editingTransaction?.date ? new Date(editingTransaction.date).toISOString().slice(0, 16) : ''}
                          onChange={(e) => updateEditingField('date', e.target.value)}
                          className="bg-gray-800 border-gray-600 text-white text-xs"
                        />
                      ) : (
                        new Date(transaction.date).toLocaleString('sv-SE', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        }).replace(' ', ' ')
                      )}
                    </TableCell>
                    <TableCell className="text-white">
                      {editingId === transaction.id ? (
                        <Input
                          value={editingTransaction?.itemName || ''}
                          onChange={(e) => updateEditingField('itemName', e.target.value)}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      ) : (
                        transaction.itemName
                      )}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {editingId === transaction.id ? (
                        <Input
                          type="number"
                          value={editingTransaction?.quantity || 0}
                          onChange={(e) => updateEditingField('quantity', parseInt(e.target.value) || 0)}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      ) : (
                        transaction.quantity.toLocaleString()
                      )}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {editingId === transaction.id ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editingTransaction?.unitPrice || 0}
                          onChange={(e) => updateEditingField('unitPrice', parseFloat(e.target.value) || 0)}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      ) : (
                        formatISK(transaction.unitPrice)
                      )}
                    </TableCell>
                    <TableCell className={`font-semibold ${type === 'expenditure' ? 'text-red-400' : 'text-green-400'}`}>
                      {editingId === transaction.id ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editingTransaction?.totalPrice || 0}
                          onChange={(e) => updateEditingField('totalPrice', parseFloat(e.target.value) || 0)}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      ) : (
                        formatISK(transaction.totalPrice)
                      )}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {editingId === transaction.id ? (
                        <Input
                          value={editingTransaction?.buyer || ''}
                          onChange={(e) => updateEditingField('buyer', e.target.value)}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      ) : (
                        transaction.buyer || '-'
                      )}
                    </TableCell>
                    <TableCell className="text-gray-300 max-w-32 truncate">
                      {editingId === transaction.id ? (
                        <Input
                          value={editingTransaction?.location || ''}
                          onChange={(e) => updateEditingField('location', e.target.value)}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      ) : (
                        <span title={transaction.location}>{transaction.location || '-'}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {editingId === transaction.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleSave}
                              className="border-green-600 hover:bg-green-700 p-1"
                            >
                              <Save className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancel}
                              className="border-gray-600 hover:bg-gray-700 p-1"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(transaction)}
                              className="border-gray-600 hover:bg-gray-700 p-1"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => handleDelete(transaction.id, e)}
                              className="p-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionTable;
