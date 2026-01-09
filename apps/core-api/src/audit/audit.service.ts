import { Injectable, Logger } from "@nestjs/common";
import { AuditLogEntry } from "@t-ecosystem/core-types";
import { randomUUID } from "crypto";

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  log(entry: Omit<AuditLogEntry, "id" | "timestamp">) {
    const logEntry: AuditLogEntry = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      ...entry,
    };

    // In a real environment, this would write to a structured log store (Elasticsearch, PostgreSQL, etc.)
    // For now, we log to stdout as valid JSON for easy parsing by external tools.
    this.logger.log(JSON.stringify(logEntry));
  }
}
