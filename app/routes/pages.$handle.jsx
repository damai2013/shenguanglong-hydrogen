import {Link, useLoaderData} from 'react-router';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [{title: `Hydrogen | ${data?.page.title ?? ''}`}];
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
async function loadCriticalData({context, request, params}) {
  if (!params.handle) {
    throw new Error('Missing page handle');
  }

  const [{page}] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {
      variables: {
        handle: params.handle,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle: params.handle, data: page});

  return {
    page,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function Page() {
  /** @type {LoaderReturnData} */
  const {page} = useLoaderData();
  const intro = PAGE_INTROS[page.handle] || PAGE_INTROS.default;

  return (
    <div className={`page editorial-page editorial-page-${page.handle}`}>
      <header className="editorial-page-hero">
        <p className="eyebrow">{intro.kicker}</p>
        <h1>{intro.title || page.title}<em>.</em></h1>
        <p className="editorial-page-lede">{intro.lede}</p>
      </header>
      <div className="editorial-page-layout">
        <main className="editorial-page-content">
          {page.handle === 'about-shen-guang-long' ? (
            <BrandStoryContent />
          ) : (
            <div className="shopify-page-body" dangerouslySetInnerHTML={{__html: page.body}} />
          )}
        </main>
        <aside className="editorial-page-aside">
          <span className="aside-index">SHEN GUANG LONG</span>
          <p>{intro.aside}</p>
          <Link className="text-link" to={intro.ctaUrl}>{intro.ctaLabel} <span aria-hidden="true">↗</span></Link>
        </aside>
      </div>
    </div>
  );
}

function BrandStoryContent() {
  const generations = [
    {number: '01', title: '沈朝庆', text: '家族制剑传承的起点。' },
    {number: '02', title: '沈庭璋', text: '沈广隆剑铺早期历史中的重要传承人。' },
    {number: '03', title: '沈焕周 · 沈焕文 · 沈焕武', text: '第三代多位传承人共同延续家族技艺。' },
    {number: '04', title: '沈新培', text: '将传统工艺继续带入当代工作室。' },
    {number: '05', title: '沈州', text: '现阶段公开介绍的传承人，负责今天的制作与传承。' },
  ];

  return (
    <div className="brand-story-content">
      <section className="brand-story-opening">
        <div className="brand-story-number">1885</div>
        <div>
          <p className="section-label">A FAMILY LINEAGE IN STEEL</p>
          <h2>一件作品，<em>先要经得起时间。</em></h2>
          <p>
            沈广隆的故事，从龙泉的炉火与一代代制剑人的手上开始。我们尊重传统，也让每一件当代作品回到清楚的用途、真实的材料和经得起使用的尺度。
          </p>
          <p>
            “六代传承”是品牌对这条家族脉络的整体概括。当前公开人物介绍以已经参与传承与当代经营的几代人为主，下一代仍在成长。
          </p>
        </div>
      </section>

      <section className="brand-story-timeline">
        <div className="brand-story-section-heading">
          <p className="section-label">A SHORT TIMELINE</p>
          <h2>从家族技艺，到今天的工作台。</h2>
        </div>
        <div className="timeline-list">
          <div className="timeline-item">
            <span>1885</span>
            <div><h3>家族制剑传承起点</h3><p>以龙泉为背景，家族制剑技艺开始延续。</p></div>
          </div>
          <div className="timeline-item">
            <span>1894</span>
            <div><h3>沈广隆剑铺形成</h3><p>品牌历史进入“沈广隆剑铺”这一明确称谓。</p></div>
          </div>
          <div className="timeline-item">
            <span>至今</span>
            <div><h3>六代传承，仍在继续</h3><p>公开介绍聚焦已经参与传承的几代人，以及今天仍在发生的制作、定制与咨询。</p></div>
          </div>
        </div>
      </section>

      <section className="brand-story-lineage">
        <div className="brand-story-section-heading">
          <p className="section-label">THE LINEAGE</p>
          <h2>公开人物，先从已经留下作品与职责的人写起。</h2>
        </div>
        <div className="generation-grid">
          {generations.map((generation) => (
            <article className="generation-card" key={generation.number}>
              <span>{generation.number}</span>
              <h3>{generation.title}</h3>
              <p>{generation.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="brand-story-principles">
        <div>
          <p className="section-label">OUR PRINCIPLES</p>
          <h2>传承不是口号，<em>是每天重复做好。</em></h2>
        </div>
        <div className="principle-list">
          <div><span>01</span><h3>对材料诚实</h3><p>清楚说明材质、规格、状态与手工差异。</p></div>
          <div><span>02</span><h3>对工艺耐心</h3><p>让选材、整形、热处理、打磨和装配各自发挥作用。</p></div>
          <div><span>03</span><h3>对每件作品负责</h3><p>从购买前咨询到交付后的保养，都给出实际而具体的说明。</p></div>
        </div>
      </section>

      <section className="brand-story-today">
        <p className="section-label">SHEN GUANG LONG TODAY</p>
        <h2>今天，我们把传统带到清楚的使用场景里。</h2>
        <p>目录商品、练习与使用场景、收藏与展示作品，以及大师订制，拥有不同的边界与说明。请以商品页的实际规格和咨询确认结果为准。</p>
        <div className="brand-story-actions">
          <Link className="button button-gold" to="/collections">查看作品 <span aria-hidden="true">↗</span></Link>
          <Link className="text-link" to="/pages/craftsmanship">了解工艺 <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </div>
  );
}

const PAGE_INTROS = {
  'about-shen-guang-long': {
    kicker: 'A LINEAGE IN STEEL',
    title: 'The story behind the blade',
    lede: 'A Longquan workshop, a family tradition, and a quiet belief that the object should carry the discipline of the hand that made it.',
    aside: 'From collection guidance to the workbench, every detail begins with respect for the tradition.',
    ctaLabel: 'Explore the collection',
    ctaUrl: '/collections',
  },
  'craftsmanship': {
    kicker: 'THE HAND & THE BLADE',
    title: 'Made with patience',
    lede: 'Balance, proportion, and finish are not decoration. They are the language through which a traditional blade becomes useful, present, and lasting.',
    aside: 'See how the workshop’s principles shape the objects in the catalog.',
    ctaLabel: 'View all pieces',
    ctaUrl: '/collections/all',
  },
  'master-custom': {
    kicker: 'BY COMMISSION · MASTER WORKS',
    title: 'A blade with your name on it',
    lede: 'Commission a considered piece from the沈廣隆 lineage. Begin with the master series, then let the workshop guide the details.',
    aside: 'Custom work requires a conversation about purpose, materials, dimensions, schedule, and destination.',
    ctaLabel: 'Start a consultation',
    ctaUrl: '/pages/contact',
  },
  'before-you-order': {
    kicker: 'BEFORE YOU ORDER',
    title: 'Choose with clarity',
    lede: 'A traditional blade is a considered purchase. Start with the information that matters: purpose, proportion, finish, delivery, and care.',
    aside: 'If you are unsure which piece is right for your practice, contact the workshop before ordering.',
    ctaLabel: 'Ask a question',
    ctaUrl: '/pages/contact',
  },
  faq: {
    kicker: 'QUESTIONS, ANSWERED',
    title: 'A clear path to the right piece',
    lede: 'Find practical answers about products, availability, delivery, and the buying process.',
    aside: 'For questions specific to your destination or intended use, we recommend a direct consultation.',
    ctaLabel: 'Contact us',
    ctaUrl: '/pages/contact',
  },
  'care-and-storage': {
    kicker: 'CARE & STORAGE',
    title: 'Keep the piece in its element',
    lede: 'Good care protects the finish, the structure, and the relationship between a blade and the hand that uses it.',
    aside: 'Care guidance depends on the material and finish of each piece. Keep your product details available when asking for help.',
    ctaLabel: 'View all pieces',
    ctaUrl: '/collections/all',
  },
  contact: {
    kicker: 'CONTACT · SHEN GUANG LONG',
    title: 'Begin with a conversation',
    lede: 'Tell us what you are looking for, where it is going, and how you intend to use it. We will help you find the next step.',
    aside: 'For custom work, include your preferred style, dimensions, materials, timing, and destination.',
    ctaLabel: 'Browse the collection',
    ctaUrl: '/collections',
  },
  default: {
    kicker: 'SHEN GUANG LONG · LONGQUAN',
    title: null,
    lede: 'Traditional blades, practice objects, and workshop stories from Longquan, China.',
    aside: 'Questions about a piece, its use, or its journey to you? We are here to help.',
    ctaLabel: 'Contact us',
    ctaUrl: '/pages/contact',
  },
};

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      handle
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
`;

/** @typedef {import('./+types/pages.$handle').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
