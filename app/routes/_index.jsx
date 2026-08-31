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
    {title: 'Shen Guang Long | Traditional Blades & Craft'},
    {
      name: 'description',
      content:
        'Traditional blades, ceremonial pieces, and enduring craft from Shen Guang Long.',
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
      <CraftStory />
    </div>
  );
}

function Hero({collection}) {
  const image = collection?.image;

  return (
    <section className="home-hero">
      <div className="hero-copy">
        <p className="eyebrow">EST. 2013 · SHEN GUANG LONG</p>
        <h1>Blades with<br /><em>a living soul.</em></h1>
        <p className="hero-intro">
          Traditional Chinese blades and objects of quiet strength, shaped by
          hand and made to be kept.
        </p>
        <div className="hero-actions">
          <Link className="button button-gold" to={collection ? `/collections/${collection.handle}` : '/collections'}>
            Explore the collection <span>↗</span>
          </Link>
          <Link className="text-link" to="/collections/all">View all pieces</Link>
        </div>
      </div>
      <div className="hero-art" aria-label={image?.altText || 'Traditional blade craftsmanship'}>
        {image ? (
          <Image data={image} sizes="(min-width: 60em) 55vw, 100vw" alt={image.altText || 'Shen Guang Long collection'} />
        ) : (
          <div className="hero-art-placeholder"><span>光</span></div>
        )}
        <div className="hero-stamp">沈<br />广<br />隆</div>
        <p className="hero-caption">A study in steel<br />and stillness</p>
      </div>
    </section>
  );
}

function CraftPillars() {
  return (
    <section className="craft-pillars" aria-label="Our craft principles">
      <div><span>01</span><strong>Hand finished</strong><small>Each piece carries the maker's touch.</small></div>
      <div><span>02</span><strong>Built to endure</strong><small>Materials chosen for a lifetime of use.</small></div>
      <div><span>03</span><strong>Rooted in tradition</strong><small>Old forms, considered for today.</small></div>
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
        <div><p className="eyebrow">THE COLLECTION</p><h2 id="recommended-products">Selected pieces</h2></div>
        <Link className="text-link" to="/collections/all">Browse all <span>↗</span></Link>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
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
        <p className="eyebrow">THE SHEN GUANG LONG WAY</p>
        <h2>Not made for a moment.<br /><em>Made for a lifetime.</em></h2>
        <p>We believe an object becomes meaningful through time: the weight in the hand, the marks of use, the stories it gathers. Our work begins with respect for the old ways and ends with something unmistakably yours.</p>
        <Link className="text-link" to="/pages/about">Discover our story <span>↗</span></Link>
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
