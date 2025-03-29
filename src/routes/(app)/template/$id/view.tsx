import { TemplateViewPage } from '@/pages/template/ViewEditor'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/template/$id/view')({
  component: TemplateViewPage,
})
