import type { ArchitectureGraph, OptimizationResult, OptimizationChange, ArchNode, ArchEdge } from "../graph/types";
import { evaluateArchitectureScore } from "../analysis/scoring";
import { repairMermaid } from "@/lib/mermaid-repair";

export function optimizeArchitecture(graph: ArchitectureGraph): OptimizationResult {
  const originalScore = evaluateArchitectureScore(graph);

  const newNodes: ArchNode[] = [...graph.nodes];
  const newEdges: ArchEdge[] = [...graph.edges];
  const changes: OptimizationChange[] = [];

  const hasCache = newNodes.some((n) => n.type === "cache");
  const hasQueue = newNodes.some((n) => n.type === "queue");
  const hasGateway = newNodes.some((n) => n.type === "gateway");
  const dbNodes = newNodes.filter((n) => n.type === "database");
  const serviceNodes = newNodes.filter((n) => n.type === "microservice");

  // 1. Add Redis Cache if missing
  if (!hasCache && dbNodes.length > 0) {
    const cacheId = "RedisCache";
    const cacheNode: ArchNode = {
      id: cacheId,
      name: "Redis Cache Cluster",
      type: "cache",
      layer: "Persistence Layer",
      technology: "Redis Enterprise v7",
      description: "In-memory cache layer storing high-frequency read queries and active session state under 1ms latency.",
      scalingStrategy: "Redis Sentinel / Cluster Sharding",
      failureModes: ["Cache eviction under memory pressure"],
      riskLevel: "LOW",
    };
    newNodes.push(cacheNode);

    // Rewire database callers to check cache first
    serviceNodes.forEach((s) => {
      newEdges.push({
        id: `e-${s.id}-${cacheId}`,
        sourceId: s.id,
        targetId: cacheId,
        label: "Sub-ms Read Cache",
        protocol: "Redis RESP / TCP",
        isSync: true,
      });
    });

    changes.push({
      id: "change-add-cache",
      type: "ADD_NODE",
      title: "Introduced Redis Cache Cluster",
      description: "Added in-memory Redis cluster in front of primary relational databases.",
      why: "Database queries were bottlenecking read throughput under high concurrent user load.",
      expectedBenefit: "Reduces database disk read IOPS by 85% and improves endpoint response latencies to sub-10ms.",
      tradeoff: "Requires cache invalidation logic on data updates.",
      nodeIds: [cacheId, ...dbNodes.map((d) => d.id)],
    });
  }

  // 2. Add Apache Kafka Event Bus if missing
  if (!hasQueue && serviceNodes.length >= 2) {
    const queueId = "KafkaQueue";
    const queueNode: ArchNode = {
      id: queueId,
      name: "Apache Kafka Event Bus",
      type: "queue",
      layer: "Event Bus Layer",
      technology: "Apache Kafka 3.6",
      description: "High-throughput event streaming bus isolating synchronous calls into async event pipelines.",
      scalingStrategy: "Partition Partitioning & Broker Cluster",
      failureModes: ["Consumer lag buildup"],
      riskLevel: "LOW",
    };
    newNodes.push(queueNode);

    if (serviceNodes.length > 0) {
      newEdges.push({
        id: `e-${serviceNodes[0].id}-${queueId}`,
        sourceId: serviceNodes[0].id,
        targetId: queueId,
        label: "Publish Event Stream",
        protocol: "Kafka Protocol",
        isSync: false,
      });
    }

    changes.push({
      id: "change-add-queue",
      type: "ADD_NODE",
      title: "Added Apache Kafka Asynchronous Event Bus",
      description: "Decoupled synchronous REST dependencies using event-driven pub/sub architecture.",
      why: "Direct HTTP RPC chains propagated downstream latency and service crash risks.",
      expectedBenefit: "Prevents cascading failures and enables peak write burst absorption.",
      tradeoff: "Requires handling eventual consistency across services.",
      nodeIds: [queueId],
    });
  }

  // 3. Add API Gateway if missing
  if (!hasGateway) {
    const gwId = "APIGateway";
    const gwNode: ArchNode = {
      id: gwId,
      name: "API Gateway & Router",
      type: "gateway",
      layer: "Ingress Layer",
      technology: "Traefik / Kong Gateway",
      description: "Central entry point handling TLS termination, JWT token validation, CORS, and rate limiting.",
      scalingStrategy: "Horizontal Ingress Pod Scaling",
      failureModes: ["Ingress bandwidth saturation"],
      riskLevel: "LOW",
    };
    newNodes.unshift(gwNode);

    changes.push({
      id: "change-add-gateway",
      type: "ADD_NODE",
      title: "Deployed Centralized API Gateway",
      description: "Encapsulated core microservices behind a unified ingress gateway.",
      why: "Exposing microservices directly created security vulnerabilities and fragmented CORS logic.",
      expectedBenefit: "Centralizes authentication, rate limiting, and SSL termination.",
      tradeoff: "Slight network hop overhead (1-2ms).",
      nodeIds: [gwId],
    });
  }

  // 4. Add Load Balancer if missing and 2+ services exist
  const hasLoadBalancer = newNodes.some(n =>
    n.name.toLowerCase().includes("load") || n.name.toLowerCase().includes("balancer") || n.name.toLowerCase().includes("lb")
  );
  if (!hasLoadBalancer && serviceNodes.length >= 2) {
    const lbId = "LoadBalancer";
    const lbNode: ArchNode = {
      id: lbId,
      name: "Load Balancer (NGINX / AWS ALB)",
      type: "gateway",
      layer: "Ingress Layer",
      technology: "NGINX / AWS ALB",
      description: "Distributes incoming traffic across multiple service instances using round-robin and health-check routing.",
      scalingStrategy: "Active-Passive or Active-Active HA pair",
      failureModes: ["Single point of failure if not HA-paired"],
      riskLevel: "LOW",
    };
    newNodes.unshift(lbNode);
    changes.push({
      id: "change-add-lb",
      type: "ADD_NODE",
      title: "Added Load Balancer for Multi-Service Traffic Distribution",
      description: "Deployed NGINX/ALB load balancer distributing traffic across multiple microservice replicas.",
      why: "With 2+ microservices and no load balancer, a single instance failure takes down that service entirely, and traffic cannot be distributed across horizontal replicas.",
      expectedBenefit: "Enables zero-downtime rolling deployments, increases throughput by up to 3x via horizontal scaling, and eliminates single-instance failure risk.",
      tradeoff: "Adds a network hop (~1ms); requires health check configuration and HA pair for the LB itself.",
      nodeIds: [lbId],
    });
  }

  // 5. Add Distributed Tracing if missing and 4+ services
  const hasMonitoring = newNodes.some(n =>
    n.name.toLowerCase().includes("monitor") || n.name.toLowerCase().includes("tracing") ||
    n.name.toLowerCase().includes("jaeger") || n.name.toLowerCase().includes("observ") ||
    n.name.toLowerCase().includes("prometheus") || n.name.toLowerCase().includes("grafana")
  );
  if (!hasMonitoring && serviceNodes.length >= 4) {
    const tracingId = "DistributedTracing";
    const tracingNode: ArchNode = {
      id: tracingId,
      name: "Distributed Tracing (Jaeger + OpenTelemetry)",
      type: "external",
      layer: "Observability Layer",
      technology: "Jaeger / OpenTelemetry",
      description: "Captures end-to-end request traces across all microservices to identify latency bottlenecks and failure paths.",
      scalingStrategy: "Jaeger Collector horizontal scaling with Cassandra/Elasticsearch backend",
      failureModes: ["Sampling rate too low misses intermittent issues"],
      riskLevel: "LOW",
    };
    newNodes.push(tracingNode);
    changes.push({
      id: "change-add-tracing",
      type: "ADD_NODE",
      title: "Added Distributed Tracing (Jaeger + OpenTelemetry)",
      description: "Introduced distributed tracing across all microservices for end-to-end request visibility.",
      why: "With 4+ microservices and no observability layer, debugging production latency issues and cascading failures becomes exponentially harder. Mean time to detect (MTTD) and mean time to recover (MTTR) increase significantly.",
      expectedBenefit: "Reduces MTTD from hours to minutes. Provides P99 latency breakdowns per service hop. Identifies slow database queries and cascade failures in real time.",
      tradeoff: "Adds ~2-5% CPU overhead per service for trace collection. Requires Jaeger infrastructure (Collector + backend storage).",
      nodeIds: [tracingId],
    });
  }

  // 6. Add Database Read Replicas if a DB has 3+ service connections
  const dbServiceConnections = new Map<string, Set<string>>();
  newEdges.forEach(e => {
    const targetIsDb = newNodes.find(n => n.id === e.targetId && n.type === "database");
    if (targetIsDb) {
      const existing = dbServiceConnections.get(e.targetId) || new Set<string>();
      existing.add(e.sourceId);
      dbServiceConnections.set(e.targetId, existing);
    }
  });
  dbNodes.forEach(db => {
    const connectedServices = dbServiceConnections.get(db.id)?.size ?? 0;
    const alreadyHasReplica = newNodes.some(n =>
      n.name.toLowerCase().includes("replica") || n.name.toLowerCase().includes("read replica")
    );
    if (connectedServices >= 3 && !alreadyHasReplica) {
      const replicaId = `${db.id}ReadReplica`;
      const replicaNode: ArchNode = {
        id: replicaId,
        name: `${db.name} Read Replica`,
        type: "database",
        layer: db.layer,
        technology: `${db.technology} Read Replica`,
        description: `Synchronous streaming replica of ${db.name} serving read-heavy queries from ${connectedServices} services, offloading the primary write node.`,
        scalingStrategy: "PostgreSQL streaming replication / AWS RDS Multi-AZ",
        failureModes: ["Replica lag under write spikes"],
        riskLevel: "LOW",
      };
      newNodes.push(replicaNode);
      changes.push({
        id: `change-add-replica-${db.id}`,
        type: "ADD_NODE",
        title: `Added Read Replica for ${db.name}`,
        description: `Introduced a read replica to offload ${connectedServices} services reading from the primary database.`,
        why: `${db.name} is serving ${connectedServices}+ microservices. Without read replicas, all read traffic hits the primary write node, causing write latency spikes during read bursts and creating a single point of failure.`,
        expectedBenefit: "Reduces primary DB CPU by 40-70% under read-heavy load. Enables zero-downtime failover. Supports up to 5x read throughput via replica scaling.",
        tradeoff: "Read replicas have eventual consistency lag (typically <100ms). Write operations must always go to primary.",
        nodeIds: [replicaId, db.id],
      });
    }
  });

  // 7. Add CDN if frontend present and no CDN
  const hasFrontend = newNodes.some(n => n.type === "frontend");
  const hasCDN = newNodes.some(n =>
    n.name.toLowerCase().includes("cdn") || n.name.toLowerCase().includes("cloudfront") ||
    n.name.toLowerCase().includes("cloudflare") || n.name.toLowerCase().includes("edge")
  );
  if (hasFrontend && !hasCDN) {
    const cdnId = "CDNEdge";
    const cdnNode: ArchNode = {
      id: cdnId,
      name: "CDN Edge Layer (Cloudflare / CloudFront)",
      type: "external",
      layer: "Edge Layer",
      technology: "Cloudflare / AWS CloudFront",
      description: "Globally distributed edge cache serving static assets, pre-rendered pages, and API responses from 200+ PoPs worldwide.",
      scalingStrategy: "Automatic edge PoP scaling",
      failureModes: ["Cache poisoning if cache keys misconfigured"],
      riskLevel: "LOW",
    };
    newNodes.unshift(cdnNode);
    changes.push({
      id: "change-add-cdn",
      type: "ADD_NODE",
      title: "Added CDN Edge Layer (Cloudflare / CloudFront)",
      description: "Introduced a CDN edge layer in front of the frontend to serve static assets and cached responses globally.",
      why: "The frontend is serving assets directly from the origin server. Without a CDN, users far from the origin experience 200-500ms+ TTFB for static assets, and the origin bears full load for every asset request.",
      expectedBenefit: "Reduces static asset TTFB to under 20ms globally. Offloads 80-95% of static traffic from origin. DDoS mitigation at the edge. Dramatically improves Core Web Vitals (LCP).",
      tradeoff: "Cache invalidation delays (typically 1-60 seconds). Requires cache-control headers to be correctly configured. Additional monthly cost.",
      nodeIds: [cdnId],
    });
  }

  // 8. Circuit Breaker recommendation for direct service-to-service calls
  const hasCircuitBreaker = newNodes.some(n =>
    n.name.toLowerCase().includes("circuit") || n.name.toLowerCase().includes("breaker") || n.name.toLowerCase().includes("resilience")
  );
  const hasDirectServiceToService = newEdges.some(e => {
    const src = newNodes.find(n => n.id === e.sourceId);
    const tgt = newNodes.find(n => n.id === e.targetId);
    return src?.type === "microservice" && tgt?.type === "microservice";
  });
  if (!hasCircuitBreaker && hasDirectServiceToService) {
    changes.push({
      id: "change-add-circuit-breaker",
      type: "MODIFY_EDGE",
      title: "Implement Circuit Breaker Pattern on Service-to-Service Calls",
      description: "Wrap all direct microservice-to-microservice synchronous calls with a circuit breaker (Resilience4j or Polly).",
      why: "Direct service-to-service connections without a circuit breaker create cascading failure risk: if Service B slows down, Service A accumulates waiting threads, exhausting its connection pool and failing too. This cascade can take down the entire system.",
      expectedBenefit: "Prevents cascading failures by failing fast when a downstream service is unhealthy. Reduces blast radius of individual service failures by 90%. Enables graceful degradation with fallback responses.",
      tradeoff: "Circuit breaker state (closed/open/half-open) adds complexity. False-positive trips under momentary latency spikes require careful threshold tuning.",
      nodeIds: serviceNodes.map(s => s.id),
    });
  }

  // Re-generate Mermaid code for optimized graph
  const mermaidLines = ["flowchart TB"];
  const subgraphs = new Map<string, ArchNode[]>();
  newNodes.forEach((n) => {
    const layer = n.layer || "Core Services";
    const arr = subgraphs.get(layer) || [];
    arr.push(n);
    subgraphs.set(layer, arr);
  });

  subgraphs.forEach((nodesInLayer, layerName) => {
    const safeLayerId = layerName.replace(/[^a-zA-Z0-9]/g, "");
    mermaidLines.push(`    subgraph ${safeLayerId}["${layerName}"]`);
    nodesInLayer.forEach((n) => {
      mermaidLines.push(`        ${n.id}["${n.name}"]`);
    });
    mermaidLines.push("    end");
  });

  newEdges.forEach((e) => {
    const labelStr = e.label ? ` -->|${e.label}| ` : " --> ";
    mermaidLines.push(`    ${e.sourceId}${labelStr}${e.targetId}`);
  });

  const optimizedMermaid = repairMermaid(mermaidLines.join("\n"), "flowchart");

  const optimizedGraph: ArchitectureGraph = {
    ...graph,
    title: `${graph.title} (Optimized)`,
    nodes: newNodes,
    edges: newEdges,
  };

  const optimizedScore = evaluateArchitectureScore(optimizedGraph);

  // Generate AI suggestions when already optimized
  let aiSuggestions: string[] | undefined;
  if (changes.length === 0) {
    aiSuggestions = generateArchitectureSuggestions(graph);
  }

  return {
    originalGraph: graph,
    optimizedGraph,
    originalHealth: originalScore.overall,
    optimizedHealth: Math.min(100, optimizedScore.overall),
    changes,
    explanation: changes.length > 0
      ? `Arqin AI optimized ${graph.title} by applying ${changes.length} structural change(s): ${changes.map((c) => c.title).join("; ")}.`
      : `${graph.title} is already well-optimized. Here are AI-generated suggestions to further improve it.`,
    aiSuggestions,
  };
}

