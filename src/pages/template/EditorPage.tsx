// src/pages/template/TemplateEditorPage.tsx
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { atom, useAtom } from 'jotai';
import { toast } from "sonner";
import { Loader2, Trash2, Plus, ArrowLeft, Save } from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

import { getTemplate, createTemplate, updateTemplate, getDataSources } from "@/api/template";
import { Template, TemplateField } from "@/typings/template";
import { INITIAL_TEMPLATE_DATA } from "@/store/template";

// Field type options
const fieldTypeOptions = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Text Area" },
  { value: "number", label: "Number" },
  { value: "select", label: "Select" },
  { value: "multiselect", label: "Multi Select" },
  { value: "date", label: "Date" },
  { value: "checkbox", label: "Checkbox" },
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

// Empty template field for initialization
const EMPTY_FIELD: TemplateField = {
  id: 0,
  name: "",
  displayName: "",
  description: "",
  fieldType: "text",
  isRequired: false,
  isSearchable: false,
  isFilterable: false,
  displayOrder: 0,
  dataSourceId: null,
  validationRules: {}
};

// Create atoms for state management
const templateAtom = atom<Template>({ ...INITIAL_TEMPLATE_DATA });
const editingFieldAtom = atom<TemplateField>({ ...EMPTY_FIELD });

