// Simple in-memory rate limiter
// Note: In production with multiple instances, use Redis or similar

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  rateLimitStore.forEach((entry, key) => {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  });
}, 60000); // Clean every minute

export interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Max requests per window
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;  // Seconds until reset
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { windowMs: 60000, maxRequests: 10 }
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  
  let entry = rateLimitStore.get(key);
  
  if (!entry || entry.resetTime < now) {
    // Create new entry
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: Math.ceil(config.windowMs / 1000),
    };
  }
  
  // Increment count
  entry.count++;
  
  const allowed = entry.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);
  const resetIn = Math.ceil((entry.resetTime - now) / 1000);
  
  return { allowed, remaining, resetIn };
}

// Specific rate limiters
export function checkLoginRateLimit(ip: string): RateLimitResult {
  return checkRateLimit(`login:${ip}`, {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    maxRequests: 5,  // 5 attempts per 15 minutes
  });
}

export function checkApiRateLimit(ip: string): RateLimitResult {
  return checkRateLimit(`api:${ip}`, {
    windowMs: 60 * 1000,  // 1 minute
    maxRequests: 60,  // 60 requests per minute
  });
}
