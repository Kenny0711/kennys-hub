'use client';
import { useRecords } from '@/hooks/use-records';
import { useFilter } from '@/hooks/use-filter';
import FilterBar from '@/components/problems/filter-bar';
import ProblemTable from '@/components/problems/problem-table';
import { PAGE_SHELL, PageHeader } from '@/components/layout/page-header';

export default function ProblemsPage() {
  const { records, loading } = useRecords();
  const { filtered, filters, setFilter, allTags } = useFilter(records);

  return (
    <div className="min-h-screen">
      <PageHeader
        meta="Kenny's Dev Hub / Problem Archive"
        status={loading ? 'Syncing…' : `${records.length} problems`}
        title="Problem "
        accent="Set."
        description="管理你的解題記錄與學習筆記。"
      />

      <div className={`${PAGE_SHELL} space-y-6 py-12 lg:py-16`}>
        {loading ? (
          <div className="animate-pulse space-y-px border border-white/15 bg-white/15" aria-label="載入中">
            <div className="h-20 bg-surface" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 bg-surface" />
            ))}
          </div>
        ) : (
          <>
            <FilterBar
              filters={filters}
              setFilter={setFilter}
              allTags={allTags}
              total={records.length}
              filtered={filtered.length}
            />
            <ProblemTable records={filtered} />
          </>
        )}
      </div>
    </div>
  );
}
