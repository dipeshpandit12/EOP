// File: app/api/connect/route.ts
import { NextResponse } from 'next/server';

// Service status response type
interface ServiceStatus {
  status: string;
  message: string;
  timestamp: string;
}

// Health response type definition
interface ComponentStatus {
  status: 'ok' | 'error' | 'unknown';
  message: string;
}

interface HealthResponse {
  status: 'healthy' | 'degraded';
  components: {
    api_server: ComponentStatus;
    gemini_service: ComponentStatus;
    database: ComponentStatus;
    proposal_generation: ComponentStatus;
    realtime_updates: ComponentStatus;
  };
  timestamp: string;
}

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || 'http://localhost:8000';

// Function to fetch service status
async function fetchServiceStatus(endpoint: string): Promise<ServiceStatus | null> {
  try {
    const response = await fetch(`${FASTAPI_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.error(`Service check ${endpoint} failed with status: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error checking ${endpoint}:`, error);
    return null;
  }
}

/**
 * GET handler for the /api/connect endpoint.
 * Calls multiple FastAPI endpoints to check the status of each service individually.
 * 
 * Checks the following services:
 * - API Server (/check/api-server)
 * - Gemini Service (/check/gemini)
 * - Database Connection (/check/database)
 * - Proposal Generation (/check/proposal)
 * - Real-time Updates (/check/realtime)
 * 
 * Each endpoint is expected to return:
 * {
 *   "status": "ok", // or "error"
 *   "message": "Service specific status message",
 *   "timestamp": "2025-07-16T12:34:56.789012"
 * }
 */
export async function GET() {
  // Initialize response structure with default values
  const healthResponse: HealthResponse = {
    status: 'healthy',
    components: {
      api_server: { 
        status: 'unknown', 
        message: 'Not checked yet' 
      },
      gemini_service: { 
        status: 'unknown', 
        message: 'Not checked yet' 
      },
      database: { 
        status: 'unknown', 
        message: 'Not checked yet' 
      },
      proposal_generation: { 
        status: 'unknown', 
        message: 'Not checked yet' 
      },
      realtime_updates: { 
        status: 'unknown', 
        message: 'Not checked yet' 
      }
    },
    timestamp: new Date().toISOString()
  };

  try {
    // Fetch status of all services in parallel
    const [apiStatus, databaseStatus, geminiStatus, proposalStatus, realtimeStatus] = await Promise.all([
      fetchServiceStatus('/check/api-server'),
      fetchServiceStatus('/check/database'),
      fetchServiceStatus('/check/gemini'),
      fetchServiceStatus('/check/proposal'),
      fetchServiceStatus('/check/realtime')
    ]);

    // Process API server status
    if (apiStatus) {
      healthResponse.components.api_server = {
        status: apiStatus.status === 'ok' ? 'ok' : 'error',
        message: apiStatus.message
      };
    } else {
      healthResponse.components.api_server = {
        status: 'error',
        message: 'Failed to connect to API server'
      };
      healthResponse.status = 'degraded';
    }

    // Process database status
    if (databaseStatus) {
      healthResponse.components.database = {
        status: databaseStatus.status === 'ok' ? 'ok' : 'error',
        message: databaseStatus.message
      };
      if (databaseStatus.status !== 'ok') {
        healthResponse.status = 'degraded';
      }
    } else {
      healthResponse.components.database = {
        status: 'error',
        message: 'Failed to check database status'
      };
      healthResponse.status = 'degraded';
    }

    // Process Gemini service status
    if (geminiStatus) {
      healthResponse.components.gemini_service = {
        status: geminiStatus.status === 'ok' ? 'ok' : 'error',
        message: geminiStatus.message
      };
      if (geminiStatus.status !== 'ok') {
        healthResponse.status = 'degraded';
      }
    } else {
      healthResponse.components.gemini_service = {
        status: 'error',
        message: 'Failed to check Gemini service status'
      };
      healthResponse.status = 'degraded';
    }

    // Process proposal generation status
    if (proposalStatus) {
      healthResponse.components.proposal_generation = {
        status: proposalStatus.status === 'ok' ? 'ok' : 'error',
        message: proposalStatus.message
      };
      if (proposalStatus.status !== 'ok') {
        healthResponse.status = 'degraded';
      }
    } else {
      healthResponse.components.proposal_generation = {
        status: 'error',
        message: 'Failed to check proposal generation status'
      };
      healthResponse.status = 'degraded';
    }

    // Process real-time updates status
    if (realtimeStatus) {
      healthResponse.components.realtime_updates = {
        status: realtimeStatus.status === 'ok' ? 'ok' : 'error',
        message: realtimeStatus.message
      };
      if (realtimeStatus.status !== 'ok') {
        healthResponse.status = 'degraded';
      }
    } else {
      healthResponse.components.realtime_updates = {
        status: 'error',
        message: 'Failed to check real-time updates status'
      };
      healthResponse.status = 'degraded';
    }

    // Response is now ready to be sent

    return NextResponse.json(healthResponse);

  } catch (error) {
    console.error('Error checking services:', error);
    
    // Return an error response
    const errorResponse: HealthResponse = {
      status: 'degraded',
      components: {
        api_server: { 
          status: 'error', 
          message: 'Failed to connect to FastAPI server' 
        },
        gemini_service: { 
          status: 'error', 
          message: 'Connection error' 
        },
        database: { 
          status: 'error', 
          message: 'Connection error' 
        },
        proposal_generation: { 
          status: 'error', 
          message: 'Connection error' 
        },
        realtime_updates: { 
          status: 'error', 
          message: 'Connection error' 
        }
      },
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(errorResponse, { status: 200 });
  }
}