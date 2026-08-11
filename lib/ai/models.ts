export const DEFAULT_CHAT_MODEL = "claude-sonnet-5";

export const titleModel = {
  description: "Fast model for title generation",
  id: "claude-haiku-4-5",
  name: "Claude Haiku 4.5",
  provider: "anthropic",
};

export type ModelCapabilities = {
  tools: boolean;
  vision: boolean;
  reasoning: boolean;
};

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  gatewayOrder?: string[];
  reasoningEffort?: "none" | "minimal" | "low" | "medium" | "high";
};

export const chatModels: ChatModel[] = [
  {
    description: "Most capable Claude model for complex, agentic work",
    id: "claude-opus-4-8",
    name: "Claude Opus 4.8",
    provider: "anthropic",
  },
  {
    description: "Best balance of speed and intelligence",
    id: "claude-sonnet-5",
    name: "Claude Sonnet 5",
    provider: "anthropic",
  },
  {
    description: "Fastest and most cost-effective Claude model",
    id: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    provider: "anthropic",
  },
];

export function getCapabilities(): Promise<
  Record<string, ModelCapabilities>
> {
  // All curated Claude models support tool use and image input.
  const capabilities = Object.fromEntries(
    chatModels.map((model) => [
      model.id,
      { reasoning: false, tools: true, vision: true },
    ])
  );

  return Promise.resolve(capabilities);
}

export const isDemo = process.env.IS_DEMO === "1";

type GatewayModel = {
  id: string;
  name: string;
  type?: string;
  tags?: string[];
};

export type GatewayModelWithCapabilities = ChatModel & {
  capabilities: ModelCapabilities;
};

export async function getAllGatewayModels(): Promise<
  GatewayModelWithCapabilities[]
> {
  try {
    const res = await fetch("https://ai-gateway.vercel.sh/v1/models", {
      next: { revalidate: 86_400 },
    });
    if (!res.ok) {
      return [];
    }

    const json = await res.json();
    return (json.data ?? [])
      .filter((m: GatewayModel) => m.type === "language")
      .map((m: GatewayModel) => ({
        capabilities: {
          reasoning: m.tags?.includes("reasoning") ?? false,
          tools: m.tags?.includes("tool-use") ?? false,
          vision: m.tags?.includes("vision") ?? false,
        },
        description: "",
        id: m.id,
        name: m.name,
        provider: m.id.split("/")[0],
      }));
  } catch {
    return [];
  }
}

export function getActiveModels(): ChatModel[] {
  return chatModels;
}

export const allowedModelIds = new Set(chatModels.map((m) => m.id));

export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);

export type ModelAvailability = "healthy" | "impacted" | "unknown";

export function getModelAvailability(
  modelId: string
): Promise<ModelAvailability> {
  const model = chatModels.find((item) => item.id === modelId);
  return Promise.resolve(model ? "healthy" : "unknown");
}
