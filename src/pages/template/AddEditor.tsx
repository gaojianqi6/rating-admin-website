// src/pages/template/EditorPage.tsx
import { Link } from '@tanstack/react-router';
import { useState } from "react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

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

// Static initial fields - this won't change in this static version
const initialFields = [
  {
    name: "title",
    displayName: "Title",
    description: "The title of the movie",
    fieldType: "text",
    isRequired: true,
    isSearchable: true,
    isFilterable: false,
    displayOrder: 1,
    validationRules: {
      minLength: 3,
      maxLength: 100
    }
  },
  {
    name: "releaseYear",
    displayName: "Release Year",
    description: "The year the movie was released",
    fieldType: "number",
    isRequired: true,
    isSearchable: true,
    isFilterable: true, 
    displayOrder: 2,
    validationRules: {
      min: 1900,
      max: 2030
    }
  },
  {
    name: "genre",
    displayName: "Genre",
    description: "The genre of the movie",
    fieldType: "select",
    isRequired: true,
    isSearchable: true,
    isFilterable: true,
    displayOrder: 3,
    dataSourceId: 1,
    validationRules: {}
  }
];

export function TemplateEditorPage() {
  // Simple state to track edit mode
  const [isEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  // Static form handler that doesn't do anything
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Form submitted - this is a static demo");
  };

  return (
    <div className="space-y-4 p-8 pt-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          asChild 
          className="mr-4"
        >
          <Link to="/template/list">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          {isEditMode ? "Edit Template" : "Create Template"}
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
            <TabsTrigger value="fields">Template Fields</TabsTrigger>
          </TabsList>
          
          {/* Basic Information Tab */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the basic details of your template.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Template Name (Internal)</Label>
                    <Input 
                      id="name"
                      defaultValue="movie_rating"
                      placeholder="e.g. movie_ratings"
                    />
                    <p className="text-sm text-muted-foreground">
                      Used internally in the system. No spaces, lowercase with underscores.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input 
                      id="displayName"
                      defaultValue="Movie Rating"
                      placeholder="e.g. Movie Ratings"
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
                    defaultValue="Template for movie ratings and reviews"
                    placeholder="Describe this template's purpose and usage"
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2 max-w-xs">
                  <Label htmlFor="fullMarks">Full Marks</Label>
                  <Input 
                    id="fullMarks"
                    type="number"
                    defaultValue="10"
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
                  Next: Define Fields
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Fields Tab */}
          <TabsContent value="fields">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Template Fields</CardTitle>
                  <CardDescription>
                    Define the fields that make up this template.
                  </CardDescription>
                </div>
                <Button type="button">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Field
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-6">
                    {initialFields.map((field, index) => (
                      <div 
                        key={`field-${index}`}
                        className="border rounded-lg p-4 bg-card"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center">
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                disabled={index === 0}
                                className="h-8 w-8"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-up"><path d="m18 15-6-6-6 6"/></svg>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                disabled={index === initialFields.length - 1}
                                className="h-8 w-8"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
                              </Button>
                            </div>
                            <h3 className="font-medium ml-2">
                              Field {index + 1}: {field.displayName}
                            </h3>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <Label htmlFor={`field-${index}-name`}>Field Name (Internal)</Label>
                            <Input 
                              id={`field-${index}-name`}
                              defaultValue={field.name}
                              placeholder="e.g. release_year"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`field-${index}-displayName`}>Display Name</Label>
                            <Input 
                              id={`field-${index}-displayName`}
                              defaultValue={field.displayName}
                              placeholder="e.g. Release Year"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <Label htmlFor={`field-${index}-description`}>Description</Label>
                          <Input 
                            id={`field-${index}-description`}
                            defaultValue={field.description}
                            placeholder="Brief description of this field"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <Label htmlFor={`field-${index}-fieldType`}>Field Type</Label>
                            <Select defaultValue={field.fieldType}>
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
                              field.fieldType === "multiselect") && (
                            <div className="space-y-2">
                              <Label htmlFor={`field-${index}-dataSourceId`}>Data Source</Label>
                              <Select defaultValue={field.dataSourceId?.toString()}>
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`field-${index}-isRequired`}
                              defaultChecked={field.isRequired}
                            />
                            <Label htmlFor={`field-${index}-isRequired`}>Required</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`field-${index}-isSearchable`}
                              defaultChecked={field.isSearchable}
                            />
                            <Label htmlFor={`field-${index}-isSearchable`}>Searchable</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`field-${index}-isFilterable`}
                              defaultChecked={field.isFilterable}
                            />
                            <Label htmlFor={`field-${index}-isFilterable`}>Filterable</Label>
                          </div>
                        </div>
                        
                        {/* Conditionally render validation rules based on field type */}
                        <Separator className="my-4" />
                        <h4 className="font-medium mb-2">Validation Rules</h4>
                        
                        {field.fieldType === "text" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`field-${index}-minLength`}>Min Length</Label>
                              <Input 
                                id={`field-${index}-minLength`}
                                type="number"
                                defaultValue={field.validationRules.minLength}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`field-${index}-maxLength`}>Max Length</Label>
                              <Input 
                                id={`field-${index}-maxLength`}
                                type="number"
                                defaultValue={field.validationRules.maxLength}
                              />
                            </div>
                          </div>
                        )}
                        
                        {field.fieldType === "textarea" && (
                          <div className="max-w-xs space-y-2">
                            <Label htmlFor={`field-${index}-textareaMaxLength`}>Max Length</Label>
                            <Input 
                              id={`field-${index}-textareaMaxLength`}
                              type="number"
                              defaultValue={field.validationRules.maxLength}
                            />
                          </div>
                        )}
                        
                        {field.fieldType === "number" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`field-${index}-min`}>Min Value</Label>
                              <Input 
                                id={`field-${index}-min`}
                                type="number"
                                defaultValue={field.validationRules.min}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`field-${index}-max`}>Max Value</Label>
                              <Input 
                                id={`field-${index}-max`}
                                type="number"
                                defaultValue={field.validationRules.max}
                              />
                            </div>
                          </div>
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
                <Button type="submit">
                  {isEditMode ? "Update Template" : "Create Template"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}