import React, { useState } from 'react';
import { Settings, Save, ShieldAlert, Key, UserCheck, Search, Plus, MoreHorizontal } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

const mockAdmins = [
  { id: 'adm-1', name: 'John SuperAdmin', email: 'john@founder.com', role: 'Super Admin', status: 'Active', lastLogin: '2 hrs ago' },
  { id: 'adm-2', name: 'Support Sarah', email: 'sarah@support.com', role: 'Support Agent', status: 'Active', lastLogin: '5 mins ago' },
  { id: 'adm-3', name: 'Mike Manager', email: 'mike@ops.com', role: 'Moderator', status: 'Inactive', lastLogin: '3 days ago' },
];

export default function AdminUsersPage() {
  const [data] = useState(mockAdmins);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Administrators</h2>
          <p className="text-muted-foreground">Manage dashboard access and role-based permissions.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 hidden sm:flex">
          <Plus className="w-4 h-4 mr-2" /> Invite Admin
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary mb-1">Super Admins</p>
                <h3 className="text-3xl font-bold">1</h3>
              </div>
              <Key className="w-8 h-8 text-primary/40" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
             <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Moderators</p>
                <h3 className="text-3xl font-bold">1</h3>
              </div>
              <ShieldAlert className="w-8 h-8 text-muted-foreground/40" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
             <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Support Agents</p>
                <h3 className="text-3xl font-bold">1</h3>
              </div>
              <UserCheck className="w-8 h-8 text-muted-foreground/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search admins..." className="pl-9" />
          </div>
        </div>
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="h-10 text-xs uppercase tracking-wider">Name</TableHead>
              <TableHead className="h-10 text-xs uppercase tracking-wider">Role</TableHead>
              <TableHead className="h-10 text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="h-10 text-xs uppercase tracking-wider">Last Login</TableHead>
              <TableHead className="h-10 w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{admin.name}</span>
                    <span className="text-xs text-muted-foreground">{admin.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={admin.role === 'Super Admin' ? 'bg-primary/10 text-primary border-primary/20' : ''}>
                    {admin.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded ${admin.status === 'Active' ? 'text-green-700 bg-green-50' : 'text-muted-foreground bg-muted'}`}>
                    {admin.status}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{admin.lastLogin}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Change Role</DropdownMenuItem>
                      <DropdownMenuItem>Reset Password</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:bg-destructive/10">Revoke Access</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
