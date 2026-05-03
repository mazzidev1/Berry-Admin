import React, { useState, useEffect } from 'react';
import { 
  useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel,
  flexRender, ColumnDef, SortingState, ColumnFiltersState
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { Search, Plus, MoreHorizontal, Ticket, Trophy, Edit, Trash, Calendar as CalendarIcon } from 'lucide-react';
import { useRaffleStore, Raffle } from '@/stores/raffleStore';
import { toast } from 'sonner';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function RafflesPage() {
  const { raffles: data, isLoading, fetchRaffles, addRaffle, updateRaffle, deleteRaffle } = useRaffleStore();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  
  // CRUD State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRaffle, setEditingRaffle] = useState<Raffle | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [prize, setPrize] = useState('');
  const [ticketCost, setTicketCost] = useState('100');
  const [maxTickets, setMaxTickets] = useState('');
  const [status, setStatus] = useState<'active' | 'drawn' | 'draft'>('draft');
  const [drawDate, setDrawDate] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));

  useEffect(() => {
    fetchRaffles();
  }, [fetchRaffles]);

  const resetForm = () => {
    setTitle('');
    setPrize('');
    setTicketCost('100');
    setMaxTickets('');
    setStatus('draft');
    setDrawDate(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
    setEditingRaffle(null);
  };

  const handleEdit = (raffle: Raffle) => {
    setEditingRaffle(raffle);
    setTitle(raffle.title);
    setPrize(raffle.prize);
    setTicketCost(raffle.ticketCost.toString());
    setMaxTickets(raffle.maxTickets ? raffle.maxTickets.toString() : '');
    setStatus(raffle.status);
    setDrawDate(format(new Date(raffle.drawDate), "yyyy-MM-dd'T'HH:mm"));
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      prize,
      ticketCost: parseInt(ticketCost),
      maxTickets: maxTickets ? parseInt(maxTickets) : null,
      status,
      drawDate: new Date(drawDate).toISOString(),
    };

    if (editingRaffle) {
      updateRaffle(editingRaffle.id, payload);
      toast.success("Raffle updated successfully");
    } else {
      addRaffle(payload);
      toast.success("Raffle created successfully");
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteRaffle(deleteId);
      toast.success("Raffle deleted successfully");
      setDeleteId(null);
    }
  };

  const columns: ColumnDef<Raffle>[] = [
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
      cell: ({ row }) => <div className="text-sm text-muted-foreground">{format(new Date(row.getValue('drawDate')), 'MMM d, yyyy')}</div>,
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
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              <Edit className="w-4 h-4 mr-2" /> Edit Raffle
            </DropdownMenuItem>
            <DropdownMenuItem>View Participants</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:bg-destructive/10"
              onClick={() => setDeleteId(row.original.id)}
            >
              <Trash className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
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
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Raffle Draws</h2>
          <p className="text-muted-foreground">Manage periodic lucky draws for users to win big prizes.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90 hidden sm:flex">
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

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingRaffle ? 'Update Raffle Draw' : 'Create New Raffle Draw'}</DialogTitle>
              <DialogDescription>
                Set up a new periodic lucky draw for users.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Raffle Name</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Weekly Mega Draw #12" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prize">Prize Description</Label>
                <Input id="prize" value={prize} onChange={(e) => setPrize(e.target.value)} placeholder="e.g. iPhone 15 Pro or 50,000 Cash" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="ticketCost">Ticket Cost (Berry)</Label>
                  <Input id="ticketCost" type="number" value={ticketCost} onChange={(e) => setTicketCost(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maxTickets">Max Tickets (Optional)</Label>
                  <Input id="maxTickets" type="number" value={maxTickets} onChange={(e) => setMaxTickets(e.target.value)} placeholder="Unlimited" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="drawn">Drawn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="drawDate">Draw Date & Time</Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input 
                      id="drawDate" 
                      type="datetime-local" 
                      className="pl-9"
                      value={drawDate}
                      onChange={(e) => setDrawDate(e.target.value)}
                      required 
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingRaffle ? 'Update Raffle' : 'Create Raffle'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the raffle and refund any purchased tickets (Simulation Note: Actual refunds not implemented in this mock).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" size="default">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" variant="destructive" size="default">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

