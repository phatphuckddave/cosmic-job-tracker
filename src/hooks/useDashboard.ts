
import { useState, useEffect, useRef } from 'react';
import { IndJob } from '@/lib/types';
import { IndTransactionRecordNoId, IndJobRecordNoId } from '@/lib/pbtypes';
import { useJobs } from '@/hooks/useDataService';

export function useDashboard() {
  const {
    jobs,
    loading,
    error,
    loadingStatuses,
    createJob,
    updateJob,
    deleteJob,
    createMultipleTransactions,
    createMultipleBillItems,
    loadJobsForStatuses
  } = useJobs();

  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<IndJob | null>(null);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [showBatchExpenditureForm, setShowBatchExpenditureForm] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalRevenueChartOpen, setTotalRevenueChartOpen] = useState(false);
  const [totalProfitChartOpen, setTotalProfitChartOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('jobGroupsCollapsed');
    return saved ? JSON.parse(saved) : {};
  });

  const scrollPositionRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      scrollPositionRef.current = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    // State
    jobs,
    loading,
    error,
    loadingStatuses,
    showJobForm,
    setShowJobForm,
    editingJob,
    setEditingJob,
    showBatchForm,
    setShowBatchForm,
    showBatchExpenditureForm,
    setShowBatchExpenditureForm,
    searchOpen,
    setSearchOpen,
    searchQuery,
    setSearchQuery,
    totalRevenueChartOpen,
    setTotalRevenueChartOpen,
    totalProfitChartOpen,
    setTotalProfitChartOpen,
    collapsedGroups,
    setCollapsedGroups,
    scrollPositionRef,
    containerRef,
    // Methods
    createJob,
    updateJob,
    deleteJob,
    createMultipleTransactions,
    createMultipleBillItems,
    loadJobsForStatuses
  };
}
