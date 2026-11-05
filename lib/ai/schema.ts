import { z } from "zod";

export const diagramTypeSchema = z.enum([
  "class",
  "sequence",
  "er",
  "flowchart",
  "component",
  "deployment",
  "state",
  "architecture",
]);

export const explanationSchema = z.object({
  overview: z.string(),
  components: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
    }),
  ).max(10),
  dataFlow: z.string(),
  technologyChoices: z.string(),
  scalability: z.string(),
  security: z.string(),
  reliability: z.string(),
  tradeoffs: z.string(),
  improvements: z.string(),
});

export const adaptiveInsightsSchema = z.object({
  health: z.number(),
  healthLabel: z.string(),
  scalability: z.number(),
  maintainability: z.number(),
  reliability: z.number(),
  security: z.number(),
  adaptability: z.number(),
  potentialIssues: z.array(z.string()).max(3),
  suggestions: z.array(
    z.object({
      current: z.string(),
      suggested: z.string(),
      reason: z.string(),
      category: z.enum([
        "scalability",
        "maintainability",
        "reliability",
        "security",
        "adaptability",
      ]),
    }),
  ).max(3),
});

export const architectureSchema = z.object({
  title: z.string(),
  diagramType: diagramTypeSchema,
  mermaidCode: z.string(),
  explanation: explanationSchema,
  technologies: z.array(z.string()),
  adaptiveInsights: adaptiveInsightsSchema,
});

export const technologyRecommendationSchema = z.object({
  category: z.string(),
  name: z.string(),
  reason: z.string(),
});

export const alternativeSchema = z.object({
  name: z.string(),
  description: z.string(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
});

export const researchSchema = z.object({
  title: z.string(),
  summary: z.string(),
  recommendedArchitecture: z.string(),
  architecturePattern: z.string(),
  technologyRecommendations: z.array(technologyRecommendationSchema),
  scalability: z.string(),
  performance: z.string(),
  latency: z.string(),
  reliability: z.string(),
  security: z.string(),
  dataStrategy: z.string(),
  cachingStrategy: z.string(),
  communicationStrategy: z.string(),
  tradeoffs: z.array(z.string()),
  alternatives: z.array(alternativeSchema),
  risks: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export const umlSchema = z.object({
  title: z.string(),
  classes: z.array(
    z.object({
      name: z.string(),
      attributes: z.array(z.string()),
      methods: z.array(z.string()),
    }),
  ),
  relationships: z.array(
    z.object({
      from: z.string(),
      to: z.string(),
      type: z.enum([
        "association",
        "inheritance",
        "aggregation",
        "composition",
      ]),
    }),
  ),
});

export type Architecture = z.infer<typeof architectureSchema>;
export type Research = z.infer<typeof researchSchema>;
export type UML = z.infer<typeof umlSchema>;
