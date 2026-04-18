import React, { useState, useEffect } from 'react';
import { 
  useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel,
  flexRender, ColumnDef, SortingState, ColumnFiltersState
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { Search, Plus, MoreHorizontal, ArrowUpRight, ArrowDownLeft, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

const generateMockAdjustments = (count: number) => {
  const types = ["credit", "debit"];
  const wallets = ["berry", "cash"];
  return Array.from({ length: count }).map((_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const wallet = wallets[Math.floor(Math.random() * wallets.length)];
    return {
      id: `adj-${Math.floor(Math.random() * 100000)}`,
      userId: `user-${Math.floor(Math.random() * 500) + 1}`,
      userName: `Test User ${Math.floor(Math.random() * 500) + 1}`,
      type,
      walletType: wallet,
      amount: Math.floor(Math.random() * 5000) + 50,
      reason: "Correction for system error on survey compensation",
      adminId: "admin-1",
      adminName: "Super Admin",
      date: new Date(Date.now() - Math.random() * 86400000 * 15),
    };
  });
};

export default function AdjustmentsPage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setData(generateMockAdjustments(25));
      setIsLoading(false);
    }, 600);
  }, []);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('id')}</span>,
    },
    {
      accessorKey: 'userName',
      header: 'Target User',
      cell: ({ row }) => (
        <Link to={`/users/${row.original.userId}`} className="font-medium hover:underline text-sm">
          {row.getValue('userName')}
        </Link>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Action',
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        const wallet = row.original.walletType as string;
        const isCredit = type === 'credit';
        return (
          <div className="flex flex-col">
            <span className={`inline-flex items-center text-xs font-medium w-max px-2 py-0.5 rounded ${isCredit ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
              {isCredit ? <ArrowDownLeft className="h-3 w-3 mr-1" /> : <ArrowUpRight className="h-3 w-3 mr-1" />}
              {isCredit ? 'CREDIT' : 'DEBIT'}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1 font-semibold">{wallet} Wallet</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        const amount = row.getValue<number>('amount');
        const wallet = row.original.walletType as string;
        const color = type === 'credit' ? 'text-green-600' : 'text-red-600';
        const symbol = wallet === 'cash' ? '₦' : 'B';
        const sign = type === 'credit' ? '+' : '-';
        return <div className={`text-right font-medium ${color}`}>{sign}{wallet === 'cash' ? symbol : ''}{amount.toLocaleString()}{wallet === 'berry' ? ` ${symbol}` : ''}</div>;
      },
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => <span className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]" title={row.getValue('reason')}>{row.getValue('reason')}</span>,
    },
    {
      accessorKey: 'adminName',
      header: 'Authorizer',
      cell: ({ row }) => <span className="text-sm flex items-center"><ShieldAlert className="w-3 h-3 mr-1 text-muted-foreground"/> {row.getValue('adminName')}</span>,
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => <div className="text-sm text-muted-foreground">{format(row.getValue('date'), 'MMM d, yyyy HH:mm')}</div>,
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
          <h2 className="text-2xl font-bold tracking-tight">Manual Adjustments</h2>
          <p className="text-muted-foreground">Log of manual balance corrections (credit/debit) made by admins.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 hidden sm:flex">
          <Plus className="w-4 h-4 mr-2" /> New Adjustment
        </Button>
      </div>

      <div className="bg-card border rounded-lg shadow-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search target user..."
              value={(table.getColumn('userName')?.getFilterValue() as string) ?? ''}
              onChange={(event) => table.getColumn('userName')?.setFilterValue(event.target.value)}
              className="pl-9"
            />
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
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-48 text-center text-muted-foreground">No adjustments found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
