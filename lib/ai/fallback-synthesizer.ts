import type { ArchitectureResult, DiagramType, ResearchResult } from "@/lib/storage/types";
import { repairMermaid } from "@/lib/mermaid-repair";

export function synthesizeFallbackArchitecture(
  idea: string,
  diagramType: DiagramType = "architecture"
): ArchitectureResult {
  const prompt = idea.trim();
  const lower = prompt.toLowerCase();

  const title = prompt.length > 45
    ? `${prompt.slice(0, 42)}...` 
    : prompt.split("\n")[0] || "Custom System Architecture";

  let mermaidCode = "";
  let overview = "";
  let components: { name: string; description: string }[] = [];
  let technologies: string[] = [];

  // Domain Matcher
  const isAutomatedCars = lower.includes("car") || lower.includes("auto") || lower.includes("vehicle") || lower.includes("drive") || lower.includes("fleet") || lower.includes("sensor");
  const isAI = lower.includes("ai") || lower.includes("rag") || lower.includes("llm") || lower.includes("gpt") || lower.includes("vector") || lower.includes("embed");
  const isChat = lower.includes("chat") || lower.includes("message") || lower.includes("realtime") || lower.includes("socket");
  const isHospital = lower.includes("hospital") || lower.includes("health") || lower.includes("patient") || lower.includes("medical") || lower.includes("doctor");
  const isEcommerce = lower.includes("e-commerce") || lower.includes("shop") || lower.includes("cart") || lower.includes("order") || lower.includes("payment");
  const isStreaming = lower.includes("stream") || lower.includes("video") || lower.includes("media") || lower.includes("hls");

  if (diagramType === "class") {
    if (isAutomatedCars) {
      mermaidCode = `classDiagram
    class VehicleSensorCluster {
        +Float lidarPoints
        +Image cameraFrame
        +readTelemetry()
    }
    class EdgeECUController {
        +String vehicleId
        +processSensorData()
        +triggerObstacleAvoidance()
    }
    class TelemetryGateway {
        +MQTTConnection socket
        +streamToCloud()
        +bufferOfflineData()
    }
    class CloudFleetEngine {
        +String fleetId
        +updateOTA()
        +aggregateAnalytics()
    }
    VehicleSensorCluster --> EdgeECUController : Telemetry
    EdgeECUController --> TelemetryGateway : Validated Frames
    TelemetryGateway --> CloudFleetEngine : 5G Stream`;
    } else {
      mermaidCode = `classDiagram
    class ClientApp {
        +String clientId
        +authenticate()
        +renderUI()
    }
    class APIGateway {
        +String route
        +validateToken()
        +forwardRequest()
    }
    class AuthService {
        +String jwtSecret
        +issueToken()
        +verifyCredentials()
    }
    class Database {
        +String connectionString
        +query()
        +persistData()
    }
    ClientApp --> APIGateway : Sends Request
    APIGateway --> AuthService : Validates Token
    APIGateway --> Database : Reads/Writes`;
    }
  } else if (diagramType === "sequence") {
    if (isAutomatedCars) {
      mermaidCode = `sequenceDiagram
    autonumber
    actor Car as Autonomous Vehicle
    participant ECU as Edge Computer (ROS 2)
    participant Gateway as 5G Telemetry Ingress
    participant Cloud as Fleet Manager
    participant AI as AI Model Engine
    Car->>ECU: Telemetry Stream
    ECU->>ECU: Obstacle Avoidance (<5ms)
    ECU->>Gateway: Publish Telemetry (MQTT)
    Gateway->>Cloud: Forward Stream to Kafka
    Cloud->>AI: Trigger Anomaly Detection
    AI-->>Cloud: Vehicle Health Report
    Cloud-->>Car: Push OTA Patch`;
    } else {
      mermaidCode = `sequenceDiagram
    autonumber
    actor User as Client User
    participant App as Web Frontend
    participant Gateway as API Gateway
    participant Auth as Auth Service
    participant DB as Database
    User->>App: Submits Request
    App->>Gateway: POST /api/v1/action
    Gateway->>Auth: Verify JWT Token
    Auth-->>Gateway: 200 OK Token Valid
    Gateway->>DB: Query User Records
    DB-->>Gateway: Return Dataset
    Gateway-->>App: 200 Success Response
    App-->>User: Render Dashboard View`;
    }
  } else if (diagramType === "er") {
    mermaidCode = `erDiagram
    USER ||--o{ ORDER : places
    USER {
        string id PK
        string email
        string password_hash
    }
    ORDER ||--|{ ORDER_ITEM : contains
    ORDER {
        string id PK
        string user_id FK
        float total_amount
        string status
    }
    ORDER_ITEM }|--|| PRODUCT : references
    PRODUCT {
        string id PK
        string title
        float price
        int stock
    }`;
  } else if (isAutomatedCars) {
    mermaidCode = `flowchart TB
    subgraph EdgeLayer["1. Vehicle Edge Hardware"]
        Sensors["LiDAR, Radar & Cameras"]
        ECU["Edge ECU Computer (ROS 2)"]
        CANBus["Vehicle CAN Bus & Controls"]
    end
    subgraph CommunicationLayer["2. Telemetry Transport"]
        MQTT["5G MQTT Telemetry Gateway"]
        Kafka["Apache Kafka Event Bus"]
    end
    subgraph CloudLayer["3. Cloud Intelligence & Storage"]
        Analytics["Fleet Analytics Engine"]
        AIEngine["AI Model Re-Training Pipeline"]
        TimescaleDB[("TimescaleDB Store")]
        OTAService["OTA Firmware Updater"]
    end
    Sensors --> ECU
    ECU --> CANBus
    ECU --> MQTT
    MQTT --> Kafka
    Kafka --> Analytics
    Kafka --> AIEngine
    Analytics --> TimescaleDB
    OTAService -.-> ECU`;

    overview = `Production architecture for Automated / Autonomous Vehicles system. Integrates Edge Vehicle Sensors (LiDAR/Cameras), ROS 2 local ECU processing (<5ms safety latency), 5G MQTT Ingestion, Kafka Stream Processing, and TimescaleDB Fleet Analytics.`;
    components = [
      { name: "Vehicle Edge ECU (ROS 2)", description: "On-board computer executing real-time object detection and CAN bus actuation under 5ms latency." },
      { name: "5G MQTT Telemetry Gateway", description: "Ultra-low-overhead binary telemetry transport receiving sensor data streams over cellular network." },
      { name: "Cloud Fleet Analytics & TimescaleDB", description: "Scalable time-series storage and real-time anomaly detection for global vehicle fleets." },
      { name: "OTA Firmware Update Service", description: "Secure, signed over-the-air firmware updates for autonomous vehicle fleet management." },
    ];
    technologies = ["ROS 2", "TensorRT", "MQTT / Protobuf", "Apache Kafka", "TimescaleDB", "C++ / Rust", "Docker / K8s"];
  } else if (isHospital || isAI) {
    mermaidCode = `flowchart TB
    subgraph ClientLayer["1. User & Client Interface"]
        WebPortal["Web Portal (Next.js)"]
        MobileApp["Mobile Health App"]
    end
    subgraph GatewayLayer["2. Ingress & Security"]
        GW["API Gateway Router"]
        Auth["HIPAA / OAuth2 Auth Service"]
    end
    subgraph LogicLayer["3. Core Logic & AI Services"]
        EMR["FHIR Patient Record Service"]
        LLM["Healthcare LLM Inference Engine"]
        Imaging["DICOM Medical Image Processor"]
    end
    subgraph DataLayer["4. Encrypted Persistence"]
        DB[("Encrypted PostgreSQL DB")]
        VectorDB[("Vector DB Knowledge Base")]
        S3[("AWS S3 Medical Imaging Bucket")]
    end
    WebPortal --> GW
    MobileApp --> GW
    GW --> Auth
    GW --> EMR
    GW --> LLM
    GW --> Imaging
    EMR --> DB
    LLM --> VectorDB
    Imaging --> S3`;

    overview = `HIPAA-Compliant Healthcare & AI Architecture integrating FHIR Patient Record Services, DICOM Medical Imaging, Vector Knowledge Bases, and LLM Inference APIs.`;
    components = [
      { name: "EMR / EHR Service (FHIR)", description: "Standardized HL7 FHIR API service managing medical records, prescriptions, and lab data." },
      { name: "Healthcare LLM Inference Engine", description: "Contextual AI inference engine executing semantic search over vector database records." },
      { name: "DICOM Imaging Vault", description: "Secure storage and viewer service for high-resolution X-Rays, MRIs, and CT Scans." },
    ];
    technologies = ["Next.js 16", "FHIR API", "DICOM Standard", "Vector DB", "PostgreSQL (AES-256)", "AWS S3 Vault"];
  } else if (isChat) {
    mermaidCode = `flowchart TB
    subgraph ClientLayer["1. Client Layer"]
        WebClient["React / Next.js SPA"]
        MobileClient["React Native App"]
    end
    subgraph IngressLayer["2. Ingress & Realtime"]
        WSGateway["WebSocket Gateway (Socket.io)"]
        Auth["JWT & Presence Manager"]
    end
    subgraph MessageLayer["3. Message Routing"]
        Broker["NATS / RabbitMQ Broker"]
        Worker["Message Persistence Worker"]
    end
    subgraph StorageLayer["4. Storage"]
        DB[("ScyllaDB Message Store")]
        Redis[("Redis Active Presence Cache")]
    end
    WebClient --> WSGateway
    MobileClient --> WSGateway
    WSGateway --> Auth
    WSGateway --> Broker
    Broker --> Worker
    Broker --> Redis
    Worker --> DB`;

    overview = `Real-Time Chat & Messaging Architecture built with WebSocket Gateways, Presence Management, NATS Message Broker, and ScyllaDB persistence.`;
    components = [
      { name: "WebSocket Gateway", description: "Maintains bi-directional, persistent socket connections for real-time messaging." },
      { name: "NATS Broker", description: "High-throughput message queuing ensuring sub-millisecond message delivery across active channels." },
      { name: "ScyllaDB Message Store", description: "Distributed NoSQL database designed for high-write chat logs." },
    ];
    technologies = ["React / Next.js", "WebSockets / Socket.io", "RabbitMQ / NATS", "ScyllaDB", "Redis"];
  } else if (isEcommerce) {
    mermaidCode = `flowchart TB
    subgraph ClientLayer["1. Storefront Interface"]
        Storefront["Next.js Storefront App"]
    end
    subgraph IngressLayer["2. Gateway & Routing"]
        GW["API Gateway & Router"]
    end
    subgraph ServicesLayer["3. Core Microservices"]
        Catalog["Product Catalog Service"]
        Cart["Cart & Reservation Service"]
        Payment["Payment Gateway (Stripe)"]
    end
    subgraph StorageLayer["4. Persistence & Async"]
        DB[("PostgreSQL Main DB")]
        Redis[("Redis Inventory Lock Cache")]
        EventBus["Kafka Event Bus"]
        Fulfillment["Warehouse Fulfillment Worker"]
    end
    Storefront --> GW
    GW --> Catalog
    GW --> Cart
    GW --> Payment
    Catalog --> DB
    Cart --> Redis
    Payment --> EventBus
    EventBus --> Fulfillment`;

    overview = `Scalable E-Commerce Microservices Architecture with Inventory Reservation Caching, Stripe Payments, and Async Fulfillment Pipelines.`;
    components = [
      { name: "Cart & Inventory Cache", description: "Uses Redis in-memory locks to prevent double-selling stock during flash sales." },
      { name: "Stripe Payment Gateway", description: "PCI-DSS compliant payment processing with webhook event handling." },
      { name: "Kafka Order Bus", description: "Asynchronous order processing triggering warehouse fulfillment and email receipts." },
    ];
    technologies = ["Next.js", "Node.js", "Stripe API", "PostgreSQL", "Redis", "Apache Kafka"];
  } else {
    mermaidCode = `flowchart TB
    subgraph ClientLayer["1. User Client Interface"]
        Client["React / Next.js Application"]
    end
    subgraph GatewayLayer["2. Ingress Gateway"]
        API["API Gateway & Load Balancer"]
        Auth["Authentication & Security Guard"]
    end
    subgraph ServicesLayer["3. Core Microservices"]
        Service["Core Business Service"]
    end
    subgraph DataLayer["4. Persistence & Async Workers"]
        Cache[("Redis Memory Cache")]
        DB[("PostgreSQL Transaction DB")]
        EventBus["Kafka Event Stream"]
        Worker["Async Background Worker"]
    end
    Client --> API
    API --> Auth
    API --> Service
    Service --> Cache
    Service --> DB
    Service --> EventBus
    EventBus --> Worker`;

    overview = `Architecture specification synthesized for: "${prompt}". Designed for resilience, fault tolerance, and independent service scaling.`;
    components = [
      { name: "Client UI Layer", description: "Renders user interfaces across web and mobile viewports." },
      { name: "API Gateway Router", description: "Central entry point for routing, authentication, and rate limiting." },
      { name: "Microservices & Database", description: "Decoupled business logic backed by relational persistence and Redis caching." },
    ];
    technologies = ["Next.js 16", "TypeScript", "Node.js API", "PostgreSQL 16", "Redis Cache", "Tailwind CSS"];
  }

  const repaired = repairMermaid(mermaidCode, diagramType);

  return {
    title,
    diagramType,
    mermaidCode: repaired,
    explanation: {
      overview: overview || `Architecture specification synthesized for: "${prompt}". Designed for resilience, fault tolerance, and independent service scaling.`,
      components: components.length > 0 ? components : [
        { name: "Client UI Layer", description: "Renders user interfaces across web and mobile viewports." },
        { name: "API Gateway Router", description: "Central entry point for routing, authentication, and rate limiting." },
        { name: "Microservices & Database", description: "Decoupled business logic backed by relational persistence and Redis caching." },
      ],
      dataFlow: "HTTPS Payload -> Gateway -> Authentication -> Service Handler -> Database / Cache -> Client Response.",
      technologyChoices: technologies.length > 0 ? technologies.join(", ") : "Next.js 16, TypeScript, Node.js API, PostgreSQL 16, Redis Cache.",
      scalability: "Horizontal pod autoscaling on ingress gateway and stateless application replicas.",
      security: "TLS 1.3 encryption in transit, JWT token rotation, role-based access control (RBAC).",
      reliability: "Circuit breaker pattern with exponential backoff retries and Redis read-replica fallback.",
      tradeoffs: "Microservices architecture increases operational monitoring and infrastructure overhead.",
      improvements: "Implement distributed tracing (OpenTelemetry) and Kafka event streaming for asynchronous workers.",
    },
    technologies: technologies.length > 0 ? technologies : [
      "Next.js 16",
      "TypeScript",
      "Node.js",
      "PostgreSQL 16",
      "Redis",
      "Tailwind CSS",
    ],
    adaptiveInsights: {
      health: 88,
      healthLabel: "Excellent",
      scalability: 90,
      maintainability: 86,
      reliability: 89,
      security: 87,
      adaptability: 91,
      potentialIssues: [
        "Network latency under spike traffic loads.",
        "Requires automated cache invalidation hooks.",
      ],
      suggestions: [
        {
          current: "Single region database deployment",
          suggested: "Multi-region database read-replicas",
          reason: "Improves global read latency and disaster recovery resilience.",
          category: "scalability",
        },
      ],
    },
  };
}

