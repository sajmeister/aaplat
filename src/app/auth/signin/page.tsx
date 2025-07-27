import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { SignInForm } from '@/components/auth/signin-form';

export const metadata: Metadata = {
  title: 'Sign In | AI Agent Platform',
  description: 'Sign in to deploy and manage your AI agents',
};

export default async function SignInPage() {
  const session = await auth();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Deploy and manage AI agents with ease
          </p>
        </div>
        
        {/* Development Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                OAuth Setup Required
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>To enable Google/GitHub sign-in, OAuth applications need to be configured in the respective developer consoles.</p>
              </div>
            </div>
          </div>
        </div>
        
        <SignInForm />
      </div>
    </div>
  );
} 