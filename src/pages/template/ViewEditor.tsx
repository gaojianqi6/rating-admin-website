// src/pages/template/EditorPage.tsx - Ultra-minimal static version
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Trash2, Plus, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getTemplate } from "@/api/template";
import { Template } from "@/typings/template";
import { INITIAL_TEMPLATE_DATA } from "@/store/template";

// Field type options - static data
const fieldTypeOptions = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Text Area" },
  { value: "number", label: "Number" },
  { value: "select", label: "Select" },
  { value: "multiselect", label: "Multi Select" },
  { value: "date", label: "Date" },
  { value: "checkbox", label: "Checkbox" },
];

// Sample data sources - static data
const dataSources = [
  { id: 1, name: "Movie Genres" },
  { id: 2, name: "Content Ratings" },
  { id: 3, name: "Countries" },
];

// Create a safe version of validation rules for checking/displaying
function getSafeValidationRules(field) {
  if (!field) return {};
  const rules = field.validationRules || {};
  return {
    minLength: rules.minLength,
    maxLength: rules.maxLength,
    min: rules.min,
    max: rules.max,
    pattern: rules.pattern,
  };
}

export function TemplateViewPage() {
  const navigate = useNavigate();
  const { id } = useParams({ strict: false })
  const { data: templateData } = useQuery({
    queryFn: () => getTemplate(id),
    queryKey: ["query/template"],
    initialData: INITIAL_TEMPLATE_DATA,
  });

  // Basic state just for UI interaction - not for real data manipulation
  const [activeTab, setActiveTab] = useState("basic");
  const [isEditMode] = useState(true);

  // Form submit that does nothing
  const handleSubmit = (e) => {
    e.preventDefault();
    navigate({ to: '/template/list', params: { } })
  };

  // Simple sort function to ensure fields are in display order
  // We're using a simple array access pattern without transformations
  const sortedFields = templateData.fields || [];
  sortedFields.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  return (
    <div className="space-y-4 p-8 pt-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link to="/template/list">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          {isEditMode ? "View Template" : "Create Template"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Tabs
          defaultValue="basic"
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="fields">
              Template Fields ({sortedFields.length})
            </TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Basic details of the template.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Template Name (Internal)</Label>
                    <Input id="name" value={templateData.name} readOnly />
                    <p className="text-sm text-muted-foreground">
                      Used internally in the system. No spaces, lowercase with
                      underscores.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={templateData.displayName}
                      readOnly
                    />
                    <p className="text-sm text-muted-foreground">
                      The name shown to users.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={templateData.description}
                    readOnly
                    rows={4}
                  />
                </div>

                <div className="space-y-2 max-w-xs">
                  <Label htmlFor="fullMarks">Full Marks</Label>
                  <Input
                    id="fullMarks"
                    type="number"
                    value={templateData.fullMarks}
                    readOnly
                  />
                  <p className="text-sm text-muted-foreground">
                    Maximum possible rating for this template.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setActiveTab("fields")}
                >
                  View Fields
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Fields Tab */}
          <TabsContent value="fields">
            <Card>
              <CardHeader>
                <CardTitle>Template Fields</CardTitle>
                <CardDescription>
                  Fields that make up this template.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-6">
                    {sortedFields.map((field, index) => (
                      <div
                        key={`field-${field.id}-${index}`}
                        className="border rounded-lg p-4 bg-card"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center">
                            <div className="bg-primary/10 px-2 py-1 rounded text-sm mr-2">
                              #{field.displayOrder}
                            </div>
                            <h3 className="font-medium">{field.displayName}</h3>
                          </div>
                          <div className="flex items-center space-x-2">
                            {field.isRequired && (
                              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                                Required
                              </span>
                            )}
                            {field.isSearchable && (
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                Searchable
                              </span>
                            )}
                            {field.isFilterable && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                Filterable
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <Label htmlFor={`field-${index}-name`}>
                              Field Name (Internal)
                            </Label>
                            <Input
                              id={`field-${index}-name`}
                              value={field.name}
                              readOnly
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`field-${index}-displayName`}>
                              Display Name
                            </Label>
                            <Input
                              id={`field-${index}-displayName`}
                              value={field.displayName}
                              readOnly
                            />
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <Label htmlFor={`field-${index}-description`}>
                            Description
                          </Label>
                          <Input
                            id={`field-${index}-description`}
                            value={field.description}
                            readOnly
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <Label htmlFor={`field-${index}-fieldType`}>
                              Field Type
                            </Label>
                            <Select defaultValue={field.fieldType} disabled>
                              <SelectTrigger>
                                <SelectValue placeholder="Select field type" />
                              </SelectTrigger>
                              <SelectContent>
                                {fieldTypeOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Conditionally show data source for select/multiselect */}
                          {(field.fieldType === "select" ||
                            field.fieldType === "multiselect") &&
                            field.dataSourceId && (
                              <div className="space-y-2">
                                <Label htmlFor={`field-${index}-dataSourceId`}>
                                  Data Source
                                </Label>
                                <Select
                                  defaultValue={field.dataSourceId?.toString()}
                                  disabled
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select data source" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {dataSources.map((source) => (
                                      <SelectItem
                                        key={source.id}
                                        value={source.id.toString()}
                                      >
                                        {source.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                        </div>

                        {/* Show validation rules if they exist */}
                        {field.validationRules &&
                          Object.keys(field.validationRules).length > 0 && (
                            <>
                              <Separator className="my-4" />
                              <h4 className="font-medium mb-2">
                                Validation Rules
                              </h4>

                              {/* Text/Textarea validation */}
                              {(field.fieldType === "text" ||
                                field.fieldType === "textarea") && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {getSafeValidationRules(field).minLength !==
                                    undefined && (
                                    <div className="space-y-2">
                                      <Label>Min Length</Label>
                                      <Input
                                        value={
                                          getSafeValidationRules(field)
                                            .minLength
                                        }
                                        readOnly
                                      />
                                    </div>
                                  )}
                                  {getSafeValidationRules(field).maxLength !==
                                    undefined && (
                                    <div className="space-y-2">
                                      <Label>Max Length</Label>
                                      <Input
                                        value={
                                          getSafeValidationRules(field)
                                            .maxLength
                                        }
                                        readOnly
                                      />
                                    </div>
                                  )}
                                  {getSafeValidationRules(field).pattern && (
                                    <div className="col-span-2 space-y-2">
                                      <Label>Pattern</Label>
                                      <Input
                                        value={
                                          getSafeValidationRules(field).pattern
                                        }
                                        readOnly
                                      />
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Number validation */}
                              {field.fieldType === "number" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {getSafeValidationRules(field).min !==
                                    undefined && (
                                    <div className="space-y-2">
                                      <Label>Min Value</Label>
                                      <Input
                                        value={
                                          getSafeValidationRules(field).min
                                        }
                                        readOnly
                                      />
                                    </div>
                                  )}
                                  {getSafeValidationRules(field).max !==
                                    undefined && (
                                    <div className="space-y-2">
                                      <Label>Max Value</Label>
                                      <Input
                                        value={
                                          getSafeValidationRules(field).max
                                        }
                                        readOnly
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setActiveTab("basic")}
                >
                  Back to Basic Info
                </Button>
                <Button type="submit">Back to template list</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
