/**
 * Project-specific rules as an ESLint-compatible oxlint JS plugin.
 * Loaded via "jsPlugins" in .oxlintrc.json; rules are referenced as "project/<name>":
 * project/ban-switch, project/ban-let, project/no-fetch, project/ban-eden-fetch.
 */

interface ReportContext {
  report: (descriptor: { message: string; node: unknown }) => void;
}

const banSwitch = {
  create(context: ReportContext) {
    return {
      SwitchStatement(node: unknown) {
        context.report({ message: "switch is banned. Use ts-pattern (`match`) instead.", node });
      },
    };
  },
  meta: {
    docs: { description: "switch is banned. Use ts-pattern (`match`) instead." },
  },
};

const banLet = {
  create(context: ReportContext) {
    return {
      VariableDeclaration(node: { kind?: "var" | "let" | "const" }) {
        if (node.kind === "let") {
          context.report({
            message: "let is banned. Use const — derive new values instead of reassigning.",
            node,
          });
        }
      },
    };
  },
  meta: {
    docs: { description: "let is banned. Use const — derive new values instead of reassigning." },
  },
};

interface FetchCallee {
  type: string;
  name?: string;
  property?: { name?: string };
}

const noFetch = {
  create(context: ReportContext) {
    return {
      CallExpression(node: { callee: FetchCallee }) {
        const { callee } = node;
        if (
          (callee.type === "Identifier" && callee.name === "fetch") ||
          (callee.type === "MemberExpression" && callee.property?.name === "fetch")
        ) {
          context.report({
            message: "fetch is banned. Use the typed Eden Treaty client from @/lib/api.",
            node,
          });
        }
      },
    };
  },
  meta: {
    docs: { description: "Raw fetch is banned. Use the typed Eden Treaty client from @/lib/api." },
  },
};

const banEdenFetch = {
  create(context: ReportContext) {
    return {
      ImportDeclaration(node: { source: { value: string } }) {
        if (node.source.value.startsWith("@elysiajs/eden/fetch")) {
          context.report({
            message: "Eden Fetch is banned. Use Eden Treaty (treaty<App> from @elysiajs/eden).",
            node,
          });
        }
      },
    };
  },
  meta: {
    docs: { description: "Eden Fetch is banned. Use Eden Treaty instead." },
  },
};

export default {
  meta: { name: "project" },
  rules: {
    "ban-eden-fetch": banEdenFetch,
    "ban-let": banLet,
    "ban-switch": banSwitch,
    "no-fetch": noFetch,
  },
};
