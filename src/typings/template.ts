// src/typings/template.ts
export interface Template {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  fullMarks: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  updatedBy?: number;
  creatorName?: string;
  updaterName?: string;
  fields?: TemplateField[];
}

export interface TemplateField {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  fieldType: string;
  isRequired: boolean;
  isSearchable: boolean;
  isFilterable: boolean;
  displayOrder: number;
  dataSourceId?: number | null;
  validationRules?: any;
}

export interface TemplateListResponse {
  list: Template[];
  pageNo: number;
  pageSize: number;
  total: number;
}

export interface TemplateListRequest {
  pageNo?: number;
  pageSize?: number;
  search?: string;
  status?: 'published' | 'draft' | 'all';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}