import {useLoaderData, Link} from 'react-router';
import {getPaginationVariables, Image} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

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
function loadDeferredData({context}) {
  return {};
}

export default function Collections() {
  /** @type {LoaderReturnData} */
  const {collections} = useLoaderData();

  return (
    <div className="collections catalog-landing">
      <section className="catalog-intro">
        <p className="eyebrow">THE COLLECTION · LONGQUAN, CHINA</p>
        <h1>Objects of <em>practice</em><br />and inheritance.</h1>
        <p className="catalog-lede">Traditional swords, sabers, and training weapons shaped by the hand of the maker—and chosen for the hand of the practitioner.</p>
        <Link className="button button-dark" to="/collections/all">View all pieces <span aria-hidden="true">↗</span></Link>
      </section>
      <section className="catalog-featured" aria-labelledby="catalog-featured-heading">
        <div className="section-heading"><div><p className="eyebrow">BY DISCIPLINE</p><h2 id="catalog-featured-heading">Find your <em>blade</em>.</h2></div><span className="catalog-count">01 — 06</span></div>
        <div className="catalog-category-grid">
          {FEATURED_CATEGORIES.map((category, index) => (
            <Link className="catalog-category-card" key={category.handle} to={`/collections/${category.handle}`}>
              <span className="catalog-category-number">0{index + 1}</span><div><h3>{category.title}</h3><p>{category.subtitle}</p></div><span className="catalog-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="catalog-paths" aria-labelledby="catalog-paths-heading">
        <div className="section-heading"><div><p className="eyebrow">CHOOSE YOUR PATH</p><h2 id="catalog-paths-heading">从用途开始选择。</h2></div><span className="catalog-count">02 — 03</span></div>
        <div className="catalog-path-grid">
          <Link className="catalog-path-card" to="/collections/all"><span>01</span><div><h3>我已经知道要找什么</h3><p>直接浏览全部商品，按实际商品页确认规格与库存。</p></div><b aria-hidden="true">↗</b></Link>
          <Link className="catalog-path-card" to="/pages/before-you-order"><span>02</span><div><h3>我想先了解购买规则</h3><p>先确认用途、状态、配送和目的地要求。</p></div><b aria-hidden="true">↗</b></Link>
          <Link className="catalog-path-card" to="/pages/master-custom"><span>03</span><div><h3>我想讨论一件订制作品</h3><p>从用途、尺寸、材料、预算和目的地开始咨询。</p></div><b aria-hidden="true">↗</b></Link>
        </div>
      </section>
      <section className="catalog-all-collections" aria-labelledby="all-collections-heading">
        <div className="section-heading"><div><p className="eyebrow">THE FULL ARCHIVE</p><h2 id="all-collections-heading">All collections</h2></div></div>
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
  {handle: 'tai-chi-swords', title: 'Tai Chi Swords', subtitle: 'For movement, balance, and daily practice.'},
  {handle: 'tai-chi-sabers', title: 'Tai Chi Sabers', subtitle: 'A responsive curve for open-hand forms.'},
  {handle: 'chinese-jian', title: 'Chinese Swords', subtitle: 'A lineage of straight blades.'},
  {handle: 'chinese-dao', title: 'Chinese Sabers', subtitle: 'Power, structure, and a single edge.'},
  {handle: 'tang-dao', title: 'Tang Dao', subtitle: 'The long arc of the Tang tradition.'},
  {handle: 'new-2025', title: 'New Arrivals', subtitle: 'The latest work from the workshop.'},
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
