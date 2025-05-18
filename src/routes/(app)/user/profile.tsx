import { createFileRoute } from '@tanstack/react-router'
import { useUserStore } from '@/store/user'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { format } from 'date-fns'

function UserProfile() {
  const { user } = useUserStore()

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading user profile...</p>
      </div>
    )
  }

  const formattedCreatedTime = format(new Date(user.createdTime), 'yyyy-MM-dd HH:mm:ss')

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src="/avatar.jpeg" alt={user.username} />
              <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl font-bold">{user.username}</CardTitle>
              <p className="text-muted-foreground">{user.roleName}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Username</Label>
              <p className="text-lg">{user.username}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Email</Label>
              <p className="text-lg">{user.email}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Role</Label>
              <p className="text-lg">{user.roleName}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Created Time</Label>
              <p className="text-lg">{formattedCreatedTime}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/(app)/user/profile')({
  component: UserProfile,
})
