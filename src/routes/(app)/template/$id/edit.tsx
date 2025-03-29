import TemplatePage from '@/pages/template';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(app)/template/$id/edit')({
  component: TemplatePage,
});

