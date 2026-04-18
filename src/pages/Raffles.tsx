import React, { useState, useEffect } from 'react';
import { 
  useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel,
  flexRender, ColumnDef, SortingState, ColumnFiltersState
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { Search, Plus, MoreHorizontal, Ticket, Trophy } from 'lucide-react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const generateMockRaffles = (count: number) => {
  const statuses = ["active", "drawn", "draft"];
  return Array.from({ length: count }).map((_, i) => ({
    id: `raf-${i + 1}`,
    title: `Weekly Mega Draw #${i + 1}`,
    prize: i % 3 === 0 ? "iPhone 15 Pro" : i % 2 === 0 ? "₦50,000 Cash" : "10,000 Berry",
    ticketCost: Math.floor(Math.random() * 500) + 50,
    ticketsSold: Math.floor(Math.random() * 5000),
    maxTickets: Math.random() > 0.5 ? Math.floor(Math.random() * 5000) + 5000 : null,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    drawDate: new Date(Date.now() + (Math.random() * 86400000 * 10) - (Math.random() * 86400000 * 5)),
  }));
};

export default function RafflesPage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setData(generateMockRaffles(15));
      setIsLoading(false);
    }, 600);
  }, []);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'title',
      header: 'Raffle Name',
      cell: ({ row }) => <span className="font-medium text-sm">{row.getValue('title')}</span>,
    },
    {
      accessorKey: 'prize',
      header: 'Prize',
      cell: ({ row }) => (
        <div className="flex items-center text-sm">
          <Trophy className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
          {row.getValue('prize')}
        </div>
      ),
    },
    {
      accessorKey: 'ticketCost',
      header: 'Ticket Cost',
      cell: ({ row }) => <span className="font-medium">{row.getValue<number>('ticketCost')} B</span>,
    },
    {
      accessorKey: 'ticketsSold',
      header: 'Tickets Sold',
      cell: ({ row }) => {
        const raffle = row.original;
        return (
          <div className="text-sm border flex items-center w-max px-2 py-0.5 rounded-md bg-muted/40">
            <Ticket className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            {raffle.ticketsSold.toLocaleString()}
            {raffle.maxTickets ? <span className="text-muted-foreground ml-1">/ {raffle.maxTickets.toLocaleString()}</span> : ''}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        if (status === 'active') return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>;
        if (status === 'drawn') return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Drawn</Badge>;
        return <Badge variant="secondary">Draft</Badge>;
      },
    },
    {
      accessorKey: 'drawDate',
      header: 'Draw Date',
      cell: ({ row }) => <div className="text-sm text-muted-foreground">{format(row.getValue('drawDate'), 'MMM d, yyyy')}</div>,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Edit Raffle</DropdownMenuItem>
            <DropdownMenuItem>View Participants</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:bg-destructive/10">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
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
          <h2 className="text-2xl font-bold tracking-tight">Raffle Draws</h2>
          <p className="text-muted-foreground">Manage periodic lucky draws for users to win big prizes.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 hidden sm:flex">
          <Plus className="w-4 h-4 mr-2" /> Create Raffle
        </Button>
      </div>

      <div className="bg-card border rounded-lg shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search raffles..."
              value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
              onChange={(event) => table.getColumn('title')?.setFilterValue(event.target.value)}
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
                Array.from({ length: 5 }).map((_, i) => (
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
                  <TableCell colSpan={columns.length} className="h-48 text-center text-muted-foreground">No raffles found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
