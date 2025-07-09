
import { Badge } from '@/components/ui/badge';

interface ExpenditureStatsProps {
  totalExpenditures: number;
  duplicatesFound: number;
}

const ExpenditureStats: React.FC<ExpenditureStatsProps> = ({ totalExpenditures, duplicatesFound }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Badge variant="outline" className="text-blue-400 border-blue-400">
          {totalExpenditures} expenditures found
        </Badge>
        {duplicatesFound > 0 && (
          <Badge variant="outline" className="text-yellow-400 border-yellow-400">
            {duplicatesFound} duplicates found
          </Badge>
        )}
      </div>
    </div>
  );
};

export default ExpenditureStats;
