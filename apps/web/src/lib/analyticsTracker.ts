type EventType = 'VIEW' | 'SEARCH' | 'ADD_TO_CART' | 'WISHLIST' | 'REQUEST' | 'PURCHASE';

interface TrackingPayload {
  productId?: string;
  categoryId?: string;
  searchQuery?: string;
  productRequestId?: string;
}

interface AnalyticsEvent extends TrackingPayload {
  eventType: EventType;
}

class AnalyticsTracker {
  private queue: AnalyticsEvent[] = [];
  private flushIntervalId: NodeJS.Timeout | null = null;
  private FLUSH_INTERVAL_MS = 10000; // 10 seconds

  constructor() {
    if (typeof window !== 'undefined') {
      this.startInterval();
      // Ensure we flush on page unload
      window.addEventListener('beforeunload', () => {
        this.flush();
      });
    }
  }

  private startInterval() {
    this.flushIntervalId = setInterval(() => {
      this.flush();
    }, this.FLUSH_INTERVAL_MS);
  }

  public track(eventType: EventType, payload?: TrackingPayload) {
    this.queue.push({
      eventType,
      ...payload,
    });
    
    // If the queue gets too large, flush immediately
    if (this.queue.length >= 50) {
      this.flush();
    }
  }

  private async flush() {
    if (this.queue.length === 0) return;

    const eventsToSend = [...this.queue];
    this.queue = []; // clear queue immediately

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Using fetch instead of RTK Query to avoid circular dependencies and keep it lightweight
      // Also allows 'keepalive: true' which is great for page unloads
      await fetch(`${baseUrl}/analytics/events/bulk`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ events: eventsToSend }),
        keepalive: true, // Crucial for beforeunload
      });
    } catch (error) {
      console.error('Failed to flush analytics events', error);
      // In a more robust system, we might push them back to the queue
      // this.queue = [...eventsToSend, ...this.queue];
    }
  }
}

// Export a singleton instance
export const analyticsTracker = new AnalyticsTracker();
