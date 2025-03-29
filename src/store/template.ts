import { Template } from "@/typings/template";

// The complete static template data provided
export const INITIAL_TEMPLATE_DATA: Template = {
  id: 0,
  name: "",
  displayName: "",
  description:
    "",
  fullMarks: 10,
  isPublished: false,
  createdAt: "",
  updatedAt: "",
  createdBy: 0,
  updatedBy: 0,
  creatorName: "",
  updaterName: "",
  fields: [
    {
      id: 0,
      name: "",
      displayName: "",
      description: "",
      fieldType: "text",
      isRequired: false,
      isSearchable: true,
      isFilterable: false,
      displayOrder: 0,
      dataSourceId: 0,
      validationRules: {
        maxLength: 500,
      },
    },
  ],
};