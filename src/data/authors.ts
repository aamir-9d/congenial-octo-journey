/**
 * Post authors. The bio restates the one on the homepage, so there is a single
 * set of claims about each person rather than two that can drift.
 */
/** Shown on the homepage stats strip as well as in the bio, so they are held
 *  once. Change them here and both move. */
export const PORTFOLIO_APPS = '50+';
export const YEARS = { count: 5, word: 'Five' } as const;

export const AUTHORS = {
  aamir: {
    name: 'Aamir Jan Khan',
    role: 'Measurement & Growth',
    linkedin: 'https://www.linkedin.com/in/aamir-jan-khan/',
    bio: `Runs growth for a portfolio of ${PORTFOLIO_APPS} iOS and Android apps. ${YEARS.word} years across measurement platforms, ad platforms, app stores and subscription analytics.`,
  },
} as const;
