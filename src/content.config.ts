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
    /**
     * The title for the browser tab and search results, when `title` is too
     * long for them. 49 characters at most: " — E2E Apps" is added, and
     * search engines cut a title at about 60. The h1 still shows `title`.
     */
    seoTitle: z.string().max(49).optional(),
    /**
     * Keep the post live but ask search engines not to index it, and leave it
     * out of the sitemap. For posts that are off the site's subject.
     */
    noindex: z.boolean().optional(),
    /** Search snippet, 160 characters at most. Falls back to the kicker. */
    description: z.string().max(160).optional(),
    /** Byline. Set only where the named person really wrote the post. */
    author: z.enum(['aamir']).optional(),
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
    /**
     * The page a reader of this post most likely wants next: a service slug,
     * `payback-calculator` or `automation`. Required, so every post links on to
     * a page that sells or applies what it explains.
     */
    related: z.enum([
      'mobile-attribution-audit',
      'skan-adattributionkit-setup',
      'att-consent-timing',
      'event-tracking-plan',
      'subscription-revenue-tracking',
      'payback-calculator',
      'automation',
    ]),
  }),
});

export const collections = { blog };
