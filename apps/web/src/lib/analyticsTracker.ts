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
    const sanitized: AnalyticsEvent = { eventType };
    if (payload?.productId && typeof payload.productId === 'string' && payload.productId.trim()) {
      sanitized.productId = payload.productId.trim();
    }
    if (payload?.categoryId && typeof payload.categoryId === 'string' && payload.categoryId.trim()) {
      sanitized.categoryId = payload.categoryId.trim();
    }
    if (payload?.productRequestId && typeof payload.productRequestId === 'string' && payload.productRequestId.trim()) {
      sanitized.productRequestId = payload.productRequestId.trim();
    }
    if (payload?.searchQuery && typeof payload.searchQuery === 'string' && payload.searchQuery.trim()) {
      sanitized.searchQuery = payload.searchQuery.trim();
    }

    this.queue.push(sanitized);

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
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('access_token') || localStorage.getItem('token')
          : null;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch(`${baseUrl}/analytics/events/bulk`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ events: eventsToSend }),
        credentials: 'include',
      });
    } catch (error) {
      // Gracefully silent on telemetry network failures
    }
  }
}

// Export a singleton instance
export const analyticsTracker = new AnalyticsTracker();
