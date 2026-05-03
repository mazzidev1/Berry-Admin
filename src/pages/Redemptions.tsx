import React, { useState, useEffect } from 'react';
import { 
  useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel,
  flexRender, ColumnDef, SortingState, ColumnFiltersState
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { Search, MoreHorizontal, Check, X, ShieldAlert, User, Gift, Calendar, Clock, CreditCard, ExternalLink, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useRedemptionStore, Redemption } from '@/stores/redemptionStore';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';

export default function RedemptionsPage() {
  const { redemptions: data, isLoading, fetchRedemptions, updateStatus } = useRedemptionStore();
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedRedemption, setSelectedRedemption] = useState<Redemption | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRedemptions();
  }, [fetchRedemptions]);

  const handleStatusChange = (id: string, newStatus: Redemption['status']) => {
    updateStatus(id, newStatus);
    toast.success(`Redemption ${newStatus} successfully.`);
  };

  const columns: ColumnDef<Redemption>[] = [
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
      cell: ({ row }) => <div className="text-sm text-muted-foreground">{format(new Date(row.getValue('date')), 'MMM d, yyyy HH:mm')}</div>,
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
              <DropdownMenuItem onClick={() => setSelectedRedemption(item)}>
                View Full Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Processing redemption for " + item.id)}>
                Manual Processing
              </DropdownMenuItem>
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

      <Dialog open={!!selectedRedemption} onOpenChange={(open) => !open && setSelectedRedemption(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Redemption Details
              <Badge variant="outline" className="ml-2 font-mono text-[10px]">{selectedRedemption?.id}</Badge>
            </DialogTitle>
            <DialogDescription>
              Audit trail for this reward exchange.
            </DialogDescription>
          </DialogHeader>

          {selectedRedemption && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">User Info</p>
                  <div className="flex items-center gap-2 font-medium text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    {selectedRedemption.userName}
                  </div>
                  <Button variant="link" size="sm" className="h-4 p-0 text-primary text-xs" onClick={() => {
                    setSelectedRedemption(null);
                    navigate(`/users/${selectedRedemption.userId}`);
                  }}>
                    View Profile <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Status</p>
                  <div className="flex items-center mt-1">
                    {selectedRedemption.status === 'approved' && <Badge className="bg-green-100 text-green-700">Approved</Badge>}
                    {selectedRedemption.status === 'rejected' && <Badge className="bg-red-100 text-red-700">Rejected</Badge>}
                    {selectedRedemption.status === 'pending' && <Badge className="bg-amber-100 text-amber-700">Pending</Badge>}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Redeemed Item</p>
                <Card className="bg-muted/30 border-none shadow-none">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Gift className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{selectedRedemption.rewardName}</p>
                      <p className="text-xs text-muted-foreground">Unit Balance Deduction: {selectedRedemption.berryCost} Berry</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Cost</p>
                  <p className="text-xl font-bold text-primary">{selectedRedemption.berryCost.toLocaleString()} Berry</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Timestamp</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(selectedRedemption.date), 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {format(new Date(selectedRedemption.date), 'HH:mm')}
                  </div>
                </div>
              </div>

              {selectedRedemption.autoProcess && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex gap-3 text-blue-700">
                  <Info className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold">Digital Item (Auto-Processing)</p>
                    <p className="mt-0.5">This item is set to auto-approve. It was flagged for manual review due to account status or suspicious activity.</p>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedRedemption(null)}>Close</Button>
                {selectedRedemption.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button variant="destructive" size="sm" onClick={() => {
                        handleStatusChange(selectedRedemption.id, 'rejected');
                        setSelectedRedemption(null);
                    }}>Reject</Button>
                    <Button size="sm" onClick={() => {
                        handleStatusChange(selectedRedemption.id, 'approved');
                        setSelectedRedemption(null);
                    }}>Approve</Button>
                  </div>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
