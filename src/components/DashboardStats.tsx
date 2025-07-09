
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Factory, TrendingUp, Briefcase, BarChart3 } from 'lucide-react';
import { formatISK } from '@/utils/priceUtils';
import RecapPopover from './RecapPopover';
import { IndJob } from '@/lib/types';

interface DashboardStatsProps {
  totalJobs: number;
  totalRevenue: number;
  totalProfit: number;
  jobs: IndJob[];
  calculateJobRevenue: (job: IndJob) => number;
  calculateJobProfit: (job: IndJob) => number;
  onTotalRevenueChart: () => void;
  onTotalProfitChart: () => void;
}

const DashboardStats = ({
  totalJobs,
  totalRevenue,
  totalProfit,
  jobs,
  calculateJobRevenue,
  calculateJobProfit,
  onTotalRevenueChart,
  onTotalProfitChart
}: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-gray-900 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="w-5 h-5" />
            Active Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalJobs}</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-900 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Total Revenue
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 ml-auto"
              onClick={onTotalRevenueChart}
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RecapPopover
            title="Revenue Breakdown"
            jobs={jobs}
            calculateJobValue={calculateJobRevenue}
          >
            <div className="text-2xl font-bold text-green-400 cursor-pointer hover:text-green-300 transition-colors">
              {formatISK(totalRevenue)}
            </div>
          </RecapPopover>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-900 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Total Profit
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 ml-auto"
              onClick={onTotalProfitChart}
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RecapPopover
            title="Profit Breakdown"
            jobs={jobs}
            calculateJobValue={calculateJobProfit}
          >
            <div className={`text-2xl font-bold cursor-pointer transition-colors ${totalProfit >= 0 ? 'text-green-400 hover:text-green-300' : 'text-red-400 hover:text-red-300'}`}>
              {formatISK(totalProfit)}
            </div>
          </RecapPopover>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
