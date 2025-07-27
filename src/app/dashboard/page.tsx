import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserProfile } from '@/components/dashboard/user-profile';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {session.user?.name}! Manage your AI agents and deployments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Agents</CardTitle>
              <CardDescription>Your deployed agents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <Badge variant="secondary">Coming Soon</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deployments</CardTitle>
              <CardDescription>Active deployments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <Badge variant="secondary">Coming Soon</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Calls</CardTitle>
              <CardDescription>This month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <Badge variant="secondary">Coming Soon</Badge>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <UserProfile session={session} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with your first agent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="outline">📚 Week 3: Agent Management (Coming Soon)</Badge>
                <Badge variant="outline">🚀 Week 4: Railway Deployment (Coming Soon)</Badge>
                <Badge variant="outline">🏪 Agent Marketplace (Coming Soon)</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 