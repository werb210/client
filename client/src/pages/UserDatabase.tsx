import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiFetch } from '@/lib/api';

interface DatabaseUser {
  id: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  hasPassword?: boolean;
}

export default function UserDatabase() {
  const [users, setUsers] = useState<DatabaseUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    setUsers([]);

    try {
      const response = await apiFetch('/users', {
        method: 'GET',
        credentials: 'include',
        mode: 'cors'
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch users');
      }
    } catch (err: any) {
      setError(`Connection error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Database Users</CardTitle>
          <p className="text-sm text-muted-foreground">
            View existing users in the database for testing password reset functionality
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={fetchUsers} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Loading Users...' : 'Fetch Users from Database'}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-medium">Error:</p>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {users.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Found {users.length} users:</h3>
              {users.map((user) => (
                <Card key={user.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-medium">{user.email}</p>
                      {user.firstName && user.lastName && (
                        <p className="text-sm text-muted-foreground">
                          {user.firstName} {user.lastName}
                        </p>
                      )}
                      {user.phone && (
                        <p className="text-sm text-muted-foreground">
                          Phone: {user.phone}
                        </p>
                      )}
                      {user.createdAt && (
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Badge variant="outline">ID: {user.id}</Badge>
                      {user.hasPassword && (
                        <Badge variant="default">Has Password</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {users.length === 0 && !isLoading && !error && (
            <div className="text-center py-8 text-muted-foreground">
              Click "Fetch Users" to view database users
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Testing Password Reset:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use any email from the list above to test password reset</li>
              <li>• Go to <code>/request-reset</code> and enter the email</li>
              <li>• Check the staff backend logs for the reset token</li>
              <li>• Visit <code>/reset-password/[token]</code> to test password reset</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}