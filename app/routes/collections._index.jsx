import {useLoaderData, Link} from 'react-router';
import {getPaginationVariables, Image} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {PageBannerMedia} from '~/components/PageBannerMedia';

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
    pageBy: 4,
  });

  const [{collections}] = await Promise.all([
    context.storefront.query(COLLECTIONS_QUERY, {
      variables: paginationVariables,
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {collections};
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

export default function Collections() {
  /** @type {LoaderReturnData} */
  const {collections} = useLoaderData();

  return (
    <div className="collections catalog-landing">
      <section className="catalog-intro">
        <PageBannerMedia variant="craft" />
        <p className="eyebrow">作品選集 · 中國龍泉</p>
        <h1>為練習與<em>傳承</em><br />而作的器物。</h1>
        <p className="catalog-lede">由匠人親手完成的傳統劍、刀與練習器械，為實際使用者的手感與用途而選。</p>
        <Link className="button button-gold" to="/collections/all">查看全部作品 <span aria-hidden="true">↗</span></Link>
      </section>
      <section className="catalog-featured" aria-labelledby="catalog-featured-heading">
        <div className="section-heading"><div><p className="eyebrow">依用途選擇</p><h2 id="catalog-featured-heading">找到適合你的<em>刀劍</em>。</h2></div><span className="catalog-count">01 — 06</span></div>
        <div className="catalog-category-grid">
          {FEATURED_CATEGORIES.map((category, index) => (
            <Link className="catalog-category-card" key={category.handle} to={`/collections/${category.handle}`}>
              <span className="catalog-category-number">0{index + 1}</span><div><h3>{category.title}</h3><p>{category.subtitle}</p></div><span className="catalog-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="catalog-paths" aria-labelledby="catalog-paths-heading">
        <div className="section-heading"><div><p className="eyebrow">選擇你的路徑</p><h2 id="catalog-paths-heading">從用途開始選擇。</h2></div><span className="catalog-count">02 — 03</span></div>
        <div className="catalog-path-grid">
          <Link className="catalog-path-card" to="/collections/all"><span>01</span><div><h3>我已經知道要找什麼</h3><p>直接瀏覽全部商品，按實際商品頁確認規格與庫存。</p></div><b aria-hidden="true">↗</b></Link>
          <Link className="catalog-path-card" to="/pages/before-you-order"><span>02</span><div><h3>我想先了解購買規則</h3><p>先確認用途、狀態、配送和目的地要求。</p></div><b aria-hidden="true">↗</b></Link>
          <Link className="catalog-path-card" to="/pages/master-custom"><span>03</span><div><h3>我想討論一件訂製作品</h3><p>從用途、尺寸、材料、預算和目的地開始諮詢。</p></div><b aria-hidden="true">↗</b></Link>
        </div>
      </section>
      <section className="catalog-all-collections" aria-labelledby="all-collections-heading">
        <div className="section-heading"><div><p className="eyebrow">完整作品檔案</p><h2 id="all-collections-heading">全部分類</h2></div></div>
      <PaginatedResourceSection
        connection={collections}
        resourcesClassName="collections-grid"
      >
        {({node: collection, index}) => (
          <CollectionItem
            key={collection.id}
            collection={collection}
            index={index}
          />
        )}
      </PaginatedResourceSection>
      </section>
    </div>
  );
}

const FEATURED_CATEGORIES = [
  {handle: 'tai-chi-swords', title: '太極劍', subtitle: '適合動作、平衡與日常練習。'},
  {handle: 'tai-chi-sabers', title: '太極刀', subtitle: '為徒手套路而設的靈活刀形。'},
  {handle: 'chinese-jian', title: '中國劍', subtitle: '收錄漢劍、唐劍、清劍與環首劍等傳統劍形作品。'},
  {handle: 'chinese-dao', title: '中國刀', subtitle: '收錄唐刀、雁翎刀、苗刀、繡春刀、明刀與環首刀等傳統刀形作品。'},
  {handle: 'tang-dao', title: '唐刀', subtitle: '以唐代刀形為脈絡，呈現長弧刀身與佩用結構的作品。'},
  {handle: 'new-2025', title: '新品', subtitle: '工作室近期完成的作品。'},
];

/**
 * @param {{
 *   collection: CollectionFragment;
 *   index: number;
 * }}
 */
function CollectionItem({collection, index}) {
  return (
    <Link
      className="collection-item"
      key={collection.id}
      to={`/collections/${collection.handle}`}
      prefetch="intent"
    >
      {collection?.image && (
        <Image
          alt={collection.image.altText || collection.title}
          aspectRatio="1/1"
          data={collection.image}
          loading={index < 3 ? 'eager' : undefined}
          sizes="(min-width: 45em) 400px, 100vw"
        />
      )}
      <h5>{collection.title}</h5>
    </Link>
  );
}

const COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
  }
  query StoreCollections(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...Collection
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

/** @typedef {import('./+types/collections._index').Route} Route */
/** @typedef {import('storefrontapi.generated').CollectionFragment} CollectionFragment */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
