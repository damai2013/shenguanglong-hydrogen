import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';

/**
 * @param {HeaderProps}
 */
export function Header({header, isLoggedIn, cart, publicStoreDomain}) {
  const {menu} = header;
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
          首頁
        </NavLink>
      )}
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        // if the url is internal, we strip the domain
        const url = normalizeMenuUrl(item.url, {
          primaryDomainUrl,
          publicStoreDomain,
        });
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
                const childUrl = normalizeMenuUrl(child.url, {
                  primaryDomainUrl,
                  publicStoreDomain,
                });
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

function normalizeMenuUrl(rawUrl, {primaryDomainUrl, publicStoreDomain}) {
  const isInternalUrl =
    rawUrl.includes('myshopify.com') ||
    rawUrl.includes(publicStoreDomain) ||
    rawUrl.includes(primaryDomainUrl);
  const path = isInternalUrl ? new URL(rawUrl).pathname : rawUrl;

  // Shopify menus can return localized paths such as /en/pages/contact.
  // Hydrogen's route files are rooted at /pages, /collections, etc.
  return path.replace(/^\/[a-z]{2}(?:-[a-z]{2})?(?=\/|$)/i, '') || '/';
}

/**
 * @param {Pick<HeaderProps, 'isLoggedIn' | 'cart'>}
 */
function HeaderCtas({isLoggedIn, cart}) {
  return (
    <nav className="header-ctas" role="navigation">
      <HeaderMenuMobileToggle />
      <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
        <Suspense fallback="登入">
          <Await resolve={isLoggedIn} errorElement="登入">
            {(isLoggedIn) => (isLoggedIn ? '帳戶' : '登入')}
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
      搜尋
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
      購物車 <span aria-label={`（商品數量：${count}）`}>{count}</span>
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
  {id: 'catalog-practice', title: '太極與練習器械', url: '/collections/tai-chi-practice'},
  {id: 'catalog-tai-chi-sword', title: '太極劍', url: '/collections/tai-chi-swords'},
  {id: 'catalog-tai-chi-saber', title: '太極刀', url: '/collections/tai-chi-sabers'},
  {id: 'catalog-tang-sword', title: '唐劍', url: '/collections/tang-jian'},
  {id: 'catalog-han-sword', title: '漢劍', url: '/collections/han-jian'},
  {id: 'catalog-chinese-sword', title: '中國劍', url: '/collections/chinese-jian'},
  {id: 'catalog-chinese-saber', title: '中國刀', url: '/collections/chinese-dao'},
  {id: 'catalog-tang-dao', title: '唐刀', url: '/collections/tang-dao'},
  {id: 'catalog-yanling-dao', title: '雁翎刀', url: '/collections/yanling-dao'},
  {id: 'catalog-xiuchun-dao', title: '繡春刀', url: '/collections/xiuchun-dao'},
  {id: 'catalog-new', title: '新品', url: '/collections/new-2025'},
];

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: '商品目錄',
      type: 'HTTP',
      url: '/collections/all',
      items: [
        ...CATALOG_SUBMENU,
        {id: 'fallback-all', title: '全部作品', url: '/collections/all'},
      ],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: '大師訂製',
      type: 'HTTP',
      url: '/pages/master-custom',
      items: [],
    },
    {
      id: 'fallback-craft',
      resourceId: null,
      tags: [],
      title: '工藝與傳承',
      type: 'HTTP',
      url: '/pages/about-shen-guang-long',
      items: [
        {id: 'fallback-story', title: '品牌故事', url: '/pages/about-shen-guang-long'},
        {id: 'fallback-craftsmanship', title: '工藝介紹', url: '/pages/craftsmanship'},
        {id: 'fallback-credentials', title: '資料與媒體', url: '/pages/media-and-credentials'},
      ],
    },
    {
      id: 'fallback-guide',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: '購買指南',
      type: 'PAGE',
      url: '/pages/before-you-order',
      items: [
        {id: 'fallback-before-order', title: '購買前須知', url: '/pages/before-you-order'},
        {id: 'fallback-faq', title: '常見問題', url: '/pages/faq'},
        {id: 'fallback-care', title: '保養與保存', url: '/pages/care-and-storage'},
      ],
    },
    {
      id: 'fallback-journal',
      resourceId: null,
      tags: [],
      title: '文章與指南',
      type: 'HTTP',
      url: '/blogs',
      items: [],
    },
    {
      id: 'fallback-contact',
      resourceId: null,
      tags: [],
      title: '聯絡諮詢',
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
    color: isPending ? 'var(--color-gold)' : undefined,
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
