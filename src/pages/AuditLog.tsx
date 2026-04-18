import React, { useState, useEffect } from 'react';
import { 
  useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel,
  flexRender, ColumnDef, SortingState, ColumnFiltersState
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { Search, History, User, Server } from 'lucide-react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const generateMockLogs = (count: number) => {
  const actions = ["USER_VERIFIED", "REWARD_CREATED", "REDEMPTION_APPROVED", "CONFIG_UPDATED", "ADMIN_LOGIN"];
  const admins = ["John SuperAdmin", "Support Sarah", "System Automaton"];
  return Array.from({ length: count }).map((_, i) => ({
    id: `log-${Math.floor(Math.random() * 1000000)}`,
    actor: admins[Math.floor(Math.random() * admins.length)],
    action: actions[Math.floor(Math.random() * actions.length)],
    resource: `ID_REF_${Math.floor(Math.random() * 9000) + 1000}`,
    details: '{"oldContext": "val", "newContext": "val2"}',
    timestamp: new Date(Date.now() - Math.random() * 86400000 * 7),
    ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
  }));
};

export default function AuditLogPage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'timestamp', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setData(generateMockLogs(50));
      setIsLoading(false);
    }, 600);
  }, []);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'timestamp',
      header: 'Timestamp',
      cell: ({ row }) => <div className="text-sm font-mono text-muted-foreground whitespace-nowrap">{format(row.getValue('timestamp'), 'MM/dd/yyyy HH:mm:ss')}</div>,
    },
    {
      accessorKey: 'actor',
      header: 'Actor',
      cell: ({ row }) => {
        const actor = row.getValue('actor') as string;
        return (
          <div className="flex items-center text-sm">
            {actor === 'System Automaton' ? <Server className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" /> : <User className="w-3.5 h-3.5 mr-1.5 text-blue-500" />}
            <span className="font-medium">{actor}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'action',
      header: 'Action Event',
      cell: ({ row }) => <span className="text-xs font-semibold tracking-wider text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">{row.getValue('action')}</span>,
    },
    {
      accessorKey: 'resource',
      header: 'Target Resource',
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('resource')}</span>,
    },
    {
      accessorKey: 'ip',
      header: 'IP Address',
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue('ip')}</span>,
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
          <h2 className="text-2xl font-bold tracking-tight">Audit Log</h2>
          <p className="text-muted-foreground">Immutable history of administrative and system-level actions.</p>
        </div>
      </div>

      <div className="bg-card border rounded-lg shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center flex-1 w-full gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search actor or resource..."
                value={(table.getColumn('actor')?.getFilterValue() as string) ?? ''}
                onChange={(event) => table.getColumn('actor')?.setFilterValue(event.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select 
              value={(table.getColumn('action')?.getFilterValue() as string) ?? 'all'} 
              onValueChange={(val) => table.getColumn('action')?.setFilterValue(val === 'all' ? '' : val)}
            >
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue placeholder="Filter Event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="USER_VERIFIED">USER_VERIFIED</SelectItem>
                <SelectItem value="CONFIG_UPDATED">CONFIG_UPDATED</SelectItem>
                <SelectItem value="ADMIN_LOGIN">ADMIN_LOGIN</SelectItem>
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
                      <TableCell key={cell.id} className="py-2.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-64 text-center text-muted-foreground">No audit logs found.</TableCell>
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
