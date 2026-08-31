import {Suspense} from 'react';
import {Await, NavLink} from 'react-router';

/**
 * @param {FooterProps}
 */
export function Footer({footer: footerPromise, header, publicStoreDomain}) {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img className="footer-logo" src="/assets/shenguanglong-logo.png" alt="沈廣隆 SHENGUANGLONG" width="180" height="36" />
          <p>以耐心打造傳統刀劍。<br />始於 1885 · 中國龍泉</p>
        </div>
        <FooterColumn title="商品目錄" links={[
          ['全部作品', '/collections/all'],
          ['中國刀', '/collections/chinese-dao'],
          ['中國劍', '/collections/chinese-jian'],
          ['太極與練習器械', '/collections/tai-chi-practice'],
        ]} />
        <FooterColumn title="關於沈廣隆" links={[
          ['品牌故事', '/pages/about-shen-guang-long'],
          ['工藝與傳承', '/pages/craftsmanship'],
          ['資質與媒體報導', '/pages/credentials-media'],
          ['官方核驗', '/pages/official-verification'],
          ['文章與指南', '/blogs'],
        ]} />
        <FooterColumn title="客戶服務" links={[
          ['聯絡諮詢', '/pages/contact'],
          ['購買前須知', '/pages/before-you-order'],
          ['常見問題', '/pages/faq'],
          ['保養與保存', '/pages/care-and-storage'],
        ]} />
      </div>
      <p className="footer-note">© {new Date().getFullYear()} Shen Guang Long. All rights reserved.</p>
      <Suspense fallback={null}>
        <Await resolve={footerPromise}>
          {(footer) => footer?.menu && header.shop.primaryDomain?.url ? (
            <FooterMenu
              menu={footer.menu}
              primaryDomainUrl={header.shop.primaryDomain.url}
              publicStoreDomain={publicStoreDomain}
            />
          ) : null}
        </Await>
      </Suspense>
    </footer>
  );
}

function FooterColumn({title, links}) {
  return (
    <div className="footer-column">
      <h3>{title}</h3>
      {links.map(([label, url]) => <NavLink key={url} to={url} prefetch="intent">{label}</NavLink>)}
    </div>
  );
}

/**
 * @param {{
 *   menu: FooterQuery['menu'];
 *   primaryDomainUrl: FooterProps['header']['shop']['primaryDomain']['url'];
 *   publicStoreDomain: string;
 * }}
 */
function FooterMenu({menu, primaryDomainUrl, publicStoreDomain}) {
  return (
    <nav aria-label="頁腳輔助連結" className="footer-menu" role="navigation">
      {(menu || FALLBACK_FOOTER_MENU).items.map((item) => {
        if (!item.url) return null;
        // if the url is internal, we strip the domain
        const url = normalizeFooterUrl(item.url, {
          primaryDomainUrl,
          publicStoreDomain,
        });
        const isExternal = !url.startsWith('/');
        const label = translateFooterTitle(item.title);
        return isExternal ? (
          <a href={url} key={item.id} rel="noopener noreferrer" target="_blank">
            {label}
          </a>
        ) : (
          <NavLink
            end
            key={item.id}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {label}
          </NavLink>
        );
      })}
    </nav>
  );
}

function translateFooterTitle(title) {
  const labels = {
    Search: '搜尋',
    'Your Privacy Choices': '隱私選項',
    'Privacy Policy': '隱私政策',
    'Refund Policy': '退款政策',
    'Shipping Policy': '配送政策',
    'Terms of Service': '服務條款',
  };
  return labels[title] || title;
}

function normalizeFooterUrl(rawUrl, {primaryDomainUrl, publicStoreDomain}) {
  const isInternalUrl =
    rawUrl.includes('myshopify.com') ||
    rawUrl.includes(publicStoreDomain) ||
    rawUrl.includes(primaryDomainUrl);
  const path = isInternalUrl ? new URL(rawUrl).pathname : rawUrl;

  return path.replace(/^\/[a-z]{2}(?:-[a-z]{2})?(?=\/|$)/i, '') || '/';
}

const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Privacy Policy',
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: 'gid://shopify/ShopPolicy/23358013496',
      tags: [],
      title: 'Refund Policy',
      type: 'SHOP_POLICY',
      url: '/policies/refund-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: 'gid://shopify/ShopPolicy/23358111800',
      tags: [],
      title: 'Shipping Policy',
      type: 'SHOP_POLICY',
      url: '/policies/shipping-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: 'Terms of Service',
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
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
    color: isPending ? 'grey' : 'white',
  };
}

/**
 * @typedef {Object} FooterProps
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {string} publicStoreDomain
 */

/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
