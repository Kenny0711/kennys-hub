'use client';
import { useRecords } from '@/hooks/use-records';
import { useFilter } from '@/hooks/use-filter';
import FilterBar from '@/components/problems/filter-bar';
import ProblemTable from '@/components/problems/problem-table';

export default function ProblemsPage() {
  const { records, loading } = useRecords();
  const { filtered, filters, setFilter, allTags } = useFilter(records);

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8 space-y-4">
        <div className="animate-pulse space-y-3">
          <div className="h-7 w-32 bg-white/8 rounded-lg" />
          <div className="h-4 w-48 bg-white/5 rounded-lg" />
          <div className="h-10 bg-white/5 rounded-xl mt-6" />
          <div className="h-80 bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent">
        <div className="container mx-auto px-6 py-10">
          <h1 className="text-3xl font-bold tracking-tight">題庫</h1>
          <p className="text-sm text-muted-foreground mt-1">
            管理你的解題記錄與學習筆記
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6 space-y-4">
        <FilterBar
          filters={filters}
          setFilter={setFilter}
          allTags={allTags}
          total={records.length}
          filtered={filtered.length}
        />
        <ProblemTable records={filtered} />
      </div>
    </div>
  );
}
