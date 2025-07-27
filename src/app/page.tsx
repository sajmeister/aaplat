import Link from 'next/link';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Bot, Cloud, Shield, Zap, Upload } from 'lucide-react';

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">
                AI Agent Platform
              </span>
            </div>
            <div>
              {session ? (
                <Link href="/dashboard">
                  <Button>
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/signin">
                  <Button>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Deploy AI Agents
              <span className="block text-blue-600">with Ease</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              The modern SaaS platform for deploying, managing, and scaling AI agents.
            </p>
            
            {!session && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signin">
                  <Button size="lg">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg">
                  View Documentation
                </Button>
              </div>
            )}

            {session && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard/agents/create">
                  <Button size="lg">
                    Create Agent
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/marketplace">
                  <Button variant="outline" size="lg">
                    Browse Agents
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="ghost" size="lg">
                    Dashboard
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to deploy AI agents
            </h2>
            <p className="text-lg text-gray-600">
              Following modern SaaS development patterns with zero budget constraints
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Fast Deployment</CardTitle>
                <CardDescription>
                  Deploy agents in seconds with Railway.app integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">Coming Soon</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Cloud className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>Cloud Native</CardTitle>
                <CardDescription>
                  Built for modern cloud infrastructure with Docker
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">Coming Soon</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Secure & Reliable</CardTitle>
                <CardDescription>
                  Enterprise-grade security with proper authentication
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="default">Available ✅</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Upload className="h-8 w-8 text-indigo-600 mb-2" />
                <CardTitle>Agent Upload</CardTitle>
                <CardDescription>
                  Upload and manage AI agents with drag-and-drop interface
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="default">Available ✅</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Bot className="h-8 w-8 text-orange-600 mb-2" />
                <CardTitle>Agent Marketplace</CardTitle>
                <CardDescription>
                  Discover and share AI agents with the community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="default">Available ✅</Badge>
              </CardContent>
            </Card>
          </div>
        </div>


      </main>
    </div>
  );
}
