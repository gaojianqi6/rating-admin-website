// src/api/template.ts
import api from "@/lib/api";
import { Template, TemplateListResponse, TemplateListRequest } from "@/typings/template";

function getURLSearchParams<T extends object>(
  params: T, 
  paramKeys: Array<keyof T>
): URLSearchParams {
  const searchParams: URLSearchParams = new URLSearchParams();
  
  paramKeys.forEach(key => {
    const value = params[key];
    
    // Skip undefined values
    if (value === undefined) {
      return;
    }
    
    // Special handling for status
    if (key === 'status' && value === 'all') {
      return; // Skip 'all' status
    }
    
    // Type narrowing - this is what makes unknown safe
    if (
      typeof value === 'string' || 
      typeof value === 'number' || 
      typeof value === 'boolean'
    ) {
      searchParams.append(key as string, String(value));
    }
  });

  return searchParams;
}

/**
 * Fetch a paginated list of templates
 */
export const getTemplates = async (params: TemplateListRequest = {}): Promise<TemplateListResponse> => {
  const searchParams = getURLSearchParams(params, [
    'pageNo', 
    'pageSize', 
    'search', 
    'status', 
    'sortBy', 
    'sortOrder'
  ])
;  // Pass all params directly to the endpoint
  return api.get("v1/templates", { 
    searchParams: searchParams as URLSearchParams,
  }).json<TemplateListResponse>();
};

/**
 * Fetch detailed information for a specific template
 */
export const getTemplate = (id: string): Promise<Template> => 
  api.get(`v1/templates/${id}`).json();

/**
 * Get data sources for template fields
 */
export const getDataSources = async () => api.get('v1/data-sources').json();

/**
 * Create a new template
 */
export const createTemplate = (template: any): Promise<Template> => 
  api.post("v1/templates", { json: template }).json();

/**
 * Update an existing template
 */
export const updateTemplate = (id: string, template: any): Promise<Template> => {
  console.log("update template:", id, template);
  return api.put(`v1/templates/${id}`, { json: template }).json();
}

/**
 * Delete a template
 */
export const deleteTemplate = (id: string): Promise<void> => 
  api.delete(`v1/templates/${id}`).json();

/**
 * Clone an existing template
 */
export const cloneTemplate = (id: string): Promise<Template> => 
  api.post(`v1/templates/${id}/clone`).json();

/**
 * Publish a template
 */
export const publishTemplate = (id: string): Promise<any> => 
  api.patch(`v1/templates/${id}/publish`).json();

/**
 * Unpublish a template
 */
export const unpublishTemplate = (id: string): Promise<any> => 
  api.patch(`v1/templates/${id}/unpublish`).json();