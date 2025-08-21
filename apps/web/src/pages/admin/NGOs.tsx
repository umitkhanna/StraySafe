import { useState } from 'react';
import { Plus, Search, MoreHorizontal, Building2, Verified, AlertCircle } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNGOs, useDeleteNGO } from '@/hooks/useNGOs';
import type { NGO } from '@/lib/api';

export default function NGOsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedNGO, setSelectedNGO] = useState<NGO | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: ngosData, isLoading } = useNGOs({
    page,
    limit: 10,
    search: searchTerm,
  });

  const deleteNGOMutation = useDeleteNGO();

  const handleAddNGO = () => {
    setSelectedNGO(null);
    setShowForm(true);
  };

  const handleEditNGO = (ngo: NGO) => {
    setSelectedNGO(ngo);
    setShowForm(true);
  };

  const handleDeleteNGO = async (ngoId: string) => {
    try {
      await deleteNGOMutation.mutateAsync(ngoId);
      // Success handled by react-query
    } catch (error) {
      console.error('Failed to delete NGO:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <AdminLayout>
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 dark:from-slate-900 dark:via-slate-950 dark:to-black">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
              NGO Management
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Manage Non-Governmental Organizations
            </p>
          </div>
          <Button onClick={handleAddNGO} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add NGO
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total NGOs</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ngosData?.data?.pagination?.totalItems || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified NGOs</CardTitle>
              <Verified className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ngosData?.data?.ngos?.filter((ngo: any) => ngo.isVerified).length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ngosData?.data?.ngos?.filter((ngo: any) => !ngo.isVerified && ngo.isActive).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search NGOs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NGOs Table */}
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Registration Number</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : ngosData?.data?.ngos?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No NGOs found
                    </TableCell>
                  </TableRow>
                ) : (
                  ngosData?.data?.ngos?.map((ngo: any) => (
                    <TableRow key={ngo._id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{ngo.name}</div>
                          {ngo.description && (
                            <div className="text-sm text-slate-500 truncate max-w-[200px]">
                              {ngo.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{ngo.registrationNumber}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {ngo.contactInfo.email && (
                            <div>{ngo.contactInfo.email}</div>
                          )}
                          {ngo.contactInfo.phone && (
                            <div>{ngo.contactInfo.phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={ngo.isActive ? 'default' : 'secondary'}>
                          {ngo.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={ngo.isVerified ? 'success' : 'warning'}>
                          {ngo.isVerified ? 'Verified' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(ngo.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditNGO(ngo)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteNGO(ngo._id)}
                              className="text-red-600"
                              disabled={deleteNGOMutation.isPending}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {ngosData?.totalPages && ngosData.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-slate-600">
              Page {page} of {ngosData.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page === ngosData.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
