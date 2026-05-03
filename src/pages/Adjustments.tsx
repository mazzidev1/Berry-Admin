import React, { useState, useEffect } from 'react';
import { 
  useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel,
  flexRender, ColumnDef, SortingState, ColumnFiltersState
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { Search, Plus, MoreHorizontal, ArrowUpRight, ArrowDownLeft, ShieldAlert, User as UserIcon, Wallet, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdjustmentStore, Adjustment } from '@/stores/adjustmentStore';
import { toast } from 'sonner';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';

export default function AdjustmentsPage() {
  const { adjustments: data, isLoading, fetchAdjustments, addAdjustment } = useAdjustmentStore();
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form State
  const [targetUserId, setTargetUserId] = useState('');
  const [targetUserName, setTargetUserName] = useState('');
  const [type, setType] = useState<'credit' | 'debit'>('credit');
  const [walletType, setWalletType] = useState<'berry' | 'cash'>('berry');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchAdjustments();
  }, [fetchAdjustments]);

  const resetForm = () => {
    setTargetUserId('');
    setTargetUserName('');
    setType('credit');
    setWalletType('berry');
    setAmount('');
    setReason('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId || !targetUserName) {
      toast.error("Please specify a target user");
      return;
    }
    
    addAdjustment({
      userId: targetUserId,
      userName: targetUserName,
      type,
      walletType,
      amount: parseFloat(amount),
      reason,
    });
    
    toast.success("Manual adjustment applied successfully");
    setIsDialogOpen(false);
    resetForm();
  };

  const columns: ColumnDef<Adjustment>[] = [
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
      cell: ({ row }) => <div className="text-sm text-muted-foreground">{format(new Date(row.getValue('date')), 'MMM d, yyyy HH:mm')}</div>,
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
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manual Adjustments</h2>
          <p className="text-muted-foreground">Log of manual balance corrections (credit/debit) made by admins.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90 hidden sm:flex">
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

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>New Manual Adjustment</DialogTitle>
              <DialogDescription>
                Correct a user's balance. Use with caution as this affects financial records.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="userId">User ID / Search</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input 
                      id="userId" 
                      value={targetUserId} 
                      onChange={(e) => setTargetUserId(e.target.value)} 
                      placeholder="e.g. user-123" 
                      className="pl-9"
                      required 
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="userName">User Display Name</Label>
                  <Input 
                    id="userName" 
                    value={targetUserName} 
                    onChange={(e) => setTargetUserName(e.target.value)} 
                    placeholder="e.g. John Doe" 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="adjustmentType">Action Type</Label>
                  <Select value={type} onValueChange={(v: any) => setType(v)}>
                    <SelectTrigger id="adjustmentType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit">Credit (Add Funds)</SelectItem>
                      <SelectItem value="debit">Debit (Remove Funds)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="walletType">Target Wallet</Label>
                  <Select value={walletType} onValueChange={(v: any) => setWalletType(v)}>
                    <SelectTrigger id="walletType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="berry">Berry Wallet</SelectItem>
                      <SelectItem value="cash">Cash Wallet (₦)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="adjAmount">Amount</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground pointer-events-none">
                    {walletType === 'cash' ? '₦' : 'B'}
                  </div>
                  <Input 
                    id="adjAmount" 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    className="pl-8"
                    placeholder="0.00"
                    required 
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="adjReason">Justification / Reason</Label>
                <Textarea 
                  id="adjReason" 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)} 
                  placeholder="Describe why this manual adjustment is being made..."
                  className="min-h-[100px]"
                  required 
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex gap-3">
                <Info className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-800">
                  Manual adjustments are logged with your administrator ID. Ensure all corrections are backed by valid support tickets or internal reports.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Post Adjustment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

