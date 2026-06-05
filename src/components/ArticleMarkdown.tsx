import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";

import { remarkCallout } from "@/lib/remark-callout";
import { CalloutBlock } from "@/components/article/CalloutBlock";
import { CopyCodeButton } from "@/components/article/CopyCodeButton";

import "highlight.js/styles/github-dark.css";

function extractText(node: unknown): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object") {
    const maybe = node as { props?: { children?: unknown } };
    return extractText(maybe.props?.children ?? "");
  }
  return "";
}

const components = {
  callout: (props: Record<string, unknown>) => <CalloutBlock {...props} />,
  pre: ({ children }: { children?: React.ReactNode }) => {
    const codeText = extractText(children).replace(/\n$/, "");
    return (
      <div className="relative my-6">
        <CopyCodeButton text={codeText} />
        <pre>{children}</pre>
      </div>
    );
  },
  code: ({ inline, className, children, ...props }: {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
  }) => {
    if (inline) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
} as unknown as Components;

export function ArticleMarkdown({ source }: { source: string }) {
  return (
    <div className="prose-mk">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkDirective, remarkCallout]}
        rehypePlugins={[rehypeHighlight, rehypeSlug]}
        components={components}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