export function synthesizeFallbackResearch(question: string): ResearchResult {
  const lower = question.toLowerCase();
  const isChat = lower.includes("chat") || lower.includes("message") || lower.includes("realtime") || lower.includes("real-time") || lower.includes("socket") || lower.includes("websocket");
  const isEcommerce = lower.includes("e-commerce") || lower.includes("ecommerce") || lower.includes("shop") || lower.includes("cart") || lower.includes("order") || lower.includes("payment");
  const isAI = lower.includes("ai") || lower.includes("rag") || lower.includes("llm") || lower.includes("vector") || lower.includes("embed") || lower.includes("inference");

  if (isChat) {
    return {
      title: "Real-Time Chat Application Architecture",
      summary: "A scalable real-time chat system requires a WebSocket Gateway for persistent connections, a message broker for reliable delivery, and purpose-built storage for high-write message logs. Redis Pub/Sub enables horizontal scaling across multiple gateway instances without shared connection state.",
      recommendedArchitecture: "Deploy a stateless WebSocket Gateway cluster (Socket.io or native WS) behind a Layer-4 load balancer. Use Redis Pub/Sub to fan out messages across gateway instances, enabling horizontal scaling without sticky sessions. Persist messages asynchronously to ScyllaDB or Cassandra for high-write throughput. Manage user presence and active channel state in Redis with TTL-based expiration. Use NATS or RabbitMQ as the message broker for guaranteed delivery between services.",
      architecturePattern: "Event-Driven + WebSocket Gateway + Pub/Sub",
      technologyRecommendations: [
        { category: "Frontend", name: "React / Next.js", reason: "SPA model supports persistent WebSocket connections and real-time state updates via context or Zustand." },
        { category: "Backend", name: "Node.js + Socket.io", reason: "Event-loop model handles thousands of concurrent persistent connections efficiently with minimal overhead." },
        { category: "Database", name: "ScyllaDB", reason: "Distributed NoSQL designed for high-write, low-latency chat log persistence with automatic sharding by conversation ID." },
        { category: "Cache", name: "Redis Cluster", reason: "Pub/Sub for cross-instance message fan-out, active presence tracking, and channel metadata caching." },
        { category: "Message Broker", name: "NATS / RabbitMQ", reason: "Guarantees message delivery between microservices with durable queues and acknowledgment semantics." },
        { category: "Infrastructure", name: "Kubernetes + HPA", reason: "Horizontal Pod Autoscaler enables dynamic WebSocket gateway scaling under variable connection load." },
      ],
      scalability: "WebSocket gateway scales horizontally as stateless instances behind a Layer-4 load balancer. Redis Pub/Sub decouples message routing from individual gateway instances. ScyllaDB shards by conversation ID for linear write scaling. Presence service scales independently using Redis TTL keys.",
      performance: "In-memory Redis Pub/Sub delivers sub-millisecond fan-out within a region. ScyllaDB achieves sub-10ms P99 write latency. Node.js event loop handles 10,000+ concurrent connections per instance. Avoid blocking operations in the event loop — offload heavy tasks to worker threads.",
      latency: "Message delivery P99 target: under 50ms end-to-end within a region. WebSocket round-trip adds ~1–5ms over a stable connection. Redis Pub/Sub fan-out under 2ms. Cross-region delivery increases latency — use regional deployments with message forwarding.",
      reliability: "Gateway instances are stateless, allowing restarts without losing routing capability. NATS provides at-least-once delivery with message acknowledgment. ScyllaDB replication factor ≥ 3 ensures message durability. Circuit breakers prevent cascade failure if the database becomes unavailable. Implement reconnection logic with exponential backoff on the client.",
      security: "Authenticate WebSocket connections via JWT token on the initial handshake before upgrading to WS. Validate and sanitize all message payloads server-side. Use TLS 1.3 for all connections. Rate-limit connections per user and per IP. Encrypt messages at rest in ScyllaDB. Implement room-level access control via authorization middleware.",
      dataStrategy: "ScyllaDB stores message logs partitioned by conversation_id with clustering key on timestamp. Redis stores ephemeral presence data, typing indicators, and unread counts with TTL. Use Redis Streams or NATS JetStream for durable message delivery guarantees before ScyllaDB persistence.",
      cachingStrategy: "Cache user profiles and channel membership in Redis with a 5-minute TTL. Store active presence in Redis keys with 30-second TTL renewed by client heartbeats. Cache recent messages (last 50 per channel) in Redis for fast initial load. Use CDN caching for static assets and avatar images.",
      communicationStrategy: "WebSockets for real-time bidirectional message exchange. REST API for non-real-time operations (message history, user profile, channel management). Use gRPC for internal service-to-service communication (presence service, notification service). REST webhooks for external integrations.",
      tradeoffs: [
        "WebSocket connections are stateful and long-lived, increasing memory footprint per connected user (~50KB per connection).",
        "Redis Pub/Sub is fire-and-forget — messages sent to channels with no subscribers are lost, requiring a durable fallback.",
        "ScyllaDB's eventual consistency model means a user may briefly see stale read data under partition scenarios.",
        "Horizontal WebSocket scaling requires sticky sessions or Redis-based session sharing — adds infrastructure complexity.",
        "At-least-once delivery semantics require client-side deduplication logic to handle potential duplicate messages.",
      ],
      alternatives: [
        {
          name: "Server-Sent Events (SSE) + REST",
          description: "Use SSE for server-to-client push and REST POST for client-to-server messages. Simpler infrastructure, works over standard HTTP/2.",
          pros: ["No WebSocket infrastructure needed", "Works natively over HTTP/2 multiplexing", "Easier to load balance"],
          cons: ["Unidirectional — client must poll or POST separately", "Higher overhead for high-frequency bidirectional messaging", "Less efficient for real-time two-way interactions"],
        },
        {
          name: "Firebase Realtime Database / Firestore",
          description: "Managed real-time sync service. Good for small-to-medium scale where operational simplicity is prioritized over cost control.",
          pros: ["Zero infrastructure management", "Built-in offline sync and conflict resolution", "Rapid development"],
          cons: ["Vendor lock-in to Google Cloud", "Cost scales poorly at high message volume", "Limited query flexibility"],
        },
        {
          name: "XMPP Protocol",
          description: "Battle-tested messaging protocol used by large-scale deployments (WhatsApp originally). Suitable when protocol interoperability and federation are requirements.",
          pros: ["Mature, proven at massive scale", "Built-in presence, federation, and extensibility", "Many open-source server implementations"],
          cons: ["XML-based protocol adds parsing overhead", "Steep learning curve", "Less developer-friendly than modern WebSocket APIs"],
        },
      ],
      risks: [
        "Redis single-node SPOF: if Redis is not clustered or using Sentinel, a Redis failure takes down presence and Pub/Sub entirely.",
        "Message ordering: distributed pub/sub does not guarantee strict global ordering — implement sequence numbers for conversation-level ordering.",
        "Connection thundering herd: all clients reconnecting simultaneously after an outage can overwhelm the gateway — implement randomized reconnect jitter.",
        "ScyllaDB wide partitions: very active conversations accumulate unbounded partition size — implement archival rotation by time bucket.",
        "JWT replay attacks: without short-lived tokens and refresh rotation, a stolen token grants persistent unauthorized access to chat sessions.",
      ],
      recommendations: [
        "Use Redis Cluster (minimum 3 primary + 3 replica nodes) for Pub/Sub and presence — never a single Redis node in production.",
        "Implement client-side message deduplication using a UUID per message to handle at-least-once delivery from the broker.",
        "Add a message delivery acknowledgment flow: client ACKs received messages, server retries unacknowledged after a timeout.",
        "Partition ScyllaDB message tables by (conversation_id, week_bucket) to prevent unbounded partition growth.",
        "Implement presence heartbeat at 15-second intervals — declare a user offline after 30 seconds without heartbeat.",
        "Add end-to-end encryption (Signal Protocol or libsodium) for private message channels that require privacy guarantees.",
        "Use OpenTelemetry distributed tracing across WebSocket gateway, broker, and persistence service for latency debugging.",
      ],
    };
  }

  if (isEcommerce) {
    return {
      title: "Scalable E-Commerce Backend Architecture",
      summary: "A production e-commerce backend requires careful separation between the write-heavy cart/order flow and the read-heavy catalog browsing flow. Microservices with event-driven order processing, Redis inventory locking, and CDN-cached product pages provide the right trade-offs for scalability and reliability.",
      recommendedArchitecture: "Separate the storefront (read-heavy) from the checkout flow (write-heavy, consistency-critical). Use an API Gateway for routing, authentication, and rate limiting. The Product Catalog Service reads from a PostgreSQL primary with Redis read-through cache. The Cart Service uses Redis for optimistic inventory locking during checkout. The Order Service writes to PostgreSQL and publishes an OrderPlaced event to Kafka, which triggers the Fulfillment Worker asynchronously. Stripe handles payment processing via webhooks.",
      architecturePattern: "Microservices + Event-Driven Order Processing + CQRS",
      technologyRecommendations: [
        { category: "Frontend", name: "Next.js (SSR + ISR)", reason: "Server-side rendering and Incremental Static Regeneration deliver fast product pages with SEO and cache-friendly HTML." },
        { category: "Backend", name: "Node.js / Go API Services", reason: "Node.js for BFF and catalog reads; Go for high-throughput order processing services." },
        { category: "Database", name: "PostgreSQL 16", reason: "ACID transactions for order records and payment state — correctness is non-negotiable in financial flows." },
        { category: "Cache", name: "Redis", reason: "Inventory locking with SETNX for flash sales, session storage, and catalog read-through caching." },
        { category: "Message Broker", name: "Apache Kafka", reason: "Durable, ordered event log for OrderPlaced events consumed by fulfillment, email, and analytics workers." },
        { category: "Infrastructure", name: "CDN (Cloudflare / AWS CloudFront)", reason: "Caches product images, static catalog pages, and ISR-rendered Next.js pages at the edge for global low latency." },
      ],
      scalability: "Catalog reads scale horizontally via stateless Node.js replicas behind the API gateway, with Redis absorbing hot product reads. The Cart Service scales independently of the Order Service. Kafka enables async fan-out to multiple consumers (fulfillment, email, analytics) without coupling. PostgreSQL scales reads via read replicas.",
      performance: "Product page load time under 200ms via CDN edge caching and ISR. Checkout flow target: under 500ms P95. Redis SETNX inventory locks prevent overselling during flash sales without database row locks, reducing contention significantly.",
      latency: "Catalog reads: sub-50ms via Redis cache hit. Checkout initiation: 150–300ms (Redis lock + DB write + Kafka publish). Order confirmation email: asynchronous, under 30 seconds. Payment webhook processing: under 5 seconds from Stripe event receipt.",
      reliability: "Kafka provides durable, at-least-once delivery for order events — fulfillment workers are idempotent. Stripe webhooks are retried automatically on failure. Circuit breakers prevent cascade failure if the inventory service is slow. PostgreSQL uses synchronous replication to a standby for failover.",
      security: "PCI-DSS compliance requires never storing raw card data — delegate entirely to Stripe. JWT tokens for customer sessions with 15-minute expiry and refresh rotation. RBAC for admin APIs. Input validation on all order endpoints. SQL parameterized queries to prevent injection. Rate limiting on checkout endpoints.",
      dataStrategy: "PostgreSQL for orders, customers, and payment records (ACID required). Redis for inventory locks, sessions, and catalog hot cache. ElasticSearch for product search with faceted filtering. S3 for product images. Kafka for event log. Separate read models (CQRS) for analytics using ClickHouse.",
      cachingStrategy: "CDN caches ISR product pages with 60-second revalidation. Redis caches catalog reads with 5-minute TTL, invalidated on product updates. Session state in Redis. Inventory lock in Redis with 15-minute TTL auto-release. Never cache checkout or order state — always read from DB.",
      communicationStrategy: "REST for customer-facing APIs (well-understood, easy to cache). GraphQL for the storefront BFF to fetch product + review + inventory in a single request. Kafka for async inter-service events. Internal service-to-service calls via gRPC for low-latency catalog lookups.",
      tradeoffs: [
        "Eventual consistency in the CQRS read model means search index and analytics may lag the source of truth by seconds.",
        "Redis inventory locking under extreme concurrent load requires careful TTL tuning — too short causes lock races, too long blocks legitimate users.",
        "Kafka event sourcing adds operational complexity: dead-letter queues, consumer group management, and schema evolution require investment.",
        "Microservices increase deployment surface area — requires a mature CI/CD pipeline and service mesh for observability.",
        "PCI-DSS audit scope expands with any system that touches payment data, even encrypted — delegate as much as possible to Stripe.",
      ],
      alternatives: [
        {
          name: "Shopify / Commerce Platform",
          description: "Managed e-commerce platform. Appropriate when time-to-market is the priority and customization requirements are standard.",
          pros: ["Zero infrastructure management", "PCI compliance built-in", "Ecosystem of plugins"],
          cons: ["Limited customization for complex business logic", "Revenue-based pricing at scale", "Vendor lock-in"],
        },
        {
          name: "Modular Monolith",
          description: "Single deployable unit with clear internal module boundaries (Catalog, Cart, Order, Fulfillment). Simpler for early-stage teams.",
          pros: ["Simpler deployment and debugging", "No distributed transaction complexity", "Faster initial development"],
          cons: ["Scaling individual components requires scaling the whole app", "Deployment coupling slows release cadence at scale"],
        },
      ],
      risks: [
        "Inventory race condition: without Redis atomic locks, concurrent purchases during flash sales can oversell stock — test with concurrent load simulation.",
        "Kafka consumer lag: if the fulfillment worker falls behind, order confirmation emails delay — monitor consumer group lag metrics.",
        "PostgreSQL connection pool exhaustion under spike traffic — use PgBouncer with transaction-mode pooling.",
        "Cart abandonment due to Redis lock expiry: if a user holds an item in cart beyond the lock TTL, another user can purchase it — communicate this in UI.",
        "Stripe webhook duplication: Stripe retries webhooks on timeout — idempotency keys in OrderService are mandatory to prevent double-fulfillment.",
      ],
      recommendations: [
        "Implement optimistic inventory locking with Redis SETNX — never use database row locks for flash sale inventory.",
        "Make all Kafka consumers and fulfillment workers idempotent using order ID as the idempotency key.",
        "Use Stripe's idempotency keys on payment intent creation to prevent duplicate charge creation on client retries.",
        "Implement dead-letter queues (Kafka DLT) for failed order events with alerting on DLT consumer lag.",
        "Use ISR (Incremental Static Regeneration) in Next.js for product pages — revalidate on product update webhook.",
        "Implement distributed tracing (OpenTelemetry + Jaeger) across API Gateway, Order Service, and Fulfillment Worker.",
        "Run Chaos Engineering tests (Gremlin or AWS FIS) targeting Redis failures and Kafka consumer restarts quarterly.",
      ],
    };
  }

  const isDatabase = lower.includes("database") || lower.includes("sql") || lower.includes("nosql") || lower.includes("mongodb") || lower.includes("postgresql") || lower.includes("scaling") || lower.includes("storage");
  const isCloud = lower.includes("cloud") || lower.includes("aws") || lower.includes("kubernetes") || lower.includes("docker") || lower.includes("microservices") || lower.includes("serverless") || lower.includes("infrastructure") || lower.includes("k8s");
  const isAuth = lower.includes("auth") || lower.includes("oauth") || lower.includes("jwt") || lower.includes("security") || lower.includes("sso") || lower.includes("saml") || lower.includes("authentication") || lower.includes("authorization");
  const isMobile = lower.includes("mobile") || lower.includes("ios") || lower.includes("android") || lower.includes("react native") || lower.includes("flutter");
  const isApi = lower.includes("api") || lower.includes("rest") || lower.includes("graphql") || lower.includes("grpc") || lower.includes("gateway") || lower.includes("api design");

  if (isAI) {
    return {
      title: "AI / LLM Inference and RAG Architecture",
      summary: "Production AI systems require a dedicated inference layer, a vector database for retrieval-augmented generation, and careful prompt engineering to control output quality. The architecture must address latency, cost, hallucination risk, and observability.",
      recommendedArchitecture: "Use a RAG (Retrieval-Augmented Generation) pipeline where user queries first retrieve semantically relevant document chunks from a vector database (pgvector or Pinecone), then inject them into a structured prompt sent to the LLM inference API. Deploy an Inference Gateway (LiteLLM or custom) to manage model routing, rate limiting, cost tracking, and fallback. Cache frequent query results in Redis. Store conversation history in PostgreSQL for multi-turn context.",
      architecturePattern: "RAG Pipeline + Inference Gateway + Semantic Cache",
      technologyRecommendations: [
        { category: "LLM Provider", name: "Groq / OpenAI API", reason: "Managed LLM APIs eliminate model hosting complexity and provide scalable inference with pay-per-token pricing." },
        { category: "Vector Database", name: "pgvector (PostgreSQL extension)", reason: "Adds HNSW vector similarity search to an existing PostgreSQL instance, avoiding a separate vector DB for most use cases." },
        { category: "Embedding Model", name: "OpenAI text-embedding-3-small", reason: "High-quality 1536-dim embeddings with strong semantic retrieval at low cost per token." },
        { category: "Backend", name: "FastAPI (Python)", reason: "Native Python ecosystem for AI/ML libraries, async support, and Pydantic-validated request/response schemas." },
        { category: "Cache", name: "Redis (semantic cache)", reason: "Cache embeddings of frequent queries and their responses to avoid redundant LLM API calls." },
        { category: "Database", name: "PostgreSQL 16", reason: "Stores conversation history, user sessions, retrieved document chunks, and audit logs with full ACID semantics." },
      ],
      scalability: "LLM inference scales by increasing API call concurrency — managed providers handle infrastructure. RAG retrieval scales via pgvector HNSW index. The application tier scales horizontally as stateless FastAPI workers. Semantic caching reduces load on the LLM API as traffic grows.",
      performance: "LLM first-token latency ranges from 200ms to 2s depending on provider and model size. Vector retrieval with HNSW index: sub-10ms for top-k. Semantic cache hits reduce response time to sub-50ms for repeated queries. Stream responses (SSE) to reduce perceived latency on long generations.",
      latency: "Target first-byte latency under 500ms for cached queries, under 2s for uncached LLM calls. Use streaming (Server-Sent Events) to deliver tokens progressively rather than waiting for full completion. Pre-warm embedding models to avoid cold-start latency.",
      reliability: "Implement fallback chains: primary model → cheaper fallback model → graceful error message. Cache responses for idempotent queries. Circuit breaker around LLM provider calls. Store all LLM interactions in PostgreSQL for replay and audit. Handle context window overflows explicitly with chunk truncation strategy.",
      security: "Sanitize and validate all user inputs before injecting into prompts to prevent prompt injection attacks. Never include system secrets in prompts. Rate-limit API calls per user to control cost. Use private VPC endpoints for cloud LLM APIs where available. Audit all LLM requests and responses for compliance.",
      dataStrategy: "PostgreSQL with pgvector extension for document chunks and vector embeddings. PostgreSQL for conversation history and user state. Object storage (S3) for raw documents before chunking. Redis for semantic cache and session state. Avoid storing sensitive data in vector embeddings — store only non-sensitive document summaries.",
      cachingStrategy: "Semantic cache: embed the user query and check cosine similarity against cached query embeddings — return cached response if similarity > 0.95. Cache document chunk embeddings at indexing time. Cache system prompts and static context in Redis. TTL-expire semantic cache entries after 24 hours to prevent stale responses.",
      communicationStrategy: "REST API for client-to-backend LLM requests. Server-Sent Events (SSE) for streaming LLM token responses to the client. Internal service calls via gRPC for embedding service. Use queues (Celery + Redis) for async document ingestion and re-embedding jobs.",
      tradeoffs: [
        "RAG retrieval adds a vector search step before every LLM call, adding 10–50ms latency but dramatically improving answer grounding.",
        "Managed LLM APIs introduce external latency variability and potential outages outside your control — implement fallback models.",
        "Semantic caching reduces cost but risks serving stale responses for rapidly changing information domains.",
        "Context window limits constrain how much retrieved context can be included in a single prompt — chunk size tuning is critical.",
        "LLM token costs scale with usage — a poorly optimized prompt multiplied across high traffic can be expensive.",
      ],
      alternatives: [
        {
          name: "Self-Hosted Open-Source LLM (Ollama / vLLM)",
          description: "Run open-weight models (Llama 3, Mistral) on your own GPU infrastructure. Appropriate when data privacy and cost control are the priority.",
          pros: ["No data sent to external APIs", "Predictable cost at high volume", "Full control over model version"],
          cons: ["Significant GPU infrastructure investment", "Operational complexity", "Smaller models have lower quality than frontier APIs"],
        },
        {
          name: "Fine-Tuned Model Without RAG",
          description: "Fine-tune a base model on domain-specific data. Appropriate when the knowledge domain is stable and doesn't require real-time document retrieval.",
          pros: ["Knowledge baked into weights — no retrieval latency", "Consistent domain-specific output format"],
          cons: ["Expensive and slow to re-train when knowledge changes", "Hallucinates on out-of-training-distribution queries"],
        },
      ],
      risks: [
        "Prompt injection: user inputs containing instruction-like text can hijack the LLM's behavior — use strict input validation and role separation.",
        "Hallucination in retrieved-context gaps: if the vector database returns irrelevant chunks, the LLM may fabricate answers — add relevance score thresholds.",
        "LLM provider outage: no SLA guarantees sub-100% uptime — implement multi-provider fallback routing.",
        "Embedding model drift: changing embedding models invalidates all stored vectors — plan for re-embedding pipeline on model upgrades.",
        "PII in vector embeddings: user-submitted content may contain personal data — implement PII scrubbing before embedding and storing.",
      ],
      recommendations: [
        "Use streaming (SSE) for all LLM responses to improve perceived latency — never wait for full completion before sending to the client.",
        "Set a minimum cosine similarity threshold (e.g. 0.75) on retrieved RAG chunks — discard irrelevant chunks rather than injecting noise into the prompt.",
        "Implement LLM response caching with semantic similarity keys — saves significant cost on repeated or near-identical queries.",
        "Log every LLM request, retrieved context, and response for debugging, cost tracking, and compliance auditing.",
        "Use structured output (JSON Schema) for all LLM calls where the output format is known — reduces hallucination and parsing failure.",
        "Implement a human-in-the-loop feedback loop: allow users to flag bad responses, which feeds into fine-tuning or prompt improvement.",
      ],
    };
  }

  if (isDatabase) {
    return {
      title: "Database Architecture & Storage Strategy",
      summary: `The optimal approach for "${question.slice(0, 80)}" depends on data shape, consistency requirements, and access patterns. A polyglot persistence strategy using PostgreSQL for ACID transactions, Redis for hot cache, and ClickHouse for analytics delivers the right trade-offs at scale.`,
      recommendedArchitecture: "Multi-tier database strategy: PostgreSQL 16 for ACID-critical transactional data with synchronous streaming replication to a standby. Redis 7 Cluster for sub-millisecond session cache and read-through caching, reducing DB IOPS by 80%+. ClickHouse for OLAP analytics queries over event data — columnar storage delivers 100x faster analytical queries than PostgreSQL. S3/MinIO for object storage (images, exports, backups). Use read replicas for PostgreSQL under high read load, PgBouncer for connection pooling (transaction mode), vertical partitioning for large tables, and horizontal sharding for scale-out beyond single-node capacity.",
      architecturePattern: "Polyglot Persistence + CQRS Read Models",
      technologyRecommendations: [
        { category: "Primary Database", name: "PostgreSQL 16", reason: "ACID-compliant OLTP store with rich indexing (B-tree, GiST, partial), row-level security, and mature replication ecosystem." },
        { category: "Cache", name: "Redis 7 Cluster", reason: "Sub-millisecond in-memory cache for sessions, counters, leaderboards, and read-through caching with TTL-based invalidation." },
        { category: "Analytics", name: "ClickHouse", reason: "Columnar OLAP database delivering 100–1000x faster analytical queries than row-store databases for event and time-series data." },
        { category: "Connection Pooling", name: "PgBouncer", reason: "Transaction-mode connection pooler preventing PostgreSQL connection exhaustion under high concurrency (supports 10,000+ app connections to 100 DB connections)." },
        { category: "Object Storage", name: "S3 / MinIO", reason: "Infinitely scalable object storage for binary assets, database backups, and export files with versioning and lifecycle policies." },
        { category: "Search", name: "Elasticsearch / pgvector", reason: "Full-text search (Elasticsearch) or vector similarity search (pgvector) layered on top of PostgreSQL without duplicating the primary store." },
      ],
      scalability: "PostgreSQL scales reads horizontally via streaming read replicas (AWS RDS Multi-AZ adds failover). Writes scale vertically or via sharding by tenant ID / user ID range. Redis Cluster shards data across 6+ nodes. ClickHouse scales by adding shards and replicas independently. S3 scales infinitely.",
      performance: "Redis cache hit target >85% for hot data paths. PostgreSQL query target <50ms with B-tree indexes on FK columns. ClickHouse analytical queries <500ms on billions of rows with columnar compression. PgBouncer eliminates 3-way TCP handshake overhead per connection, reducing connection setup time from ~10ms to <1ms.",
      latency: "Redis cache reads: sub-1ms. PostgreSQL indexed reads: 2–20ms. PostgreSQL full scans: 50–500ms depending on table size. ClickHouse aggregation on 1B rows: 100–500ms. S3 GET with CloudFront: 5–30ms globally.",
      reliability: "PostgreSQL streaming replication with automatic failover via Patroni or AWS RDS Multi-AZ. Redis Sentinel for primary/replica failover. Point-in-time recovery (PITR) with WAL archiving to S3. ClickHouse replication with ZooKeeper quorum. Automated backup snapshots with 7-day retention minimum.",
      security: "PostgreSQL row-level security (RLS) for multi-tenant data isolation. TLS encryption for all database connections. Encrypted storage volumes at rest (AWS EBS encryption / dm-crypt). Database user per service with least-privilege grants. Secrets rotation via HashiCorp Vault or AWS Secrets Manager.",
      dataStrategy: "Source of truth in PostgreSQL. Derived read models in Redis (hot cache) and ClickHouse (analytics). Avoid JOIN-heavy queries on the primary write path — materialize read models asynchronously via Kafka CDC (Debezium). Archive cold data to S3 after 90 days using pg_partman time-based partitioning.",
      cachingStrategy: "Cache hot entities (user profiles, product catalog) in Redis with 5-minute TTL. Invalidate on write via Redis PUBLISH. Use Redis SETNX for distributed locks (inventory reservations). Cache expensive aggregation query results with longer TTL (60 minutes). Never cache financial balances — always read from primary.",
      communicationStrategy: "Application reads through Redis cache → PostgreSQL on cache miss. Analytics queries routed directly to ClickHouse via a separate read-only connection string. CDC events from PostgreSQL to ClickHouse via Debezium → Kafka pipeline. S3 pre-signed URLs for client file access.",
      tradeoffs: [
        "Polyglot persistence increases operational complexity — each database system requires its own expertise, monitoring, and backup strategy.",
        "Cache invalidation is hard to get right — stale cache under concurrent writes can surface as data inconsistency bugs in production.",
        "ClickHouse CDC lag means analytics data is typically 1–10 seconds behind the source of truth.",
        "PgBouncer transaction-mode pooling is incompatible with advisory locks and prepared statements — requires application changes.",
        "PostgreSQL horizontal sharding requires application-level shard routing logic and complicates cross-shard queries.",
      ],
      alternatives: [
        {
          name: "MySQL / MariaDB",
          description: "Mature relational database with strong read replica ecosystem. Preferred in legacy stacks and when MySQL-specific tooling (ProxySQL, Vitess) is already invested in.",
          pros: ["Widely understood", "Strong horizontal read scaling via ProxySQL", "Vitess supports transparent sharding"],
          cons: ["Weaker JSON support than PostgreSQL", "No row-level security", "Less rich extension ecosystem"],
        },
        {
          name: "MongoDB Atlas",
          description: "Document-oriented NoSQL database. Best when the data model is highly variable in schema or when horizontal write scaling is the primary concern from day one.",
          pros: ["Flexible schema for evolving data models", "Built-in horizontal sharding", "Atlas managed service simplifies operations"],
          cons: ["No multi-document ACID transactions across shards", "Higher cost at scale than self-hosted PostgreSQL", "Weaker relational query capabilities"],
        },
      ],
      risks: [
        "Single-node PostgreSQL SPOF: without streaming replication and automatic failover, a primary failure causes extended downtime — configure Patroni or use RDS Multi-AZ.",
        "Redis cache stampede: if the cache expires for a hot key under high traffic, thousands of requests hit the database simultaneously — implement cache warming and probabilistic early expiry.",
        "ClickHouse write amplification: high-frequency INSERT of individual rows (not batches) degrades ClickHouse performance — batch writes in 1,000+ row chunks via Kafka consumers.",
      ],
      recommendations: [
        "Enable PostgreSQL connection pooling via PgBouncer in transaction mode from day one — retrofit is painful under production load.",
        "Partition large PostgreSQL tables by time (pg_partman) before they reach 50M rows — retroactive partitioning requires downtime.",
        "Use Debezium CDC to stream PostgreSQL changes to Kafka for real-time cache invalidation and ClickHouse ingestion.",
        "Set up automated PITR backups to S3 using WAL-G and test restoration monthly — untested backups are not backups.",
        "Monitor PostgreSQL slow query log (>100ms) and run EXPLAIN ANALYZE on any query appearing more than 100 times per minute.",
        "Never store secrets (API keys, tokens) in the database without encryption — use pgcrypto or store only hashed/encrypted values.",
      ],
    };
  }

  if (isCloud) {
    return {
      title: "Cloud-Native Infrastructure Architecture",
      summary: `The optimal approach for "${question.slice(0, 80)}" centers on Kubernetes-based container orchestration for independent service scaling, GitOps for reproducible deployments, and a managed service mesh for observability and security. This architecture balances operational control with cloud-managed convenience.`,
      recommendedArchitecture: "Kubernetes on AWS EKS with Helm charts for reproducible deployments and Kustomize overlays for environment promotion. AWS ALB Ingress Controller for Layer-7 HTTP routing with path-based rules. HPA (Horizontal Pod Autoscaler) driven by custom metrics (RPS) and Cluster Autoscaler for node scaling. Terraform for all infrastructure-as-code, stored in Git, applied via GitHub Actions CI/CD. RDS Aurora Serverless v2 for managed PostgreSQL with automatic scale-to-zero on dev, ElastiCache Redis for sessions and cache, S3 for object storage. Istio service mesh for mTLS between services, distributed tracing, and traffic management (canary deployments, circuit breaking).",
      architecturePattern: "Kubernetes Microservices + GitOps + Service Mesh",
      technologyRecommendations: [
        { category: "Orchestration", name: "AWS EKS (Kubernetes)", reason: "Managed Kubernetes control plane eliminates etcd and API server management. Integrates natively with AWS IAM, ALB, and EBS CSI driver." },
        { category: "Infrastructure as Code", name: "Terraform + Terragrunt", reason: "Declarative IaC with remote state in S3+DynamoDB locking. Terragrunt enables DRY configuration across multiple environments." },
        { category: "Service Mesh", name: "Istio", reason: "Transparent mTLS between all services, distributed tracing (Jaeger integration), circuit breaking, retries, and canary traffic splitting without code changes." },
        { category: "GitOps", name: "ArgoCD", reason: "Continuous delivery from Git — any merge to main triggers a sync to the cluster. Provides rollback, drift detection, and multi-cluster support." },
        { category: "Observability", name: "Prometheus + Grafana + Loki", reason: "Prometheus scrapes metrics from all Kubernetes pods. Grafana dashboards with pre-built Kubernetes and Istio panels. Loki for log aggregation without Elasticsearch cost." },
        { category: "CI/CD", name: "GitHub Actions", reason: "OIDC-based authentication to AWS (no long-lived keys), matrix builds for multi-arch images, and built-in secrets management." },
      ],
      scalability: "HPA scales pods based on CPU, memory, or custom metrics (Prometheus-adapter). Cluster Autoscaler adds EC2 nodes when pod scheduling is pending. EKS Fargate for burst workloads without node management. Aurora Serverless v2 scales database capacity in increments of 0.5 ACUs with sub-second scaling. CloudFront CDN absorbs static asset traffic at the edge.",
      performance: "Pod startup under 5 seconds with optimized container images (distroless base, layer caching). Istio sidecar adds ~1-2ms per-hop overhead — acceptable for most use cases. EBS gp3 volumes with 16,000 IOPS for database-intensive workloads. ElastiCache Redis delivers sub-1ms cache latency. ALB target group health checks enable zero-downtime rolling deployments.",
      latency: "EKS pod-to-pod within a node: <1ms. Cross-AZ pod-to-pod: 1-3ms. ALB to pod: 2-5ms. Istio mTLS handshake overhead: ~1ms after connection warming. ElastiCache Redis: sub-1ms. RDS Aurora: 2-10ms for indexed reads.",
      reliability: "Multi-AZ node groups ensure pod rescheduling survives AZ outage. PodDisruptionBudgets guarantee minimum available replicas during node drains. Istio circuit breakers prevent cascade failures. Aurora Multi-AZ with automated failover under 30 seconds. S3 11-nines durability for state persistence.",
      security: "AWS IAM Roles for Service Accounts (IRSA) for pod-level AWS API access (no shared credentials). Istio mTLS for zero-trust service-to-service communication. Network Policies via Calico for pod-level firewall rules. AWS WAF on ALB for OWASP rule sets. Secrets in AWS Secrets Manager synced to Kubernetes via External Secrets Operator. Container image scanning via ECR on push.",
      dataStrategy: "Aurora Serverless v2 for primary relational data with automated backups. ElastiCache Redis Cluster for sessions and hot cache. S3 for object storage with lifecycle policies. Use Amazon MSK (managed Kafka) for event streaming if Kafka is required. Separate RDS read endpoint for analytics queries.",
      cachingStrategy: "ElastiCache Redis for application-level cache. CloudFront for static assets and ISR pages with S3 origin. ALB sticky sessions disabled — keep application stateless. Redis Cluster with 3 shards + 3 replicas for HA cache.",
      communicationStrategy: "Kubernetes Service DNS for in-cluster communication. Istio VirtualService for traffic splitting (canary, A/B). AWS ALB Ingress for external HTTP/HTTPS routing. MSK (Kafka) for async inter-service events. gRPC with HTTP/2 for high-throughput internal calls.",
      tradeoffs: [
        "Kubernetes has a steep operational learning curve — budget 2-4 weeks of onboarding per engineer and invest in runbooks.",
        "Istio adds ~50MB memory overhead per sidecar and 1-2ms latency per hop — evaluate whether simpler solutions (NGINX, App Mesh) meet your needs.",
        "EKS costs add up: control plane ($0.10/hr), node groups, ALB, NAT Gateway egress — evaluate total cost vs. simpler PaaS alternatives for smaller teams.",
        "GitOps with ArgoCD requires disciplined Git workflow — out-of-band cluster changes will be overwritten on next sync.",
        "Terraform state management requires care — corrupted or lost state file can make infrastructure unmanageable without manual import.",
      ],
      alternatives: [
        {
          name: "AWS Lambda + API Gateway (Serverless)",
          description: "Functions-as-a-service for event-driven workloads with automatic scaling to zero. Best for teams with highly variable or spiky traffic patterns and simple function-oriented business logic.",
          pros: ["No infrastructure to manage", "Scales to zero (cost-efficient for low traffic)", "Pay-per-invocation pricing"],
          cons: ["Cold starts add 100ms-2s latency for infrequent functions", "15-minute execution limit unsuitable for long-running jobs", "Stateless constraints require external state management"],
        },
        {
          name: "Railway / Render / Fly.io (PaaS)",
          description: "Managed PaaS platforms that abstract Kubernetes. Best for teams of 1-5 engineers who want cloud-native deployment without Kubernetes operational complexity.",
          pros: ["Dramatically simpler operations", "Built-in databases, Redis, and job queues", "Git-push deployments"],
          cons: ["Less control over networking, scaling policies, and resource isolation", "Higher per-unit cost at scale", "Vendor lock-in to platform abstractions"],
        },
      ],
      risks: [
        "Kubernetes RBAC misconfiguration can grant excessive pod permissions — audit ClusterRoleBindings quarterly and use least-privilege Service Accounts per deployment.",
        "Cluster Autoscaler scale-down evicts pods without PodDisruptionBudgets — ensure all stateful workloads have PDBs and graceful shutdown handling.",
        "Istio control plane outage does not break existing mTLS connections but prevents new certificate issuance — plan for Istiod HA with multiple replicas.",
      ],
      recommendations: [
        "Use namespace-per-team with RBAC boundaries — prevents accidental cross-team resource modification and simplifies cost attribution.",
        "Tag all AWS resources with team, environment, and service labels for accurate cost allocation and resource auditing.",
        "Implement Kubernetes resource requests and limits on every deployment — unset limits cause noisy-neighbor CPU starvation.",
        "Use Karpenter instead of Cluster Autoscaler for faster, more cost-efficient node provisioning with Spot instance support.",
        "Set up pre-commit hooks enforcing Terraform fmt and validate — prevent format drift and configuration errors before they reach CI.",
        "Run quarterly Game Days simulating AZ outage, database failover, and pod eviction to validate recovery procedures under controlled conditions.",
      ],
    };
  }

  if (isAuth) {
    return {
      title: "Authentication & Security Architecture",
      summary: `The optimal approach for "${question.slice(0, 80)}" uses OAuth 2.0 / OIDC as the identity foundation with short-lived JWT access tokens and rotating refresh tokens. Centralizing identity in a dedicated Authorization Server (Keycloak or Auth0) separates authentication concerns from business logic services.`,
      recommendedArchitecture: "OAuth 2.0 / OIDC with an Authorization Server (Keycloak self-hosted or Auth0 managed) for federated identity and SSO. Short-lived JWT access tokens (15-minute expiry) signed with RS256 (asymmetric keys) with rotating refresh tokens stored in HttpOnly Secure SameSite=Strict cookies — never localStorage. PKCE flow for public clients (SPAs, mobile apps). Role-Based Access Control (RBAC) claims embedded in the JWT, enforced at the API Gateway layer (OPA sidecar or gateway plugin) before reaching microservices. mTLS (Istio or Linkerd) for service-to-service communication inside the cluster. Secrets managed via HashiCorp Vault with dynamic database credentials and automatic rotation.",
      architecturePattern: "OAuth 2.0 + OIDC + Zero Trust",
      technologyRecommendations: [
        { category: "Identity Provider", name: "Keycloak", reason: "Open-source OIDC/SAML identity provider with SSO, MFA, social login, and user federation (LDAP/AD). Self-hosted for data sovereignty and cost control at scale." },
        { category: "Access Tokens", name: "JWT (RS256)", reason: "Asymmetric JWT signed by the IdP private key, verified by services using public JWKS endpoint — no shared secrets, stateless verification." },
        { category: "Secrets Management", name: "HashiCorp Vault", reason: "Dynamic secrets (database credentials that auto-rotate), transit encryption engine, PKI certificate authority, and AppRole authentication for services." },
        { category: "Perimeter Security", name: "AWS WAF + Shield", reason: "WAF blocks OWASP Top 10 (SQLi, XSS, RCE) at the CDN/ALB layer before requests reach the application. Shield provides DDoS mitigation." },
        { category: "Policy Engine", name: "OPA (Open Policy Agent)", reason: "Decouples authorization policy from application code. Policies expressed in Rego, evaluated at the gateway — services are policy consumers, not policy engines." },
        { category: "MFA", name: "TOTP / WebAuthn (Passkeys)", reason: "TOTP for broad device compatibility, WebAuthn/Passkeys for phishing-resistant strong authentication. Both supported natively in Keycloak." },
      ],
      scalability: "Keycloak scales horizontally in cluster mode with Infinispan distributed cache for session state. OPA scales as a sidecar per service or as a centralized policy decision point. JWT verification is stateless and CPU-bound — scales with the service tier. Vault scales with Raft storage backend for HA without Consul dependency.",
      performance: "JWT verification is sub-millisecond (RSA signature check in memory). OPA policy evaluation: 1-5ms for typical RBAC rules. Keycloak token issuance: 50-200ms including PKCE code exchange. Vault secret reads with agent caching: sub-1ms after cache warm. Session validation overhead: ~1ms at the gateway layer.",
      latency: "Access token validation at API gateway: <1ms (JWKS public key cached). OPA authorization decision: 1-5ms. Token refresh via /token endpoint: 100-300ms. MFA TOTP validation: user-gated. mTLS handshake between services (after warm): ~0.5ms.",
      reliability: "Keycloak HA cluster with session replication survives node failure without re-authentication. JWT access tokens remain valid if Keycloak is temporarily down (offline token validation). Vault Raft HA cluster tolerates loss of minority nodes. OPA bundles cached locally in sidecars — policy enforcement continues during OPA central server outage.",
      security: "Refresh tokens stored in HttpOnly cookies prevents XSS token theft. Short-lived access tokens (15 min) limit blast radius of token compromise. PKCE prevents authorization code interception attacks for SPAs. mTLS with short-lived certificates (via Vault PKI, 24h TTL) prevents service impersonation. Vault audits all secret access for compliance.",
      dataStrategy: "User identity data stored in Keycloak's embedded database (PostgreSQL-backed for production). Application-specific user profile data stored in the app's PostgreSQL instance, linked by the OIDC sub claim. Session state in Keycloak's Infinispan cache. Audit logs streamed to SIEM (Splunk / ELK).",
      cachingStrategy: "JWKS public keys cached at the API gateway with 1-hour TTL (refreshed on 401 with unknown kid). OPA policy bundles cached locally with 60-second refresh interval. Vault agent caches dynamic credentials with lease renewal. User profile cache in Redis keyed by user ID with 5-minute TTL.",
      communicationStrategy: "OIDC Authorization Code + PKCE flow for browser SPAs. Device Authorization flow for CLI tools. Client Credentials flow for service-to-service M2M. Refresh Token Rotation with refresh token reuse detection for mobile clients. mTLS for all service-to-service calls within the cluster.",
      tradeoffs: [
        "Short-lived access tokens (15 min) require robust refresh token infrastructure — clients must handle 401 responses and retry with refreshed tokens transparently.",
        "Self-hosting Keycloak adds operational overhead vs. Auth0/Clerk managed services — justified at scale where per-MAU pricing becomes significant.",
        "mTLS with Istio adds sidecar memory overhead (~50MB per pod) and complicates local development debugging.",
        "OPA policy-as-code requires a policy review process — incorrect Rego policies can inadvertently open or close access to sensitive endpoints.",
        "PKCE flow requires client-side code verifier/challenge implementation — increases SPA complexity vs. implicit flow (which is deprecated for good reason).",
      ],
      alternatives: [
        {
          name: "Clerk / Auth0 (Managed IdP)",
          description: "Fully managed identity platforms with pre-built UI, social login, and MFA. Best for teams prioritizing developer velocity over cost control and data sovereignty.",
          pros: ["Zero infrastructure to manage", "Pre-built login UI components", "Compliance certifications (SOC 2, HIPAA) included"],
          cons: ["Per-MAU pricing becomes expensive at scale (>100K users)", "Data stored on vendor infrastructure", "Limited customization of token claims and flows"],
        },
        {
          name: "Passport.js + Session-Based Auth",
          description: "Traditional server-side sessions stored in Redis. Simpler for monolithic applications without mobile clients or cross-domain token requirements.",
          pros: ["Simpler to reason about", "No JWT expiry complexity", "Easy revocation via session deletion"],
          cons: ["Stateful — every request requires session lookup from Redis", "Doesn't scale across domains without CORS complexity", "Not suitable for mobile or service-to-service use cases"],
        },
      ],
      risks: [
        "Refresh token theft: if refresh tokens are stored in localStorage instead of HttpOnly cookies, XSS attacks can steal long-lived tokens — enforce HttpOnly cookie storage in all clients.",
        "JWT algorithm confusion: if the JWT library accepts both RS256 and HS256, an attacker can forge tokens using the public key as an HMAC secret — pin the expected algorithm explicitly.",
        "Keycloak misconfigured CORS: overly permissive CORS on the Keycloak token endpoint allows cross-origin token requests — restrict origins to known application domains.",
      ],
      recommendations: [
        "Enforce PKCE for all public OAuth clients (SPAs, mobile) — disable implicit flow in Keycloak configuration.",
        "Implement refresh token rotation with reuse detection — a reused refresh token should invalidate the entire refresh token family (compromised device signal).",
        "Use short-lived Vault dynamic database credentials (1-hour TTL, auto-rotated) instead of long-lived static passwords for all service-to-database connections.",
        "Audit all Keycloak admin operations and stream logs to SIEM — unauthorized admin actions are a critical security event.",
        "Run OWASP ZAP or Burp Suite against authentication endpoints quarterly to catch token handling regressions.",
      ],
    };
  }

  if (isMobile) {
    return {
      title: "Mobile Application Architecture",
      summary: `The optimal approach for "${question.slice(0, 80)}" uses React Native (Expo) for cross-platform development backed by a dedicated BFF (Backend for Frontend) that aggregates microservice data. An offline-first local database with background sync provides resilient UX under poor connectivity.`,
      recommendedArchitecture: "React Native with Expo for cross-platform iOS/Android development sharing a single codebase. Dedicated mobile BFF (Next.js API Routes or Node.js/Fastify) aggregating data from internal microservices — returns mobile-optimized payloads without over-fetching. GraphQL for flexible data fetching with field selection. WatermelonDB or Expo SQLite for offline-first local persistence with background sync to the server. Push notifications via FCM (Android) and APNS (iOS) routed through a unified notification service. JWT auth with biometric unlock (Face ID / Fingerprint) via expo-secure-store. OTA updates via Expo EAS for hotfixes without app store review.",
      architecturePattern: "BFF + Offline-First + Cross-Platform",
      technologyRecommendations: [
        { category: "Framework", name: "React Native + Expo SDK", reason: "Single TypeScript codebase for iOS and Android. Expo managed workflow reduces native toolchain complexity and enables OTA updates." },
        { category: "Local Database", name: "WatermelonDB", reason: "High-performance reactive SQLite wrapper designed for large offline-first datasets. Supports incremental sync and lazy loading for smooth 60fps UI." },
        { category: "BFF API", name: "GraphQL + Apollo Server", reason: "Mobile BFF exposes a single GraphQL endpoint — clients request exactly the fields they need, eliminating over/under-fetching and reducing payload size on cellular." },
        { category: "Push Notifications", name: "FCM / APNS via Expo Notifications", reason: "Expo abstracts FCM (Android) and APNS (iOS) into a unified API. Supports local notifications, deep links, and notification categories." },
        { category: "OTA Updates", name: "Expo EAS Update", reason: "Push JavaScript bundle updates to production apps without App Store review. Critical for rapid hotfixes on mobile where review cycles take 1-3 days." },
        { category: "Auth", name: "expo-secure-store + Biometrics", reason: "Stores JWT refresh tokens in the iOS Keychain / Android Keystore (hardware-backed encryption). expo-local-authentication enables Face ID / fingerprint unlock." },
      ],
      scalability: "BFF scales horizontally as stateless API replicas. GraphQL persisted queries reduce payload size for repeated operations. WatermelonDB sync uses timestamp-based incremental sync, reducing bandwidth as dataset grows. Push notification service scales via FCM/APNS which handle global delivery infrastructure. Background sync frequency adapts based on connectivity type (WiFi vs. cellular).",
      performance: "WatermelonDB renders 10,000+ record lists at 60fps via lazy loading. GraphQL fragment colocation prevents unnecessary re-renders. Expo Image with progressive loading for media-heavy screens. React Navigation with native navigation stack (not JS-based) for sub-16ms transitions. Hermes JS engine on Android reduces startup time by 30%.",
      latency: "BFF GraphQL query: 50-200ms on 4G. WatermelonDB local reads: <5ms. Background sync: non-blocking, runs on a background thread. Push notification delivery via FCM: 100ms-5s depending on device and network. OTA update check on startup: <300ms (bundle served from CDN).",
      reliability: "Offline-first architecture: all read operations served from local WatermelonDB, writes queued locally and synced on reconnection. Expo EAS rollback enables instant revert to previous JS bundle on bad OTA. Circuit breaker in the BFF prevents cascading failures from downstream microservice timeouts. Retry with exponential backoff for failed sync operations.",
      security: "JWT refresh tokens stored in expo-secure-store (hardware-backed Keychain/Keystore). Biometric authentication gate for sensitive operations. Certificate pinning to prevent MITM attacks on production API endpoints. HTTPS-only with TLS 1.3. App attestation (Play Integrity API / App Attest) to verify genuine app binary on sensitive endpoints.",
      dataStrategy: "WatermelonDB as local offline-first store synchronized with the server BFF. Server-side PostgreSQL as the source of truth. Conflict resolution via last-write-wins with vector clocks for collaborative features. Media assets (images, videos) on S3/CloudFront with local file system caching via expo-file-system.",
      cachingStrategy: "WatermelonDB caches all user data locally for offline access. Apollo Client in-memory cache for active session data. expo-image cache for profile images and media (automatic LRU eviction). API response headers (Cache-Control) respected by Apollo for query deduplication.",
      communicationStrategy: "GraphQL over HTTPS for data fetching. WebSockets (subscriptions) for real-time features (chat, live updates). REST for file upload endpoints (multipart/form-data). FCM/APNS for push. Background fetch (expo-background-fetch) for periodic sync while app is backgrounded.",
      tradeoffs: [
        "Expo managed workflow restricts native module access — projects requiring complex native bridging (Bluetooth, custom sensors) must eject to bare workflow.",
        "WatermelonDB sync protocol requires careful conflict resolution design — distributed concurrent edits need application-level merge strategies.",
        "React Native bridge overhead is measurable for animation-heavy UIs — consider Reanimated v3 (runs on UI thread) for 60fps animations.",
        "OTA updates (Expo EAS) are JavaScript-only — native binary changes still require App Store / Google Play review cycles.",
        "Cross-platform trade-off: platform-specific UX patterns (iOS vs. Android navigation, back gesture) require conditional code paths for a native-quality feel.",
      ],
      alternatives: [
        {
          name: "Native Swift (iOS) + Kotlin (Android)",
          description: "Two separate native codebases. Best when UI/UX quality and platform-specific features (ARKit, Wear OS) are the primary requirement and team has native expertise.",
          pros: ["Best possible performance and platform integration", "Access to all native APIs", "Platform-specific UX that feels completely native"],
          cons: ["Two codebases to maintain — doubles feature development cost", "Separate CI/CD pipelines", "Longer time-to-market"],
        },
        {
          name: "Flutter",
          description: "Google's cross-platform framework using Dart and Skia rendering engine. Strong choice when pixel-perfect custom UI and animation-heavy experiences are required.",
          pros: ["Excellent animation performance (custom renderer)", "Strong type system (Dart)", "Growing ecosystem"],
          cons: ["Dart language adoption overhead for JS/TS teams", "Smaller ecosystem than React Native", "Flutter-rendered UI doesn't use native components"],
        },
      ],
      risks: [
        "OTA update delivery failure: if an EAS update bundle is corrupted, all users on that release channel get a broken update — implement staged rollouts (10% → 50% → 100%) with error rate monitoring.",
        "WatermelonDB schema migration: adding columns or tables in app updates requires explicit migration scripts — untested migrations can corrupt local databases on upgrade.",
        "Push notification token expiry: FCM/APNS tokens expire and must be refreshed on app launch — stale tokens silently drop notifications without error.",
      ],
      recommendations: [
        "Use Expo EAS Build for CI/CD — building React Native on local developer machines is fragile and inconsistent across team members.",
        "Implement background sync using expo-background-fetch with a 15-minute minimum interval — respect battery and data constraints.",
        "Test on real devices (not simulators) for performance profiling — simulators don't accurately represent CPU, memory, or network constraints.",
        "Use React Native Debugger + Flipper for network inspection and WatermelonDB query profiling during development.",
      ],
    };
  }

  if (isApi) {
    return {
      title: "API Design & Gateway Architecture",
      summary: `The optimal approach for "${question.slice(0, 80)}" combines REST for public-facing CRUD operations (cacheable, widely understood), GraphQL for flexible frontend data fetching (eliminates over/under-fetching), and gRPC for high-throughput internal service calls. An API Gateway layer handles cross-cutting concerns.`,
      recommendedArchitecture: "REST for public-facing CRUD APIs (HTTP caching, OpenAPI documentation, widely understood tooling). GraphQL for frontend BFF endpoints that aggregate multiple backend services in a single request, eliminating waterfall fetches and over-fetching. gRPC with Protocol Buffers for internal microservice-to-microservice calls (binary serialization, 7x smaller payload than JSON, HTTP/2 streaming). Kong Gateway (or AWS API Gateway) as the unified API gateway layer handling authentication (JWT validation), rate limiting (token bucket per client), routing (path-based), and observability (request logging, tracing headers). OpenAPI 3.1 specs generated from code using zod-to-openapi or tRPC with OpenAPI adapter.",
      architecturePattern: "API Gateway + REST + GraphQL BFF + gRPC Internal",
      technologyRecommendations: [
        { category: "API Gateway", name: "Kong Gateway", reason: "Open-source gateway with plugins for JWT auth, rate limiting, CORS, request transformation, and OpenTelemetry. Self-hosted for cost control, or Kong Konnect for managed." },
        { category: "BFF API", name: "GraphQL + Apollo Server v4", reason: "Flexible schema-driven API for frontend teams. Federation (Apollo Federation 2) enables composing multiple microservice graphs into a unified supergraph." },
        { category: "Internal RPC", name: "gRPC + Protocol Buffers", reason: "Binary serialization (7x smaller than JSON), HTTP/2 multiplexing, bi-directional streaming, and generated type-safe clients for every language." },
        { category: "REST Documentation", name: "OpenAPI 3.1 + Swagger UI", reason: "Machine-readable API contract enabling auto-generated SDKs, client code generation, and interactive documentation." },
        { category: "API Testing", name: "Postman / Insomnia + k6", reason: "Postman for API development and contract testing. k6 for load testing API endpoints under realistic concurrent user load." },
        { category: "Type Safety", name: "tRPC (TypeScript monorepos)", reason: "End-to-end type safety between Next.js frontend and Node.js backend without code generation — ideal for TypeScript monorepos without polyglot services." },
      ],
      scalability: "Kong scales horizontally with shared PostgreSQL config database. GraphQL Apollo Server scales as stateless replicas. gRPC load balancing via Envoy sidecar (client-side LB via headless Kubernetes Service). REST APIs scale with standard HTTP load balancers. Rate limiting state in Redis Cluster for distributed token bucket across gateway replicas.",
      performance: "gRPC protobuf encoding: 7x smaller payloads than JSON, 5x faster serialization. HTTP/2 multiplexing eliminates head-of-line blocking. GraphQL query complexity analysis prevents N+1 queries with DataLoader batching. REST responses cached at CDN for GET endpoints with Cache-Control headers. Kong processes 30,000+ RPS per node.",
      latency: "Kong gateway overhead: 1-3ms per request. REST with CDN cache: <20ms globally. GraphQL BFF query: 50-200ms (aggregates 2-5 backend calls). gRPC internal call: 1-10ms. REST direct (no cache): 20-100ms depending on backend. Rate limit check (Redis): <1ms.",
      reliability: "Kong HA with active-active replicas and shared PostgreSQL config. Circuit breakers via Kong's circuit-breaker plugin (or Resilience4j in application). GraphQL error boundaries prevent single field failure from collapsing entire query. gRPC deadline propagation ensures upstream services respect client timeout budgets. Retry policies at the gateway for 502/503 responses.",
      security: "JWT validation at Kong gateway — microservices trust gateway-forwarded identity headers. API key rotation without client code changes via Kong key rotation. Rate limiting prevents brute force and DDoS at the API layer. mTLS between Kong and backend services (mutual authentication). OpenAPI schema validation rejects malformed request bodies before reaching service code.",
      dataStrategy: "REST responses use HTTP caching (ETag, Last-Modified, Cache-Control) for GET resources. GraphQL persisted queries reduce payload size and enable server-side caching by query hash. gRPC responses not cached by default — implement application-level caching for idempotent RPCs. Rate limiting counters in Redis with sliding window algorithm.",
      cachingStrategy: "CDN (Cloudflare) caches public REST GET endpoints with Cache-Control headers. Apollo Server response cache plugin for GraphQL query caching by authenticated user. Kong proxy cache plugin for REST responses (configurable TTL per route). Never cache POST/PUT/DELETE or authenticated personalized responses without cache-key isolation.",
      communicationStrategy: "REST for external public APIs and webhook consumers. GraphQL for internal BFF between Next.js frontend and backend services. gRPC for synchronous internal service calls. Kafka for async event-driven communication between services. WebSockets via Kong's WebSocket upgrade plugin for real-time subscriptions.",
      tradeoffs: [
        "GraphQL N+1 query problem: without DataLoader batching, a query requesting user.posts.comments makes O(N×M) database calls — DataLoader is mandatory from day one.",
        "gRPC requires code generation from .proto files — adds a build step and requires proto file versioning strategy across teams.",
        "OpenAPI spec drift: if specs are written by hand rather than generated from code, they drift from implementation — generate specs from code or use API-first tooling.",
        "Kong PostgreSQL dependency: Kong's config is stored in PostgreSQL — Kong cluster shares a database SPOF with the application unless using a separate managed instance.",
        "GraphQL schema stitching complexity: Apollo Federation requires a gateway supergraph coordinator — adds infrastructure and deployment coupling between subgraphs.",
      ],
      alternatives: [
        {
          name: "tRPC (TypeScript-only monorepos)",
          description: "End-to-end typesafe API layer between Next.js frontend and Node.js backend with no code generation step. Best for TypeScript monorepos without polyglot service requirements.",
          pros: ["Full type safety between frontend and backend without code generation", "Zero API documentation needed within the monorepo", "Simple setup with Next.js"],
          cons: ["TypeScript-only — not usable with non-TS services", "Not suitable for public APIs or external consumers", "Tight coupling between client and server code"],
        },
        {
          name: "REST-Only with OpenAPI",
          description: "Pure REST with OpenAPI 3.1 spec for all endpoints. Best when broad client compatibility, cacheability, and developer familiarity are the primary goals.",
          pros: ["Widely understood by all developers", "HTTP caching semantics well-defined", "Maximum tooling and client SDK compatibility"],
          cons: ["Over-fetching and under-fetching require multiple round trips for complex UI data needs", "No real-time subscription capability without WebSocket extension", "Versioning strategy (v1, v2) requires discipline"],
        },
      ],
      risks: [
        "GraphQL introspection enabled in production: exposes your full schema to potential attackers — disable introspection in production and use persisted queries for known clients.",
        "gRPC proto breaking changes: removing fields or changing field types breaks existing clients silently in proto2 — enforce backward-compatible field rules and use proto linting in CI.",
        "API rate limit bypass via distributed clients: per-IP rate limiting is bypassed by distributed botnet IPs — implement per-user and per-API-key limits as primary controls.",
      ],
      recommendations: [
        "Generate OpenAPI specs from Zod schemas or TypeScript types rather than writing them by hand — eliminates spec drift from the first day.",
        "Implement GraphQL DataLoader for every relationship resolver — N+1 queries are the most common GraphQL performance anti-pattern.",
        "Use proto field options to mark deprecated fields and set a 6-month sunset policy before removing gRPC fields.",
        "Log all API requests at the gateway layer with correlation IDs, client identity, response time, and status code for debugging and compliance.",
      ],
    };
  }

  const titleStr = question.length > 60 ? question.slice(0, 57) + "..." : question;
  return {
    title: `${titleStr} — Architecture Analysis`,
    summary: `The optimal approach for "${question.slice(0, 80)}" depends on scale, consistency requirements, and team expertise. The recommended architecture below addresses these concerns with proven patterns.`,
    recommendedArchitecture: `For a system addressing "${question.slice(0, 60)}", deploy a stateless API tier behind an API Gateway with centralized authentication and rate limiting. Apply domain-driven design to separate concerns into focused services. Use PostgreSQL as the primary relational store for structured data, Redis for caching and ephemeral state, and Kafka for async event processing between services. Containerize with Docker and orchestrate on Kubernetes for independent scaling.`,
    architecturePattern: "Layered Microservices + Event-Driven + API Gateway",
    technologyRecommendations: [
      { category: "Frontend", name: "Next.js 15", reason: "React-based framework with SSR, ISR, and App Router for fast, SEO-friendly user interfaces tailored to this system's needs." },
      { category: "Backend", name: "Node.js / TypeScript", reason: "Type-safe, async-first runtime well suited for building scalable REST and GraphQL APIs for this domain." },
      { category: "Database", name: "PostgreSQL 16", reason: "Production-proven RDBMS with strong ACID guarantees, rich query capabilities, and mature replication ecosystem." },
      { category: "Cache", name: "Redis 7", reason: "In-memory store for session state, rate limiting counters, and read-through caching to reduce database pressure." },
      { category: "Infrastructure", name: "Kubernetes + Helm", reason: "Container orchestration with declarative deployments, HPA for autoscaling, and health management across all services." },
    ],
    scalability: "Stateless API services scale horizontally via Kubernetes HPA. Redis absorbs read spikes. Kafka decouples async workers from the API tier for independent scaling. PostgreSQL read replicas handle read-heavy workloads.",
    performance: "Redis cache hit target above 85% for hot paths. API P95 latency target under 200ms. Background jobs processed asynchronously via Kafka. PgBouncer connection pooling reduces PostgreSQL overhead.",
    latency: "API tier P99 latency target: under 300ms. Redis cache reads: sub-1ms. Database indexed queries: under 50ms. Kafka consumer delivery: eventual within 5 seconds.",
    reliability: "Circuit breakers prevent cascade failures. Exponential backoff retry on transient errors. Kafka at-least-once delivery with idempotent consumers. PostgreSQL synchronous streaming replication for standby failover.",
    security: "JWT tokens with 15-minute expiry and refresh rotation. API Gateway enforces RBAC. TLS 1.3 for all traffic. Row-level security in PostgreSQL for multi-tenant isolation.",
    dataStrategy: "PostgreSQL as source of truth for relational data. Redis for ephemeral cache and session. S3 for object storage. Kafka event log for audit trails and async processing.",
    cachingStrategy: "Redis read-through cache with 5-minute TTL. Cache invalidation via pub/sub on write. CDN caching for static assets. Application-level response cache for expensive aggregations.",
    communicationStrategy: "REST for CRUD operations. GraphQL for flexible frontend data fetching. Kafka for async inter-service events. gRPC for latency-sensitive internal calls.",
    tradeoffs: [
      "Microservices add distributed systems complexity — distributed tracing (OpenTelemetry) is mandatory from day one.",
      "Eventual consistency via Kafka means read-after-write may return stale data briefly.",
      "Redis cache invalidation complexity — concurrent writes require careful TTL and invalidation strategy.",
      "Kubernetes operational overhead — budget training time and invest in runbooks for common failure scenarios.",
    ],
    alternatives: [
      {
        name: "Modular Monolith",
        description: "Single deployable unit with clear internal module boundaries. Best for early-stage products and teams under 10 engineers.",
        pros: ["Simpler deployment and debugging", "No distributed transaction complexity", "Faster initial development velocity"],
        cons: ["Scaling requires scaling the entire application", "Deployment coupling slows release velocity at scale"],
      },
      {
        name: "Serverless (AWS Lambda / Vercel)",
        description: "Event-triggered functions with automatic scaling to zero. Best for variable or spiky traffic patterns.",
        pros: ["Zero infrastructure management", "Automatic scaling to zero for cost efficiency", "Pay-per-invocation model"],
        cons: ["Cold start latency for infrequent functions", "15-minute execution limit", "Stateless constraints require external state"],
      },
    ],
    risks: [
      "Database connection pool exhaustion under traffic spikes — deploy PgBouncer in transaction mode from the start.",
      "Redis single node failure takes down cache and sessions — use Redis Sentinel or Cluster in production.",
      "Kafka consumer lag during spikes can delay critical async operations — monitor consumer group lag with alerting.",
    ],
    recommendations: [
      "Start with a modular monolith and extract services only when a specific scaling or team ownership boundary demands it.",
      "Implement distributed tracing (OpenTelemetry + Jaeger) from day one — it's essential for debugging production issues.",
      "Use PgBouncer in transaction-mode pooling — prevents connection exhaustion at scale.",
      "Define SLOs (P95/P99 latency, error rate, availability) for each service before going to production.",
    ],
  };
}

