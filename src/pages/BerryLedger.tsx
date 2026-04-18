import React, { useState, useEffect } from 'react';
import { 
  useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel,
  flexRender, ColumnDef, SortingState, ColumnFiltersState
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { Search, Download, ArrowUpRight, ArrowDownLeft, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

const generateMockLedger = (count: number) => {
  const types = ["MINT", "BURN", "TRANSFER", "ADJUSTMENT"];
  const reasons = {
    MINT: ["Survey Reward", "Referral Bonus", "System Credit"],
    BURN: ["Reward Redemption", "Penalty / Adjustment"],
    TRANSFER: ["Peer to Peer"],
    ADJUSTMENT: ["Admin Correction"]
  };
  
  return Array.from({ length: count }).map((_, i) => {
    const type = types[Math.floor(Math.random() * types.length)] as keyof typeof reasons;
    const reasonList = reasons[type];
    return {
      id: `txn-${Math.floor(Math.random() * 1000000)}`,
      userId: `user-${Math.floor(Math.random() * 500) + 1}`,
      userName: `Test User ${Math.floor(Math.random() * 500) + 1}`,
      type,
      reason: reasonList[Math.floor(Math.random() * reasonList.length)],
      amount: Math.floor(Math.random() * 5000) + 50,
      balanceAfter: Math.floor(Math.random() * 20000) + 5000,
      date: new Date(Date.now() - Math.random() * 86400000 * 30),
      referencePath: `/surveys/srv-1` // Mock reference
    };
  });
};

export default function BerryLedgerPage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setData(generateMockLedger(100));
      setIsLoading(false);
    }, 800);
  }, []);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        if (type === 'MINT') return <span className="inline-flex items-center text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded"><ArrowDownLeft className="h-3 w-3 mr-1" /> MINT</span>;
        if (type === 'BURN') return <span className="inline-flex items-center text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded"><ArrowUpRight className="h-3 w-3 mr-1" /> BURN</span>;
        if (type === 'TRANSFER') return <span className="inline-flex items-center text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded"><RefreshCcw className="h-3 w-3 mr-1" /> TRANSFER</span>;
        return <span className="inline-flex items-center text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded">{type}</span>;
      },
    },
    {
      accessorKey: 'userName',
      header: 'Account',
      cell: ({ row }) => {
        const sub = row.original;
        return (
          <Link to={`/users/${sub.userId}`} className="font-medium hover:underline text-sm truncate max-w-[150px]">
            {sub.userName}
          </Link>
        );
      },
    },
    {
      accessorKey: 'reason',
      header: 'Context/Reason',
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.getValue('reason')}</span>,
    },
    {
      accessorKey: 'amount',
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        const amount = row.getValue<number>('amount');
        const color = type === 'MINT' ? 'text-green-600' : type === 'BURN' ? 'text-red-600' : 'text-neutral-800';
        const sign = type === 'MINT' ? '+' : type === 'BURN' ? '-' : '';
        return <div className={`text-right font-medium ${color}`}>{sign}{amount.toLocaleString()} B</div>;
      },
    },
    {
      accessorKey: 'balanceAfter',
      header: () => <div className="text-right">Balance After</div>,
      cell: ({ row }) => <div className="text-right text-muted-foreground text-sm font-mono">{row.getValue<number>('balanceAfter').toLocaleString()} B</div>,
    },
    {
      accessorKey: 'date',
      header: 'Timestamp',
      cell: ({ row }) => <div className="text-sm text-muted-foreground">{format(row.getValue('date'), 'MMM d, yyyy HH:mm:ss')}</div>,
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
          <h2 className="text-2xl font-bold tracking-tight">Berry Ledger</h2>
          <p className="text-muted-foreground">Immutable log of all global Berry minting, burning, and transfers.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 hidden sm:flex">
          <Download className="w-4 h-4 mr-2" /> Export Log
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-green-50 border-green-100">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-green-800 mb-1">Total MINT (All Time)</p>
            <h3 className="text-xl font-bold text-green-700">{isLoading ? <Skeleton className="h-6 w-20" /> : "14,500,200"}</h3>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-100">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-red-800 mb-1">Total BURN (All Time)</p>
            <h3 className="text-xl font-bold text-red-700">{isLoading ? <Skeleton className="h-6 w-20" /> : "8,245,600"}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">Current Circulating Supply</p>
            <h3 className="text-xl font-bold text-foreground">{isLoading ? <Skeleton className="h-6 w-20" /> : "6,254,600"}</h3>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card border rounded-lg shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center flex-1 w-full gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search user..."
                value={(table.getColumn('userName')?.getFilterValue() as string) ?? ''}
                onChange={(event) => table.getColumn('userName')?.setFilterValue(event.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            
            <Select 
              value={(table.getColumn('type')?.getFilterValue() as string) ?? 'all'} 
              onValueChange={(val) => table.getColumn('type')?.setFilterValue(val === 'all' ? '' : val)}
            >
              <SelectTrigger className="w-[140px] bg-background">
                <SelectValue placeholder="Tx Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="MINT">Mint</SelectItem>
                <SelectItem value="BURN">Burn</SelectItem>
                <SelectItem value="TRANSFER">Transfer</SelectItem>
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
                  <TableRow key={row.id} className="hover:bg-muted/50 transition-colors group">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-64 text-center">
                    <p className="text-muted-foreground">No ledger entries found.</p>
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
