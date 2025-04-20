// src/pages/template/components/TemplateFields.tsx
import { useState } from "react";
import { useAtom } from 'jotai';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { templateAtom, editingFieldAtom } from "../index";
import { FieldDialog } from "./FieldDialog";
import { DeleteFieldDialog } from "./DeleteFieldDialog";
import { getSafeValidationRules } from "@/utils/template";

interface TemplateFieldsProps {
  mode: 'create' | 'edit' | 'view';
  dataSources: any[];
  onBack: () => void;
}

export function TemplateFields({ mode, dataSources, onBack }: TemplateFieldsProps) {
  const [template, setTemplate] = useAtom(templateAtom);
  const [_editingField, setEditingField] = useAtom(editingFieldAtom);
  
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);
  
  const isReadOnly = mode === 'view';
  
  const openAddFieldDialog = () => {
    setEditingField({
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
    });
    setIsFieldDialogOpen(true);
  };
  
  const openEditFieldDialog = (field) => {
    setEditingField({ ...field });
    setIsFieldDialogOpen(true);
  };
  
  const confirmDeleteField = (fieldId) => {
    setSelectedFieldId(fieldId);
    setIsDeleteDialogOpen(true);
  };
  
  // Will be used by the delete dialog component
  const deleteField = () => {
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
    }
    setIsDeleteDialogOpen(false);
  };

  const fields = (template?.fields || []).sort((a, b) => a.displayOrder > b.displayOrder ? 1 : -1);
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Template Fields</CardTitle>
            <CardDescription>
              {isReadOnly 
                ? "View the fields that make up this `template.`"
                : "Define the fields that make up this template."}
            </CardDescription>
          </div>
          {!isReadOnly && (
            <Button onClick={openAddFieldDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Field
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            {fields.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 border border-dashed rounded-md bg-muted/50 p-8">
                <p className="text-muted-foreground mb-4">No fields added yet</p>
                {!isReadOnly && (
                  <Button onClick={openAddFieldDialog} variant="secondary">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Field
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {fields.map((field, index) => (
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
                        {!isReadOnly && (
                          <>
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
                          </>
                        )}
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
            onClick={onBack}
          >
            Back to Basic Info
          </Button>
        </CardFooter>
      </Card>
      
      {/* Field Dialog */}
      <FieldDialog 
        isOpen={isFieldDialogOpen} 
        setIsOpen={setIsFieldDialogOpen} 
        dataSources={dataSources}
      />
      
      {/* Delete Field Dialog */}
      <DeleteFieldDialog 
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        onDelete={deleteField}
      />
    </>
  );
}