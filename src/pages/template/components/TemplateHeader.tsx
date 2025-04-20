// src/pages/template/components/TemplateHeader.tsx
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtom } from 'jotai';
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createTemplate, updateTemplate } from "@/api/template";
import { templateAtom } from "../index";

interface TemplateHeaderProps {
  mode: 'create' | 'edit' | 'view';
  templateData: any;
}

export function TemplateHeader({ mode, templateData }: TemplateHeaderProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [template] = useAtom(templateAtom);
  
  const isEditMode = mode === 'edit';
  const isViewMode = mode === 'view';
  
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
    mutationFn: ({ id, data }) => updateTemplate(id, data),
    onSuccess: () => {
      toast.success("Template updated successfully");
      queryClient.invalidateQueries({ queryKey: ['template', templateData.id] });
      navigate({ to: "/template/list" });
    },
    onError: (error) => {
      toast.error(`Failed to update template: ${error.message}`);
    }
  });
  
  // Check if template has required fields filled
  const hasRequiredFields = template.name?.trim() && template.displayName?.trim();
  
  const handleSubmit = () => {
    if (!hasRequiredFields) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Clean up validation rules - remove null/undefined values
    const cleanedFields = template.fields?.map(field => {
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
      updateMutation.mutate({ id: templateData.id, data: submissionData });
    } else {
      createMutation.mutate(submissionData);
    }
  };
  
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link to="/template/list">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          {isEditMode ? "Edit Template" : isViewMode ? "View Template" : "Create Template"}
        </h2>
      </div>
      
      {!isViewMode && (
        <Button 
          onClick={handleSubmit}
          disabled={createMutation.isPending || updateMutation.isPending || !hasRequiredFields}
        >
          {(createMutation.isPending || updateMutation.isPending) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          <Save className="mr-2 h-4 w-4" />
          {isEditMode ? "Update Template" : "Create Template"}
        </Button>
      )}
      
      {isViewMode && templateData.id && (
        <Button 
          variant="outline"
          onClick={() => navigate({ to: `/template/${templateData.id}/edit` })}
        >
          <Eye className="mr-2 h-4 w-4" />
          Edit Template
        </Button>
      )}
    </div>
  );
}