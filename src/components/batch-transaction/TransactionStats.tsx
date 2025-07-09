
import { Badge } from '@/components/ui/badge';

interface TransactionStatsProps {
  transactionCount: number;
  duplicatesFound: number;
}

const TransactionStats: React.FC<TransactionStatsProps> = ({ transactionCount, duplicatesFound }) => {
  return (
    <div className="flex items-center gap-4">
      <Badge variant="outline" className="text-blue-400 border-blue-400">
        {transactionCount} transactions found
      </Badge>
      {duplicatesFound > 0 && (
        <Badge variant="outline" className="text-yellow-400 border-yellow-400">
          {duplicatesFound} duplicates found
        </Badge>
      )}
    </div>
  );
};

export default TransactionStats;
