import {Link, redirect, useLoaderData} from 'react-router';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductItem} from '~/components/ProductItem';
import {PageBannerMedia} from '~/components/PageBannerMedia';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [{title: `沈廣隆｜${data?.collection.title ?? '作品分類'}`}];
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
async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;
  const url = new URL(request.url);
  const sort = normalizeSort(url.searchParams.get('sort'));
  const availability = url.searchParams.get('availability') === 'in-stock';
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  if (!handle) {
    throw redirect('/collections');
  }

  const masterProfile = MASTER_COLLECTIONS[handle];
  const [collectionResult, masterProductsResult] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {
        handle,
        ...paginationVariables,
        sortKey: SORT_OPTIONS[sort].sortKey,
        reverse: SORT_OPTIONS[sort].reverse,
        filters: availability ? [{available: true}] : null,
      },
      // Add other queries here, so that they are loaded in parallel
    }),
    masterProfile
      ? storefront.query(MASTER_PRODUCTS_QUERY, {variables: {first: 250}})
      : Promise.resolve({products: {nodes: []}}),
  ]);
  const {collection} = collectionResult;

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {
    collection,
    masterProducts: masterProductsResult.products?.nodes ?? [],
    catalogControls: {sort, availability},
  };
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
  const {collection, masterProducts = [], catalogControls} = useLoaderData();
  const masterProfile = MASTER_COLLECTIONS[collection.handle];
  const titleMatchedProducts = masterProfile
    ? masterProducts.filter((product) => product.title.includes(masterProfile.name))
    : [];
  const collectionProducts = collection.products?.nodes ?? [];
  const displayedMasterProducts = masterProfile
    ? [
        ...titleMatchedProducts,
        ...collectionProducts.filter(
          (product) => !titleMatchedProducts.some((matched) => matched.id === product.id),
        ),
      ]
    : [];

  return (
    <div className="collection collection-detail">
      <div className="collection-detail-intro" id={collection.handle === 'chinese-dao' ? 'dao-forms' : collection.handle === 'chinese-jian' ? 'jian-forms' : undefined}><PageBannerMedia variant={MASTER_COLLECTIONS[collection.handle] ? 'master' : 'materials'} /><p className="eyebrow">作品分類 · 沈廣隆</p><h1>{collection.title}<em>。</em></h1><p className="collection-description">{COLLECTION_DESCRIPTIONS[collection.handle] || collection.description || '來自龍泉工作室的傳統刀劍精選作品。'}</p></div>
      <div className="listing-bar"><span>精選作品</span><span>龍泉手工製作 ↓</span></div>
      {!masterProfile && (
        <CollectionControls
          handle={collection.handle}
          sort={catalogControls?.sort || 'recommended'}
          availability={catalogControls?.availability || false}
        />
      )}
      {masterProfile && (
        <MasterCollectionProfile profile={masterProfile} />
      )}
      {displayedMasterProducts.length ? (
        <MasterProductsGrid products={displayedMasterProducts} />
      ) : (
        <PaginatedResourceSection
          connection={collection.products}
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
      )}
      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </div>
  );
}

function CollectionControls({handle, sort, availability}) {
  return (
    <section className="collection-controls" aria-label="作品排序與篩選">
      <div className="collection-controls-heading">
        <p className="section-label">REFINE THE ARCHIVE</p>
        <p>按展示順序與庫存狀態整理當前分類。</p>
      </div>
      <form action={`/collections/${handle}`} className="collection-controls-form" method="get">
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
        <Link className="text-link collection-controls-reset" to={`/collections/${handle}`}>
          清除篩選 <span aria-hidden="true">↗</span>
        </Link>
      </form>
    </section>
  );
}

