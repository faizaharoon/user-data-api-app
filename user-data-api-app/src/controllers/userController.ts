import { Request, Response } from 'express';
import { LRUCache } from '../lib/LRUCache';

import { AsyncQueue } from '../lib/AsyncQueue';
import { User } from '../types';


// Mock database of users
const mockUsers: Record<string, User> = {
  "1": { id: 1, name: "John Doe", email: "john@example.com" },
  "2": { id: 2, name: "Jane Smith", email: "jane@example.com" },
  "3": { id: 3, name: "Alice Johnson", email: "alice@example.com" }
};

// Initialize LRU Cache with a capacity of 60 items
const cache = new LRUCache<User>(60);

// Initialize Async Queue with a concurrency limit of 3
const asyncQueue = new AsyncQueue(3);

// Map to track in-flight requests to prevent duplicate processing (Request Coalescing)
const inflightRequests = new Map<string, Promise<User | null>>();

/**
 * Simulates an asynchronous database fetch with a delay.
 * @param id Type string - User ID
 * @returns Promise<User | null>
 */
const fetchUserFromDb = (id: string): Promise<User | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockUsers[id] || null);
    }, 200);
  });
};

/**
 * Retrieves a user by ID.
 * Implements Caching, Request Coalescing, and Async Queueing.
 */
export const getUser = async (req: Request, res: Response) => {
  const id = req.params.id;

  // 1. Check Cache
  const cachedUser = cache.get(id);
  if (cachedUser) {
    // console.log(`Cache hit for user ${id}`);
    res.json(cachedUser);
    return;
  }

  // 2. Check In-Flight Requests (Request Coalescing)
  // If a request for this ID is already in progress, wait for it instead of starting a new one.
  if (inflightRequests.has(id)) {
    try {
      // console.log(`Waiting for in-flight request for user ${id}`);
      const user = await inflightRequests.get(id);
      if (user) {
         res.json(user);
      } else {
         res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
       res.status(500).json({ error: 'Internal Server Error' });
    }
    return;
  }

  // 3. Queue Database Fetch
  // Enqueue the fetch task to limit concurrent database access.
  const fetchTask = asyncQueue.enqueue(() => fetchUserFromDb(id));
  
  // Track this request as in-flight
  inflightRequests.set(id, fetchTask);

  try {
    const user = await fetchTask;
    
    if (user) {
      // Update Cache on success
      cache.set(id, user);
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    // Clean up in-flight request map
    inflightRequests.delete(id);
  }
};

/**
 * Creates a new user.
 * Updates both the mock DB and the cache.
 */
export const createUser = (req: Request, res: Response) => {
  console.log('ENTER createUser', req.body);
  const { name, email } = req.body;
  
  if (!name || !email) {
     res.status(400).json({ error: 'Name and email are required' });
     return;
  }

  // Generate a simple ID
  const id = (Object.keys(mockUsers).length + 1).toString();
  const newUser = { id: parseInt(id), name, email };
  
  // Save to DB and Cache
  mockUsers[id] = newUser;
  cache.set(id, newUser);
  
  console.log('Created user:', newUser);
  res.status(201).json(newUser);
};

/**
 * Clears the entire application cache.
 */
export const clearCache = (req: Request, res: Response) => {
  cache.clear();
  res.json({ message: 'Cache cleared successfully' });
};

/**
 * Returns current cache statistics (hits, misses, size).
 */
export const getCacheStatus = (req: Request, res: Response) => {
  res.json(cache.getStats());
};
