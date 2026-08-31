import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';

/**
 * @param {HeaderProps}
 */
export function Header({header, isLoggedIn, cart, publicStoreDomain}) {
  const {shop, menu} = header;
  return (
    <header className="header">
      <NavLink prefetch="intent" to="/" style={activeLinkStyle} end>
        <img className="brand-logo" src="/assets/shenguanglong-logo.png" alt="沈廣隆 SHENGUANGLONG" width="180" height="36" />
      </NavLink>
      <HeaderMenu
        menu={menu}
        viewport="desktop"
        primaryDomainUrl={header.shop.primaryDomain.url}
        publicStoreDomain={publicStoreDomain}
      />
      <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
    </header>
  );
}

/**
 * @param {{
 *   menu: HeaderProps['header']['menu'];
 *   primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
 *   viewport: Viewport;
 *   publicStoreDomain: HeaderProps['publicStoreDomain'];
 * }}
 */
export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}) {
  const className = `header-menu-${viewport}`;
  const {close} = useAside();

  return (
    <nav className={className} role="navigation">
      {viewport === 'mobile' && (
        <NavLink
          end
          onClick={close}
          prefetch="intent"
          style={activeLinkStyle}
          to="/"
        >
          Home
        </NavLink>
      )}
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        const isCatalog =
          item.title.toLowerCase().includes('catalog') ||
          item.title.includes('商品目录') ||
          url.endsWith('/collections/all');
        const children = item.items?.length ? item.items : isCatalog ? CATALOG_SUBMENU : [];
        return children.length ? (
          <div className="header-menu-group" key={item.id}>
            <NavLink
              className="header-menu-item"
              end
              onClick={close}
              prefetch="intent"
              style={activeLinkStyle}
              to={url}
            >
              {item.title} <span aria-hidden="true">⌄</span>
            </NavLink>
            <div className="header-submenu">
              {children.map((child) => {
                if (!child.url) return null;
                const childUrl =
                  child.url.includes('myshopify.com') ||
                  child.url.includes(publicStoreDomain) ||
                  child.url.includes(primaryDomainUrl)
                    ? new URL(child.url).pathname
                    : child.url;
                return (
                  <NavLink key={child.id} onClick={close} prefetch="intent" to={childUrl}>
                    {child.title}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ) : (
          <NavLink
            className="header-menu-item"
            end
            key={item.id}
            onClick={close}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

/**
 * @param {Pick<HeaderProps, 'isLoggedIn' | 'cart'>}
 */
function HeaderCtas({isLoggedIn, cart}) {
  return (
    <nav className="header-ctas" role="navigation">
      <HeaderMenuMobileToggle />
      <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
        <Suspense fallback="Sign in">
          <Await resolve={isLoggedIn} errorElement="Sign in">
            {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
          </Await>
        </Suspense>
      </NavLink>
      <SearchToggle />
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="header-menu-mobile-toggle reset"
      onClick={() => open('mobile')}
    >
      <h3>☰</h3>
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button className="reset" onClick={() => open('search')}>
      Search
    </button>
  );
}

/**
 * @param {{count: number}}
 */
function CartBadge({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        });
      }}
    >
      Cart <span aria-label={`(items: ${count})`}>{count}</span>
    </a>
  );
}

/**
 * @param {Pick<HeaderProps, 'cart'>}
 */
function CartToggle({cart}) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

const CATALOG_SUBMENU = [
  {id: 'catalog-practice', title: 'Tai Chi & Wushu Practice', url: '/collections/tai-chi-practice'},
  {id: 'catalog-tai-chi-sword', title: 'Tai Chi Swords', url: '/collections/tai-chi-swords'},
  {id: 'catalog-tai-chi-saber', title: 'Tai Chi Sabers', url: '/collections/tai-chi-sabers'},
  {id: 'catalog-tang-sword', title: 'Tang Swords', url: '/collections/tang-jian'},
  {id: 'catalog-han-sword', title: 'Han Swords', url: '/collections/han-jian'},
  {id: 'catalog-chinese-sword', title: 'Chinese Swords', url: '/collections/chinese-jian'},
  {id: 'catalog-chinese-saber', title: 'Chinese Sabers', url: '/collections/chinese-dao'},
  {id: 'catalog-tang-dao', title: 'Tang Dao', url: '/collections/tang-dao'},
  {id: 'catalog-yanling-dao', title: 'Yanling Dao', url: '/collections/yanling-dao'},
  {id: 'catalog-xiuchun-dao', title: 'Xiuchun Dao', url: '/collections/xiuchun-dao'},
  {id: 'catalog-han-jian', title: 'Han Swords', url: '/collections/han-jian'},
  {id: 'catalog-tang-jian', title: 'Tang Swords', url: '/collections/tang-jian'},
  {id: 'catalog-new', title: 'New Arrivals', url: '/collections/new-2025'},
];

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Product Catalog',
      type: 'HTTP',
      url: '/collections/all',
      items: [
        ...CATALOG_SUBMENU,
        {id: 'fallback-all', title: 'View All Pieces', url: '/collections/all'},
      ],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Master Custom',
      type: 'HTTP',
      url: '/pages/master-custom',
      items: [],
    },
    {
      id: 'fallback-craft',
      resourceId: null,
      tags: [],
      title: 'Craft & Heritage',
      type: 'HTTP',
      url: '/pages/about-shen-guang-long',
      items: [
        {id: 'fallback-story', title: 'Our Story', url: '/pages/about-shen-guang-long'},
        {id: 'fallback-craftsmanship', title: 'Craftsmanship', url: '/pages/craftsmanship'},
        {id: 'fallback-credentials', title: 'Credentials & Media', url: '/pages/media-and-credentials'},
      ],
      items: [],
    },
    {
      id: 'fallback-guide',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'Buying Guide',
      type: 'PAGE',
      url: '/pages/before-you-order',
      items: [
        {id: 'fallback-before-order', title: 'Before You Order', url: '/pages/before-you-order'},
        {id: 'fallback-faq', title: 'Frequently Asked Questions', url: '/pages/faq'},
        {id: 'fallback-care', title: 'Care & Storage', url: '/pages/care-and-storage'},
      ],
    },
    {
      id: 'fallback-journal',
      resourceId: null,
      tags: [],
      title: 'Journal / Guide',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'fallback-contact',
      resourceId: null,
      tags: [],
      title: 'Contact',
      type: 'HTTP',
      url: '/pages/contact',
      items: [],
    },
  ],
};

/**
 * @param {{
 *   isActive: boolean;
 *   isPending: boolean;
 * }}
 */
function activeLinkStyle({isActive, isPending}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}

/** @typedef {'desktop' | 'mobile'} Viewport */
/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 */

/** @typedef {import('@shopify/hydrogen').CartViewPayload} CartViewPayload */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
