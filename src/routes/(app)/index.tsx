import { createFileRoute } from '@tanstack/react-router'
import { Button } from "@/components/ui/button"
import { useQuery } from '@tanstack/react-query'
import { getUser } from '@/api/user'

export const Route = createFileRoute('/(app)/')({
  component: Index,
})

function Index() {
  const { data } = useQuery({queryKey: ['user/me'], queryFn: getUser})
  return (
    <div className="p-2">
      <h3>Welcome Home! {data?.username}</h3>
      <div className="flex flex-col items-center justify-center min-h-svh">
        <Button>Click me</Button>
      </div>
    </div>
  )
}