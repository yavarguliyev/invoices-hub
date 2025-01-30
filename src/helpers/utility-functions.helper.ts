import { Constructable } from 'typedi';
import crypto from 'crypto';
import winston from 'winston';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';

import { LoggerTracerInfrastructure } from 'infrastructure/logger-tracer.infrastructure';
import { ContainerHelper } from 'ioc/helpers/container.helper';
import { RedisCacheKeys, SortOrder } from 'value-objects/types/decorator/decorator.types';
import { Version } from 'value-objects/types/controllers/version-control.type';
import { GetQueryResultsArgs } from 'value-objects/inputs/query-results/get-query-results.args';

export const safelyInitializeService = async (serviceName: string, initializeFn: () => Promise<void>): Promise<void> => {
  try {
    await initializeFn();
    LoggerTracerInfrastructure.log(`${serviceName} initialized successfully`, 'info');
  } catch (err: any) {
    LoggerTracerInfrastructure.log(`${serviceName} initialization failed: ${err?.message || 'An unknown error occurred'}`, 'error');
    throw err;
  }
};

export const ensureInitialized = <T> (connection: T | undefined, serviceName: string): T => {
  if (!connection) {
    throw new Error(`${serviceName} is not initialized. Call initialize() first.`);
  }

  return connection;
};

export const getEnvVariable = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }

  return value;
};

export const handleProcessSignals = (shutdownCallback: (...args: any[]) => Promise<void>, ...callbackArgs: any[]): void => {
  ['SIGINT', 'SIGTERM'].forEach(signal => process.on(signal, async () => await shutdownCallback(...callbackArgs)));
};

export const logWorkerStatus = (message: string, pid: number): void => {
  LoggerTracerInfrastructure.log(`${message}: ${pid}`, 'info');
};

export const registerService = <T> (id: string, service: Constructable<T>, isSingleton: boolean = true): void => {
  if (isSingleton) {
    ContainerHelper.addSingleton<T>(id, service);
  } else {
    ContainerHelper.addTransient<T>(id, service);
  }
};

export const generateCacheKey = (keyTemplate: string): RedisCacheKeys => {
  const ttl = Number(process.env.REDIS_DEFAULT_CACHE_TTL);
  const funcHash = crypto.createHash('md5').update(keyTemplate.toString()).digest('hex');
  const cacheKey = `${keyTemplate}:${funcHash}:${keyTemplate}`;

  return { cacheKey, ttl };
};

export const compareValues = <T> (a: T, b: T, key: keyof T, sortOrder: SortOrder): number => {
  const valA = a[key];
  const valB = b[key];

  if (typeof valA === 'string' && typeof valB === 'string') {
    return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
  } else if (typeof valA === 'number' && typeof valB === 'number') {
    return sortOrder === 'asc' ? valA - valB : valB - valA;
  } else if (valA instanceof Date && valB instanceof Date) {
    return sortOrder === 'asc' ? valA.getTime() - valB.getTime() : valB.getTime() - valA.getTime();
  } else {
    return 0;
  }
};

export const queryResults = async <T extends Record<string, any>, DTO extends Record<string, any>, RelatedDTO extends Record<string, any>> (
  repository: Repository<T>, query: GetQueryResultsArgs, dtoClass: new () => DTO, relatedEntity?: { RelatedDtoClass: new () => RelatedDTO, relationField: string }
): Promise<{ payloads: DTO[], total: number }> => {
  const { page = 1, limit = 10, filters = {}, order = {} } = query;
  const offset = (page - 1) * limit;

  const [items, total] = await repository.findAndCount({ where: filters, order, take: limit, skip: offset });

  const dtos = await Promise.all(
    items.map(async (item) => {
      const relationDto = relatedEntity?.relationField ? await item[relatedEntity.relationField] : undefined;
      const dto = plainToInstance(dtoClass, item, { excludeExtraneousValues: true });

      if (relationDto && relatedEntity?.RelatedDtoClass) {
        (dto as Record<string, any>)[relatedEntity.relationField] = plainToInstance(relatedEntity.RelatedDtoClass, relationDto, { excludeExtraneousValues: true });
      }

      return dto;
    })
  );

  return { payloads: dtos, total };
};

export const createVersionedRoute = (controllerPath: string, version: Version) => {
  return `/api/${version}${controllerPath}`;
};

export const winstonLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `[${timestamp}] [${level.toUpperCase()}] ${message}`)
  ),
  transports: [new winston.transports.Console({ format: winston.format.combine(winston.format.colorize(), winston.format.simple()) })]
});
