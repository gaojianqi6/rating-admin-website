// src/routes/(app)/template/list.tsx
import { createFileRoute } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { 
  ArrowUpDown, 
  ChevronDown, 
  FilePlus, 
  MoreHorizontal, 
  Copy, 
  FileEdit, 
  Trash2, 
  Eye
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTemplates, cloneTemplate, deleteTemplate, publishTemplate, unpublishTemplate } from '@/api/template';
import { Template } from '@/typings/template';
import { datetime } from '@/utils/date';
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
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

const getStatusBadge = (status: string) => {
  switch(status) {
    case 'published':
      return <Badge variant="success">Published</Badge>;
    case 'draft':
      return <Badge variant="outline">Draft</Badge>;
    case 'archived':
      return <Badge variant="destructive">Archived</Badge>;
    default:
      return <Badge>{status || 'Unknown'}</Badge>;
  }
};

export function TemplateListPage() {
  const queryClient = useQueryClient();
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    id: false,
    createdBy: false,
    updatedBy: false,
  });
  const [rowSelection, setRowSelection] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  // API query
  const { data, isLoading, error } = useQuery({
    queryKey: ['templates', page, pageSize, searchTerm, statusFilter, sorting],
    queryFn: () => getTemplates({
      pageNo: page,
      pageSize: pageSize,
      search: searchTerm || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      sortBy: sorting.length > 0 ? sorting[0].id : undefined,
      sortOrder: sorting.length > 0 ? (sorting[0].direction as 'asc' | 'desc') : undefined,
    })
  });

  const templates = data?.list || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete template: ${error?.message || 'Unknown error'}`);
    }
  });

  const cloneMutation = useMutation({
    mutationFn: (id: string) => cloneTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template cloned successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to clone template: ${error?.message || 'Unknown error'}`);
    }
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => publishTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template published successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to publish template: ${error?.message || 'Unknown error'}`);
    }
  });

  const unpublishMutation = useMutation({
    mutationFn: (id: string) => unpublishTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template unpublished successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to unpublish template: ${error?.message || 'Unknown error'}`);
    }
  });

  // Delete confirmation handling
  const handleDeleteClick = (id: string) => {
    setTemplateToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      deleteMutation.mutate(templateToDelete);
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  // Table columns
  const columns: ColumnDef<Template>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("id") || '—'}</div>,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("name") || '—'}</div>,
    },
    {
      accessorKey: "displayName",
      header: "Display Name",
      cell: ({ row }) => row.getValue("displayName") || '—',
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return description ? (
          <div className="max-w-[300px] truncate" title={description}>
            {description}
          </div>
        ) : '—';
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.getValue("status")),
    },
    {
      accessorKey: "fullMarks",
      header: "Full Marks",
      cell: ({ row }) => row.getValue("fullMarks") || 0,
    },
    {
      accessorKey: "fieldCount",
      header: "Fields",
      cell: ({ row }) => row.getValue("fieldCount") || 0,
    },
    {
      accessorKey: "creatorName",
      header: "Created By",
      cell: ({ row }) => row.getValue("creatorName") || '—',
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        const value = row.getValue("createdAt");
        return value ? datetime(value) : '—';
      },
    },
    {
      accessorKey: "updatedAt",
      header: "Updated At",
      cell: ({ row }) => {
        const value = row.getValue("updatedAt");
        return value ? datetime(value) : '—';
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const template = row.original;
        const isPublished = template.status === 'published';

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link to={`/template/${template.id}/view`} className="flex items-center">
                  <Eye className="mr-2 h-4 w-4" />
                  View details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/template/${template.id}/edit`} className="flex items-center">
                  <FileEdit className="mr-2 h-4 w-4" />
                  Edit template
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => cloneMutation.mutate(String(template.id))}
                className="flex items-center"
              >
                <Copy className="mr-2 h-4 w-4" />
                Clone template
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isPublished ? (
                <DropdownMenuItem 
                  onClick={() => unpublishMutation.mutate(String(template.id))}
                  className="flex items-center"
                >
                  Unpublish template
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem 
                  onClick={() => publishMutation.mutate(String(template.id))}
                  className="flex items-center"
                >
                  Publish template
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleDeleteClick(String(template.id))}
                className="flex items-center text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete template
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ];

  // Initialize table
  const table = useReactTable({
    data: templates,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Handle manual pagination with API
  const onPageChange = (newPage: number) => {
    setPage(newPage);
  };

  const onPageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1); // Reset to first page when changing page size
  };

  // Error state
  if (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-destructive mb-2">Error loading templates</h2>
        <p className="text-muted-foreground mb-4">
          {(error as any)?.message || "An unknown error occurred"}
        </p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['templates'] })}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-8 pt-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Templates</h2>
        <Button asChild>
          <Link to="/template/create">
            <FilePlus className="mr-2 h-4 w-4" />
            Create Template
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <div className="flex justify-center items-center">
                      <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full mr-2"></div>
                      Loading templates...
                    </div>
                  </TableCell>
                </TableRow>
              ) : templates.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No templates found.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex-1 text-sm text-muted-foreground">
            Showing {templates.length > 0 ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, total)} of {total} templates
          </div>
          
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => onPageSizeChange(Number(value))}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {page} of {totalPages || 1}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= (totalPages || 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the template. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export const Route = createFileRoute('/(app)/template/list')({
  component: TemplateListPage,
});