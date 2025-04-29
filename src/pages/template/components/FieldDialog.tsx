// src/pages/template/components/FieldDialog.tsx
import { useAtom } from 'jotai';
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { templateAtom, editingFieldAtom } from "../index";
import { getSafeValidationRules } from '@/utils/template';

// Field type options
const fieldTypeOptions = [
  { value: "text", label: "Text" },
  { value: "img", label: "Image" },
  { value: "textarea", label: "Text Area" },
  { value: "number", label: "Number" },
  { value: "select", label: "Select" },
  { value: "multiselect", label: "Multi Select" },
  { value: "date", label: "Date" },
  { value: "checkbox", label: "Checkbox" },
  { value: "url", label: "URL" },
];

interface FieldDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  dataSources: any[];
}

export function FieldDialog({ isOpen, setIsOpen, dataSources }: FieldDialogProps) {
  const [_, setTemplate] = useAtom(templateAtom);
  const [editingField, setEditingField] = useAtom(editingFieldAtom);
  
  // Update field properties
  const updateFieldProp = (prop: string, value: any) => {
    setEditingField(prev => ({
      ...prev,
      [prop]: value
    }));
  };
  
  // Update validation rules
  const updateValidationRule = (rule: string, value: any) => {
    setEditingField(prev => ({
      ...prev,
      validationRules: {
        ...prev.validationRules,
        [rule]: value
      }
    }));
  };
  
  // Add or update field to template
  const addOrUpdateField = () => {
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
    
    setIsOpen(false);
    toast.success(`Field ${editingField.id ? 'updated' : 'added'} successfully`);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
            onClick={() => setIsOpen(false)}
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
  );
}