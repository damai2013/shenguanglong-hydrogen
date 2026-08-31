import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue, useLocation} from 'react-router';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';

/**
 * @param {HeaderProps}
 */
export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
  localization,
}) {
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
      <HeaderCtas
        isLoggedIn={isLoggedIn}
        cart={cart}
        localization={localization}
      />
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
    <nav className={className} aria-label={viewport === 'mobile' ? '行動版主選單' : '主選單'} role="navigation">
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
        const isCraft = item.title.includes('工藝') || item.title.includes('傳承');
        const isMaster = item.title.includes('大師') || item.title.includes('大师');
        const baseChildren = isCatalog
          ? enrichCatalogChildren(item.items?.length ? item.items : CATALOG_SUBMENU)
          : item.items?.length
            ? item.items
            : [];
        const hasVerificationLink = baseChildren.some((child) => child.url?.includes('/official-verification'));
        const additionalChildren = isCraft && !hasVerificationLink
          ? [{id: 'official-verification', title: '官方核驗', url: '/pages/official-verification'}]
          : [];
        const children = [...baseChildren, ...additionalChildren].filter((child) => {
          if (!isMaster) return true;
          return !child.url?.includes('/pages/shen-xinpei') && !child.url?.includes('/pages/shen-zhou');
        });
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
            <HeaderSubmenu
              items={children}
              close={close}
              primaryDomainUrl={primaryDomainUrl}
              publicStoreDomain={publicStoreDomain}
            />
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

function HeaderSubmenu({items, close, primaryDomainUrl, publicStoreDomain, nested = false}) {
  return (
    <div className={`header-submenu${nested ? ' header-submenu-nested' : ''}`}>
      {items.map((child) => {
        if (!child.url) return null;
        const childUrl = normalizeMenuUrl(child.url, {
          primaryDomainUrl,
          publicStoreDomain,
        });
        const hasChildren = child.items?.length;
        return hasChildren ? (
          <div className="header-submenu-group" key={child.id}>
            <NavLink
              aria-haspopup="menu"
              className="header-submenu-link"
              onClick={close}
              prefetch="intent"
              to={childUrl}
            >
              <span>{child.title}</span>
              <span aria-hidden="true">›</span>
            </NavLink>
            <HeaderSubmenu
              close={close}
              items={child.items}
              nested
              primaryDomainUrl={primaryDomainUrl}
              publicStoreDomain={publicStoreDomain}
            />
          </div>
        ) : (
          <NavLink key={child.id} onClick={close} prefetch="intent" to={childUrl}>
            {child.title}
          </NavLink>
        );
      })}
    </div>
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
 * @param {Pick<HeaderProps, 'isLoggedIn' | 'cart'> & {localization: Localization}}
 */
function HeaderCtas({isLoggedIn, cart, localization}) {
  return (
    <nav className="header-ctas" role="navigation">
      <HeaderLocalization localization={localization} />
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

function HeaderLocalization({localization}) {
  const location = useLocation();
  const redirectTo = `${location.pathname}${location.search}${location.hash}`;
  const currentCountry = localization?.country || 'US';
  const currentLanguage = localization?.language || 'ZH_TW';
  const countryLabel = COUNTRY_OPTIONS.find((item) => item.code === currentCountry)?.short || currentCountry;
  const languageLabel = LANGUAGE_OPTIONS.find((item) => item.code === currentLanguage)?.short || currentLanguage;

  return (
    <div className="header-localization" aria-label="地區與語言">
      <details className="header-localization-menu">
        <summary aria-label={`選擇地區，目前為 ${countryLabel}`}>
          <span className="header-localization-icon" aria-hidden="true">◎</span>
          <span>{countryLabel}</span>
        </summary>
        <form method="post" action="/localization">
          <input type="hidden" name="language" value={currentLanguage} />
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <p className="header-localization-title">地區／貨幣</p>
          {COUNTRY_OPTIONS.map((item) => (
            <button
              className={item.code === currentCountry ? 'is-active' : ''}
              key={item.code}
              name="country"
              type="submit"
              value={item.code}
            >
              <span>{item.label}</span>
              <small>{item.currency}</small>
            </button>
          ))}
        </form>
      </details>
      <details className="header-localization-menu">
        <summary aria-label={`選擇語言，目前為 ${languageLabel}`}>
          <span className="header-localization-icon header-localization-icon-language" aria-hidden="true">文</span>
          <span>{languageLabel}</span>
        </summary>
        <form method="post" action="/localization">
          <input type="hidden" name="country" value={currentCountry} />
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <p className="header-localization-title">網站語言</p>
          {LANGUAGE_OPTIONS.map((item) => (
            <button
              className={item.code === currentLanguage ? 'is-active' : ''}
              key={item.code}
              name="language"
              type="submit"
              value={item.code}
            >
              {item.label}
            </button>
          ))}
        </form>
      </details>
    </div>
  );
}

const COUNTRY_OPTIONS = [
  {code: 'US', label: '美國', short: 'US', currency: 'USD'},
  {code: 'TW', label: '台灣', short: 'TW', currency: 'TWD'},
  {code: 'JP', label: '日本', short: 'JP', currency: 'JPY'},
  {code: 'CN', label: '中國大陸', short: 'CN', currency: 'CNY'},
];

const LANGUAGE_OPTIONS = [
  {code: 'ZH_TW', label: '繁體中文', short: '繁中'},
  {code: 'EN', label: 'English', short: 'EN'},
  {code: 'JA', label: '日本語', short: '日本語'},
];

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      aria-label="開啟選單"
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

const CHINESE_DAO_SUBMENU = [
  {id: 'catalog-tang-dao', title: '唐刀', url: '/collections/tang-dao'},
  {id: 'catalog-yanling-dao', title: '雁翎刀', url: '/collections/chinese-dao#dao-forms'},
  {id: 'catalog-miao-dao', title: '苗刀', url: '/collections/chinese-dao#dao-forms'},
  {id: 'catalog-xiuchun-dao', title: '繡春刀', url: '/collections/chinese-dao#dao-forms'},
  {id: 'catalog-ming-dao', title: '明刀', url: '/collections/chinese-dao#dao-forms'},
  {id: 'catalog-huanshou-dao', title: '環首刀', url: '/collections/chinese-dao#dao-forms'},
];

const CHINESE_JIAN_SUBMENU = [
  {id: 'catalog-han-jian', title: '漢劍', url: '/collections/chinese-jian#jian-forms'},
  {id: 'catalog-tang-jian', title: '唐劍', url: '/collections/chinese-jian#jian-forms'},
  {id: 'catalog-qing-jian', title: '清劍', url: '/collections/chinese-jian#jian-forms'},
  {id: 'catalog-huanshou-jian', title: '環首劍', url: '/collections/chinese-jian#jian-forms'},
];

const CATALOG_SUBMENU = [
  {id: 'catalog-practice', title: '太極與練習器械', url: '/collections/tai-chi-practice'},
  {id: 'catalog-chinese-sword', title: '中國劍', url: '/collections/chinese-jian', items: CHINESE_JIAN_SUBMENU},
  {id: 'catalog-chinese-saber', title: '中國刀', url: '/collections/chinese-dao', items: CHINESE_DAO_SUBMENU},
  {id: 'catalog-new', title: '新品', url: '/collections/new-2025'},
  {id: 'catalog-accessories', title: '文化商品與配件', url: '/collections/cultural-goods-accessories'},
];

function enrichCatalogChildren(items) {
  return items.map((child) => {
    const fallback = CATALOG_SUBMENU.find((item) =>
      item.title === child.title ||
      (item.title === '中國劍' && child.title === '中国剑') ||
      (item.title === '中國刀' && child.title === '中国刀'),
    );
    return fallback && !child.items?.length
      ? {...child, items: fallback.items}
      : child;
  });
}

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
 * @property {Localization} localization
 */

/** @typedef {{country: string, language: string}} Localization */

/** @typedef {import('@shopify/hydrogen').CartViewPayload} CartViewPayload */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
