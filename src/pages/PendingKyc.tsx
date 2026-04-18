import React, { useState, useEffect } from 'react';
import { 
  useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel,
  flexRender, ColumnDef, SortingState, ColumnFiltersState
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { Search, MoreHorizontal, Download, ShieldCheck, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserType } from './Users';

// Mock data generator (reusing similar structure to Users component)
const generateMockPendingUsers = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `pending-${i + 1}`,
    displayName: `Pending User ${i + 1}`,
    email: `pending${i + 1}@example.com`,
    phoneNumber: `+234 800 000 ${String(i).padStart(4, '0')}`,
    berryBalance: Math.floor(Math.random() * 5000),
    walletBalance: Math.floor(Math.random() * 20000),
    kycVerified: false,
    profileCompleted: true,
    referralCount: Math.floor(Math.random() * 5),
    createdAt: new Date(Date.now() - Math.random() * 1000000000),
    flagged: false,
    avatarUrl: null
  }));
};

export default function PendingKycPage() {
  const [data, setData] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setData(generateMockPendingUsers(28));
      setIsLoading(false);
    }, 800);
  }, []);

  const handleQuickVerify = (id: string, name: string) => {
    setData((prev) => prev.filter(u => u.id !== id));
    toast.success(`User ${name} KYC verified successfully.`);
  };

  const columns: ColumnDef<UserType>[] = [
    {
      accessorKey: 'displayName',
      header: 'User',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs shrink-0">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <Link to={`/users/${user.id}`} className="font-medium hover:underline text-sm truncate max-w-[150px]">
                {user.displayName}
              </Link>
              <span className="text-xs text-muted-foreground truncate max-w-[150px]">{user.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'phoneNumber',
      header: 'Phone',
      cell: ({ row }) => <div className="text-sm">{row.getValue('phoneNumber')}</div>,
    },
    {
      accessorKey: 'createdAt',
      header: 'Registered',
      cell: ({ row }) => <div className="text-sm">{format(row.getValue('createdAt'), 'MMM d, yyyy')}</div>,
    },
    {
      id: 'quickVerify',
      header: 'Action',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
            onClick={() => handleQuickVerify(user.id, user.displayName)}
          >
            <ShieldCheck className="w-4 h-4 mr-1.5" /> Quick Verify
          </Button>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-muted focus:outline-none">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate(`/users/${user.id}?tab=verification`)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Flag User
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
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pending KYC</h2>
          <p className="text-muted-foreground flex items-center gap-2">
            Users who have completed their profile but remain unverified.
            <Badge variant="secondary" className="font-mono">{data.length} await KYC</Badge>
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 hidden sm:flex">
          <ShieldCheck className="w-4 h-4 mr-2" />
          Verify Selected
        </Button>
      </div>

      <div className="bg-card border rounded-lg shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={(table.getColumn('displayName')?.getFilterValue() as string) ?? ''}
              onChange={(event) => table.getColumn('displayName')?.setFilterValue(event.target.value)}
              className="pl-9 bg-background"
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
                Array.from({ length: 10 }).map((_, i) => (
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
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <ShieldCheck className="h-10 w-10 mb-4 opacity-20" />
                      <p>No pending KYC requests.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
