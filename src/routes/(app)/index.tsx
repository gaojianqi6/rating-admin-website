import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/api/user";
import { useUserStore } from "@/store/user";

export const Route = createFileRoute("/(app)/")({
  component: Index,
});

function Index() {
  const setUser = useUserStore((state) => state.setUser);

  const { data: user } = useQuery({
    queryKey: ["user/me"],
    queryFn: async () => {
      const data = await getUser();
      // Store the user data in zustand so your app can access it globally
      setUser(data);
      return data;
    },
    enabled: !!localStorage.getItem("accessToken"),
  });
  
  return (
    <div className="p-2">
      <h3>Welcome Home! {user?.username}</h3>
      <div className="flex flex-col items-center justify-center min-h-svh">
        <Button>Click me</Button>
      </div>
    </div>
  );
}
