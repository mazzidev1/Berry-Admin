import React, { useState, useEffect } from 'react';
import { 
  useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel,
  flexRender, ColumnDef, SortingState, ColumnFiltersState
} from '@tanstack/react-table';
import { Search, Trophy, Users, TrendingUp, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const generateMockReferrals = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `ref-${i}`,
    userId: `user-${Math.floor(Math.random() * 500) + 1}`,
    userName: `Referrer ${i + 1}`,
    referralCode: `REF2026${String(i).padStart(3, '0')}X`,
    totalReferred: Math.floor(Math.random() * 50) + 1,
    successfulConversions: Math.floor(Math.random() * 20),
    totalEarned: Math.floor(Math.random() * 10000) + 500
  }));
};

export default function ReferralsPage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'totalReferred', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setData(generateMockReferrals(40));
      setIsLoading(false);
    }, 800);
  }, []);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'userName',
      header: 'Referrer',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <Link to={`/users/${item.userId}`} className="font-medium hover:underline text-sm truncate">
            {item.userName}
          </Link>
        );
      },
    },
    {
      accessorKey: 'referralCode',
      header: 'Referral Code',
      cell: ({ row }) => <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{row.getValue('referralCode')}</span>,
    },
    {
      accessorKey: 'totalReferred',
      header: () => <div className="text-right">Total Invited</div>,
      cell: ({ row }) => <div className="text-right">{row.getValue('totalReferred')}</div>,
    },
    {
      accessorKey: 'successfulConversions',
      header: () => <div className="text-right">Successful KYC</div>,
      cell: ({ row }) => <div className="text-right font-medium">{row.getValue('successfulConversions')}</div>,
    },
    {
      accessorKey: 'totalEarned',
      header: () => <div className="text-right">Bonus Earned</div>,
      cell: ({ row }) => <div className="text-right font-medium text-primary">{row.getValue<number>('totalEarned').toLocaleString()} Berry</div>,
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
          <h2 className="text-2xl font-bold tracking-tight">Referral Program</h2>
          <p className="text-muted-foreground">Monitor the viral coefficient and top referrers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-primary/10 text-primary rounded-full">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Referrals (Global)</p>
              <h3 className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-20" /> : "12,450"}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-green-100 text-green-700 rounded-full">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Successful Conversions</p>
              <h3 className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-16" /> : "3,205"}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-orange-100 text-orange-700 rounded-full">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Bonus Distributed</p>
              <h3 className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-24" /> : "1,602,500 B"}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card border rounded-lg shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search referrers..."
              value={(table.getColumn('userName')?.getFilterValue() as string) ?? ''}
              onChange={(event) => table.getColumn('userName')?.setFilterValue(event.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <div className="text-sm font-medium text-muted-foreground flex items-center">
            <Trophy className="w-4 h-4 mr-2 text-amber-500" /> Leaderboard Ranking
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
                    <p className="text-muted-foreground">No referrers found.</p>
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
