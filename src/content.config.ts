import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Blog posts.
 *
 * Markdown, not a `posts.ts` data module like faq.ts and products.ts.
 *
 * I proposed the data-module shape before reading the articles and it was the
 * wrong call: these are long-form technical pieces built around Python,
 * JavaScript and JSON code blocks. In a TypeScript module every one of those
 * would be a template literal fighting the backticks inside it, with no syntax
 * highlighting. Markdown gets Astro's built-in Shiki highlighting for free and
 * stays readable when the next post is written.
 *
 * Still zero new dependencies — content collections ship with Astro.
 *
 * The articles were first published on LinkedIn by the site's own author, so
 * `source` records where, and each page links back to it visibly.
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    /** Rendered as the post's h1 and the row title on the homepage. */
    title: z.string(),
    /** One line under the title. Shown on the index rows and in the meta description. */
    kicker: z.string(),
    /** First publication date, from the original article. */
    date: z.coerce.date(),
    /** Mono uppercase label on the row. Keep the set small so it reads as a taxonomy. */
    tag: z.string(),
    /** Where it first appeared. Rendered as a visible attribution link. */
    source: z.string().url().optional(),
    /**
     * Closing call to action, tailored to this post.
     *
     * Required, so a new post cannot ship without one. It lives here rather
     * than in the Markdown body because a Markdown link cannot know the
     * deployed base path -- `../#contact` gets normalised to `#contact`, which
     * points the reader back at the post they are already reading. The layout
     * has the base.
     *
     * Tailored, not boilerplate: it should name something specific to the
     * article it closes. `tests/blog.test.ts` fails if two posts share one.
     */
    cta: z.string(),
  }),
});

export const collections = { blog };
