import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, Clock, AlertCircle, ArrowLeft } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  body?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  created_at: string;
  read_at?: string;
}

export default function NotificationsClient() {
  const [items, setItems] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const contactId = new URLSearchParams(location.search).get("contactId") || "";

  const loadNotifications = async () => {
    if (!contactId) {
      setError("Contact ID is required");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/client/notifications?contactId=${encodeURIComponent(contactId)}`);
      
      if (response.ok) {
        const data = await response.json();
        setItems(data);
        setError(null);
      } else {
        throw new Error(`Failed to load notifications: ${response.status}`);
      }
    } catch (err) {
      console.error("Error loading notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(
        `/api/client/notifications/${id}/read?contactId=${encodeURIComponent(contactId)}`, 
        { method: "POST" }
      );
      
      if (response.ok) {
        await loadNotifications();
      } else {
        console.error("Failed to mark notification as read");
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = items.filter(item => !item.read_at);
    
    try {
      await Promise.all(
        unreadNotifications.map(item => 
          fetch(`/api/client/notifications/${item.id}/read?contactId=${encodeURIComponent(contactId)}`, { 
            method: "POST" 
          })
        )
      );
      await loadNotifications();
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [contactId]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-amber-100 text-amber-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const unreadCount = items.filter(item => !item.read_at).length;

  if (!contactId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Contact ID Required</h2>
                <p className="text-gray-600">
                  Please provide a contact ID to view notifications.
                </p>
                <Button 
                  onClick={() => window.history.back()} 
                  className="mt-4"
                  variant="outline"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => window.history.back()}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Bell className="w-6 h-6" />
                Notifications
              </h1>
              <p className="text-gray-600 text-sm">Contact: {contactId}</p>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <Button 
              onClick={markAllAsRead}
              variant="outline"
              size="sm"
            >
              Mark All Read
            </Button>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center gap-4 mb-6">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {items.length} Total
          </Badge>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <Bell className="w-3 h-3" />
              {unreadCount} Unread
            </Badge>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading notifications...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Notifications</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={loadNotifications} variant="outline">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications List */}
        {!isLoading && !error && (
          <div className="space-y-4">
            {items.length === 0 ? (
              <Card>
                <CardContent className="p-8">
                  <div className="text-center">
                    <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">No Notifications</h2>
                    <p className="text-gray-600">You're all caught up! No new notifications at this time.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              items.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`${!notification.read_at ? 'ring-2 ring-teal-200 bg-teal-50/50' : 'bg-white'} transition-all`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getNotificationBadgeColor(notification.type)}`}
                            >
                              {notification.type}
                            </Badge>
                            {!notification.read_at && (
                              <Badge variant="destructive" className="text-xs">
                                NEW
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                          {notification.body && (
                            <p className="text-sm text-gray-800">{notification.body}</p>
                          )}
                        </div>
                      </div>
                      
                      {!notification.read_at && (
                        <Button
                          onClick={() => markAsRead(notification.id)}
                          variant="ghost"
                          size="sm"
                          className="ml-4"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark Read
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}