function MasterCollectionProfile({profile}) {
  return (
    <section className="master-collection-profile">
      <div className="master-collection-profile-portrait">
        <img src={profile.image} alt={profile.imageAlt} loading="eager" />
        <span>{profile.mark}</span>
      </div>
      <div>
        <p className="section-label">MASTER WORKS · {profile.generation}</p>
        <h2>{profile.title}</h2>
        <p>{profile.intro}</p>
        <div className="master-collection-profile-grid">
          {profile.points.map(([title, text]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <p className="master-collection-profile-note">這個作品系列以大師的工藝方向與相關作品為主題；你可以先查看現售作品，再聯絡我們討論訂製。</p>
        <Link className="text-link" to="/pages/master-custom">查看大師訂製流程 <span aria-hidden="true">↗</span></Link>
      </div>
    </section>
  );
}

function MasterProductsGrid({products}) {
  return (
    <div className="products-grid master-products-grid">
      {products.map((product, index) => (
        <ProductItem
          key={product.id}
          product={product}
          loading={index < 8 ? 'eager' : undefined}
        />
      ))}
    </div>
  );
}

const MASTER_COLLECTIONS = {
  'shen-xinpei-master-custom': {
    name: '沈新培',
    mark: '新培',
    generation: '第四代 · 沈新培',
    image: '/assets/reference/master-shen-xinpei.jpg',
    imageAlt: '沈新培肖像',
    title: '沈新培大師作品與訂製方向',
    intro: '沈新培承接家族龍泉刀劍工藝，將傳統形制、實用尺度與當代製作延續到工作室。這裡集中呈現沈新培大師的工藝方向與相關作品，從傳統形制、材料到手工流程，了解一件作品如何形成。',
    points: [
      ['傳統根基', '從龍泉刀劍的形制、材料與手工流程出發，重視作品的結構與使用邊界。'],
      ['作品方向', '可作為收藏、展示與禮贈方向的參考；具體作品是否可訂製，需要逐項確認。'],
      ['訂製方式', '如需討論尺寸、材料、裝具或刻飾，請先提供用途、目的地與預算範圍。'],
    ],
  },
  'shen-zhou-master-custom': {
    name: '沈州',
    mark: '沈州',
    generation: '第五代 · 沈州',
    image: '/assets/reference/master-shen-zhou.jpg',
    imageAlt: '沈州在工作室展示劍器',
    title: '沈州大師作品與訂製方向',
    intro: '沈州自年輕時跟隨家族學習龍泉劍鍛製技藝，承接第五代工作室的製作與傳承。這裡集中呈現沈州大師的工藝方向與相關作品，從家學傳承出發，理解當代作品對實用、比例與審美的平衡。',
    points: [
      ['實用與美觀', '作品方向重視實際使用、比例、平衡與外觀之間的關係，不以裝飾取代規格說明。'],
      ['工藝探索', '部分作品涉及材料、熱處理、表面與裝具的不同處理方式，實際可行性需逐項確認。'],
      ['訂製方式', '請先說明用途、尺寸、材料偏好、預算、完成時間與收貨地區，再進入報價討論。'],
    ],
  },
};

const COLLECTION_DESCRIPTIONS = {
  'chinese-dao': '本分類按中國傳統刀形整理，收錄唐刀、雁翎刀、苗刀、繡春刀、明刀與環首刀等作品；實際材質、尺寸、裝具與現售狀態，以各商品頁標示為準。',
  'chinese-jian': '本分類按中國傳統劍形整理，收錄漢劍、唐劍、清劍、環首劍及其他中國劍類作品；實際材質、尺寸、裝具與現售狀態，以各商品頁標示為準。',
};

const SORT_OPTIONS = {
  recommended: {sortKey: null, reverse: false},
  newest: {sortKey: 'UPDATED_AT', reverse: true},
  'title-asc': {sortKey: 'TITLE', reverse: false},
  'title-desc': {sortKey: 'TITLE', reverse: true},
};

function normalizeSort(value) {
  return value && SORT_OPTIONS[value] ? value : 'recommended';
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
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
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
  }
`;

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $filters: [ProductFilter!]
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
        sortKey: $sortKey,
        reverse: $reverse,
        filters: $filters
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
`;

const MASTER_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query MasterProducts(
    $first: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $first) {
      nodes {
        ...ProductItem
      }
    }
  }
`;

/** @typedef {import('./+types/collections.$handle').Route} Route */
/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
