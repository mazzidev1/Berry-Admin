import React, { useState, useEffect } from 'react';
import { 
  useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel,
  flexRender, ColumnDef, SortingState, ColumnFiltersState
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { Search, Plus, MoreHorizontal, Copy, Edit, Trash, BarChart2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const generateMockSurveys = (count: number) => {
  const categories = ["Tech", "Health", "Finance", "Lifestyle", "General"];
  const statuses = ["active", "draft", "closed"];
  return Array.from({ length: count }).map((_, i) => ({
    id: `srv-${i + 1}`,
    title: `Customer Feedback Survey ${i + 1}`,
    category: categories[Math.floor(Math.random() * categories.length)],
    reward: Math.floor(Math.random() * 500) + 50,
    completions: Math.floor(Math.random() * 5000),
    targetLimit: Math.random() > 0.5 ? Math.floor(Math.random() * 5000) + 5000 : null,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    createdAt: new Date(Date.now() - Math.random() * 10000000000),
  }));
};

export type SurveyType = ReturnType<typeof generateMockSurveys>[0];

export default function SurveysPage() {
  const [data, setData] = useState<SurveyType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setData(generateMockSurveys(45));
      setIsLoading(false);
    }, 800);
  }, []);

  const columns: ColumnDef<SurveyType>[] = [
    {
      accessorKey: 'title',
      header: 'Survey Title',
      cell: ({ row }) => {
        const survey = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-sm truncate max-w-[250px]">{survey.title}</span>
            <span className="text-xs text-muted-foreground truncate max-w-[250px]">ID: {survey.id}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => <Badge variant="secondary" className="bg-muted text-muted-foreground">{row.getValue('category')}</Badge>,
    },
    {
      accessorKey: 'reward',
      header: () => <div className="text-right">Reward</div>,
      cell: ({ row }) => <div className="text-right font-medium text-primary">{row.getValue<number>('reward')} Berry</div>,
    },
    {
      accessorKey: 'completions',
      header: () => <div className="text-right">Completions</div>,
      cell: ({ row }) => {
        const survey = row.original;
        return (
          <div className="text-right text-sm">
            {survey.completions.toLocaleString()}
            {survey.targetLimit ? <span className="text-muted-foreground text-xs ml-1">/ {survey.targetLimit.toLocaleString()}</span> : ''}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        if (status === 'active') return <Badge className="bg-green-100 text-green-700 hover:bg-green-100/80 hover:text-green-700 border-transparent shadow-none">Active</Badge>;
        if (status === 'closed') return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100/80 hover:text-gray-700 border-transparent shadow-none">Closed</Badge>;
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100/80 hover:text-amber-700 border-transparent shadow-none">Draft</Badge>;
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created On',
      cell: ({ row }) => <div className="text-sm text-muted-foreground">{format(row.getValue('createdAt'), 'MMM d, yyyy')}</div>,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const survey = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-muted focus:outline-none">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate(`/surveys/submissions?surveyId=${survey.id}`)}>
                <BarChart2 className="w-4 h-4 mr-2" /> View Submissions
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" /> Edit Survey
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="w-4 h-4 mr-2" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Surveys</h2>
          <p className="text-muted-foreground">Manage active surveys and view performance.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white" onClick={() => navigate('/surveys/create')}>
          <Plus className="w-4 h-4 mr-2" /> Create Survey
        </Button>
      </div>

      <div className="bg-card border rounded-lg shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center flex-1 w-full gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search surveys..."
                value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
                onChange={(event) => table.getColumn('title')?.setFilterValue(event.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            <Select 
              value={(table.getColumn('status')?.getFilterValue() as string) ?? 'all'} 
              onValueChange={(val) => table.getColumn('status')?.setFilterValue(val === 'all' ? '' : val)}
            >
              <SelectTrigger className="w-[140px] bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                  <TableRow key={row.id} className="hover:bg-muted/50 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-64 text-center">
                    <p className="text-muted-foreground">No surveys found.</p>
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
