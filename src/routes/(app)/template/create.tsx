import { TemplateEditorPage } from '@/pages/template/EditorPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(app)/template/create')({
  component: TemplateEditorPage,
})
