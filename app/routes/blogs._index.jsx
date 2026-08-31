import {Link, useLoaderData} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {PageBannerMedia} from '~/components/PageBannerMedia';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => [{title: '沈廣隆｜文章與指南'}];

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
      <header className="journal-hero"><PageBannerMedia variant="media" /><p className="eyebrow">SHEN GUANG LONG · 工作室筆記</p><h1>文章 <em>&amp;</em><br />指南。</h1><p>整理傳統刀劍的選擇、練習、配送與保養知識。</p></header>
      <div className="journal-list">
        <section className="journal-topics" aria-labelledby="journal-topics-heading">
          <div className="journal-section-heading">
            <p className="section-label">從這裡開始</p>
            <h2 id="journal-topics-heading">從基礎知識開始。</h2>
            <p>先了解工藝、用途和保存方式，再選擇適合自己的作品。</p>
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
              <p className="section-label">已發布文章</p>
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
                  <span className="journal-card-number">01</span><div><h2>{blog.title}</h2><p>{blog.seo?.description || '閱讀購買指南與工作室筆記。'}</p></div><span aria-hidden="true">↗</span>
                </Link>
              )}
            </PaginatedResourceSection>
          </section>
        ) : (
          <section className="journal-published journal-empty" aria-labelledby="journal-published-heading">
            <div className="journal-section-heading">
              <p className="section-label">工作室文章</p>
              <h2 id="journal-published-heading">工作室筆記正在陸續整理。</h2>
              <p>這裡會分享龍泉刀劍工藝、作品選擇、保存方式與訂製經驗；已有文章時，會按時間出現在下方。</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

const JOURNAL_TOPICS = [
  {title: '工藝與傳承', description: '從選材、鍛造到檢查，看懂一件作品如何完成。', href: '/pages/craftsmanship'},
  {title: '購買前須知', description: '確認用途、規格、配送和目的地要求。', href: '/pages/before-you-order'},
  {title: '保養與保存', description: '了解傳統刀劍和金屬作品的基礎保存原則。', href: '/pages/care-and-storage'},
  {title: '常見問題', description: '集中查看商品、訂製、配送和購買相關問題。', href: '/pages/faq'},
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
