'use client';

import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User } from 'lucide-react';

interface UserProfileProps {
  session: Session;
}

export function UserProfile({ session }: UserProfileProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };



  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Avatar className="h-12 w-12">
          <AvatarImage 
            src={session.user?.image || ''} 
            alt={session.user?.name || 'User'} 
          />
          <AvatarFallback>
            <User className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">
            {session.user?.name || 'Anonymous User'}
          </h3>
          <p className="text-sm text-gray-500">
            {session.user?.email}
          </p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Account Type:</span>
          <span className="font-medium">Free Tier</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Joined:</span>
          <span className="font-medium">Today</span>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button 
          onClick={handleSignOut} 
          variant="outline" 
          size="sm"
          className="w-full"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
} 