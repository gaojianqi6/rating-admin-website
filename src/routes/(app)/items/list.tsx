import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { StarIcon, EyeIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { toast } from "sonner";
import { getItems, deleteItem, ItemsQueryParams, Item } from "@/api/item";
import { getTemplates } from "@/api/template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
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
import { parseDateSafely } from "@/utils/utils"; // Updated import path
import { PAGE_SIZE_OPTIONS } from "@/constants/ui";

export const Route = createFileRoute('/(app)/items/list')({
  component: ItemsPage,
});

interface Template {
  id: number;
  displayName: string;
}

function ItemsPage() {
  const navigate = useNavigate();
  const { search } = Route.useSearch();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [tempFilters, setTempFilters] = useState<ItemsQueryParams>({
    pageNo: parseInt(search?.pageNo as string || "1"),
    pageSize: parseInt(search?.pageSize as string || "10"),
    title: (search?.title as string) || "",
    templateId: search?.templateId ? parseInt(search.templateId as string) : undefined,
    createdTimeStart: (search?.createdTimeStart as string) || undefined,
    createdTimeEnd: (search?.createdTimeEnd as string) || undefined,
    sortField: (search?.sortField as string) || "createdAt",
    sortOrder: (search?.sortOrder as "asc" | "desc") || "desc",
  });

  const [filters, setFilters] = useState<ItemsQueryParams>(tempFilters);

  // Load templates for filter dropdown
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const res = await getTemplates({ pageSize: 100 });
        setTemplates(res.list.map((template: any) => ({
          id: template.id,
          displayName: template.displayName,
        })));
      } catch (error) {
        console.error("Failed to load templates:", error);
        toast.error("Failed to load templates. Please try again.");
      }
    };
    loadTemplates();
  }, []);

  // Load items data
  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getItems(filters);
        setItems(data.list);
        setTotalItems(data.total);
      } catch (error) {
        console.error("Failed to load items:", error);
        setError("Failed to load items. Please try again.");
        toast.error("Failed to load items. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [filters]);

  // Update URL params when filters change
  useEffect(() => {
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== "") {
        acc[key] = value.toString();
      }
      return acc;
    }, {} as Record<string, string>);

    // navigate({
    //   to: '/items/list',
    //   search: cleanFilters,
    //   replace: true,
    // });
  }, [filters, navigate]);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, pageNo: page }));
  };

  const handleFilterChange = (key: keyof ItemsQueryParams, value: any) => {
    if (key === 'pageSize') {
      // Page size changes trigger immediate search
      const newFilters = {
        ...filters,
        [key]: value,
        pageNo: 1, // Reset to first page when changing page size
      };
      setFilters(newFilters);
      setTempFilters(newFilters);
    } else {
      // Other changes only update tempFilters
      setTempFilters(prev => ({
        ...prev,
        [key]: value,
        pageNo: key !== 'pageNo' ? 1 : value, // Reset page number except when changing page number itself
      }));
    }
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApplyFilters();
    }
  };

  const handleSort = (field: string) => {
    setFilters((prev) => ({
      ...prev,
      sortField: field,
      sortOrder: prev.sortField === field && prev.sortOrder === "desc" ? "asc" : "desc",
    }));
  };

  const handleDeleteClick = (id: number) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      await deleteItem(itemToDelete);
      toast.success("Item deleted successfully");
      const data = await getItems(filters);
      setItems(data.list);
      setTotalItems(data.total);
    } catch (error) {
      console.error("Failed to delete item:", error);
      toast.error("Failed to delete item. Please try again.");
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const resetFilters = () => {
    const defaultFilters: ItemsQueryParams = {
      pageNo: 1,
      pageSize: 10,
      title: "",
      templateId: undefined,
      createdTimeStart: undefined,
      createdTimeEnd: undefined,
      sortField: "createdAt",
      sortOrder: "desc" as const,
    };
    setFilters(defaultFilters);
    setTempFilters(defaultFilters);
  };

  const retryLoadItems = () => {
    setFilters((prev) => ({ ...prev })); // Trigger useEffect to reload items
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Items</h1>
      </div>

      {/* Filters Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
              <Input
                placeholder="Search by title"
                value={tempFilters.title || ""}
                onChange={(e) => handleFilterChange("title", e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Template</label>
              <Select
                value={tempFilters.templateId?.toString() || "0"}
                onValueChange={(value) => handleFilterChange("templateId", value === "0" ? undefined : parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All templates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">All templates</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Created From</label>
              <DatePicker
                date={tempFilters.createdTimeStart ? parseDateSafely(tempFilters.createdTimeStart) || undefined : undefined}
                onSelect={(date) => {
                  if (date) {
                    // Adjust for timezone to keep the selected date
                    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                    handleFilterChange("createdTimeStart", localDate.toISOString().split('T')[0]);
                  } else {
                    handleFilterChange("createdTimeStart", undefined);
                  }
                }}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Created To</label>
              <DatePicker
                date={tempFilters.createdTimeEnd ? parseDateSafely(tempFilters.createdTimeEnd) || undefined : undefined}
                onSelect={(date) => {
                  if (date) {
                    // Adjust for timezone to keep the selected date
                    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                    handleFilterChange("createdTimeEnd", localDate.toISOString().split('T')[0]);
                  } else {
                    handleFilterChange("createdTimeEnd", undefined);
                  }
                }}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4 space-x-3">
            <Button
              variant="outline"
              onClick={resetFilters}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Reset Filters
            </Button>
            <Button
              onClick={handleApplyFilters}
              className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Items Table Card */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button
                onClick={retryLoadItems}
                className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Retry
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">No items found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => handleSort("id")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>ID</span>
                          {filters.sortField === "id" && (
                            filters.sortOrder === "asc" ? (
                              <ArrowUpIcon className="h-4 w-4 text-blue-500" />
                            ) : (
                              <ArrowDownIcon className="h-4 w-4 text-blue-500" />
                            )
                          )}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => handleSort("title")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Title</span>
                          {filters.sortField === "title" && (
                            filters.sortOrder === "asc" ? (
                              <ArrowUpIcon className="h-4 w-4 text-blue-500" />
                            ) : (
                              <ArrowDownIcon className="h-4 w-4 text-blue-500" />
                            )
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => handleSort("createdAt")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Created At</span>
                          {filters.sortField === "createdAt" && (
                            filters.sortOrder === "asc" ? (
                              <ArrowUpIcon className="h-4 w-4 text-blue-500" />
                            ) : (
                              <ArrowDownIcon className="h-4 w-4 text-blue-500" />
                            )
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => handleSort("avgRating")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Rating</span>
                          {filters.sortField === "avgRating" && (
                            filters.sortOrder === "asc" ? (
                              <ArrowUpIcon className="h-4 w-4 text-blue-500" />
                            ) : (
                              <ArrowDownIcon className="h-4 w-4 text-blue-500" />
                            )
                          )}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => handleSort("viewsCount")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Views</span>
                          {filters.sortField === "viewsCount" && (
                            filters.sortOrder === "asc" ? (
                              <ArrowUpIcon className="h-4 w-4 text-blue-500" />
                            ) : (
                              <ArrowDownIcon className="h-4 w-4 text-blue-500" />
                            )
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      const createdAt = parseDateSafely(item.createdAt);
                      return (
                        <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <TableCell>{item.id}</TableCell>
                          <TableCell className="font-medium text-gray-900 dark:text-gray-100">{item.title}</TableCell>
                          <TableCell>{item.templateName}</TableCell>
                          <TableCell>
                            {createdAt ? format(createdAt, "MMM d, yyyy") : "-"}
                          </TableCell>
                          <TableCell>{item.createdByName || "-"}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <StarIcon className="h-5 w-5 text-yellow-500" />
                              <span className="text-gray-900 dark:text-gray-100">{item.avgRating.toFixed(1)}</span>
                              <Badge variant="outline" className="text-gray-600 dark:text-gray-300">
                                {item.ratingsCount} ratings
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <EyeIcon className="h-5 w-5 text-gray-500" />
                              <span className="text-gray-900 dark:text-gray-100">{item.viewsCount}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                              >
                                <Link to="/items/$itemId" params={{ itemId: item.id.toString() }}>
                                  <EyeIcon className="h-5 w-5" />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500"
                                onClick={() => handleDeleteClick(item.id)}
                              >
                                <TrashIcon className="h-5 w-5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-6 flex justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    Showing {items.length} of {totalItems} items
                  </div>
                  <Select
                    value={filters.pageSize?.toString()}
                    onValueChange={(value) => handleFilterChange("pageSize", parseInt(value))}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Items per page" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <Input
                      type="number"
                      min={1}
                      max={Math.ceil(totalItems / (filters.pageSize || 10))}
                      value={tempFilters.pageNo || 1}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value)) {
                          handleFilterChange("pageNo", value);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const value = parseInt((e.target as HTMLInputElement).value);
                          if (value > 0 && value <= Math.ceil(totalItems / (filters.pageSize || 10))) {
                            handleApplyFilters();
                          }
                        }
                      }}
                      className="w-[60px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      of {Math.ceil(totalItems / (filters.pageSize || 10))}
                    </span>
                  </div>
                  <Pagination className="justify-end">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(Math.max(1, (filters.pageNo || 1) - 1))}
                          className={`cursor-pointer ${(filters.pageNo || 1) <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                      </PaginationItem>
                      {(() => {
                        const currentPage = filters.pageNo || 1;
                        const totalPages = Math.ceil(totalItems / (filters.pageSize || 10));
                        const pages: number[] = [];
                        
                        // Always show first page
                        pages.push(1);
                        
                        // Calculate range around current page
                        let start = Math.max(2, currentPage - 1);
                        let end = Math.min(totalPages - 1, currentPage + 1);
                        
                        // Adjust range if at edges
                        if (currentPage <= 2) {
                          end = Math.min(4, totalPages - 1);
                        }
                        if (currentPage >= totalPages - 1) {
                          start = Math.max(2, totalPages - 3);
                        }
                        
                        // Add ellipsis after first page if needed
                        if (start > 2) {
                          pages.push(-1); // -1 represents ellipsis
                        }
                        
                        // Add pages in range
                        for (let i = start; i <= end; i++) {
                          pages.push(i);
                        }
                        
                        // Add ellipsis before last page if needed
                        if (end < totalPages - 1) {
                          pages.push(-2); // -2 represents ellipsis
                        }
                        
                        // Always show last page if there is more than one page
                        if (totalPages > 1) {
                          pages.push(totalPages);
                        }
                        
                        return pages.map((page, index) => (
                          <PaginationItem key={`${page}-${index}`}>
                            {page < 0 ? (
                              <PaginationEllipsis />
                            ) : (
                              <PaginationLink
                                onClick={() => handlePageChange(page)}
                                isActive={page === currentPage}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            )}
                          </PaginationItem>
                        ));
                      })()}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(Math.min(Math.ceil(totalItems / (filters.pageSize || 10)), (filters.pageNo || 1) + 1))}
                          className={`cursor-pointer ${(filters.pageNo || 1) >= Math.ceil(totalItems / (filters.pageSize || 10)) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              This action cannot be undone. This will permanently delete the item and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ItemsPage;