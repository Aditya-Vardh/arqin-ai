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

  return {
    title: "Software Architecture Research Analysis",
    summary: `The optimal architectural approach for "${question.slice(0, 80)}" balances scalability, reliability, and operational simplicity. A layered microservices design with an API Gateway, Redis caching, and PostgreSQL persistence provides a strong production foundation.`,
    recommendedArchitecture: "Deploy a stateless API tier behind an API Gateway for centralized authentication, rate limiting, and routing. Separate concerns into focused services: business logic service, notification service, and background worker. Use PostgreSQL as the primary relational store with Redis for caching and session management. Publish domain events to a Kafka topic for async processing and service decoupling.",
    architecturePattern: "Layered Microservices + Event-Driven + API Gateway",
    technologyRecommendations: [
      { category: "Frontend", name: "Next.js 15", reason: "React-based framework with SSR, ISR, and App Router for fast, SEO-friendly user interfaces." },
      { category: "Backend", name: "Node.js / TypeScript", reason: "Type-safe, async-first runtime for building scalable REST and GraphQL APIs." },
      { category: "Database", name: "PostgreSQL 16", reason: "Production-proven RDBMS with strong ACID guarantees, rich query capabilities, and extensive extension ecosystem." },
      { category: "Cache", name: "Redis 7", reason: "In-memory cache for session state, rate limiting counters, and read-through database caching." },
      { category: "Message Broker", name: "Apache Kafka", reason: "Durable event log for async inter-service communication and event sourcing." },
      { category: "Infrastructure", name: "Kubernetes + Helm", reason: "Container orchestration with declarative deployment, horizontal pod autoscaling, and health management." },
    ],
    scalability: "Stateless API services scale horizontally via Kubernetes HPA based on CPU and request rate metrics. Redis absorbs read spikes, reducing database pressure. Kafka decouples async workers from the API tier, allowing each to scale independently. Database scales reads via read replicas.",
    performance: "Redis cache hit rate target above 85% for hot paths. API P95 latency target under 200ms. Background jobs processed asynchronously via Kafka — no blocking on the API response path. Use connection pooling (PgBouncer) to reduce PostgreSQL connection overhead.",
    latency: "API tier P99 latency target: under 300ms. Redis cache lookups: sub-1ms. Database queries: under 50ms with proper indexing. Async Kafka consumer jobs: eventual delivery within 5 seconds. CDN edge cache for static assets and pre-rendered pages.",
    reliability: "Circuit breakers (Resilience4j / cockatiel) prevent cascade failure to downstream services. Exponential backoff retry on transient database errors. Kafka at-least-once delivery with idempotent consumers. PostgreSQL synchronous streaming replication to a standby replica. Health check endpoints on every service for Kubernetes readiness/liveness probes.",
    security: "JWT tokens with 15-minute expiry and refresh token rotation for API authentication. API Gateway enforces RBAC authorization before forwarding to services. TLS 1.3 for all external and internal service traffic. PostgreSQL row-level security for multi-tenant data isolation. Input validation and parameterized queries on all endpoints.",
    dataStrategy: "PostgreSQL as the primary source of truth for all relational data. Redis for ephemeral session and cache data with TTL-based expiration. S3-compatible object storage for file uploads, exports, and media. Kafka as the event log for audit trails and async processing. ElasticSearch for full-text search capabilities if required.",
    cachingStrategy: "Redis read-through cache for frequently accessed entities with 5-minute TTL. Redis cache invalidation on write via publish/subscribe pattern. CDN caching for static assets with long TTLs and content-addressed filenames. Application-level response caching for expensive aggregation queries.",
    communicationStrategy: "REST API for standard CRUD operations and external integrations. GraphQL for flexible data fetching on the frontend BFF. Kafka for async inter-service events and background job triggering. gRPC for latency-sensitive internal service-to-service calls. WebSockets for real-time features if required.",
    tradeoffs: [
      "Microservices add distributed systems complexity — debugging across service boundaries requires distributed tracing (OpenTelemetry).",
      "Eventual consistency via Kafka events means read-after-write may return stale data — design UX to account for propagation delay.",
      "Redis cache invalidation is complex — stale cache data can cause subtle bugs under concurrent writes.",
      "API Gateway becomes a critical path — a gateway outage impacts all services, requiring high-availability deployment.",
    ],
    alternatives: [
      {
        name: "Modular Monolith",
        description: "Single deployable unit with strong internal module boundaries. Best for teams under 20 engineers or early-stage products.",
        pros: ["Simpler deployment and local development", "No distributed transaction complexity", "Easier debugging with single process"],
        cons: ["Scaling requires scaling the entire application", "Deployment coupling slows release velocity", "Module boundary drift is hard to enforce without tooling"],
      },
      {
        name: "Serverless (AWS Lambda / Vercel Functions)",
        description: "Event-triggered functions with auto-scaling and pay-per-invocation. Best for variable or unpredictable traffic patterns.",
        pros: ["Zero infrastructure management", "Automatic scaling to zero", "Pay-per-invocation cost model"],
        cons: ["Cold start latency (100ms–2s) for infrequent functions", "Local development complexity", "Stateless constraints require external state management"],
      },
    ],
    risks: [
      "Database connection pool exhaustion under sudden traffic spikes — deploy PgBouncer in transaction mode and set max_connections appropriately.",
      "Redis single node failure takes down caching and sessions — use Redis Sentinel or Redis Cluster for production deployments.",
      "Kafka consumer group lag during traffic spikes can delay critical notifications — monitor consumer lag with alerting thresholds.",
      "Kubernetes resource limits misconfigured too low cause OOM kills under load — profile resource usage under realistic load tests.",
    ],
    recommendations: [
      "Start with a modular monolith if the team is small — extract microservices only when a specific scaling or ownership boundary demands it.",
      "Implement distributed tracing (OpenTelemetry + Jaeger/Tempo) from day one — it pays dividends when debugging production latency.",
      "Use PgBouncer in transaction-mode pooling between application and PostgreSQL — prevents connection exhaustion at scale.",
      "Implement structured logging (JSON) with correlation IDs across all services to enable efficient log aggregation and debugging.",
      "Run load tests (k6 or Locust) before launch to validate latency targets and identify bottlenecks under realistic traffic.",
      "Define SLOs (Service Level Objectives) for each service — P95/P99 latency, error rate, and availability targets guide engineering decisions.",
    ],
  };
}

