import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { getUser } from "@/api/user";
import { getStatistics, Statistics } from "@/api/statistics";
import { useUserStore } from "@/store/user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StarIcon, ListIcon, LayoutDashboardIcon, LayoutTemplateIcon, UserIcon } from "lucide-react";

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

  const { data: statistics } = useQuery<Statistics>({
    queryKey: ["statistics/total"],
    queryFn: getStatistics,
  });

  const getMostPopularTemplate = () => {
    if (!statistics) return '';
    const [template] = Object.entries(statistics.itemsByTemplate)
      .sort(([, a], [, b]) => b - a)[0];
    return template.replace(/([A-Z])/g, ' $1').trim();
  };

  const quickActions = [
    {
      title: "Items List",
      description: "View and manage all items",
      icon: ListIcon,
      link: "/items/list",
      color: "text-blue-500",
    },
    {
      title: "Template List",
      description: "View all templates",
      icon: LayoutTemplateIcon,
      link: "/template/list",
      color: "text-purple-500",
    },
    {
      title: "My Profile",
      description: "View and edit your profile",
      icon: UserIcon,
      link: "/user/profile",
      color: "text-green-500",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <Card className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold text-white mb-2">
                Welcome back, {user?.username}! 👋
              </CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                Here's what's happening with your rating admin system
              </CardDescription>
            </div>
            <LayoutDashboardIcon className="h-12 w-12 text-white opacity-80" />
          </div>
        </CardHeader>
      </Card>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <ListIcon className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.totalItems || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <StarIcon className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.overallStatistics.averageRating.toFixed(1) || '0.0'}</div>
            <p className="text-xs text-gray-500">Total Ratings: {statistics?.overallStatistics.totalRatings || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Most Items</CardTitle>
            <LayoutTemplateIcon className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {getMostPopularTemplate()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Stats */}
      <h2 className="text-2xl font-bold mb-4">Items by Template</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statistics && ['movie', 'tvSeries', 'varietyShow', 'book', 'music', 'podcast'].map((template) => (
          <Card key={template}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium capitalize">
                {template.replace(/([A-Z])/g, ' $1').trim()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.itemsByTemplate[template] || 0}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action) => (
          <Card key={action.title} className="hover:shadow-lg transition-shadow">
            <Link to={action.link} className="block h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-lg font-medium">{action.title}</CardTitle>
                <action.icon className={`h-5 w-5 ${action.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">{action.description}</p>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
