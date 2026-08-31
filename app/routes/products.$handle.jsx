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
    {title: `Hydrogen | ${data?.product.title ?? ''}`},
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
function loadDeferredData({context, params}) {
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

  return (
    <div className="product product-detail-page">
      <div className="product-buy-grid">
        <ProductGallery product={product} selectedVariant={selectedVariant} />
        <div className="product-main">
        <p className="eyebrow">TRADITIONAL BLADE</p>
        <h1>{title}</h1>
        <ProductPrice
          price={selectedVariant?.price}
          compareAtPrice={selectedVariant?.compareAtPrice}
        />
        <br />
        <ProductForm
          productOptions={productOptions}
          selectedVariant={selectedVariant}
        />
        <br />
        <br />
        <div className="product-description"><p className="description-label">THE PIECE</p><div dangerouslySetInnerHTML={{__html: descriptionHtml}} /></div>
        <div className="product-notes"><div><span>Origin</span><strong>Longquan, China</strong></div><div><span>Finishing</span><strong>Hand finished</strong></div><div><span>Dispatch</span><strong>See buying guide</strong></div></div>
        <ProductDetailSections />
        <br />
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

function ProductRecommendations({products}) {
  if (!products?.length) {
    return (
      <section className="product-recommendations product-recommendations-empty">
        <div><p className="section-label">CONTINUE EXPLORING</p><h2>从商品目录继续寻找适合你的作品。</h2></div>
        <Link className="text-link" to="/collections">浏览全部商品 <span aria-hidden="true">↗</span></Link>
      </section>
    );
  }

  return (
    <section className="product-recommendations">
      <div className="product-recommendations-heading"><p className="section-label">CONTINUE EXPLORING</p><h2>你可能也会喜欢。</h2></div>
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
        <summary>规格与购买说明 <span aria-hidden="true">＋</span></summary>
        <div className="product-detail-copy">
          <p>请以当前商品页显示的尺寸、重量、材料、配件、库存和状态为准。不同商品的用途与手感不同，图片不能代替规格信息。</p>
          <p>现货、补货和订制作品的交期可能不同；如需确认目的地、适用状态或交付时间，请在结账前联系我们。</p>
        </div>
      </details>
      <details>
        <summary>保养与保存 <span aria-hidden="true">＋</span></summary>
        <div className="product-detail-copy">
          <p>请保持干燥，避免碰撞、潮湿和长时间接触腐蚀性物质。天然材料与手工表面需要按照具体商品的说明进行保存。</p>
          <p>如果你不确定某种护理方式是否适合这件作品，请先提供订单信息和商品照片，再向我们咨询。</p>
        </div>
      </details>
      <details>
        <summary>评论与使用反馈 <span aria-hidden="true">＋</span></summary>
        <div className="product-review-empty">
          <span className="review-mark">00</span>
          <div><strong>暂无已发布评论</strong><p>真实评论功能接入后，会在这里显示经过店铺确认的购买反馈。</p></div>
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
      <p className="eyebrow">SHEN GUANG LONG · LONGQUAN</p>
      <div className="gallery-main">
        <ProductImage image={activeImage} />
        {images.length > 1 ? (
          <div className="gallery-controls">
            <button type="button" onClick={() => setActiveIndex((activeIndex - 1 + images.length) % images.length)} aria-label="Previous product image">←</button>
            <span>{String(activeIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span>
            <button type="button" onClick={() => setActiveIndex((activeIndex + 1) % images.length)} aria-label="Next product image">→</button>
          </div>
        ) : null}
      </div>
      {images.length > 1 ? (
        <div className="gallery-thumbnails" aria-label="Product images">
          {images.map((image, index) => (
            <button className={index === activeIndex ? 'is-active' : ''} key={image.id} type="button" onClick={() => setActiveIndex(index)} aria-label={`View product image ${index + 1}`} aria-pressed={index === activeIndex}>
              <img src={image.url} alt={image.altText || ''} loading="lazy" />
            </button>
          ))}
        </div>
      ) : null}
      <p className="gallery-caption">Each piece is finished by hand. Variations in grain, patina, and balance are part of its character.</p>
    </div>
  );
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
