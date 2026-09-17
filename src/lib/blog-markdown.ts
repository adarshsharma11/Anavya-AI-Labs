import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

/**
 * Compile CMS blog bodies as Markdown, not MDX.
 * MDX treats values like `<2.5s` as JSX and 404s the post.
 */
export async function compileBlogMarkdown(source: string) {
  return compileMDX({
    source: source || "",
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        format: "md",
        remarkPlugins: [remarkGfm],
      },
    },
  });
}
