import {Await, useLoaderData, Link} from 'react-router';
import {Suspense} from 'react';
import {Image} from '@shopify/hydrogen';
import {ProductItem} from '~/components/ProductItem';
import {MockShopNotice} from '~/components/MockShopNotice';
import {WorkshopMedia, WorkshopVideo} from '~/components/WorkshopMedia';
import {PageBannerMedia} from '~/components/PageBannerMedia';

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
      <HomeCategoryPaths />
      <RecommendedProducts products={data.recommendedProducts} />
      <HomeGuides />
      <CommissionPaths />
      <WorkshopVideo
        label="MOVING IMAGE · WORKSHOP"
        title="看見一件作品，如何回到手上。"
        intro="工作室影像記錄火、手與材料在工作台上的節奏。"
        poster="/assets/reference/workshop-03.jpg"
      />
      <WorkshopMedia
        kind="home"
        label="FROM LONGQUAN"
        title="從工作台、火花與人物，看見作品的來處。"
        intro="三組不同角度的影像，分別呈現製作現場、鍛打工序與當代傳承人物。"
      />
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
        <h1><span className="hero-heading-line">五代製劍傳承，</span><br /><em><span className="hero-heading-line">為今天而作。</span></em></h1>
        <p className="hero-intro">
          始於 1885 年的龍泉沈廣隆，提供傳統刀劍、練習器械與私人訂製作品。
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
          <PageBannerMedia variant="home" />
        )}
        <div className="hero-stamp">沈<br />廣<br />隆</div>
        <p className="hero-caption">五代製劍傳承<br />為今天而作</p>
      </div>
    </section>
  );
}

function CraftPillars() {
  return (
    <section className="craft-pillars" aria-label="品牌傳承要點">
      <div><span>01</span><strong>百年傳承</strong><small>始於 1885 年，五代延續龍泉製劍家學。</small></div>
      <div><span>02</span><strong>五代經營</strong><small>從家族製劍到今日工坊，工藝與劍鋪經營持續至今。</small></div>
      <div><span>03</span><strong>中華老字號</strong><small>2010 年獲認定，品牌歷史與傳承節點有公開資料可核對。</small></div>
    </section>
  );
}

function HomeCategoryPaths() {
  const categories = [
    ['01', '中國刀', '唐刀、雁翎刀、苗刀等傳統刀制作品。', '/collections/chinese-dao'],
    ['02', '中國劍', '漢劍、唐劍、清劍與環首劍等形制作品。', '/collections/chinese-jian'],
    ['03', '練習器械', '面向日常練習、教學、展示與武術使用。', '/collections/tai-chi-practice'],
    ['04', '訂製作品', '按用途、尺寸、材料、裝具與目的地單獨確認。', '/pages/master-custom'],
  ];

  return (
    <section className="home-category-paths" aria-labelledby="home-category-title">
      <div className="home-category-heading">
        <p className="eyebrow">FIND YOUR DIRECTION · 作品分類</p>
        <h2 id="home-category-title">先說明用途，<em>再選擇作品。</em></h2>
        <p>不同形制與配置，對應不同的收藏、展示、練習與訂製需求。</p>
      </div>
      <div className="home-category-grid">
        {categories.map(([number, title, text, url]) => (
          <Link className="home-category-card" key={number} to={url}>
            <span>{number}</span>
            <h3>{title}</h3>
            <p>{text}</p>
            <b aria-hidden="true">↗</b>
          </Link>
        ))}
      </div>
    </section>
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
        <div><p className="eyebrow">SELECTED WORKS · 精選作品</p><h2 id="recommended-products">從幾件作品開始了解。</h2></div>
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
      <div className="story-mark">先<br />看<br />清<br />楚</div>
      <div>
        <p className="eyebrow">購買前須知</p>
        <h2>先確認用途與條件，<br /><em>再選適合的作品。</em></h2>
        <p>不同作品的形制、尺寸、材料、開刃狀態、庫存與配送要求各不相同。購買前請先查看商品頁與購買指南；若仍不確定，請把商品連結和收貨地區發給我們。</p>
        <div className="hero-actions"><Link className="button button-gold" to="/pages/before-you-order">查看購買指南 <span>↗</span></Link><Link className="text-link" to="/pages/contact">提交商品諮詢</Link></div>
      </div>
    </section>
  );
}

function HomeGuides() {
  const guides = [
    ['01', '看懂工藝', '從材料、形制到檢查，了解一件作品如何完成。', '/pages/craftsmanship'],
    ['02', '認識品牌', '從 1885 年起點到五代傳承，查看公開品牌資料。', '/pages/about-shen-guang-long'],
    ['03', '購買指南', '確認用途、規格、配送、付款與保存方式。', '/pages/before-you-order'],
    ['04', '博客文章', '閱讀作品選擇、工藝與保存相關的工作室文章。', '/blogs'],
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

function CommissionPaths() {
  const paths = [
    {
      number: '01',
      eyebrow: 'TEAM COMMISSIONS · 團隊訂製',
      title: '團隊訂製',
      text: '為武術館、學校、社團與活動整理數量、規格、預算、交期與配送條件。',
      image: '/assets/reference/workshop-02.jpg',
      bullets: ['統一用途與規格', '按數量整理報價', '確認交期與目的地'],
      cta: '團隊訂製諮詢',
      href: '/pages/group-orders',
    },
    {
      number: '02',
      eyebrow: 'PRIVATE MASTER COMMISSION · 私人大師訂製',
      title: '私人大師訂製',
      text: '由沈新培與沈洲的人物與作品方向進入討論，再確認尺寸、材料、裝具、刻飾與預算。',
      image: '/assets/reference/master-shen-xinpei.jpg',
      bullets: ['指定大師方向', '討論尺寸與材料', '先確認可行性與交期'],
      cta: '私人大師訂製',
      href: '/pages/master-custom',
    },
  ];

  return (
    <section className="commission-paths" aria-labelledby="commission-paths-title">
      <div className="commission-paths-heading">
        <div>
          <p className="eyebrow">MADE TO ORDER · 訂製入口</p>
          <h2 id="commission-paths-title">需要訂製，<em>先把需求說清楚。</em></h2>
        </div>
        <p>團隊採購和私人訂製的確認方式不同；我們會先了解用途、規格、目的地與時間，再進入報價與製作。</p>
      </div>
      <div className="commission-path-grid">
        {paths.map((path) => (
          <article className="commission-path-card" key={path.number}>
            <div className="commission-path-image">
              <img src={path.image} alt="" loading="lazy" />
            </div>
            <div className="commission-path-body">
              <span className="commission-path-number">{path.number}</span>
              <p className="section-label">{path.eyebrow}</p>
              <h3>{path.title}</h3>
              <p>{path.text}</p>
              <ul>
                {path.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
              </ul>
              <Link className="text-link" to={path.href}>{path.cta} <span aria-hidden="true">↗</span></Link>
            </div>
          </article>
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
