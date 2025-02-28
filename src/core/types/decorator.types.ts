import { EVENTS } from 'domain/enums/events.enum';

export type SortOrder = 'asc' | 'desc';

export const REDIS_CACHE_KEYS = {
  ORDER_INVOICE_GET_LIST: 'order:invoice:get:list',
  ROLE_GET_LIST: 'role:get:list',
  USER_GET_LIST: 'user:get:list'
} as const;

export type RedisCacheKeys = { cacheKey: string, ttl: number };
export type RedisCacheKey = typeof REDIS_CACHE_KEYS[keyof typeof REDIS_CACHE_KEYS];
export type RedisDecoratorOption<T> = { keyTemplate: RedisCacheKey; event?: EVENTS, sortBy?: keyof T, sortOrder?: SortOrder };

export type EventDecoratorOption = { keyTemplate: RedisCacheKey; event?: EVENTS };
