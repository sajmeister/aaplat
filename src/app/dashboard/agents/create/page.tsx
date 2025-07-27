'use client';

import { CreateAgentForm } from '@/components/agent/create-agent-form-simple';
import { useRouter } from 'next/navigation';

export default function CreateAgentPage() {
  const router = useRouter();

  const handleSuccess = (agentId: string) => {
    // Handle different redirect types
    if (agentId === 'dashboard') {
      router.push('/dashboard');
    } else {
      // Redirect to dashboard since agent detail page doesn't exist yet
      router.push('/dashboard');
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/agents');
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Agent</h1>
        <p className="text-gray-600 mt-2">
          Upload your agent code and configure it for deployment
        </p>
      </div>

      <CreateAgentForm 
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
} 