import React, { useState, useEffect } from 'react';
import { 
  useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel,
  flexRender, ColumnDef, SortingState, ColumnFiltersState
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Eye, Download } from 'lucide-react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const generateMockSubmissions = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `sub-${i + 1}`,
    userId: `user-${Math.floor(Math.random() * 500) + 1}`,
    userName: `Test User ${Math.floor(Math.random() * 500) + 1}`,
    email: `test${Math.floor(Math.random() * 500)}@example.com`,
    completedAt: new Date(Date.now() - Math.random() * 86400000 * 30),
    timeTaken: `${Math.floor(Math.random() * 10) + 1}m ${Math.floor(Math.random() * 59)}s`,
    rewardEarned: 150,
    isFlagged: Math.random() > 0.95
  }));
};

export default function SurveySubmissionsPage() {
  const [searchParams] = useSearchParams();
  const surveyId = searchParams.get('surveyId') || 'unknown';
  
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setData(generateMockSubmissions(42));
      setIsLoading(false);
    }, 800);
  }, [surveyId]);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'userName',
      header: 'Participant',
      cell: ({ row }) => {
        const sub = row.original;
        return (
          <div className="flex items-center space-x-3">
            <div className="flex flex-col">
              <Link to={`/users/${sub.userId}`} className="font-medium hover:underline text-sm truncate max-w-[150px]">
                {sub.userName}
              </Link>
              <span className="text-xs text-muted-foreground">{sub.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'completedAt',
      header: 'Completed At',
      cell: ({ row }) => <div className="text-sm">{format(row.getValue('completedAt'), 'MMM d, yyyy HH:mm')}</div>,
    },
    {
      accessorKey: 'timeTaken',
      header: 'Time Taken',
      cell: ({ row }) => <div className="text-sm text-muted-foreground">{row.getValue('timeTaken')}</div>,
    },
    {
      accessorKey: 'rewardEarned',
      header: 'Earned',
      cell: ({ row }) => <div className="text-sm font-medium text-primary">+{row.getValue<number>('rewardEarned')} Berry</div>,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        return (
          <Button variant="outline" size="sm" className="h-8">
            <Eye className="w-4 h-4 mr-2" /> View Answers
          </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, columnFilters },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/surveys"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Survey Submissions</h2>
          <p className="text-muted-foreground">Responses for survey ID: <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">{surveyId}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-primary mb-1">Total Completions</p>
            <h3 className="text-3xl font-bold">{isLoading ? <Skeleton className="h-8 w-16" /> : "3,204"}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Avg Time Taken</p>
            <h3 className="text-3xl font-bold">{isLoading ? <Skeleton className="h-8 w-16" /> : "4m 12s"}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Reward Distributed</p>
            <h3 className="text-3xl font-bold text-primary">{isLoading ? <Skeleton className="h-8 w-24" /> : "480,600 Berry"}</h3>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card border rounded-lg shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search participants..."
              value={(table.getColumn('userName')?.getFilterValue() as string) ?? ''}
              onChange={(event) => table.getColumn('userName')?.setFilterValue(event.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <Button variant="outline" className="hidden sm:flex">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="h-10 text-xs uppercase tracking-wider">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((_, colIdx) => (
                      <TableCell key={colIdx}><Skeleton className="h-6 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-48 text-center">
                    <p className="text-muted-foreground">No submissions found.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 border-t flex items-center justify-between">
          <div className="flex-1 text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