export function TemplateEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams({ strict: false });
  const isEditMode = !!id;
  const queryClient = useQueryClient();
  
  // Jotai state
  const [template, setTemplate] = useAtom(templateAtom);
  const [editingField, setEditingField] = useAtom(editingFieldAtom);
  
  // Local UI state
  const [activeTab, setActiveTab] = useState("basic");
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);
  
  // Data Queries
  const { data: dataSources = [] } = useQuery({
    queryKey: ['dataSources'],
    queryFn: getDataSources,
    initialData: []
  });
  
  const { isLoading: isTemplateLoading } = useQuery({
    queryKey: ['template', id],
    queryFn: () => getTemplate(id),
    enabled: isEditMode,
    initialData: INITIAL_TEMPLATE_DATA,
    onSuccess: (data) => {
      // Initialize the atom with the received data
      setTemplate(data);
    }
  });
  
  // Mutations
  const createMutation = useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      toast.success("Template created successfully");
      navigate({ to: "/template/list" });
    },
    onError: (error) => {
      toast.error(`Failed to create template: ${error.message}`);
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: updateTemplate,
    onSuccess: () => {
      toast.success("Template updated successfully");
      queryClient.invalidateQueries({ queryKey: ['template', id] });
      navigate({ to: "/template/list" });
    },
    onError: (error) => {
      toast.error(`Failed to update template: ${error.message}`);
    }
  });
  
  // Reset template when creating new
  useEffect(() => {
    if (!isEditMode) {
      setTemplate({ ...INITIAL_TEMPLATE_DATA });
    }
  }, [isEditMode, setTemplate]);
  
  // Field Management
  const openAddFieldDialog = useCallback(() => {
    setEditingField({ ...EMPTY_FIELD });
    setIsFieldDialogOpen(true);
  }, [setEditingField]);
  
  const openEditFieldDialog = useCallback((field: TemplateField) => {
    setEditingField({ ...field });
    setIsFieldDialogOpen(true);
  }, [setEditingField]);
  
  const confirmDeleteField = useCallback((fieldId: number) => {
    setSelectedFieldId(fieldId);
    setIsDeleteDialogOpen(true);
  }, []);
  
  const deleteField = useCallback(() => {
    if (selectedFieldId !== null) {
      setTemplate(prev => {
        const newFields = prev.fields.filter(field => field.id !== selectedFieldId);
        
        // Reorder remaining fields
        const reorderedFields = newFields.map((field, index) => ({
          ...field,
          displayOrder: index + 1
        }));
        
        return {
          ...prev,
          fields: reorderedFields
        };
      });
      
      setIsDeleteDialogOpen(false);
      toast.success("Field deleted successfully");
    }
  }, [selectedFieldId, setTemplate]);
  
  const addOrUpdateField = useCallback(() => {
    setTemplate(prev => {
      let newFields = [...prev.fields];
      const fieldIndex = newFields.findIndex(f => f.id === editingField.id);
      
      if (fieldIndex === -1) {
        // Add new field
        const newId = Math.min(0, ...newFields.map(f => f.id)) - 1; // Temporary negative ID
        const newField = {
          ...editingField,
          id: editingField.id || newId,
          displayOrder: newFields.length + 1
        };
        newFields.push(newField);
      } else {
        // Update existing field
        newFields[fieldIndex] = {
          ...editingField,
          displayOrder: editingField.displayOrder || fieldIndex + 1
        };
      }
      
      // Sort by display order
      newFields.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      
      return {
        ...prev,
        fields: newFields
      };
    });
    
    setIsFieldDialogOpen(false);
    toast.success(`Field ${editingField.id ? 'updated' : 'added'} successfully`);
  }, [editingField, setTemplate]);
  
  // Update specific template properties
  const updateTemplateProp = useCallback((prop: keyof Template, value: any) => {
    setTemplate(prev => ({
      ...prev,
      [prop]: value
    }));
  }, [setTemplate]);
  
  // Update editing field properties
  const updateFieldProp = useCallback((prop: keyof TemplateField, value: any) => {
    setEditingField(prev => ({
      ...prev,
      [prop]: value
    }));
  }, [setEditingField]);
  
  // Update validation rules
  const updateValidationRule = useCallback((rule: string, value: any) => {
    setEditingField(prev => ({
      ...prev,
      validationRules: {
        ...prev.validationRules,
        [rule]: value
      }
    }));
  }, [setEditingField]);
  
  // Check if template has required fields filled
  const hasRequiredFields = template.name?.trim() && template.displayName?.trim();
  
  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasRequiredFields) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Clean up validation rules - remove null/undefined values
    const cleanedFields = template.fields.map(field => {
      const validationRules = field.validationRules || {};
      const cleanedRules = Object.fromEntries(
        Object.entries(validationRules).filter(([_, value]) => value !== null && value !== undefined)
      );
      
      return {
        ...field,
        validationRules: Object.keys(cleanedRules).length > 0 ? cleanedRules : null
      };
    });
    
    const submissionData = {
      ...template,
      fields: cleanedFields
    };
    
    if (isEditMode) {
      updateMutation.mutate({ id, data: submissionData });
    } else {
      createMutation.mutate(submissionData);
    }
  };
  
  if (isEditMode && isTemplateLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link to="/template/list">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Templates
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">
            {isEditMode ? "Edit Template" : "Create Template"}
          </h2>
        </div>
        <Button 
          type="submit" 
          onClick={handleSubmit}
          disabled={createMutation.isPending || updateMutation.isPending || !hasRequiredFields}
        >
          {(createMutation.isPending || updateMutation.isPending) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          <Save className="mr-2 h-4 w-4" />
          {isEditMode ? "Update Template" : "Create Template"}
        </Button>
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
              Template Fields ({template.fields.length})
            </TabsTrigger>
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
                      value={template.name}
                      onChange={(e) => updateTemplateProp('name', e.target.value)}
                      placeholder="e.g. movie_ratings"
                    />
                    <p className="text-sm text-muted-foreground">
                      Used internally in the system. No spaces, lowercase with
                      underscores.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={template.displayName}
                      onChange={(e) => updateTemplateProp('displayName', e.target.value)}
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
                    value={template.description}
                    onChange={(e) => updateTemplateProp('description', e.target.value)}
                    placeholder="Describe this template's purpose and usage"
                    rows={4}
                  />
                </div>

                <div className="space-y-2 max-w-xs">
                  <Label htmlFor="fullMarks">Full Marks</Label>
                  <Input
                    id="fullMarks"
                    type="number"
                    value={template.fullMarks}
                    onChange={(e) => updateTemplateProp('fullMarks', Number(e.target.value))}
                    min={1}
                    max={100}
                  />
                  <p className="text-sm text-muted-foreground">
                    Maximum possible rating for this template.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPublished"
                      checked={template.isPublished}
                      onCheckedChange={(checked) => updateTemplateProp('isPublished', checked)}
                    />
                    <Label htmlFor="isPublished">Published</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Published templates are available for users to create ratings.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setActiveTab("fields")}
                >
                  Next: Configure Fields
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Fields Tab */}
          <TabsContent value="fields">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Template Fields</CardTitle>
                  <CardDescription>
                    Define the fields that make up this template.
                  </CardDescription>
                </div>
                <Button onClick={openAddFieldDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Field
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  {template.fields.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 border border-dashed rounded-md bg-muted/50 p-8">
                      <p className="text-muted-foreground mb-4">No fields added yet</p>
                      <Button onClick={openAddFieldDialog} variant="secondary">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Field
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {template.fields.map((field, index) => (
                        <div
                          key={`field-${field.id || index}`}
                          className="border rounded-lg p-4 bg-card"
                        >
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center">
                              <div className="bg-primary/10 px-2 py-1 rounded text-sm mr-2">
                                #{field.displayOrder || index + 1}
                              </div>
                              <h3 className="font-medium">{field.displayName || field.name}</h3>
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
                              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                                {field.fieldType}
                              </span>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => openEditFieldDialog(field)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => confirmDeleteField(field.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <Label>Field Name (Internal)</Label>
                              <Input
                                value={field.name}
                                readOnly
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Display Name</Label>
                              <Input
                                value={field.displayName}
                                readOnly
                              />
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <Label>Description</Label>
                            <Input
                              value={field.description}
                              readOnly
                            />
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
                  )}
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
                <Button 
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending || !hasRequiredFields}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditMode ? "Update Template" : "Create Template"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>

      {/* Field Editor Dialog */}
      <Dialog open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingField.id ? "Edit Field" : "Add New Field"}
            </DialogTitle>
            <DialogDescription>
              Define the properties for this template field
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fieldName">Field Name (Internal)</Label>
                <Input
                  id="fieldName"
                  value={editingField.name || ''}
                  onChange={(e) => updateFieldProp('name', e.target.value)}
                  placeholder="e.g. release_year"
                />
                <p className="text-xs text-muted-foreground">
                  No spaces, lowercase with underscores
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fieldDisplayName">Display Name</Label>
                <Input
                  id="fieldDisplayName"
                  value={editingField.displayName || ''}
                  onChange={(e) => updateFieldProp('displayName', e.target.value)}
                  placeholder="e.g. Release Year"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fieldDescription">Description</Label>
              <Textarea
                id="fieldDescription"
                value={editingField.description || ''}
                onChange={(e) => updateFieldProp('description', e.target.value)}
                placeholder="Describe this field's purpose"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fieldType">Field Type</Label>
                <Select 
                  value={editingField.fieldType} 
                  onValueChange={(value) => {
                    updateFieldProp('fieldType', value);
                    // Reset data source if not a select/multiselect
                    if (value !== 'select' && value !== 'multiselect') {
                      updateFieldProp('dataSourceId', null);
                    }
                  }}
                >
                  <SelectTrigger id="fieldType">
                    <SelectValue placeholder="Select field type" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Data source for select/multiselect fields */}
              {(editingField.fieldType === 'select' || editingField.fieldType === 'multiselect') && (
                <div className="space-y-2">
                  <Label htmlFor="dataSource">Data Source</Label>
                  <Select 
                    value={editingField.dataSourceId?.toString() || ''} 
                    onValueChange={(value) => 
                      updateFieldProp('dataSourceId', value ? parseInt(value) : null)
                    }
                  >
                    <SelectTrigger id="dataSource">
                      <SelectValue placeholder="Select data source" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataSources.map((source) => (
                        <SelectItem key={source.id} value={source.id.toString()}>
                          {source.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isRequired"
                  checked={editingField.isRequired || false}
                  onCheckedChange={(checked) => 
                    updateFieldProp('isRequired', checked)
                  }
                />
                <Label htmlFor="isRequired">Required</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isSearchable"
                  checked={editingField.isSearchable || false}
                  onCheckedChange={(checked) => 
                    updateFieldProp('isSearchable', checked)
                  }
                />
                <Label htmlFor="isSearchable">Searchable</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isFilterable"
                  checked={editingField.isFilterable || false}
                  onCheckedChange={(checked) => 
                    updateFieldProp('isFilterable', checked)
                  }
                />
                <Label htmlFor="isFilterable">Filterable</Label>
              </div>
            </div>
            
            {/* Validation rules based on field type */}
            <Separator />
            <h3 className="text-md font-medium">Validation Rules</h3>
            
            {/* Text/Textarea validation */}
            {(editingField.fieldType === 'text' || editingField.fieldType === 'textarea') && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minLength">Min Length</Label>
                  <Input
                    id="minLength"
                    type="number"
                    value={getSafeValidationRules(editingField).minLength || ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : null;
                      updateValidationRule('minLength', value);
                    }}
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLength">Max Length</Label>
                  <Input
                    id="maxLength"
                    type="number"
                    value={getSafeValidationRules(editingField).maxLength || ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : null;
                      updateValidationRule('maxLength', value);
                    }}
                    min={1}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="pattern">Regex Pattern</Label>
                  <Input
                    id="pattern"
                    value={getSafeValidationRules(editingField).pattern || ''}
                    onChange={(e) => {
                      const value = e.target.value || null;
                      updateValidationRule('pattern', value);
                    }}
                    placeholder="Regular expression pattern"
                  />
                </div>
              </div>
            )}
            
            {/* Number validation */}
            {editingField.fieldType === 'number' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min">Min Value</Label>
                  <Input
                    id="min"
                    type="number"
                    value={getSafeValidationRules(editingField).min ?? ''}
                    onChange={(e) => {
                      const value = e.target.value ? Number(e.target.value) : null;
                      updateValidationRule('min', value);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max">Max Value</Label>
                  <Input
                    id="max"
                    type="number"
                    value={getSafeValidationRules(editingField).max ?? ''}
                    onChange={(e) => {
                      const value = e.target.value ? Number(e.target.value) : null;
                      updateValidationRule('max', value);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsFieldDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={addOrUpdateField}
              disabled={!editingField.name || !editingField.displayName}
            >
              {editingField.id ? "Update Field" : "Add Field"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Field Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this field from the template.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={deleteField}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}