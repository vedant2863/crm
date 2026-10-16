import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { getSocketServer } from "@/lib/socket/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface SubsystemHealth {
  status: "up" | "down" | "degraded";
  latencyMs?: number;
  message?: string;
  details?: Record<string, unknown>;
}

export async function GET() {
  const startTime = performance.now();
  const checks: Record<string, SubsystemHealth> = {};
  let isHealthy = true;

  // 1. Database Connectivity Check
  const dbStart = performance.now();
  try {
    await dbConnect();
    const readyState = mongoose.connection.readyState;
    const dbLatency = Math.round(performance.now() - dbStart);

    if (readyState === 1) {
      // Perform active ping
      if (mongoose.connection.db) {
        await mongoose.connection.db.admin().ping();
      }
      checks.database = {
        status: "up",
        latencyMs: dbLatency,
        details: {
          readyState: "connected",
          host: mongoose.connection.host,
          name: mongoose.connection.name,
        },
      };
    } else {
      isHealthy = false;
      const stateMap: Record<number, string> = {
        0: "disconnected",
        2: "connecting",
        3: "disconnecting",
      };
      checks.database = {
        status: "down",
        latencyMs: dbLatency,
        message: `Database in state: ${stateMap[readyState] || "unknown"}`,
      };
    }
  } catch (err) {
    isHealthy = false;
    checks.database = {
      status: "down",
      latencyMs: Math.round(performance.now() - dbStart),
      message: err instanceof Error ? err.message : "Database connection failed",
    };
  }

  // 2. Real-Time Socket.io Server Check
  const io = getSocketServer();
  if (io) {
    const clientsCount = io.engine?.clientsCount ?? io.sockets?.sockets?.size ?? 0;
    checks.realtime = {
      status: "up",
      details: {
        engine: "socket.io",
        path: "/api/socket/io",
        connectedClients: clientsCount,
      },
    };
  } else {
    // Non-fatal if socket runs on different worker or standalone
    checks.realtime = {
      status: "degraded",
      message: "Socket.io instance not initialized in current worker context",
    };
  }

  // 3. Process & Memory Metrics
  const memUsage = process.memoryUsage();
  const memory = {
    rssMb: Math.round(memUsage.rss / 1024 / 1024),
    heapTotalMb: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsedMb: Math.round(memUsage.heapUsed / 1024 / 1024),
    externalMb: Math.round(memUsage.external / 1024 / 1024),
  };

  const totalDurationMs = Math.round(performance.now() - startTime);

  const payload = {
    status: isHealthy ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    durationMs: totalDurationMs,
    version: process.env.npm_package_version || "1.1.0",
    environment: process.env.NODE_ENV || "development",
    checks,
    system: {
      memory,
      nodeVersion: process.version,
      pid: process.pid,
    },
  };

  const status = isHealthy ? 200 : 503;

  return NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "X-Response-Time": `${totalDurationMs}ms`,
    },
  });
}

export async function HEAD() {
  const readyState = mongoose.connection.readyState;
  const isHealthy = readyState === 1;

  return new NextResponse(null, {
    status: isHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}
