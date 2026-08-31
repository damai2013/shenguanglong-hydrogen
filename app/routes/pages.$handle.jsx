import {Link, useLoaderData} from 'react-router';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [{title: `Hydrogen | ${data?.page.title ?? ''}`}];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context, request, params}) {
  if (!params.handle) {
    throw new Error('Missing page handle');
  }

  const [{page}] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {
      variables: {
        handle: params.handle,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.handle, data: page});

  return {
    page,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function Page() {
  /** @type {LoaderReturnData} */
  const {page} = useLoaderData();
  const intro = PAGE_INTROS[page.handle] || PAGE_INTROS.default;

  return (
    <div className={`page editorial-page editorial-page-${page.handle}`}>
      <header className="editorial-page-hero">
        <p className="eyebrow">{intro.kicker}</p>
        <h1>{intro.title || page.title}<em>.</em></h1>
        <p className="editorial-page-lede">{intro.lede}</p>
      </header>
      <div className="editorial-page-layout">
        <main className="editorial-page-content">
          <div className="shopify-page-body" dangerouslySetInnerHTML={{__html: page.body}} />
        </main>
        <aside className="editorial-page-aside">
          <span className="aside-index">SHEN GUANG LONG</span>
          <p>{intro.aside}</p>
          <Link className="text-link" to={intro.ctaUrl}>{intro.ctaLabel} <span aria-hidden="true">↗</span></Link>
        </aside>
      </div>
    </div>
  );
}

const PAGE_INTROS = {
  'about-shen-guang-long': {
    kicker: 'A LINEAGE IN STEEL',
    title: 'The story behind the blade',
    lede: 'A Longquan workshop, a family tradition, and a quiet belief that the object should carry the discipline of the hand that made it.',
    aside: 'From collection guidance to the workbench, every detail begins with respect for the tradition.',
    ctaLabel: 'Explore the collection',
    ctaUrl: '/collections',
  },
  'craftsmanship': {
    kicker: 'THE HAND & THE BLADE',
    title: 'Made with patience',
    lede: 'Balance, proportion, and finish are not decoration. They are the language through which a traditional blade becomes useful, present, and lasting.',
    aside: 'See how the workshop’s principles shape the objects in the catalog.',
    ctaLabel: 'View all pieces',
    ctaUrl: '/collections/all',
  },
  'master-custom': {
    kicker: 'BY COMMISSION · MASTER WORKS',
    title: 'A blade with your name on it',
    lede: 'Commission a considered piece from the沈廣隆 lineage. Begin with the master series, then let the workshop guide the details.',
    aside: 'Custom work requires a conversation about purpose, materials, dimensions, schedule, and destination.',
    ctaLabel: 'Start a consultation',
    ctaUrl: '/pages/contact',
  },
  'before-you-order': {
    kicker: 'BEFORE YOU ORDER',
    title: 'Choose with clarity',
    lede: 'A traditional blade is a considered purchase. Start with the information that matters: purpose, proportion, finish, delivery, and care.',
    aside: 'If you are unsure which piece is right for your practice, contact the workshop before ordering.',
    ctaLabel: 'Ask a question',
    ctaUrl: '/pages/contact',
  },
  faq: {
    kicker: 'QUESTIONS, ANSWERED',
    title: 'A clear path to the right piece',
    lede: 'Find practical answers about products, availability, delivery, and the buying process.',
    aside: 'For questions specific to your destination or intended use, we recommend a direct consultation.',
    ctaLabel: 'Contact us',
    ctaUrl: '/pages/contact',
  },
  'care-and-storage': {
    kicker: 'CARE & STORAGE',
    title: 'Keep the piece in its element',
    lede: 'Good care protects the finish, the structure, and the relationship between a blade and the hand that uses it.',
    aside: 'Care guidance depends on the material and finish of each piece. Keep your product details available when asking for help.',
    ctaLabel: 'View all pieces',
    ctaUrl: '/collections/all',
  },
  contact: {
    kicker: 'CONTACT · SHEN GUANG LONG',
    title: 'Begin with a conversation',
    lede: 'Tell us what you are looking for, where it is going, and how you intend to use it. We will help you find the next step.',
    aside: 'For custom work, include your preferred style, dimensions, materials, timing, and destination.',
    ctaLabel: 'Browse the collection',
    ctaUrl: '/collections',
  },
  default: {
    kicker: 'SHEN GUANG LONG · LONGQUAN',
    title: null,
    lede: 'Traditional blades, practice objects, and workshop stories from Longquan, China.',
    aside: 'Questions about a piece, its use, or its journey to you? We are here to help.',
    ctaLabel: 'Contact us',
    ctaUrl: '/pages/contact',
  },
};

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      handle
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
`;

/** @typedef {import('./+types/pages.$handle').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
