'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const errorMessages = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The sign in link is no longer valid.',
  Default: 'An unexpected error occurred.',
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') as keyof typeof errorMessages;
  
  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-red-900">Authentication Error</CardTitle>
          <CardDescription>
            {errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-3 rounded text-sm">
            <strong>Error Code:</strong> {error || 'Unknown'}
          </div>
          
          {error === 'Configuration' && (
            <div className="bg-blue-50 p-3 rounded text-sm">
              <strong>Possible causes:</strong>
              <ul className="mt-1 ml-4 list-disc">
                <li>Missing environment variables</li>
                <li>Database connection issues</li>
                <li>Invalid OAuth configuration</li>
              </ul>
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/auth/signin">
                Try Again
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                Go Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 