import {Link, redirect, useLoaderData} from 'react-router';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductItem} from '~/components/ProductItem';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [{title: `Hydrogen | ${data?.collection.title ?? ''} Collection`}];
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
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  if (!handle) {
    throw redirect('/collections');
  }

  const [{collection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, ...paginationVariables},
      // Add other queries here, so that they are loaded in parallel
    }),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {
    collection,
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
  const {collection} = useLoaderData();

  return (
    <div className="collection collection-detail">
      <div className="collection-detail-intro"><p className="eyebrow">作品分類 · 沈廣隆</p><h1>{collection.title}<em>。</em></h1><p className="collection-description">{collection.description || '來自龍泉工作室的傳統刀劍精選作品。'}</p></div>
      <div className="listing-bar"><span>精選作品</span><span>龍泉手工製作 ↓</span></div>
      {MASTER_COLLECTIONS[collection.handle] && (
        <MasterCollectionProfile profile={MASTER_COLLECTIONS[collection.handle]} />
      )}
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

function MasterCollectionProfile({profile}) {
  return (
    <section className="master-collection-profile">
      <div className="master-collection-profile-mark">{profile.mark}</div>
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
        <p className="master-collection-profile-note">以上為人物與工藝背景介紹；實際可售作品、規格、庫存與交期，以本頁商品和聯絡確認為準。</p>
        <Link className="text-link" to="/pages/master-custom">查看大師訂製流程 <span aria-hidden="true">↗</span></Link>
      </div>
    </section>
  );
}

const MASTER_COLLECTIONS = {
  'shen-xinpei-master-custom': {
    mark: '新培',
    generation: '第四代 · 沈新培',
    title: '沈新培大師作品與訂製方向',
    intro: '沈新培承接家族龍泉刀劍工藝，將傳統形制、實用尺度與當代製作延續到工作室。這個系列用來介紹其工藝脈絡與大師作品方向。',
    points: [
      ['傳統根基', '從龍泉刀劍的形制、材料與手工流程出發，重視作品的結構與使用邊界。'],
      ['作品方向', '可作為收藏、展示與禮贈方向的參考；具體作品是否可訂製，需要逐項確認。'],
      ['訂製方式', '如需討論尺寸、材料、裝具或刻飾，請先提供用途、目的地與預算範圍。'],
    ],
  },
  'shen-zhou-master-custom': {
    mark: '沈州',
    generation: '第五代 · 沈州',
    title: '沈州大師作品與訂製方向',
    intro: '沈州自年輕時跟隨家族學習龍泉劍鍛製技藝，承接第五代工作室的製作與傳承。這個系列聚焦當代實用與審美之間的平衡。',
    points: [
      ['實用與美觀', '作品方向重視實際使用、比例、平衡與外觀之間的關係，不以裝飾取代規格說明。'],
      ['工藝探索', '部分作品涉及材料、熱處理、表面與裝具的不同處理方式，實際可行性需逐項確認。'],
      ['訂製方式', '請先說明用途、尺寸、材料偏好、預算、完成時間與收貨地區，再進入報價討論。'],
    ],
  },
};

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

/** @typedef {import('./+types/collections.$handle').Route} Route */
/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
