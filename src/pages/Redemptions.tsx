import React, { useState, useEffect } from 'react';
import { 
  useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel,
  flexRender, ColumnDef, SortingState, ColumnFiltersState
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { Search, MoreHorizontal, Check, X, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const generateMockRedemptions = (count: number) => {
  const statuses = ["pending", "approved", "rejected"];
  const rewards = ["MTN Airtime ₦500", "Wallet Cash ₦1000", "Netflix Gift Card $15", "Airtel Data 1.5GB"];
  return Array.from({ length: count }).map((_, i) => ({
    id: `red-${Math.floor(Math.random() * 100000)}`,
    userId: `user-${Math.floor(Math.random() * 500) + 1}`,
    userName: `Test User ${Math.floor(Math.random() * 500) + 1}`,
    rewardName: rewards[Math.floor(Math.random() * rewards.length)],
    berryCost: Math.floor(Math.random() * 5000) + 500,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    date: new Date(Date.now() - Math.random() * 86400000 * 5),
    autoProcess: Math.random() > 0.8 // indicating logic might have auto-approved but requires review
  }));
};

export default function RedemptionsPage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setData(generateMockRedemptions(60));
      setIsLoading(false);
    }, 800);
  }, []);

  const handleStatusChange = (id: string, newStatus: string) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    toast.success(`Redemption ${newStatus} successfully.`);
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('id')}</span>,
    },
    {
      accessorKey: 'userName',
      header: 'User',
      cell: ({ row }) => {
        const sub = row.original;
        return (
          <div className="flex flex-col">
            <Link to={`/users/${sub.userId}`} className="font-medium hover:underline text-sm truncate max-w-[150px]">
              {sub.userName}
            </Link>
          </div>
        );
      },
    },
    {
      accessorKey: 'rewardName',
      header: 'Item Redeemed',
      cell: ({ row }) => <span className="font-medium">{row.getValue('rewardName')}</span>,
    },
    {
      accessorKey: 'berryCost',
      header: () => <div className="text-right">Cost</div>,
      cell: ({ row }) => <div className="text-right font-medium text-primary">{row.getValue<number>('berryCost').toLocaleString()} Berry</div>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        if (status === 'approved') return <Badge className="bg-green-100 text-green-700 shadow-none border-transparent hover:bg-green-100">Approved</Badge>;
        if (status === 'rejected') return <Badge className="bg-red-100 text-red-700 shadow-none border-transparent hover:bg-red-100">Rejected</Badge>;
        return (
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-100 text-amber-700 shadow-none border-transparent hover:bg-amber-100">Pending</Badge>
            {row.original.autoProcess && <ShieldAlert className="w-4 h-4 text-amber-500" title="Flagged by system for manual review" />}
          </div>
        );
      },
    },
    {
      accessorKey: 'date',
      header: 'Requested On',
      cell: ({ row }) => <div className="text-sm text-muted-foreground">{format(row.getValue('date'), 'MMM d, yyyy HH:mm')}</div>,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const item = row.original;
        const isPending = item.status === 'pending';
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-muted focus:outline-none">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {isPending && (
                <>
                  <DropdownMenuItem onClick={() => handleStatusChange(item.id, 'approved')} className="text-green-600 focus:text-green-600 focus:bg-green-50">
                    <Check className="w-4 h-4 mr-2" /> Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange(item.id, 'rejected')} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                    <X className="w-4 h-4 mr-2" /> Reject (Refund Berry)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem>
                <Link to={`/users/${item.userId}?tab=redemptions`} className="flex w-full">View User History</Link>
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
          <h2 className="text-2xl font-bold tracking-tight">Redemption Requests</h2>
          <p className="text-muted-foreground">Approve or reject users swapping Berry for catalog items.</p>
        </div>
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
              value={(table.getColumn('status')?.getFilterValue() as string) ?? 'all'} 
              onValueChange={(val) => table.getColumn('status')?.setFilterValue(val === 'all' ? '' : val)}
            >
              <SelectTrigger className="w-[140px] bg-background">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
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
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-64 text-center">
                    <p className="text-muted-foreground">No redemptions found.</p>
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