function generateArchitectureSuggestions(graph: ArchitectureGraph): string[] {
  const nodeTypes = new Set(graph.nodes.map(n => n.type));
  const nodeNames = graph.nodes.map(n => n.name.toLowerCase()).join(" ");
  const suggestions: string[] = [];

  // Suggestion 1: Based on node types present
  if (nodeTypes.has("database") && !nodeNames.includes("backup")) {
    suggestions.push(
      `Implement automated database backups with point-in-time recovery for ${graph.nodes.find(n => n.type === "database")?.name ?? "your database"}. Use pg_dump schedules or managed backup services (AWS RDS automated backups) with a minimum 7-day retention window to meet RPO requirements.`
    );
  } else {
    suggestions.push(
      `Consider implementing a Blue-Green deployment strategy for ${graph.title}. Maintain two identical production environments and switch traffic instantly, reducing deployment risk and enabling zero-downtime releases with one-click rollback.`
    );
  }

  // Suggestion 2: Observability
  if (!nodeNames.includes("log") && !nodeNames.includes("monitor")) {
    suggestions.push(
      `Add centralized structured logging (ELK Stack or Grafana Loki) with correlation IDs propagated across all ${graph.nodes.length} components in ${graph.title}. JSON-structured logs with request IDs reduce mean-time-to-debug from hours to minutes during production incidents.`
    );
  } else {
    suggestions.push(
      `Implement SLO (Service Level Objective) dashboards for ${graph.title}. Define P95/P99 latency targets, error rate budgets, and availability targets per service. Alert on error budget burn rate rather than raw thresholds to reduce alert fatigue.`
    );
  }

  // Suggestion 3: Security
  if (!nodeNames.includes("waf") && !nodeNames.includes("firewall")) {
    suggestions.push(
      `Add a Web Application Firewall (WAF) in front of ${graph.title}'s public-facing endpoints. Configure OWASP Core Rule Set to block SQLi, XSS, and RCE attempts. AWS WAF or Cloudflare WAF integrate directly with ALB/API Gateway with minimal latency overhead (~1ms).`
    );
  } else {
    suggestions.push(
      `Conduct a threat model review for ${graph.title} using the STRIDE framework. Identify trust boundaries between ${graph.nodes.slice(0, 3).map(n => n.name).join(", ")} and document mitigation strategies for each identified threat vector.`
    );
  }

  return suggestions.slice(0, 3);
}
