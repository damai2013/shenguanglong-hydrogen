import {useState} from 'react';
import {Link, useLoaderData} from 'react-router';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {ProductItem} from '~/components/ProductItem';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [
    {title: `沈廣隆｜${data?.product.title ?? '商品詳情'}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
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
async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {handle, selectedOptions: getSelectedProductOptions(request)},
  });

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  const {productRecommendations} = await storefront.query(RECOMMENDATIONS_QUERY, {
    variables: {productId: product.id},
  });

  return {
    product,
    recommendations: productRecommendations || [],
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData() {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

export default function Product() {
  /** @type {LoaderReturnData} */
  const {product, recommendations} = useLoaderData();

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;
  const customerDescriptionHtml = removeInternalDescriptionNote(descriptionHtml);

  return (
    <div className="product product-detail-page">
      <div className="product-buy-grid">
        <ProductGallery product={product} selectedVariant={selectedVariant} />
        <div className="product-main">
        <p className="eyebrow">傳統刀劍</p>
        <h1>{title}</h1>
        <ProductPrice
          price={selectedVariant?.price}
          compareAtPrice={selectedVariant?.compareAtPrice}
        />
        <ProductForm
          productOptions={productOptions}
          selectedVariant={selectedVariant}
        />
        <div className="product-description"><p className="description-label">作品介紹</p><div dangerouslySetInnerHTML={{__html: customerDescriptionHtml}} /></div>
        <div className="product-notes"><div><span>產地</span><strong>中國龍泉</strong></div><div><span>工藝</span><strong>手工完成</strong></div><div><span>交付</span><strong>請參閱購買指南</strong></div></div>
        <ProductDetailSections />
        </div>
      </div>
      <ProductRecommendations products={recommendations} />
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

function removeInternalDescriptionNote(descriptionHtml = '') {
  return descriptionHtml.replace(
    /<p>\s*This draft item is prepared for catalog review before publication\.\s*<\/p>/gi,
    '',
  );
}

function ProductRecommendations({products}) {
  if (!products?.length) {
    return (
      <section className="product-recommendations product-recommendations-empty">
        <div><p className="section-label">繼續探索</p><h2>從商品目錄繼續尋找適合你的作品。</h2></div>
        <Link className="text-link" to="/collections">瀏覽全部商品 <span aria-hidden="true">↗</span></Link>
      </section>
    );
  }

  return (
    <section className="product-recommendations">
      <div className="product-recommendations-heading"><p className="section-label">繼續探索</p><h2>你可能也會喜歡。</h2></div>
      <div className="product-recommendations-grid">
        {products.slice(0, 4).map((recommendedProduct) => <ProductItem key={recommendedProduct.id} product={recommendedProduct} loading="lazy" />)}
      </div>
    </section>
  );
}

function ProductDetailSections() {
  return (
    <div className="product-detail-sections">
      <details open>
        <summary>規格與購買說明 <span aria-hidden="true">＋</span></summary>
        <div className="product-detail-copy">
          <p>請以當前商品頁顯示的尺寸、重量、材料、配件、庫存和狀態為準。不同商品的用途與手感不同，圖片不能代替規格資訊。</p>
          <p>如果當前頁面沒有列出你需要的規格，請在結帳前聯絡我們確認，不要僅憑圖片判斷是否適合。</p>
          <Link className="text-link product-detail-cta" to="/pages/contact">諮詢商品規格 <span aria-hidden="true">↗</span></Link>
        </div>
      </details>
      <details>
        <summary>配送、目的地與合規 <span aria-hidden="true">＋</span></summary>
        <div className="product-detail-copy">
          <p>現貨、補貨和訂製作品的交期可能不同。刀劍類商品的運輸、進口和持有要求會因目的地而不同。</p>
          <p>請在付款前確認目的地規則、運輸方式和交付條件；需要確認時，請提供國家／地區和商品連結。</p>
          <Link className="text-link product-detail-cta" to="/pages/before-you-order">查看購買前須知 <span aria-hidden="true">↗</span></Link>
        </div>
      </details>
      <details>
        <summary>保養與保存 <span aria-hidden="true">＋</span></summary>
        <div className="product-detail-copy">
          <p>請保持乾燥，避免碰撞、潮濕和長時間接觸腐蝕性物質。天然材料與手工表面需要按照具體商品的說明進行保存。</p>
          <p>如果你不確定某種護理方式是否適合這件作品，請先提供訂單資訊和商品照片，再向我們諮詢。</p>
        </div>
      </details>
      <details>
        <summary>評論與使用回饋 <span aria-hidden="true">＋</span></summary>
        <div className="product-review-empty">
          <span className="review-mark">↗</span>
          <div><strong>評論已展示於商品圖片下方</strong><p>有已發布的 Judge.me 評論時，這裡會優先顯示；尚未取得評論時，先以清楚標示的測試內容展示版面。</p></div>
        </div>
      </details>
    </div>
  );
}

function ProductGallery({product, selectedVariant}) {
  const images = [selectedVariant?.image, ...(product.images?.nodes || [])].filter(Boolean).filter((image, index, allImages) => allImages.findIndex((item) => item.id === image.id) === index);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] || selectedVariant?.image;

  return (
    <div className="product-gallery">
      <p className="eyebrow">沈廣隆 · 龍泉</p>
      <div className="gallery-main">
        <ProductImage image={activeImage} />
        {images.length > 1 ? (
          <div className="gallery-controls">
            <button type="button" onClick={() => setActiveIndex((activeIndex - 1 + images.length) % images.length)} aria-label="上一張商品圖片">←</button>
            <span>{String(activeIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span>
            <button type="button" onClick={() => setActiveIndex((activeIndex + 1) % images.length)} aria-label="下一張商品圖片">→</button>
          </div>
        ) : null}
      </div>
      {images.length > 1 ? (
        <div className="gallery-thumbnails" aria-label="商品圖片">
          {images.map((image, index) => (
            <button className={index === activeIndex ? 'is-active' : ''} key={image.id} type="button" onClick={() => setActiveIndex(index)} aria-label={`查看商品圖片 ${index + 1}`} aria-pressed={index === activeIndex}>
              <img src={image.url} alt={image.altText || ''} loading="lazy" />
            </button>
          ))}
        </div>
      ) : null}
      <p className="gallery-caption">每件作品均以手工完成。紋理、包漿與平衡感的差異，正是作品獨有的性格。</p>
      <ProductReviews product={product} />
    </div>
  );
}

function ProductReviews({product}) {
  const judgeMeWidget = product?.metafields?.find(
    (metafield) => metafield?.namespace === 'judgeme' && metafield?.key === 'widget',
  )?.value;

  if (judgeMeWidget?.trim()) {
    return (
      <section className="product-reviews product-reviews-judgeme" aria-labelledby="product-reviews-heading">
        <div className="product-reviews-heading">
          <div>
            <p className="section-label">JUDGE.ME REVIEWS</p>
            <h2 id="product-reviews-heading">作品評論。</h2>
          </div>
        </div>
        <div className="judgeme-widget-shell" dangerouslySetInnerHTML={{__html: judgeMeWidget}} />
      </section>
    );
  }

  const reviews = getDemoReviews(product);

  return (
    <section className="product-reviews" aria-labelledby="product-reviews-heading">
      <div className="product-reviews-heading">
        <div>
          <p className="section-label">CUSTOMER VOICES · 測試資料</p>
          <h2 id="product-reviews-heading">作品評論。</h2>
        </div>
        <div className="product-review-summary">
          <strong>5.0</strong>
          <span className="product-review-stars" aria-label="測試評分 5 分">★★★★★</span>
          <small>{reviews.length} 則測試評論</small>
        </div>
      </div>
      <p className="product-reviews-notice">
        目前尚未接入已發布的 Judge.me 評論，以下測試內容用於展示評論版面。完成評論來源連接後，這裡會優先顯示實際評論。
      </p>
      <div className="product-reviews-list">
        {reviews.map((review) => (
          <article className="product-review-card" key={`${review.author}-${review.date}`}>
            <div className="product-review-card-top">
              <h3>{review.title}</h3>
              <span className="product-review-card-meta">{review.author} · {review.date}</span>
            </div>
            <span className="product-review-stars" aria-label={`測試評分 ${review.rating} 分`}>{'★'.repeat(review.rating)}</span>
            <p>{review.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function getDemoReviews(product) {
  // The current Storefront API context has no Judge.me review adapter, so demo data
  // remains visibly labeled until a server-side reviews source is connected.
  const isSword = /刀|劍|劍鞘|唐/.test(product?.title || '');

  return isSword
    ? [
        {rating: 5, title: '細節與平衡感很出色', text: '測試評論：這段文字用來展示商品評論的評分、摘要與閱讀節奏。', author: '測試顧客 A', date: '2026.08'},
        {rating: 5, title: '收到後先仔細確認規格', text: '測試評論：接入 Judge.me 後，這裡會替換為已發布的實際購買回饋。', author: '測試顧客 B', date: '2026.07'},
      ]
    : [
        {rating: 5, title: '材質與手感令人印象深刻', text: '測試評論：用來展示不同商品都能保持一致的評論版式。', author: '測試顧客 A', date: '2026.08'},
        {rating: 5, title: '包裝與作品說明清楚', text: '測試評論：接入 Judge.me 後，這裡會替換為已發布的實際購買回饋。', author: '測試顧客 B', date: '2026.07'},
      ];
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    images(first: 12) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
    metafields(identifiers: [{namespace: "judgeme", key: "widget"}]) {
      namespace
      key
      value
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;

const RECOMMENDATIONS_QUERY = `#graphql
  query ProductRecommendations($productId: ID!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    productRecommendations(productId: $productId) {
      id
      title
      handle
      featuredImage {
        id
        url
        altText
        width
        height
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
    }
  }
`;

/** @typedef {import('./+types/products.$handle').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
