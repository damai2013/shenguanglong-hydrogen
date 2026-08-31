import {Link, useLoaderData} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: `Shen Guang Long | Journal & Guides`}];
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
async function loadCriticalData({context, request}) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 10,
  });

  const [{blogs}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        ...paginationVariables,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {blogs};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData() {
  return {};
}

export default function Blogs() {
  /** @type {LoaderReturnData} */
  const {blogs} = useLoaderData();

  return (
    <div className="blogs editorial-journal">
      <header className="journal-hero"><p className="eyebrow">SHEN GUANG LONG · NOTES FROM THE WORKSHOP</p><h1>Journal <em>&</em><br />guides.</h1><p>Practical knowledge for choosing, practicing with, and caring for traditional blades.</p></header>
      <div className="journal-list">
        <section className="journal-topics" aria-labelledby="journal-topics-heading">
          <div className="journal-section-heading">
            <p className="section-label">START HERE</p>
            <h2 id="journal-topics-heading">从基础知识开始。</h2>
            <p>先了解工艺、用途和保存方式，再选择适合自己的作品。</p>
          </div>
          <div className="journal-topic-grid">
            {JOURNAL_TOPICS.map((topic, index) => (
              <Link className="journal-topic-card" key={topic.href} to={topic.href}>
                <span className="journal-card-number">{String(index + 1).padStart(2, '0')}</span>
                <div><h3>{topic.title}</h3><p>{topic.description}</p></div>
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </section>
        {blogs?.nodes?.length ? (
          <section className="journal-published" aria-labelledby="journal-published-heading">
            <div className="journal-section-heading">
              <p className="section-label">PUBLISHED NOTES</p>
              <h2 id="journal-published-heading">工作室文章。</h2>
            </div>
            <PaginatedResourceSection connection={blogs}>
              {({node: blog}) => (
                <Link
                  className="journal-card"
                  key={blog.handle}
                  prefetch="intent"
                  to={`/blogs/${blog.handle}`}
                >
                  <span className="journal-card-number">01</span><div><h2>{blog.title}</h2><p>{blog.seo?.description || 'Read our buying guides and workshop notes.'}</p></div><span aria-hidden="true">↗</span>
                </Link>
              )}
            </PaginatedResourceSection>
          </section>
        ) : null}
      </div>
    </div>
  );
}

const JOURNAL_TOPICS = [
  {title: '工艺与传承', description: '从选材、锻造到检查，看懂一件作品如何完成。', href: '/pages/craftsmanship'},
  {title: '购买前须知', description: '确认用途、规格、配送和目的地要求。', href: '/pages/before-you-order'},
  {title: '保养与保存', description: '了解传统刀剑和金属作品的基础保存原则。', href: '/pages/care-and-storage'},
  {title: '常见问题', description: '集中查看商品、定制、配送和购买相关问题。', href: '/pages/faq'},
];

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOGS_QUERY = `#graphql
  query Blogs(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    blogs(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        title
        handle
        seo {
          title
          description
        }
      }
    }
  }
`;

/** @typedef {BlogsQuery['blogs']['nodes'][0]} BlogNode */

/** @typedef {import('./+types/blogs._index').Route} Route */
/** @typedef {import('storefrontapi.generated').BlogsQuery} BlogsQuery */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
