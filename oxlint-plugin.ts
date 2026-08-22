/**
 * Project-specific rules as an ESLint-compatible oxlint JS plugin.
 * Loaded via "jsPlugins" in .oxlintrc.json; rules are referenced as "project/<name>".
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

export default {
  meta: { name: "project" },
  rules: {
    "ban-let": banLet,
    "ban-switch": banSwitch,
  },
};
