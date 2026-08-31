import {Link, useLoaderData} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductItem} from '~/components/ProductItem';
import {PageBannerMedia} from '~/components/PageBannerMedia';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: `沈廣隆｜全部作品`}];
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
  const {storefront} = context;
  const url = new URL(request.url);
  const sort = normalizeSort(url.searchParams.get('sort'));
  const availability = url.searchParams.get('availability') === 'in-stock';
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  const [{products}] = await Promise.all([
    storefront.query(CATALOG_QUERY, {
      variables: {
        ...paginationVariables,
        sortKey: SORT_OPTIONS[sort].sortKey,
        reverse: SORT_OPTIONS[sort].reverse,
        query: availability ? 'available_for_sale:true' : null,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);
  return {products, catalogControls: {sort, availability}};
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

export default function Collection() {
  /** @type {LoaderReturnData} */
  const {products, catalogControls} = useLoaderData();

  return (
    <div className="collection catalog-listing">
      <div className="listing-intro"><PageBannerMedia variant="workshop" /><p className="eyebrow">SHEN GUANG LONG · 始於 1885</p><h1>全部<em>作品</em>。</h1><p>探索來自龍泉工作室的傳統刀劍、練習器械與工藝器物。</p></div>
      <div className="listing-bar"><span>工作室作品檔案</span><span>向下探索 ↓</span></div>
      <CollectionControls
        sort={catalogControls?.sort || 'recommended'}
        availability={catalogControls?.availability || false}
      />
      <PaginatedResourceSection
        connection={products}
        resourcesClassName="products-grid"
      >
        {({node: product, index}) => (
          <ProductItem
            key={product.id}
            product={product}
            loading={index < 8 ? 'eager' : undefined}
          />
        )}
      </PaginatedResourceSection>
    </div>
  );
}

function CollectionControls({sort, availability}) {
  return (
    <section className="collection-controls" aria-label="作品排序與篩選">
      <div className="collection-controls-heading">
        <p className="section-label">整理作品</p>
        <p>按展示順序與庫存狀態整理全部作品。</p>
      </div>
      <form action="/collections/all" className="collection-controls-form" method="get">
        <label className="collection-control-field">
          <span>排序方式</span>
          <select defaultValue={sort} name="sort">
            <option value="recommended">推薦順序</option>
            <option value="newest">最新上架</option>
            <option value="title-asc">名稱 A–Z</option>
            <option value="title-desc">名稱 Z–A</option>
          </select>
        </label>
        <label className="collection-control-checkbox">
          <input defaultChecked={availability} name="availability" type="checkbox" value="in-stock" />
          <span>僅顯示現貨</span>
        </label>
        <button className="button button-gold collection-controls-submit" type="submit">
          套用篩選 <span aria-hidden="true">↗</span>
        </button>
        <Link className="text-link collection-controls-reset" to="/collections/all">
          清除篩選 <span aria-hidden="true">↗</span>
        </Link>
      </form>
    </section>
  );
}

const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment MoneyCollectionItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment CollectionItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyCollectionItem
      }
      maxVariantPrice {
        ...MoneyCollectionItem
      }
    }
  }
`;

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/product
const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $query: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor, sortKey: $sortKey, reverse: $reverse, query: $query) {
      nodes {
        ...CollectionItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
`;

const SORT_OPTIONS = {
  recommended: {sortKey: null, reverse: false},
  newest: {sortKey: 'UPDATED_AT', reverse: true},
  'title-asc': {sortKey: 'TITLE', reverse: false},
  'title-desc': {sortKey: 'TITLE', reverse: true},
};

function normalizeSort(value) {
  return value && SORT_OPTIONS[value] ? value : 'recommended';
}

/** @typedef {import('./+types/collections.all').Route} Route */
/** @typedef {import('storefrontapi.generated').CollectionItemFragment} CollectionItemFragment */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
