import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { StarIcon, EyeIcon } from "lucide-react";
import { toast } from "sonner";
import { getItemById, Item } from "@/api/item";
import { parseDateSafely } from "@/utils/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute('/(app)/items/$itemId')({
  component: ItemDetail,
});

function ItemDetail() {
  const { itemId } = Route.useParams();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadItem = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getItemById(parseInt(itemId));
        setItem(data);
      } catch (err) {
        console.error("Failed to load item:", err);
        setError("Failed to load item details. Please try again.");
        toast.error("Failed to load item details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [itemId]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-10">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || "Item not found."}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const createdAt = parseDateSafely(item.createdAt);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{item.title}</h1>
        <Button
          variant="outline"
          asChild
          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Link to="/items/list">Back to List</Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Template</p>
              <p className="text-gray-900 dark:text-gray-100">{item.templateName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Created By</p>
              <p className="text-gray-900 dark:text-gray-100">{item.createdByName || "Unknown"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Created At</p>
              <p className="text-gray-900 dark:text-gray-100">
                {createdAt ? format(createdAt, "MMM d, yyyy") : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Rating</p>
              <div className="flex items-center space-x-2">
                <StarIcon className="h-5 w-5 text-yellow-500" />
                <span className="text-gray-900 dark:text-gray-100">{item.avgRating.toFixed(1)}</span>
                <Badge variant="outline" className="text-gray-600 dark:text-gray-300">
                  {item.ratingsCount} ratings
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Views</p>
              <div className="flex items-center space-x-2">
                <EyeIcon className="h-5 w-5 text-gray-500" />
                <span className="text-gray-900 dark:text-gray-100">{item.viewsCount}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Fields</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {item.fieldValues?.map((field) => (
              <div key={field.fieldId} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{field.displayName}</p>
                <div className="md:col-span-2">
                  {renderFieldValue(field.fieldType, field.value, field.fieldName)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to render field values based on fieldType
function renderFieldValue(fieldType: string, value: any, fieldName: string) {
  // Handle null or undefined values
  if (value === null || value === undefined) {
    return <p className="text-gray-500 dark:text-gray-400">Not specified</p>;
  }

  switch (fieldType) {
    case "text":
      // Special case for URLs (e.g., trailer_url)
      if (fieldName.toLowerCase().includes("url") && typeof value === "string") {
        return (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Watch Trailer
          </a>
        );
      }
      return <p className="text-gray-900 dark:text-gray-100">{value}</p>;

    case "number":
      return (
        <p className="text-gray-900 dark:text-gray-100">
          {fieldName.toLowerCase().includes("runtime") ? `${value} minutes` : value}
        </p>
      );

    case "multiselect":
      return (
        <div className="flex flex-wrap gap-2">
          {(value as string[]).map((item: string, index: number) => (
            <Badge key={index} variant="secondary" className="bg-gray-200 dark:bg-gray-700">
              {item}
            </Badge>
          ))}
        </div>
      );

    case "select":
      return <p className="text-gray-900 dark:text-gray-100">{value || "Not specified"}</p>;

    case "textarea":
      return <p className="text-gray-900 dark:text-gray-100">{value || "No description available"}</p>;

    default:
      return <p className="text-gray-900 dark:text-gray-100">{value.toString()}</p>;
  }
}

export default ItemDetail;