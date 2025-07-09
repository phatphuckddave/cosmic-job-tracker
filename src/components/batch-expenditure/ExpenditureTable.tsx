
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatISK } from '@/utils/priceUtils';
import { IndJob } from '@/lib/types';

interface TransactionGroup {
  itemName: string;
  transactions: any[];
  totalQuantity: number;
  totalValue: number;
}

interface ExpenditureTableProps {
  transactionGroups: TransactionGroup[];
  jobs: IndJob[];
  eligibleJobs: IndJob[];
  onAssignJob: (groupIndex: number, jobId: string) => void;
}

const ExpenditureTable: React.FC<ExpenditureTableProps> = ({
  transactionGroups,
  jobs,
  eligibleJobs,
  onAssignJob
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-700">
          <TableHead className="text-gray-300">Material</TableHead>
          <TableHead className="text-gray-300">Quantity</TableHead>
          <TableHead className="text-gray-300">Total Cost</TableHead>
          <TableHead className="text-gray-300">Assign To Job</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactionGroups.map((group, index) => {
          const autoAssigned = group.transactions[0]?.assignedJobId;
          const isDuplicate = group.transactions[0]?.isDuplicate;
          const matchingJob = autoAssigned ? jobs.find(j => j.id === autoAssigned) : undefined;

          return (
            <TableRow
              key={`${group.itemName}-${index}`}
              className={`border-gray-700 ${isDuplicate ? 'bg-red-900/30' : ''}`}
            >
              <TableCell className="text-white flex items-center gap-2">
                {group.itemName}
                {isDuplicate && (
                  <Badge variant="destructive" className="bg-red-600">
                    Duplicate
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-gray-300">
                {group.totalQuantity.toLocaleString()}
              </TableCell>
              <TableCell className="text-red-400">
                {formatISK(group.totalValue)}
              </TableCell>
              <TableCell>
                {isDuplicate ? (
                  <div className="text-red-400 text-sm">
                    Transaction already exists
                  </div>
                ) : (
                  <Select
                    value={group.transactions[0]?.assignedJobId || ''}
                    onValueChange={(value) => onAssignJob(index, value)}
                  >
                    <SelectTrigger
                      className={`bg-gray-800 border-gray-600 text-white ${autoAssigned ? 'border-green-600' : ''}`}
                    >
                      <SelectValue placeholder={autoAssigned ? `Auto-assigned to ${matchingJob?.outputItem}` : 'Select a job'} />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {eligibleJobs
                        .filter(job => 
                          job.billOfMaterials?.some(item => 
                            item.name.toLowerCase().includes(group.itemName.toLowerCase())
                          )
                        )
                        .map(job => (
                          <SelectItem
                            key={job.id}
                            value={job.id}
                            className="text-white"
                          >
                            {job.outputItem} (Acquisition)
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default ExpenditureTable;
