import {Await, useLoaderData, Link} from 'react-router';
import {Suspense} from 'react';
import {Image} from '@shopify/hydrogen';
import {ProductItem} from '~/components/ProductItem';
import {MockShopNotice} from '~/components/MockShopNotice';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [
    {title: '沈廣隆｜傳統刀劍與工藝'},
    {
      name: 'description',
      content:
        '沈廣隆傳統刀劍與工藝作品，承襲龍泉文脈，為收藏、鑑賞與使用而作。',
    },
  ];
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
async function loadCriticalData({context}) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
    featuredCollection: collections.nodes[0],
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  return (
    <div className="home-page">
      {data.isShopLinked ? null : <MockShopNotice />}
      <Hero collection={data.featuredCollection} />
      <CraftPillars />
      <RecommendedProducts products={data.recommendedProducts} />
      <HomeGuides />
      <CraftStory />
    </div>
  );
}

function Hero({collection}) {
  const image = collection?.image;

  return (
    <section className="home-hero">
      <div className="hero-copy">
        <p className="eyebrow">SINCE 1885 · SHEN GUANG LONG</p>
        <h1>刀劍有魂，<br /><em>歲月有痕。</em></h1>
        <p className="hero-intro">
          來自龍泉的傳統刀劍與器物，以手工完成，為長久保存與使用而作。
        </p>
        <div className="hero-actions">
          <Link className="button button-gold" to={collection ? `/collections/${collection.handle}` : '/collections'}>
            探索作品 <span>↗</span>
          </Link>
          <Link className="text-link" to="/collections/all">查看全部作品</Link>
        </div>
      </div>
      <div className="hero-art" aria-label={image?.altText || '傳統刀劍工藝'}>
        {image ? (
          <Image data={image} sizes="(min-width: 60em) 55vw, 100vw" alt={image.altText || 'Shen Guang Long collection'} />
        ) : (
          <div className="hero-art-placeholder"><span>光</span></div>
        )}
        <div className="hero-stamp">沈<br />广<br />隆</div>
        <p className="hero-caption">鋼鐵與靜謐<br />的注解</p>
      </div>
    </section>
  );
}

function CraftPillars() {
  return (
    <section className="craft-pillars" aria-label="工藝原則">
      <div><span>01</span><strong>手工完成</strong><small>每一件作品都留下匠人的手感。</small></div>
      <div><span>02</span><strong>經久耐用</strong><small>為長久使用選擇合適的材料。</small></div>
      <div><span>03</span><strong>承襲傳統</strong><small>從古老形制出發，回應今日需要。</small></div>
    </section>
  );
}

/**
 * @param {{
 *   collection: FeaturedCollectionFragment;
 * }}
 */
function FeaturedCollection({collection}) {
  if (!collection) return null;
  const image = collection?.image;
  return (
    <Link
      className="featured-collection"
      to={`/collections/${collection.handle}`}
    >
      {image && (
        <div className="featured-collection-image">
          <Image
            data={image}
            sizes="100vw"
            alt={image.altText || collection.title}
          />
        </div>
      )}
      <h1>{collection.title}</h1>
    </Link>
  );
}

/**
 * @param {{
 *   products: Promise<RecommendedProductsQuery | null>;
 * }}
 */
function RecommendedProducts({products}) {
  return (
    <section
      className="recommended-products"
      aria-labelledby="recommended-products"
    >
      <div className="section-heading">
        <div><p className="eyebrow">作品選集</p><h2 id="recommended-products">精選作品</h2></div>
        <Link className="text-link" to="/collections/all">查看全部 <span>↗</span></Link>
      </div>
      <Suspense fallback={<div>載入中⋯</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response
                ? response.products.nodes.map((product) => (
                    <ProductItem key={product.id} product={product} />
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
    </section>
  );
}

function CraftStory() {
  return (
    <section className="craft-story">
      <div className="story-mark">形<br />神<br />兼<br />备</div>
      <div>
        <p className="eyebrow">沈廣隆之道</p>
        <h2>不為一時而作。<br /><em>為歲月而作。</em></h2>
        <p>一件器物的意義，來自時間留下的重量、使用痕跡與故事。我們尊重古法，也讓每件當代作品回到清楚的用途與真實的材料。</p>
        <Link className="text-link" to="/pages/about-shen-guang-long">了解品牌故事 <span>↗</span></Link>
      </div>
    </section>
  );
}

function HomeGuides() {
  const guides = [
    ['01', '品牌故事', '了解家族制剑传承与今天的工作台。', '/pages/about-shen-guang-long'],
    ['02', '工藝與傳承', '從選材到檢查，看懂一件作品如何完成。', '/pages/craftsmanship'],
    ['03', '大師訂製', '從用途、規格和目的地開始一次清楚的溝通。', '/pages/master-custom'],
    ['04', '購買前須知', '先確認用途、規格、配送與目的地要求。', '/pages/before-you-order'],
  ];

  return (
    <section className="home-guides" aria-labelledby="home-guides-title">
      <div className="home-guides-heading">
        <p className="eyebrow">A CLEAR PATH</p>
        <h2 id="home-guides-title">從了解開始，<em>再做選擇。</em></h2>
      </div>
      <div className="home-guides-grid">
        {guides.map(([number, title, text, url]) => (
          <Link className="home-guide-card" key={number} to={url}>
            <span>{number}</span>
            <div><h3>{title}</h3><p>{text}</p></div>
            <b aria-hidden="true">↗</b>
          </Link>
        ))}
      </div>
    </section>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
`;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
`;

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {import('storefrontapi.generated').FeaturedCollectionFragment} FeaturedCollectionFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductsQuery} RecommendedProductsQuery */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
