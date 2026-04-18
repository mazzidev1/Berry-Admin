import React, { useState, useEffect } from 'react';
import { 
  useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel,
  flexRender, ColumnDef, SortingState, ColumnFiltersState
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { Search, MoreHorizontal, Download, Filter, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock data generator
const generateMockUsers = (count: number) => {
  return Array.from({ length: count }).map((_, i) => {
    const isVerified = Math.random() > 0.3;
    const isProfileComplete = Math.random() > 0.2;
    return {
      id: `user-${i + 1}`,
      displayName: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      phoneNumber: `+234 800 000 ${String(i).padStart(4, '0')}`,
      berryBalance: Math.floor(Math.random() * 5000),
      walletBalance: Math.floor(Math.random() * 20000),
      kycVerified: isVerified,
      profileCompleted: isProfileComplete,
      referralCount: Math.floor(Math.random() * 20),
      createdAt: new Date(Date.now() - Math.random() * 10000000000),
      flagged: Math.random() > 0.95,
      avatarUrl: null
    };
  });
};

export type UserType = ReturnType<typeof generateMockUsers>[0];

export default function UsersPage() {
  const [data, setData] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setData(generateMockUsers(150));
      setIsLoading(false);
    }, 800);
  }, []);

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
      accessorKey: 'berryBalance',
      header: () => <div className="text-right">Berry</div>,
      cell: ({ row }) => <div className="text-right font-medium">{row.getValue<number>('berryBalance').toLocaleString()}</div>,
    },
    {
      accessorKey: 'walletBalance',
      header: () => <div className="text-right">Wallet ₦</div>,
      cell: ({ row }) => <div className="text-right font-medium text-green-600">₦{row.getValue<number>('walletBalance').toLocaleString()}</div>,
    },
    {
      accessorKey: 'kycVerified',
      header: 'KYC',
      cell: ({ row }) => {
        const verified = row.getValue('kycVerified');
        return verified 
          ? <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Verified</Badge> 
          : <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Pending</Badge>;
      },
      filterFn: (row, id, value) => {
        if (value === 'all') return true;
        return row.getValue(id) === (value === 'verified');
      }
    },
    {
      accessorKey: 'profileCompleted',
      header: 'Profile',
      cell: ({ row }) => {
        return row.getValue('profileCompleted') 
          ? <Badge variant="outline" className="text-xs">Complete</Badge> 
          : <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-200">Incomplete</Badge>;
      },
      filterFn: (row, id, value) => {
        if (value === 'all') return true;
        return row.getValue(id) === (value === 'complete');
      }
    },
    {
      accessorKey: 'referralCount',
      header: () => <div className="text-center">Referrals</div>,
      cell: ({ row }) => <div className="text-center">{row.getValue('referralCount')}</div>,
    },
    {
      accessorKey: 'createdAt',
      header: 'Registered',
      cell: ({ row }) => <div className="text-sm">{format(row.getValue('createdAt'), 'MMM d, yyyy')}</div>,
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
              <DropdownMenuItem onClick={() => navigate(`/users/${user.id}`)}>
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/users/${user.id}?tab=berry`)}>
                Adjust Balance
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
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">Manage and view all platform users.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 hidden sm:flex">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="bg-card border rounded-lg shadow-sm">
        {/* Toolbar */}
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center flex-1 w-full gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={(table.getColumn('displayName')?.getFilterValue() as string) ?? ''}
                onChange={(event) => table.getColumn('displayName')?.setFilterValue(event.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            
            <Select 
              value={(table.getColumn('kycVerified')?.getFilterValue() as string) ?? 'all'} 
              onValueChange={(val) => table.getColumn('kycVerified')?.setFilterValue(val)}
            >
              <SelectTrigger className="w-[140px] bg-background">
                <SelectValue placeholder="KYC Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All KYC</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Not Verified</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={(table.getColumn('profileCompleted')?.getFilterValue() as string) ?? 'all'} 
              onValueChange={(val) => table.getColumn('profileCompleted')?.setFilterValue(val)}
            >
              <SelectTrigger className="w-[150px] bg-background">
                <SelectValue placeholder="Profile Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Profiles</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            Showing {table.getFilteredRowModel().rows.length} users
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="h-10 text-xs uppercase tracking-wider">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
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
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-muted/50 transition-colors cursor-pointer group">
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
                      <User className="h-10 w-10 mb-4 opacity-20" />
                      <p>No users found matching your filters.</p>
                      <Button variant="link" onClick={() => {
                        table.getColumn('displayName')?.setFilterValue('');
                        table.getColumn('kycVerified')?.setFilterValue('all');
                        table.getColumn('profileCompleted')?.setFilterValue('all');
                      }}>Clear filters</Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Toolbar */}
        <div className="p-4 border-t flex items-center justify-between">
          <div className="flex-1 text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
          </div>
          <div className="flex items-center space-x-2">
            <Select 
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="w-[70px] h-8 text-xs">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>{pageSize}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
