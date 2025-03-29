// src/pages/template/index.tsx
import { useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { atom, useAtom } from 'jotai';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

import { getTemplate, getDataSources } from "@/api/template";
import { Template, TemplateField } from "@/typings/template";
import { INITIAL_TEMPLATE_DATA } from "@/store/template";

import { TemplateHeader } from "./components/TemplateHeader";
import { TemplateBasicInfo } from "./components/TemplateBasicInfo";
import { TemplateFields } from "./components/TemplateFields";

// Create atoms for state management
export const templateAtom = atom<Template>({ ...INITIAL_TEMPLATE_DATA });
export const editingFieldAtom = atom<TemplateField>({ 
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

export default function TemplatePage() {
  const { id = "" } = useParams({ strict: false });
  const mode = id 
    ? window.location.pathname.includes('/edit') 
      ? 'edit'
      : 'view'
    : 'create';
    
  const isEditMode = mode === 'edit';
  const isViewMode = mode === 'view';
  const isReadOnly = isViewMode;

  const [_, setTemplate] = useAtom(templateAtom);
  
  const [activeTab, setActiveTab] = useState("basic");
  
  // Data Queries
  const { data: dataSources = [] } = useQuery({
    queryKey: ['dataSources'],
    queryFn: getDataSources,
    initialData: []
  });
  
  const { data: templateData, isLoading: isTemplateLoading } = useQuery({
    queryKey: ['template', id],
    queryFn: () => getTemplate(id),
    enabled: !!id,
    initialData: INITIAL_TEMPLATE_DATA,
  });

  // Update the template atom when data is loaded or mode changes
  useEffect(() => {
    if (isEditMode || isViewMode) {
      if (templateData && !isTemplateLoading) {
        setTemplate(templateData);
      }
    } else {
      // Reset to initial data for create mode
      setTemplate({ ...INITIAL_TEMPLATE_DATA });
    }
  }, [templateData, isTemplateLoading, mode, setTemplate]);
  
  if ((isEditMode || isViewMode) && isTemplateLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4 p-8 pt-6">
      <TemplateHeader 
        mode={mode} 
        templateData={templateData}
      />

      <Tabs
        defaultValue="basic"
        className="w-full"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="fields">
            Template Fields ({templateData.fields?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <TemplateBasicInfo 
            mode={mode}
            onNext={() => setActiveTab("fields")}
          />
        </TabsContent>

        <TabsContent value="fields">
          <TemplateFields 
            mode={mode}
            dataSources={dataSources}
            onBack={() => setActiveTab("basic")}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}