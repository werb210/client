/**
 * Notification Service
 * Handles real-time notifications with Server-Sent Events (SSE) support
 */

import { db } from "../db";
import { sql } from "drizzle-orm";

// Active SSE connections
interface NotificationSink {
  write: (chunk: string) => void;
  closed: boolean;
}

const staffSubscriptions = new Map<string, Set<NotificationSink>>();
const contactSubscriptions = new Map<string, Set<NotificationSink>>();

export function subscribe(type: 'staff' | 'contact', id: string, sink: NotificationSink): () => void {
  const subscriptions = type === 'staff' ? staffSubscriptions : contactSubscriptions;
  
  if (!subscriptions.has(id)) {
    subscriptions.set(id, new Set());
  }
  
  subscriptions.get(id)!.add(sink);
  
  // Return unsubscribe function
  return () => {
    const sinks = subscriptions.get(id);
    if (sinks) {
      sinks.delete(sink);
      if (sinks.size === 0) {
        subscriptions.delete(id);
      }
    }
    sink.closed = true;
  };
}

export async function notifyStaff(
  userId: string, 
  notification: {
    type: string;
    title: string;
    body?: string;
    link_url?: string;
  }
): Promise<string> {
  try {
    // Insert notification into database
    const result = await db.execute(sql`
      INSERT INTO notifications (user_id, type, title, body, link_url)
      VALUES (${userId}, ${notification.type}, ${notification.title}, ${notification.body || null}, ${notification.link_url || null})
      RETURNING id
    `);
    
    const notificationId = result.rows?.[0]?.id;
    
    if (notificationId) {
      // Send real-time update to connected staff clients
      const sinks = staffSubscriptions.get(userId);
      if (sinks) {
        const eventData = JSON.stringify({
          id: notificationId,
          type: notification.type,
          title: notification.title,
          body: notification.body,
          link_url: notification.link_url,
          created_at: new Date().toISOString()
        });
        
        const message = `event: notification\ndata: ${eventData}\n\n`;
        
        sinks.forEach(sink => {
          if (!sink.closed) {
            try {
              sink.write(message);
            } catch (error) {
              console.error('Error writing to SSE sink:', error);
              sink.closed = true;
            }
          }
        });
        
        // Clean up closed connections
        Array.from(sinks).forEach(sink => {
          if (sink.closed) {
            sinks.delete(sink);
          }
        });
      }
    }
    
    return notificationId;
  } catch (error) {
    console.error('Error creating staff notification:', error);
    throw error;
  }
}

export async function notifyContact(
  contactId: string,
  notification: {
    type: string;
    title: string;
    body?: string;
    link_url?: string;
  }
): Promise<string> {
  try {
    // Insert notification into database
    const result = await db.execute(sql`
      INSERT INTO notifications (contact_id, type, title, body, link_url)
      VALUES (${contactId}, ${notification.type}, ${notification.title}, ${notification.body || null}, ${notification.link_url || null})
      RETURNING id
    `);
    
    const notificationId = result.rows?.[0]?.id;
    
    if (notificationId) {
      // Send real-time update to connected client applications
      const sinks = contactSubscriptions.get(contactId);
      if (sinks) {
        const eventData = JSON.stringify({
          id: notificationId,
          type: notification.type,
          title: notification.title,
          body: notification.body,
          link_url: notification.link_url,
          created_at: new Date().toISOString()
        });
        
        const message = `event: notification\ndata: ${eventData}\n\n`;
        
        sinks.forEach(sink => {
          if (!sink.closed) {
            try {
              sink.write(message);
            } catch (error) {
              console.error('Error writing to SSE sink:', error);
              sink.closed = true;
            }
          }
        });
        
        // Clean up closed connections
        Array.from(sinks).forEach(sink => {
          if (sink.closed) {
            sinks.delete(sink);
          }
        });
      }
    }
    
    return notificationId;
  } catch (error) {
    console.error('Error creating contact notification:', error);
    throw error;
  }
}

export async function markAsRead(notificationId: string, userId?: string, contactId?: string): Promise<boolean> {
  try {
    let query;
    if (userId) {
      query = sql`
        UPDATE notifications 
        SET read_at = now() 
        WHERE id = ${notificationId} AND user_id = ${userId}
      `;
    } else if (contactId) {
      query = sql`
        UPDATE notifications 
        SET read_at = now() 
        WHERE id = ${notificationId} AND contact_id = ${contactId}
      `;
    } else {
      throw new Error('Either userId or contactId must be provided');
    }
    
    const result = await db.execute(query);
    return (result as any).rowCount > 0;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

export async function getNotifications(
  userId?: string, 
  contactId?: string, 
  limit: number = 100
): Promise<any[]> {
  try {
    let query;
    if (userId) {
      query = sql`
        SELECT id, type, title, body, link_url, read_at, created_at
        FROM notifications 
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    } else if (contactId) {
      query = sql`
        SELECT id, type, title, body, link_url, read_at, created_at
        FROM notifications 
        WHERE contact_id = ${contactId}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    } else {
      throw new Error('Either userId or contactId must be provided');
    }
    
    const result = await db.execute(query);
    return result.rows || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

export async function getUnreadCount(userId?: string, contactId?: string): Promise<number> {
  try {
    let query;
    if (userId) {
      query = sql`
        SELECT COUNT(*) as count
        FROM notifications 
        WHERE user_id = ${userId} AND read_at IS NULL
      `;
    } else if (contactId) {
      query = sql`
        SELECT COUNT(*) as count
        FROM notifications 
        WHERE contact_id = ${contactId} AND read_at IS NULL
      `;
    } else {
      throw new Error('Either userId or contactId must be provided');
    }
    
    const result = await db.execute(query);
    return parseInt((result.rows?.[0] as any)?.count || '0');
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
}

// Helper function to broadcast to all staff
export async function broadcastToAllStaff(notification: {
  type: string;
  title: string;
  body?: string;
  link_url?: string;
}): Promise<void> {
  try {
    // This would require getting all active staff user IDs
    // For now, we'll implement a simple broadcast mechanism
    console.log('Broadcasting to all staff:', notification);
    
    // In a real implementation, you'd query for all active staff users
    // and send notifications to each one
  } catch (error) {
    console.error('Error broadcasting to all staff:', error);
  }
}

// Cleanup function to remove closed connections
export function cleanupConnections(): void {
  [staffSubscriptions, contactSubscriptions].forEach(subscriptions => {
    subscriptions.forEach((sinks, id) => {
      Array.from(sinks).forEach(sink => {
        if (sink.closed) {
          sinks.delete(sink);
        }
      });
      
      if (sinks.size === 0) {
        subscriptions.delete(id);
      }
    });
  });
}

// Run cleanup every 5 minutes
setInterval(cleanupConnections, 5 * 60 * 1000);