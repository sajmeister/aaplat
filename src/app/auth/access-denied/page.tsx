'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export default function AccessDeniedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-3">
            <p className="text-gray-600">
              Sorry, you don't have permission to access this application.
            </p>
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 font-medium">
                🔒 Restricted Application
              </p>
              <p className="text-xs text-red-700 mt-1">
                Only authorized users (sajmeister) can access this AI Agent Deployment Platform.
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/')}
              variant="outline"
              size="lg"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                If you believe this is an error, please contact the administrator.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 