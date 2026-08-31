import {Link, useLoaderData} from 'react-router';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {WorkshopMedia, WorkshopVideo} from '~/components/WorkshopMedia';
import {PageBannerMedia} from '~/components/PageBannerMedia';
import {ProductItem} from '~/components/ProductItem';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [{title: `沈廣隆｜${data?.page.title ?? '品牌與工藝'}`}];
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

  // Editorial pages are owned by the Hydrogen storefront. They should still
  // render when the matching Shopify Page is only a placeholder or is absent.
  const builtInTitle = BUILT_IN_PAGE_TITLES[params.handle];
  if (builtInTitle) {
    const page = {
      handle: params.handle,
      id: `built-in:${params.handle}`,
      title: builtInTitle,
      body: '',
      seo: null,
    };
    redirectIfHandleIsLocalized(request, {handle: params.handle, data: page});
    const isMasterPage = ['master-custom', 'shen-xinpei', 'shen-zhou'].includes(params.handle);
    const masterCollections = isMasterPage
      ? await context.storefront.query(MASTER_CUSTOM_COLLECTIONS_QUERY, {
          variables: {
            first: 8,
            productsFirst: 250,
            xinpeiHandle: 'shen-xinpei-master-custom',
            zhouHandle: 'shen-zhou-master-custom',
          },
        })
      : null;
    return {
      page,
      masterCollections,
      masterProducts: masterCollections?.products?.nodes ?? [],
    };
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
function loadDeferredData() {
  return {};
}

export default function Page() {
  /** @type {LoaderReturnData} */
  const {page, masterCollections, masterProducts = []} = useLoaderData();
  const intro = PAGE_INTROS[page.handle] || PAGE_INTROS.default;

  return (
    <div className={`page editorial-page editorial-page-${page.handle}`}>
      <header className="editorial-page-hero">
        <PageBannerMedia variant={PAGE_BANNER_VARIANTS[page.handle] || 'workshop'} />
        <p className="eyebrow">{intro.kicker}</p>
        <h1>{intro.title || page.title}<em>.</em></h1>
        <p className="editorial-page-lede">{intro.lede}</p>
      </header>
      <div className="editorial-page-layout">
        <main className="editorial-page-content">
          {page.handle === 'about-shen-guang-long' ? (
            <BrandStoryContent />
          ) : page.handle === 'craftsmanship' ? (
            <CraftsmanshipContent />
          ) : page.handle === 'master-custom' ? (
            <MasterCustomContent collections={masterCollections} products={masterProducts} />
          ) : page.handle === 'shen-xinpei' || page.handle === 'shen-zhou' ? (
            <MasterPersonContent handle={page.handle} collections={masterCollections} products={masterProducts} />
          ) : page.handle === 'before-you-order' ? (
            <BeforeYouOrderContent />
          ) : page.handle === 'faq' ? (
            <FaqContent />
          ) : page.handle === 'longquan-swordmaking' ? (
            <LongquanSwordmakingContent />
          ) : page.handle === 'craftsmanship-materials' ? (
            <CraftsmanshipMaterialsContent />
          ) : page.handle === 'credentials-media' ? (
            <CredentialsMediaContent />
          ) : page.handle === 'official-verification' ? (
            <OfficialVerificationContent />
          ) : page.handle === 'care-storage' ? (
            <CareStorageContent />
          ) : page.handle === 'shipping-legal-notice' ? (
            <ShippingLegalContent />
          ) : page.handle === 'group-orders' ? (
            <GroupOrdersContent />
          ) : (
            <div className="shopify-page-body" dangerouslySetInnerHTML={{__html: page.body}} />
          )}
        </main>
      </div>
    </div>
  );
}

function LongquanSwordmakingContent() {
  const steps = [
    ['01', '從材料開始', '先按照用途、尺寸與結構選擇合適材料，讓作品的方向在製作前就清楚。'],
    ['02', '鍛打與成形', '透過反覆鍛打、整形與校正，使刀劍逐步形成穩定的比例與線條。'],
    ['03', '熱處理與研磨', '熱處理影響作品的狀態，研磨則整理表面、刃線與細節；兩者都需要逐步檢查。'],
    ['04', '裝配與交付', '劍身、刀身、裝具與鞘具完成配合後，再核對外觀、規格與隨件說明。'],
  ];

  return (
    <div className="craftsmanship-content">
      <section className="craftsmanship-intro">
        <p className="section-label">LONGQUAN · THE WORKSHOP</p>
        <h2>龍泉刀劍，<em>從火與手開始。</em></h2>
        <p>龍泉刀劍工藝不只是一道工序，而是一套從材料判斷、形制安排到成品檢查的工作方法。沈廣隆的作品以傳統刀劍形制為基礎，回到清楚的用途、比例與使用感。</p>
        <p>本頁介紹工藝脈絡與閱讀商品頁的方法；每件現售作品的尺寸、重量、材料與狀態，仍以對應商品頁為準。</p>
      </section>
      <section className="craftsmanship-flow">
        <div className="craftsmanship-section-heading">
          <p className="section-label">FROM FIRE TO FORM</p>
          <h2>一件作品如何逐步完成。</h2>
        </div>
        <div className="craft-step-grid">
          {steps.map(([number, title, text]) => (
            <article className="craft-step" key={number}>
              <span>{number}</span><h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <WorkshopMedia
        label="THE WORKSHOP IN VIEW"
        title="先看見環境，再理解工藝。"
        intro="以下影像作為品牌與工藝的視覺索引；具體商品仍以商品頁實際資料為準。"
      />
      <section className="craftsmanship-inspection">
        <div className="inspection-mark">龍<br />泉</div>
        <div>
          <p className="section-label">HOW TO READ A PIECE</p>
          <h2>工藝最後要回到作品本身。</h2>
          <div className="inspection-points">
            <p><strong>形制</strong><br />先理解它是為練習、收藏、展示還是禮贈而作。</p>
            <p><strong>材料</strong><br />天然材料與手工表面可能有紋理、色澤和細部差異。</p>
            <p><strong>規格</strong><br />尺寸、重量、配件與交期請以商品頁和最終確認為準。</p>
          </div>
        </div>
      </section>
      <section className="craftsmanship-next">
        <p className="section-label">CONTINUE EXPLORING</p>
        <h2>從工藝理解作品，再進入購買與諮詢。</h2>
        <div className="brand-story-actions">
          <Link className="button button-gold" to="/collections">瀏覽作品 <span aria-hidden="true">↗</span></Link>
          <Link className="text-link" to="/pages/before-you-order">查看購買前須知 <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </div>
  );
}

function CraftsmanshipMaterialsContent() {
  return (
    <div className="craftsmanship-content">
      <section className="craftsmanship-intro">
        <p className="section-label">MATERIALS · PROPORTION · USE</p>
        <h2>材質不是裝飾，<em>而是作品的性格。</em></h2>
        <p>刀劍的手感、光澤、重量與保存方式，都與材料和表面處理有關。選擇時應先從用途出發，再看商品頁提供的實際規格。</p>
      </section>
      <section className="craftsmanship-flow">
        <div className="craftsmanship-section-heading"><p className="section-label">MATERIAL LANGUAGE</p><h2>從四個方向理解材質。</h2></div>
        <div className="craft-step-grid">
          <article className="craft-step"><span>01</span><h3>刀劍本體</h3><p>不同鋼材與處理方式會影響重量、彈性、表面狀態與使用邊界，不能只看外觀判斷。</p></article>
          <article className="craft-step"><span>02</span><h3>木作與鞘具</h3><p>木材、包覆與鞘具需要配合刀劍本體，也需要避免潮濕、碰撞和長時間日曬。</p></article>
          <article className="craft-step"><span>03</span><h3>裝具與握持</h3><p>護手、柄、鐔與其他裝具會影響比例和握持感，具體配置以商品頁或訂製確認單為準。</p></article>
          <article className="craft-step"><span>04</span><h3>手工差異</h3><p>天然材料與手工表面不會完全相同；差異應被如實理解，而不是被當成瑕疵或承諾。</p></article>
        </div>
      </section>
      <WorkshopMedia
        kind="workshop"
        label="MATERIAL & SURFACE"
        title="材料的差異，會留在手上。"
        intro="光澤、紋理、重量與保存方式，都需要結合實際材料和用途判斷。"
      />
      <section className="craftsmanship-boundary">
        <div className="craftsmanship-section-heading"><p className="section-label">PRODUCT PAGE FIRST</p><h2>每件作品，都有自己的材料說明。</h2></div>
        <div className="boundary-copy">
          <p>網站上的工藝介紹用來建立理解框架，不代替某一件商品的規格。購買前請核對尺寸、重量、材料、配件、庫存、交期與保存方式。</p>
          <p>如果你需要特定材料、尺寸或裝具，請在付款前聯絡我們確認，不要只根據圖片推測。</p>
          <Link className="text-link" to="/pages/contact">諮詢作品規格 <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </div>
  );
}

function CredentialsMediaContent() {
  const records = [
    ['01', '1885 · 傳承起點', '沈廣隆鑄劍傳承始於 1885 年，家族工藝與劍鋪經營延續至今。'],
    ['02', '2010 · 中華老字號', '沈廣隆劍鋪於 2010 年獲認定為中華老字號。'],
    ['03', '2010 · 非遺保護基地', '沈廣隆劍鋪於 2010 年成為龍泉寶劍鍛製技藝省級非物質文化遺產生產性保護基地。'],
    ['04', '兩代傳承人', '第四代沈新培為中國工藝美術大師、國家級非物質文化遺產代表性傳承人；第五代沈州為浙江省工藝美術大師、浙江省非物質文化遺產代表性傳承人。'],
  ];
  const media = [
    ['《我有傳家寶》', 'CCTV-1'],
    ['《手藝人》', 'CCTV-7'],
    ['《傳承》', 'CCTV-9'],
    ['龍泉鑄劍文化專題', '鳳凰衛視'],
    ['《中國面孔》', '山東衛視'],
    ['《百家姓》', '安徽衛視'],
  ];

  return (
    <div className="brand-story-content">
      <section className="brand-story-opening">
        <div className="brand-story-number">1885</div>
        <div><p className="section-label">PUBLIC RECORDS</p><h2>資質與報導，<em>看見品牌留下的足跡。</em></h2><p>從 1885 年的家族製劍起點，到中華老字號、非物質文化遺產保護基地、兩代傳承人與電視節目記錄，這些資料共同呈現沈廣隆的品牌根基與工藝脈絡。</p></div>
      </section>
      <section className="brand-story-lineage"><div className="brand-story-section-heading"><p className="section-label">CREDENTIALS</p><h2>品牌資料索引。</h2></div><div className="generation-grid">{records.map(([number,title,text]) => <article className="generation-card" key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
      <WorkshopMedia
        kind="credentials"
        label="DOCUMENTS · STATUS"
        title="認定與傳承，回到公開資料。"
        intro="影像展示品牌資質與傳承線索；商品頁仍以具體規格與當前狀態為準。"
      />
      <section className="brand-story-principles"><div><p className="section-label">MEDIA RECORDS</p><h2>曾公開記錄的節目與專題。</h2></div><div className="principle-list">{media.map(([title, channel], index) => <div key={title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{channel} · 從人物、技藝與文化背景記錄沈廣隆及龍泉刀劍工藝。</p></div>)}</div></section>
      <WorkshopMedia
        kind="media"
        label="PUBLIC PROGRAMMES"
        title="從節目畫面，回到工藝本身。"
        intro="節目與專題提供品牌文化的公開背景；商品規格、證書與當前可售狀態，請回到對應商品頁查看。"
      />
      <section className="brand-story-today"><p className="section-label">SOURCES</p><h2>從品牌故事，繼續了解作品。</h2><p>想了解品牌資質、人物履歷與傳承細節，可以繼續閱讀下方公開資料；現售作品則請回到商品頁查看圖片、規格、庫存與交付資訊。</p><div className="brand-story-actions"><a className="button button-gold" href="https://shen1885.com/pages/media-and-credentials" target="_blank" rel="noreferrer">品牌資質與媒體報導 ↗</a><a className="text-link" href="https://shen1885.com/blogs/news-and-guides/shenguanglong-six-generation-history" target="_blank" rel="noreferrer">傳承文章 ↗</a></div></section>
    </div>
  );
}

function OfficialVerificationContent() {
  const summary = [
    ['01', '品牌名稱', '沈廣隆劍鋪'],
    ['02', '所在地', '中國浙江省龍泉市'],
    ['03', '傳承起點', '1885 年，沈朝慶開始專業鑄劍'],
    ['04', '核驗聯絡', 'service@shenguanglong1885.com'],
  ];
  const socialAccounts = [
    ['TikTok', 'ShenGuangLong1885'],
    ['Instagram', 'shenguanglong1885'],
    ['YouTube', 'ShenGuangLong'],
    ['Facebook', 'Guang Long Shen'],
  ];
  const media = [
    ['《我有傳家寶》', 'CCTV-1', '從傳統鑄劍技藝與家族傳承角度，記錄沈廣隆的工藝背景。'],
    ['《手藝人》', 'CCTV-7', '以手藝與工坊工作為主題，呈現龍泉寶劍的製作脈絡。'],
    ['《傳承》', 'CCTV-9', '從傳統技藝、人物與時代變化，記錄工藝如何延續。'],
    ['龍泉鑄劍文化專題', '鳳凰衛視', '從地域文化與製劍技藝角度，介紹龍泉刀劍的傳統。'],
    ['《中國面孔》', '山東衛視', '以工藝人物為線索，呈現匠人與作品之間的關係。'],
    ['《百家姓》', '安徽衛視', '從家族脈絡與手藝傳承角度，記錄沈氏鑄劍歷程。'],
  ];

  return (
    <div className="verification-content">
      <section className="verification-summary editorial-section">
        <div className="verification-section-heading">
          <p className="section-label">VERIFICATION SUMMARY</p>
          <div>
            <h2>資料先列清楚，<em>再談品牌傳承。</em></h2>
            <p>這一頁集中整理品牌名稱、所在地、傳承節點、公開資質與媒體記錄，讓客戶在查看商品前，先知道資料從哪裡來、哪些內容仍應回到原始來源確認。</p>
          </div>
        </div>
        <div className="verification-summary-grid">
          {summary.map(([number, label, value]) => (
            <article key={label}>
              <span>{number}</span>
              <p className="section-label">{label}</p>
              <strong>{value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="verification-identity editorial-section">
        <div>
          <p className="section-label">OFFICIAL BRAND IDENTITY</p>
          <h2>先確認品牌身份，<em>再看作品規格。</em></h2>
        </div>
        <div className="verification-fact-list">
          <div><span>品牌中文名</span><strong>沈廣隆劍鋪</strong><p>中文資料中也會使用「沈廣隆」或簡體字「沈广隆」作為品牌簡稱。</p></div>
          <div><span>英文名稱</span><strong>Shen Guanglong</strong><p>英文名稱依品牌對外使用的拼寫呈現；不同平台可能採用不同格式。</p></div>
          <div><span>品牌網站</span><a href="https://shen1885.com/" target="_blank" rel="noreferrer">shen1885.com ↗</a><p>品牌網站用於發布品牌、人物與作品資料；商品頁另列每件作品的規格、庫存與交付資訊。</p></div>
          <div><span>核驗聯絡</span><a href="mailto:service@shenguanglong1885.com">service@shenguanglong1885.com</a><p>如需核對名稱、年份、作品或合作資料，請附上具體頁面與問題。</p></div>
        </div>
      </section>

      <section className="verification-trademarks editorial-section">
        <div className="verification-section-heading">
          <p className="section-label">TRADEMARK RECORDS</p>
          <div>
            <h2>商標資料，<em>只列可核對的部分。</em></h2>
            <p>本頁不展示完整註冊號，也不把品牌名稱直接等同於商標權利。需要確認申請人、類別或當前狀態時，請以對應地區的官方商標資料庫為準。</p>
          </div>
        </div>
        <div className="verification-trademark-grid">
          <article><span>01</span><p className="section-label">CHINA</p><h3>中國地區</h3><p>如需確認「沈廣隆」相關商標的申請人、類別與狀態，請在國家知識產權局商標查詢系統中以完整名稱核對。</p><strong>本站不展示完整註冊號</strong></article>
          <article><span>02</span><p className="section-label">UNITED STATES</p><h3>美國地區</h3><p>如需確認美國商標的權利人、類別與狀態，請以美國官方商標資料庫的檢索結果為準。</p><strong>本站不替代官方查詢</strong></article>
        </div>
      </section>

      <section className="verification-social editorial-section">
        <div className="verification-section-heading">
          <p className="section-label">OFFICIAL SOCIAL ACCOUNTS</p>
          <div><h2>社群帳號，<em>以平台頁面為準。</em></h2><p>以下名稱用於協助辨認品牌公開社群入口；帳號是否完成平台認證、目前是否更新，以及實際歸屬，請以平台頁面本身為準。</p></div>
        </div>
        <div className="verification-social-grid">
          {socialAccounts.map(([platform, handle], index) => (
            <article key={platform}><span>{String(index + 1).padStart(2, '0')}</span><p className="section-label">{platform}</p><strong>{handle}</strong></article>
          ))}
        </div>
      </section>

      <section className="verification-background editorial-section">
        <div>
          <p className="section-label">LINEAGE & CRAFT BACKGROUND</p>
          <h2>傳承沿革，<em>用時間與人物說明。</em></h2>
        </div>
        <div className="verification-background-copy">
          <p>公開沿革將沈廣隆的傳承起點追溯至 1885 年：第一代沈朝慶開始專業鑄劍，第二代沈庭璋於 1894 年創立沈廣隆劍鋪，之後由第三代沈煥周等人延續家族工藝。</p>
          <p>第四代沈新培承接父輩的鍛製、研磨與裝配工作；第五代沈州於 1993 年開始跟隨父親學藝，並於 1999 年承接劍鋪工作。人物履歷與作品資訊，請分別回到對應頁面核對。</p>
          <div className="brand-story-actions"><Link className="button button-gold" to="/pages/about-shen-guang-long">查看品牌故事 <span aria-hidden="true">↗</span></Link><Link className="text-link" to="/pages/credentials-media">查看資質與報導 <span aria-hidden="true">↗</span></Link></div>
        </div>
      </section>

      <section className="verification-sources editorial-section">
        <div className="verification-section-heading">
          <p className="section-label">PUBLIC REFERENCE SOURCES</p>
          <div><h2>資料入口，<em>按主題分開查看。</em></h2><p>以下入口分別對應品牌故事、資質報導、核驗說明與聯絡方式；不同頁面的內容用途不同，不以其中一頁取代全部證明。</p></div>
        </div>
        <div className="verification-source-grid">
          <Link to="/pages/official-verification"><span>01</span><strong>本頁核驗索引</strong><small>品牌名稱、所在地與查核說明 ↗</small></Link>
          <Link to="/pages/about-shen-guang-long"><span>02</span><strong>品牌故事</strong><small>1885 起點、家族脈絡與當代工坊 ↗</small></Link>
          <Link to="/pages/credentials-media"><span>03</span><strong>資質與媒體報導</strong><small>公開資質、傳承人物與節目記錄 ↗</small></Link>
          <Link to="/pages/contact"><span>04</span><strong>聯絡與資料補充</strong><small>提交需要核對的名稱、年份或作品 ↗</small></Link>
        </div>
      </section>

      <section className="verification-media editorial-section">
        <div className="verification-section-heading">
          <p className="section-label">MEDIA RECORDS</p>
            <div><h2>媒體記錄，<em>先看節目與來源。</em></h2><p>以下只作為曾公開記錄的節目與專題索引，不等同於商品品質、收藏事實或任何單件作品的證明。</p></div>
        </div>
        <div className="faq-list verification-media-list">
          {media.map(([title, channel, description]) => (
            <details key={title}><summary>{title}<span aria-hidden="true">＋</span></summary><p><strong>{channel}</strong> · {description}</p></details>
          ))}
        </div>
      </section>

      <section className="verification-declaration">
        <p className="section-label">OFFICIAL VERIFICATION STATEMENT</p>
        <h2>發現資料需要更新？<em>請把具體問題寄來。</em></h2>
        <p>如需核對品牌身份、年份、人物履歷、作品資料或合作內容，請附上頁面連結、商品名稱與具體問題；我們會按可查資料逐項回覆，無法確認的部分會明確說明。</p>
        <div className="brand-story-actions"><Link className="button button-gold" to="/pages/contact">聯絡核驗 <span aria-hidden="true">↗</span></Link><Link className="text-link" to="/pages/contact">查看聯絡方式 <span aria-hidden="true">↗</span></Link></div>
      </section>
    </div>
  );
}

function MasterPersonContent({handle, collections, products = []}) {
  const profile = MASTER_PERSON_PROFILES[handle];
  const collectionProducts = collections?.[profile.collectionKey]?.products?.nodes ?? [];
  const titleMatchedProducts = products.filter((product) => product.title.includes(profile.name));
  const displayedProducts = [
    ...titleMatchedProducts,
    ...collectionProducts.filter(
      (product) => !titleMatchedProducts.some((matched) => matched.id === product.id),
    ),
  ];

  return (
    <div className="master-person-content">
      <section className="master-person-hero">
        <div className="master-person-portrait">
          <img src={profile.image} alt={profile.imageAlt} loading="eager" />
          <span>{profile.mark}</span>
        </div>
        <div>
          <p className="section-label">{profile.generation} · MASTER PROFILE</p>
          <h2>{profile.title}</h2>
          <p>{profile.intro}</p>
          <div className="brand-story-actions"><Link className="button button-gold" to={`/collections/${profile.collectionHandle}`}>查看作品 <span aria-hidden="true">↗</span></Link><Link className="text-link" to="/pages/master-custom">討論訂製方向 <span aria-hidden="true">↗</span></Link></div>
        </div>
      </section>

      <section className="master-person-credentials editorial-section">
        <div className="master-person-section-heading"><p className="section-label">PUBLIC PROFILE</p><h2>把人物放回時間裡。</h2></div>
        <div className="master-person-timeline">
          {profile.timeline.map(([year, title, text]) => (
            <article key={year}><span>{year}</span><div><h3>{title}</h3><p>{text}</p></div></article>
          ))}
        </div>
      </section>

      <section className="master-person-practice editorial-section">
        <div className="master-person-section-heading"><p className="section-label">CRAFT &amp; PRACTICE</p><h2>從工藝重點，理解作品方向。</h2></div>
        <div className="master-person-practice-grid">
          {profile.focus.map(([title, text], index) => (
            <article key={title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
      </section>

      <section className="master-person-works editorial-section">
        <div className="master-person-section-heading"><p className="section-label">WORKS IN THIS STORE</p><h2>{profile.name}的作品。</h2><p>這裡集中展示與{profile.name}相關的現售作品，並按人物作品系列整理，方便先了解作品方向，再進入訂製諮詢。</p></div>
        {displayedProducts.length ? (
          <div className="products-grid master-person-products-grid">
            {displayedProducts.map((product, index) => <ProductItem key={product.id} product={product} loading={index < 8 ? 'eager' : undefined} />)}
          </div>
        ) : (
          <div className="editorial-status-card"><strong>目前沒有與 {profile.name} 相關的現售作品</strong><p>如果你已有特定作品方向，歡迎直接聯絡我們討論尺寸、材料、裝具與製作需求。</p></div>
        )}
      </section>

      <section className="master-person-note">
        <p className="section-label">READ BEFORE COMMISSIONING</p>
        <h2>代表作是工藝參考，<em>不是現貨承諾。</em></h2>
        <p>人物頁聚焦工藝履歷與作品方向；現售作品的圖片、價格、規格、庫存與交期，請直接查看對應商品頁。</p>
        <div className="brand-story-actions"><Link className="button button-gold" to="/pages/contact">聯絡諮詢 <span aria-hidden="true">↗</span></Link><a className="text-link" href={profile.referenceUrl} target="_blank" rel="noreferrer">查看公開人物資料 ↗</a></div>
      </section>
    </div>
  );
}

const MASTER_PERSON_PROFILES = {
  'shen-xinpei': {
    name: '沈新培',
    mark: '新培',
    generation: '第四代 · 沈新培',
    image: '/assets/reference/master-shen-xinpei.jpg',
    imageAlt: '沈新培肖像',
    title: '沈新培，從父輩工作台走來的第四代傳承人',
    intro: '沈新培自幼隨父輩學習龍泉寶劍鍛製技藝，經歷合作社時期與祖業延續，長期參與鍛打、成形、研磨、裝配與作品檢查。',
    collectionKey: 'xinpei',
    collectionHandle: 'shen-xinpei-master-custom',
    referenceUrl: 'https://shen1885.com/pages/shen-xinpei',
    timeline: [
      ['少年時期', '隨父學習鑄劍', '沈新培自幼隨父親沈煥周學習龍泉寶劍鍛製技藝，從工作台開始累積對材料與火候的理解。'],
      ['1972', '鑄製國禮龍泉劍', '沈新培為美國總統尼克森鑄製龍泉劍，作為國禮。'],
      ['1979', '受到國家領導人接見', '沈新培受到鄧小平等國家領導人接見並合影留念。'],
      ['1991', '浙江省工藝美術大師', '沈新培獲評浙江省工藝美術大師。'],
      ['1993', '日月乾坤劍與刀', '研發的日月乾坤劍、日月乾坤刀取得國家發明專利；相關作品同年獲中國首屆武術器材審評會金獎。'],
      ['2007', '國家級非遺代表性傳承人', '沈新培成為龍泉寶劍鍛製技藝國家級非物質文化遺產代表性傳承人。'],
      ['2012', '中國工藝美術大師', '沈新培獲評中國工藝美術大師。'],
    ],
    focus: [
      ['鍛打與成形', '從材料、火候與整體比例出發，讓刀劍的結構先建立，再進入表面與裝配。'],
      ['傳統形制', '以龍泉刀劍的形制與使用邊界為基礎，具體作品仍以商品頁規格或訂製確認為準。'],
      ['代際教學', '公開資料呈現的不只是個人履歷，也包括技藝如何在父子協作與日常工作台上繼續。'],
    ],
  },
  'shen-zhou': {
    name: '沈州',
    mark: '沈州',
    generation: '第五代 · 沈州',
    image: '/assets/reference/master-shen-zhou.jpg',
    imageAlt: '沈州在工作室展示劍器',
    title: '沈州，讓傳統工藝進入當代工作台',
    intro: '沈州出生於龍泉製劍世家，1993 年開始跟隨父親沈新培學習龍泉劍鍛製技藝，1999 年承接沈廣隆劍鋪第五代工作與傳承。',
    collectionKey: 'zhou',
    collectionHandle: 'shen-zhou-master-custom',
    referenceUrl: 'https://shen1885.com/pages/shen-zhou',
    timeline: [
      ['1977', '出生於龍泉製劍世家', '沈州於 1977 年 12 月出生於龍泉沈廣隆製劍世家。'],
      ['1993', '開始專業學藝', '沈州 17 歲起跟隨父親沈新培，系統學習龍泉寶劍鍛製技藝。'],
      ['1999', '承接第五代工作與傳承', '沈州接續沈廣隆劍鋪第五代的製作與傳承工作。'],
      ['2001', '武術賽事指定器械', '日月乾坤刀與劍被指定為第九屆全國運動會武術錦標賽器械。'],
      ['2002—2003', '淬鍊與研磨工藝改進', '研製武術刀劍淬鍊專用裝備與多次高速淬鍊工藝，並研發武術劍滾壓機，持續改善製作效率與成形流程。'],
      ['2011—2012', '作品獲中國工藝美術館收藏', '螭龍劍與王者之劍先後獲中國工藝美術館收藏。'],
      ['2017—2019', '浙江省傳承與工藝美術資歷', '沈州先後成為浙江省非物質文化遺產代表性傳承人，並獲評浙江省工藝美術大師。'],
      ['2024', '玄武劍獲金獎', '玄武劍獲第二十屆中國（深圳）國際文化產業博覽交易會金獎。'],
    ],
    focus: [
      ['實用與審美', '以用途、比例、平衡和外觀一起討論作品，不用裝飾取代對規格的說明。'],
      ['工藝與改進', '在傳統工序的基礎上持續整理工具、流程與表面處理，實際可行性需要逐項確認。'],
      ['工作台協作', '把材料判斷、熱處理、研磨與裝配放在同一套工作流程裡，讓傳承落到每日製作。'],
    ],
  },
};

function BrandStoryContent() {
  const generations = [
    {number: '01', title: '沈朝慶', text: '家族製劍傳承的起點，從龍泉爐火開始建立技藝脈絡。' },
    {number: '02', title: '沈庭璋', text: '創立沈廣隆劍鋪，承接家學，也讓「沈廣隆」成為延續至今的字號。' },
    {number: '03', title: '沈煥周 · 沈煥文 · 沈煥武', text: '在時代轉折中共同延續家族技藝，為後來的工坊打下基礎。' },
    {number: '04', title: '沈新培', text: '從合作社工作到國家級非遺代表性傳承人，長期參與鍛打、研磨與裝配。' },
    {number: '05', title: '沈州', text: '承接第五代傳承，持續把家學經驗帶入當代製作、訂製與工坊傳承。' },
  ];
  const milestones = [
    ['1885', '家族製劍傳承起點', '沈朝慶開始專業製作龍泉劍，家族製劍脈絡由此展開。'],
    ['1894', '沈廣隆劍鋪形成', '沈庭璋在龍泉創建沈廣隆劍鋪，品牌字號正式形成。'],
    ['1915', '巴拿馬萬國博覽會金獎', '沈廣隆劍鋪作品於巴拿馬萬國博覽會獲得金獎，品牌工藝開始被更廣泛地看見。'],
    ['2010', '品牌資質與非遺保護', '沈廣隆劍鋪獲認定為中華老字號，並成為龍泉寶劍鍛製技藝省級非物質文化遺產生產性保護基地。'],
  ];

  return (
    <div className="brand-story-content">
      <section className="brand-story-opening">
        <div className="brand-story-number">1885</div>
        <div>
          <p className="section-label">A FAMILY LINEAGE IN STEEL</p>
          <h2>一件作品，<em>先要經得起時間。</em></h2>
          <p>
            沈廣隆的故事，從龍泉的爐火與一代代製劍人的手上開始。1885 年沈朝慶開始專業製作龍泉劍，1894 年沈庭璋創立沈廣隆劍鋪，家族技藝與品牌經營由此延續至今天的工坊。
          </p>
          <p>
            「六代傳承」是品牌對家族脈絡的整體概括。本頁人物介紹保留前五代的歷史節點，人物內容聚焦已經參與製作與傳承的人；第六代仍在成長，暫不作為現任製作者介紹。
          </p>
        </div>
      </section>
      <WorkshopMedia
        label="THE WORKSHOP IN VIEW"
        title="一條傳承，落在今天的工作台。"
        intro="品牌故事不只是一條時間線，也包括場地、工具、作品與每天對材料、比例和用途的判斷。"
      />

      <section className="brand-story-timeline">
        <div className="brand-story-section-heading">
          <p className="section-label">BRAND ORIGIN · PUBLIC RECORDS</p>
          <h2>從家族技藝，走到今天的工作台。</h2>
        </div>
        <div className="timeline-list">
          {milestones.map(([year, title, text]) => (
            <div className="timeline-item" key={year}>
              <span>{year}</span>
              <div><h3>{title}</h3><p>{text}</p></div>
            </div>
          ))}
        </div>
        <p className="brand-story-source-note">從 1885 年開爐製劍，到 1894 年劍鋪創立、1915 年獲巴拿馬萬國博覽會金獎，再到 2010 年的品牌與非遺認定，這些節點共同構成沈廣隆延續至今的歷史軌跡。</p>
      </section>

      <section className="brand-story-lineage">
        <div className="brand-story-section-heading">
          <p className="section-label">THE LINEAGE</p>
          <h2>五代傳承人物，從爐火走到今天的工作台。</h2>
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

      <section className="brand-story-handoff">
        <div>
          <p className="section-label">THE HANDOVER BETWEEN GENERATIONS</p>
          <h2>傳承不在展櫃裡，<em>在每天的判斷裡。</em></h2>
          <p>從父輩手上學到的，不只是一套工序，也包括面對材料時的觀察、對火候的理解，以及對比例和裝配關係的反覆校準。</p>
          <p>沈新培與沈州代表兩個已經公開介紹、並持續參與製作與傳承的世代。兩位大師的作品與資歷，適合用來理解工藝方向；歷史代表作不等同於當前現貨。</p>
        </div>
        <div className="brand-story-handoff-portraits">
          <figure>
            <img src="/assets/reference/master-shen-xinpei.jpg" alt="沈新培" loading="lazy" />
            <figcaption><span>第四代</span>沈新培</figcaption>
          </figure>
          <figure>
            <img src="/assets/reference/master-shen-zhou.jpg" alt="沈州" loading="lazy" />
            <figcaption><span>第五代</span>沈州</figcaption>
          </figure>
        </div>
      </section>

      <section className="brand-story-masters">
        <div className="brand-story-section-heading">
          <p className="section-label">THE BEARERS</p>
          <h2>從人物與作品，理解傳承如何繼續。</h2>
        </div>
        <div className="brand-story-master-grid">
          <article className="brand-story-master-card">
            <img src="/assets/reference/master-shen-xinpei.jpg" alt="沈新培大師" loading="lazy" />
            <div><p className="section-label">FOURTH-GENERATION INHERITOR</p><h3>沈新培</h3><p>中國工藝美術大師、國家級非物質文化遺產代表性傳承人。長期參與龍泉寶劍的鍛打、研磨、裝配與紋理呈現。</p><Link className="text-link" to="/collections/shen-xinpei-master-custom">查看沈新培作品 <span aria-hidden="true">↗</span></Link></div>
          </article>
          <article className="brand-story-master-card">
            <img src="/assets/reference/master-shen-zhou.jpg" alt="沈州大師" loading="lazy" />
            <div><p className="section-label">FIFTH-GENERATION INHERITOR</p><h3>沈州</h3><p>浙江省工藝美術大師、浙江省非遺代表性傳承人。將家學經驗落實在當代作品、材料研究與工坊傳承中。</p><Link className="text-link" to="/collections/shen-zhou-master-custom">查看沈州作品 <span aria-hidden="true">↗</span></Link></div>
          </article>
        </div>
      </section>

      <section className="brand-story-principles">
        <div>
          <p className="section-label">OUR PRINCIPLES</p>
          <h2>傳承不是口號，<em>是每天重複做好。</em></h2>
        </div>
        <div className="principle-list">
          <div><span>01</span><h3>對材料誠實</h3><p>清楚說明材質、規格、狀態與手工差異。</p></div>
          <div><span>02</span><h3>對工藝耐心</h3><p>讓選材、整形、熱處理、打磨和裝配各自發揮作用。</p></div>
          <div><span>03</span><h3>對每件作品負責</h3><p>從購買前諮詢到交付後的保養，都給出實際而具體的說明。</p></div>
        </div>
      </section>

      <section className="brand-story-today">
        <p className="section-label">SHEN GUANG LONG TODAY · CONTINUING THE CRAFT</p>
        <h2>今天，我們把傳統帶到清楚的使用場景裡。</h2>
        <p>目錄商品、練習與使用場景、收藏與展示作品，以及大師訂製，擁有不同的邊界與說明。傳統不只停留在歷史裡，也延伸到今天的選材、鍛造、打磨、裝配、教學與諮詢。</p>
        <div className="brand-story-actions">
          <Link className="button button-gold" to="/collections">查看作品 <span aria-hidden="true">↗</span></Link>
          <Link className="text-link" to="/pages/craftsmanship">了解工藝 <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </div>
  );
}

function CraftsmanshipContent() {
  const steps = [
    ['01', '選材', '先確認材料、尺寸與用途，再決定一件作品應該從哪裡開始。'],
    ['02', '鍛造', '透過反覆鍛打讓材料逐漸形成需要的形態，也讓匠人理解它的狀態。'],
    ['03', '整形', '校正比例、線條與重心，讓作品從「成形」走向可使用的結構。'],
    ['04', '熱處理', '根據實際材料和工藝要求完成熱處理，並檢查形態與狀態。'],
    ['05', '打磨', '逐步處理表面、刃線與細節，使手感、光澤和輪廓保持統一。'],
    ['06', '刻飾', '裝飾服務於整體氣質與識別，不用裝飾掩蓋材料或工藝本身。'],
    ['07', '裝配', '將劍身、裝具、劍鞘及相關部件組合，重新檢查比例和配合。'],
    ['08', '檢查', '在交付前核對外觀、結構、規格和隨件說明，確認它與商品頁一致。'],
  ];

  return (
    <div className="craftsmanship-content">
      <section className="craftsmanship-intro">
        <p className="section-label">FROM MATERIAL TO OBJECT</p>
        <h2>工藝的價值，<em>藏在每一次判斷裡。</em></h2>
        <p>一件刀劍作品的材料、比例、熱處理、表面處理與裝配，會共同影響最後的手感、外觀與保存方式；以下以工作流程說明每一個判斷點。</p>
      </section>

      <section className="craftsmanship-flow">
        <div className="craftsmanship-section-heading">
          <p className="section-label">THE WORKFLOW</p>
          <h2>從工作台開始，直到交付。</h2>
        </div>
        <div className="craft-step-grid">
          {steps.map(([number, title, text]) => (
            <article className="craft-step" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <WorkshopMedia
        label="THE WORKBENCH"
        title="工作台上的八個工序。"
        intro="從材料到成形，影像讓八個工序有一個可以被理解的現場。"
      />
      <WorkshopVideo
        label="MOVING IMAGE · WORKSHOP"
        title="讓工藝在影像裡動起來。"
        intro="影片記錄材料處理、鍛打、表面處理與裝配檢查的工作環境。"
      />

      <section className="craftsmanship-inspection">
        <div className="inspection-mark">手<br />作</div>
        <div>
          <p className="section-label">WHAT THE MAKER LOOKS FOR</p>
          <h2>不是把每件作品做得一模一樣，而是讓它符合自己的用途。</h2>
          <div className="inspection-points">
            <p><strong>比例</strong><br />尺寸、線條與裝具之間形成完整關係，作品才有穩定的整體感。</p>
            <p><strong>平衡</strong><br />不同用途對應不同的重量與握持感，具體以商品規格為準。</p>
            <p><strong>細節</strong><br />手工作品的紋理、色澤與細部差異，會成為每件作品獨有的性格。</p>
          </div>
        </div>
      </section>

      <section className="craftsmanship-boundary">
        <div className="craftsmanship-section-heading">
          <p className="section-label">A CLEAR BOUNDARY</p>
          <h2>歷史作品與當代商品，各自有自己的位置。</h2>
        </div>
        <div className="boundary-copy">
          <p>歷史訂製、收藏、禮儀或展覽作品，呈現沈廣隆曾經處理的作品方向；如果你喜歡其中的形制或裝具，可以把圖片和需求帶來討論。</p>
          <p>現售作品請從商品目錄查看，每件商品頁會列出圖片、規格、狀態與交付資訊。</p>
          <Link className="text-link" to="/pages/before-you-order">查看購買前須知 <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <section className="craftsmanship-next">
        <p className="section-label">CONTINUE EXPLORING</p>
        <h2>看見工藝之後，再選擇適合你的作品。</h2>
        <div className="brand-story-actions">
          <Link className="button button-gold" to="/collections">瀏覽作品 <span aria-hidden="true">↗</span></Link>
          <Link className="text-link" to="/pages/master-custom">大師訂製 <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </div>
  );
}

function MasterCustomContent({collections, products}) {
  const process = [
    ['01', '先說用途', '告訴我們作品的使用或展示場景、目的地，以及你最在意的部分。'],
    ['02', '確認方向', '圍繞器型、尺寸、材料、裝具、刻飾和預算範圍，整理可行方向。'],
    ['03', '確認規格', '在報價前明確規格、交期、付款節點、配送方式及購買前須知。'],
    ['04', '製作與交付', '確認方案後進入製作，完成檢查並按約定方式交付。'],
  ];

  return (
    <div className="master-custom-content">
      <section className="custom-intro">
        <p className="section-label">A CONVERSATION BEFORE A COMMISSION</p>
        <h2>訂製不是從一張圖片開始，<em>而是從一次清楚的溝通開始。</em></h2>
        <p>每一件訂製作品都需要先了解用途、尺寸、材料、裝具、預算和目的地。我們會先判斷需求是否適合，再討論可以實現的方向。</p>
        <Link className="button button-gold" to="/pages/contact">開始諮詢 <span aria-hidden="true">↗</span></Link>
      </section>
      <WorkshopMedia
        label="COMMISSION CONTEXT"
        title="訂製之前，先理解工作室能確認什麼。"
        intro="影像讓你先了解工作室環境與作品方向；如果有喜歡的形制或細節，歡迎帶著參考一起討論。"
      />
      <MasterCustomProducts collections={collections} products={products} />

      <section className="custom-scope">
        <div className="custom-section-heading">
          <p className="section-label">WHAT WE CAN DISCUSS</p>
          <h2>先把範圍講清楚，方案才有意義。</h2>
        </div>
        <div className="custom-scope-grid">
          <article><span>01</span><h3>器型與尺寸</h3><p>討論整體比例、長度、重量和握持方式，具體以最終規格確認單為準。</p></article>
          <article><span>02</span><h3>材料與裝具</h3><p>根據用途與風格討論劍身、刀身、劍鞘和裝具等組成部分。</p></article>
          <article><span>03</span><h3>刻飾與細節</h3><p>討論紋樣、文字和裝飾位置；是否能夠製作，需要結合工藝與授權判斷。</p></article>
          <article><span>04</span><h3>收藏與展示</h3><p>歷史作品可作為形制、裝具與氣質的參考；實際方案會按照你的用途與需求重新討論。</p></article>
        </div>
      </section>

      <section className="custom-process">
        <div className="custom-section-heading">
          <p className="section-label">THE PROCESS</p>
          <h2>四個階段，把想法變成可確認的方案。</h2>
        </div>
        <div className="custom-process-list">
          {process.map(([number, title, text]) => (
            <article key={number}>
              <span>{number}</span>
              <div><h3>{title}</h3><p>{text}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="custom-brief">
        <div className="brief-mark">定<br />制</div>
        <div>
          <p className="section-label">YOUR FIRST MESSAGE</p>
          <h2>諮詢時，準備這六項資訊就夠了。</h2>
          <ol>
            <li>希望製作或了解的作品類型</li>
            <li>使用、練習、收藏或展示場景</li>
            <li>期望尺寸、風格與材料方向</li>
            <li>是否需要刻飾或個人化細節</li>
            <li>預算範圍與希望完成時間</li>
            <li>收貨國家或地區</li>
          </ol>
        </div>
      </section>

      <section className="custom-notes">
        <div className="custom-section-heading">
          <p className="section-label">IMPORTANT NOTES</p>
          <h2>訂製作品，需要比普通商品更多的確認。</h2>
        </div>
        <div className="custom-note-list">
          <p><strong>價格與交期</strong>規格確認後，我們會按作品內容、製作工序與目的地單獨報價並安排時間。</p>
          <p><strong>可行性</strong>不同尺寸、材料、紋樣與歷史作品方向，需要結合工藝條件逐項討論。</p>
          <p><strong>配送與法規</strong>目的地、承運商、稅費與當地要求會影響交付，請在諮詢時一併提供收貨地區。</p>
        </div>
        <Link className="text-link" to="/pages/before-you-order">先閱讀購買前須知 <span aria-hidden="true">↗</span></Link>
      </section>
    </div>
  );
}

function MasterCustomProducts({collections, products = []}) {
  const masters = [
    {
      key: 'xinpei',
      name: '沈新培',
      generation: '第四代 · 沈新培',
      handle: 'shen-xinpei-master-custom',
      image: '/assets/reference/master-shen-xinpei.jpg',
      imageAlt: '沈新培肖像',
      collection: collections?.xinpei,
      description: '這裡整理沈新培相關的已上架作品，讓你先了解大師的作品方向。',
    },
    {
      key: 'zhou',
      name: '沈州',
      generation: '第五代 · 沈州',
      handle: 'shen-zhou-master-custom',
      image: '/assets/reference/master-shen-zhou.jpg',
      imageAlt: '沈州在工作室展示劍器',
      collection: collections?.zhou,
      description: '這裡整理沈州相關的已上架作品，讓你先了解大師的作品方向。',
    },
  ];

  return (
    <section className="master-custom-products" aria-labelledby="master-custom-products-heading">
      <div className="custom-section-heading">
        <p className="section-label">AVAILABLE MASTER WORKS</p>
        <h2 id="master-custom-products-heading">先看現有作品，<em>再討論訂製方向。</em></h2>
        <p>按大師與作品系列整理的現售作品，適合先了解作品方向，再與我們討論尺寸、材料、裝具與訂製需求。</p>
      </div>
      <div className="master-custom-products-groups">
        {masters.map((master) => {
          const titleMatchedProducts = products.filter((product) => product.title.includes(master.name));
          const collectionProducts = master.collection?.products?.nodes ?? [];
          const displayedProducts = [
            ...titleMatchedProducts,
            ...collectionProducts.filter(
              (product) => !titleMatchedProducts.some((matched) => matched.id === product.id),
            ),
          ];
          return (
            <section className="master-custom-products-group" key={master.key} aria-labelledby={`${master.key}-works-heading`}>
              <div className="master-custom-products-group-heading">
                <div className="master-custom-products-group-identity">
                  <img src={master.image} alt={master.imageAlt} loading="lazy" />
                  <div>
                    <p className="section-label">{master.generation}</p>
                    <h3 id={`${master.key}-works-heading`}>{master.name}大師作品</h3>
                    <p>{master.description}</p>
                  </div>
                </div>
                <Link className="text-link" to={`/collections/${master.handle}`}>查看分類 <span aria-hidden="true">↗</span></Link>
              </div>
              {displayedProducts.length ? (
                <div className="master-custom-products-grid">
                  {displayedProducts.map((product) => <ProductItem key={product.id} product={product} />)}
                </div>
              ) : (
                <div className="editorial-status-card">
                  <strong>目前沒有已上架的 {master.name} 相關作品</strong>
                  <p>如果你有特定作品方向，歡迎先提交需求，我們會按用途與規格回覆。</p>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </section>
  );
}

function BeforeYouOrderContent() {
  const checks = [
    ['01', '先確認用途', '練習、收藏、展示或禮贈，不同用途對應不同的規格、裝具和注意事項。'],
    ['02', '再看商品規格', '請閱讀尺寸、重量、材料、配件、狀態和庫存資訊，不要只依據主圖判斷。'],
    ['03', '確認交期與配送', '現貨和訂製的交期不同；目的地、承運商、稅費與當地規則需要單獨確認。'],
    ['04', '最後再進入結帳', '確認商品、數量、收貨資訊和適用政策後，再透過 Shopify Checkout 完成付款。'],
  ];

  return (
    <div className="before-order-content">
      <section className="before-order-intro">
        <p className="section-label">A CONSIDERED PURCHASE</p>
        <h2>在點擊購買之前，<em>先把重要的事看清楚。</em></h2>
        <p>傳統刀劍及相關作品不是普通的衝動型商品。請先確認用途、規格、目的地與當地要求；如果仍有疑問，歡迎在結帳前聯絡我們。</p>
        <Link className="button button-gold" to="/pages/contact">諮詢作品 <span aria-hidden="true">↗</span></Link>
      </section>
      <WorkshopMedia
        label="LOOK BEFORE YOU CHOOSE"
        title="圖片提供方向，規格才決定選擇。"
        intro="影像展示不同作品的場景與方向；付款前仍請核對商品頁、目的地與實際確認資訊。"
      />

      <section className="before-order-checklist">
        <div className="before-order-heading">
          <p className="section-label">BEFORE CHECKOUT</p>
          <h2>四項檢查，幫助你做出合適的選擇。</h2>
        </div>
        <div className="before-order-check-grid">
          {checks.map(([number, title, text]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="before-order-details">
        <div className="before-order-heading">
          <p className="section-label">WHAT TO CONFIRM</p>
          <h2>商品頁上的資訊，都有實際用途。</h2>
        </div>
        <div className="before-order-detail-list">
          <p><strong>用途與狀態</strong>請確認作品適合練習、收藏、展示還是禮贈。開刃、未開刃、展示狀態和可使用狀態不能混為一談，具體以商品頁說明為準。</p>
          <p><strong>規格與手工差異</strong>尺寸和重量以商品頁或確認單為準。天然材料、手工紋理、色澤和細部可能存在差異，圖片不能完全代表實物。</p>
          <p><strong>庫存與交期</strong>有庫存不等於當天發貨；訂製、補貨、裝配和檢查都可能影響交期，請以確認後的時間為準。</p>
          <p><strong>支付與結帳</strong>購物車用於確認商品和數量，最終付款在 Shopify Checkout 完成。訂單是否成立，以結帳頁面和店鋪訂單記錄為準。</p>
        </div>
      </section>

      <section className="before-order-regulations">
        <div className="regulations-mark">知<br />悉</div>
        <div>
          <p className="section-label">DESTINATION &amp; REGULATIONS</p>
          <h2>配送能否完成，取決於目的地和具體商品。</h2>
          <p>不同國家或地區可能對刀劍、金屬製品、木製裝具、長度、鋒利狀態、進口申報和承運方式有不同要求。我們不會用「全球配送」一句話替代目的地確認。</p>
          <p>下單前請提供收貨國家或地區；如有需要，也請向當地海關、承運商或相關機構確認。稅費、清關、退運和當地限制可能由收貨方承擔。</p>
          <Link className="text-link" to="/pages/contact">提交目的地諮詢 <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <section className="before-order-final">
        <p className="section-label">READY WHEN YOU ARE</p>
        <h2>看完仍然確定，再把作品放進購物車。</h2>
        <div className="brand-story-actions">
          <Link className="button button-gold" to="/collections">瀏覽商品 <span aria-hidden="true">↗</span></Link>
          <Link className="text-link" to="/pages/faq">查看常見問題 <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </div>
  );
}

function CareStorageContent() {
  return (
    <div className="before-order-content">
      <section className="before-order-intro">
        <p className="section-label">CARE &amp; STORAGE</p>
        <h2>保存不是附加項，<em>而是作品的一部分。</em></h2>
        <p>收到作品後，請先按照商品頁的材料、表面處理與狀態說明保存。以下是適用於大多數金屬與木作作品的基礎原則。</p>
      </section>
      <WorkshopMedia label="CARE IN CONTEXT" title="讓環境配合作品，而不是讓作品承受環境。" intro="影像展示金屬、木作與展示環境的關係；具體護理仍以商品說明為準。" />
      <section className="before-order-details">
        <div className="before-order-heading"><p className="section-label">A SIMPLE ROUTINE</p><h2>四個日常保存動作。</h2></div>
        <div className="before-order-detail-list">
          <p><strong>擦乾</strong>接觸金屬表面後，以乾淨柔軟的布擦去指紋、水分與可能殘留的鹽分。</p>
          <p><strong>避潮</strong>存放於乾燥、通風、避免陽光直射的位置，木作與金屬不要長時間受潮。</p>
          <p><strong>少碰撞</strong>展示或收納時保持穩固，避免跌落、摩擦、重壓與不同金屬長時間接觸。</p>
          <p><strong>先確認</strong>清潔劑、油品或任何特殊處理前，先確認材料與商品說明，不要用同一套方式處理所有作品。</p>
        </div>
      </section>
      <section className="before-order-regulations"><div className="regulations-mark">護<br />持</div><div><p className="section-label">SAFETY &amp; USE</p><h2>開刃、運輸與當地規則，要單獨確認。</h2><p>保養說明不能取代安全訓練、承運商要求或目的地法規。涉及開刃作品、進口與持有問題時，請先閱讀購買前須知並聯絡我們。</p><Link className="text-link" to="/pages/contact">提出具體問題 <span aria-hidden="true">↗</span></Link></div></section>
    </div>
  );
}

function ShippingLegalContent() {
  const items = [
    ['目的地', '請在付款前提供收貨國家或地區；刀劍、金屬製品、木製裝具和不同長度可能有不同要求。'],
    ['承運方式', '配送方式、包裝、申報與承運商接受範圍，需要結合具體商品逐項確認。'],
    ['稅費與清關', '進口稅、清關費、退運和當地限制可能由收貨方承擔，不能以「全球配送」一句話替代確認。'],
    ['訂單狀態', '只有在商品、規格、目的地與付款資訊確認後，才能判斷是否可以安排交付。'],
  ];
  return (
    <div className="before-order-content">
      <section className="before-order-intro"><p className="section-label">DELIVERY &amp; LEGAL NOTICE</p><h2>先確認能否交付，<em>再安排付款。</em></h2><p>不同目的地的進口、運輸與持有要求可能不同。本頁提供判斷框架，不替代當地海關、承運商或法律機構的正式說明。</p><Link className="button button-gold" to="/pages/contact">提交目的地諮詢 <span aria-hidden="true">↗</span></Link></section>
      <section className="before-order-details"><div className="before-order-heading"><p className="section-label">WHAT TO CONFIRM</p><h2>四個資訊，讓我們更快判斷。</h2></div><div className="before-order-detail-list">{items.map(([title, text]) => <p key={title}><strong>{title}</strong>{text}</p>)}</div></section>
      <section className="before-order-regulations"><div className="regulations-mark">行<br />程</div><div><p className="section-label">A CLEAR BOUNDARY</p><h2>本站不把法規與配送寫成模糊承諾。</h2><p>你可以先從商品頁取得尺寸、重量、材料與狀態，再把商品連結和收貨地區傳給我們。最終以目的地規則、承運商接受條件和雙方確認資訊為準。</p><Link className="text-link" to="/pages/before-you-order">返回購買前須知 <span aria-hidden="true">↗</span></Link></div></section>
    </div>
  );
}

function GroupOrdersContent() {
  const steps = [
    ['01', '先統一用途', '由教練、社團或採購負責人整理練習、比賽、展示或教學需求。'],
    ['02', '建立明細', '列出數量、長度、重量、左右手、配件、包裝和希望到貨時間。'],
    ['03', '確認樣品與報價', '先核對樣品、差異範圍、庫存、交期、配送與付款條件，再決定是否進行。'],
    ['04', '分批檢查交付', '團體訂單需要按照確認單核對數量、規格、包裝與收貨資訊。'],
  ];
  return (
    <div className="master-custom-content">
      <section className="custom-intro"><p className="section-label">GROUP ORDERS · CLUBS &amp; SCHOOLS</p><h2>團體採購，<em>先把差異說清楚。</em></h2><p>武術館、社團、學校或活動採購，最重要的不是一次列出很多商品，而是先統一用途和規格，讓每一把作品在到貨後都能被正確使用。</p><Link className="button button-gold" to="/pages/contact">提交團體需求 <span aria-hidden="true">↗</span></Link></section>
      <section className="custom-process"><div className="custom-section-heading"><p className="section-label">THE GROUP ORDER PATH</p><h2>四個階段，降低溝通成本。</h2></div><div className="custom-process-list">{steps.map(([number, title, text]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></section>
      <section className="custom-brief"><div className="brief-mark">團<br />購</div><div><p className="section-label">YOUR FIRST MESSAGE</p><h2>第一次聯絡，請附上這些資料。</h2><ol><li>採購單位與聯絡人</li><li>用途與使用程度</li><li>商品類型與數量</li><li>希望的尺寸、重量與配置</li><li>收貨國家或地區</li><li>預算與希望到貨時間</li></ol></div></section>
    </div>
  );
}

function FaqContent() {
  const groups = [
    {
      label: 'PRODUCTS',
      title: '關於商品',
      items: [
        ['如何判斷一件商品是否適合我？', '先看商品頁的用途、尺寸、重量、材料、狀態和配件說明。不同作品的手感與適用場景不同；如果你仍不確定，請在下單前聯絡我們。'],
        ['商品圖片是否完全代表實物？', '商品圖片用於展示整體外觀，但天然材料、手工紋理、色澤和細節可能存在差異。具體規格以商品頁和確認資訊為準。'],
        ['歷史作品是否可以直接購買或複製？', '歷史訂製、收藏、禮儀或展覽作品主要用來了解品牌的形制與工藝方向。若你有相近需求，請提供參考圖片、用途與規格，讓我們先討論可行方案。'],
      ],
    },
    {
      label: 'AVAILABILITY & CUSTOM',
      title: '庫存與訂製',
      items: [
        ['有庫存是否代表可以馬上發貨？', '不一定。裝配、檢查、包裝和目的地確認都可能影響發貨時間。請以商品頁或確認後的交期為準。'],
        ['可以訂製尺寸、材料或刻飾嗎？', '部分需求可以討論，但需要結合用途、工藝可行性、材料和目的地確認。請透過大師訂製頁面提交完整需求。'],
        ['訂製價格和交期如何確定？', '訂製需要先確認器型、尺寸、材料、裝具、刻飾、預算與目的地，再單獨報價和確認交期，不能直接套用目錄商品價格。'],
      ],
    },
    {
      label: 'PAYMENT & DELIVERY',
      title: '支付與配送',
      items: [
        ['如何完成付款？', '商品加入購物車後，最終透過 Shopify Checkout 完成結帳和付款。訂單是否成立，以結帳頁面和店鋪訂單記錄為準。'],
        ['是否支持全球配送？', '不能一概而論。刀劍、金屬製品和相關裝具可能受到目的地法規、承運商和清關要求影響，請先提供收貨國家或地區確認。'],
        ['稅費和清關由誰負責？', '稅費、清關、退運和當地限制可能由收貨方承擔，具體取決於目的地、承運商和當地規則。下單前請先確認。'],
      ],
    },
    {
      label: 'CARE & AFTER SALES',
      title: '保養與售後',
      items: [
        ['收到作品後應該如何保存？', '請先閱讀對應商品的保養說明，避免潮濕、碰撞、長時間接觸腐蝕性物質或不適當的使用環境。不同材料的護理方式可能不同。'],
        ['發現問題應該怎麼辦？', '請保留訂單資訊、外包裝和現場照片，儘快透過聯絡頁面說明問題。我們會根據商品狀態、運輸情況和訂單約定進一步確認。'],
        ['可以退換貨嗎？', '退換條件以店鋪政策和具體商品頁面說明為準。訂製、個人化或特殊狀態商品可能有不同規則，請在付款前確認。'],
      ],
    },
  ];

  return (
    <div className="faq-content">
      <section className="faq-intro">
        <p className="section-label">QUESTIONS, ANSWERED</p>
        <h2>先把問題問清楚，<em>再選擇下一步。</em></h2>
        <p>這裡整理購買前最常見的問題。如果答案涉及具體商品、目的地或訂製規格，請以商品頁、店鋪政策和最終確認資訊為準。</p>
        <Link className="button button-gold" to="/pages/contact">還有問題？聯絡我們 <span aria-hidden="true">↗</span></Link>
      </section>

      {groups.map((group) => (
        <section className="faq-group" key={group.label}>
          <div className="faq-heading">
            <p className="section-label">{group.label}</p>
            <h2>{group.title}</h2>
          </div>
          <div className="faq-list">
            {group.items.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}<span aria-hidden="true">＋</span></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
      ))}

      <section className="faq-final">
        <p className="section-label">NEED A SPECIFIC ANSWER?</p>
        <h2>帶上商品名稱、目的地和你的用途，我們會更快幫你判斷。</h2>
        <div className="brand-story-actions">
          <Link className="button button-gold" to="/pages/contact">提交諮詢 <span aria-hidden="true">↗</span></Link>
          <Link className="text-link" to="/pages/before-you-order">購買前須知 <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </div>
  );
}

const PAGE_INTROS = {
  'about-shen-guang-long': {
    kicker: 'A LINEAGE IN STEEL · 品牌故事',
    title: '刀劍背後的傳承',
    lede: '來自龍泉的工作室、延續數代的家族技藝，以及讓作品承載製作者耐心與尺度的信念。',
    aside: '從作品導覽到工作台，每個細節都從對傳統的尊重開始。',
    ctaLabel: '探索作品目錄',
    ctaUrl: '/collections',
  },
  'craftsmanship': {
    kicker: 'THE HAND & THE BLADE · 工藝與傳承',
    title: '以耐心完成',
    lede: '平衡、比例與表面處理不是裝飾，而是傳統刀劍走向可理解、可使用與可保存的語言。',
    aside: '看看工作室的原則如何塑造目錄中的每一件作品。',
    ctaLabel: '查看全部作品',
    ctaUrl: '/collections/all',
  },
  'master-custom': {
    kicker: 'BY COMMISSION · 大師訂製',
    title: '讓作品從你的用途開始',
    lede: '從沈廣隆傳承的工作室方向開始討論，再讓用途、尺寸、材料與目的地共同決定細節。',
    aside: '訂製作品需要先討論用途、材料、尺寸、時間與目的地。',
    ctaLabel: '開始諮詢',
    ctaUrl: '/pages/contact',
  },
  'before-you-order': {
    kicker: 'BEFORE YOU ORDER · 購買前須知',
    title: '先看清楚，再做選擇',
    lede: '傳統刀劍是一項需要理解的選擇。先確認用途、比例、表面、配送與保存方式。',
    aside: '如果你不確定哪件作品適合練習，請在下單前聯絡工作室。',
    ctaLabel: '提出問題',
    ctaUrl: '/pages/contact',
  },
  faq: {
    kicker: 'QUESTIONS, ANSWERED · 常見問題',
    title: '走向合適作品的清楚路徑',
    lede: '集中查看商品、庫存、配送與購買流程的實際問題。',
    aside: '涉及目的地或預計用途的問題，建議直接諮詢。',
    ctaLabel: '聯絡我們',
    ctaUrl: '/pages/contact',
  },
  'longquan-swordmaking': {
    kicker: 'LONGQUAN · THE WORKSHOP',
    title: '龍泉刀劍工藝',
    lede: '從材料、形制到交付，理解一件傳統刀劍作品如何逐步完成。',
    aside: '先理解工藝，再按商品頁的實際規格選擇作品。',
    ctaLabel: '瀏覽作品',
    ctaUrl: '/collections',
  },
  'craftsmanship-materials': {
    kicker: 'MATERIALS · PROPORTION · USE',
    title: '工藝與材質',
    lede: '材質、比例與用途共同決定一件作品的性格與保存方式。',
    aside: '需要確認特定材質或尺寸時，請在付款前直接諮詢。',
    ctaLabel: '聯絡諮詢',
    ctaUrl: '/pages/contact',
  },
  'credentials-media': {
    kicker: 'PUBLIC RECORDS · MEDIA',
    title: '資質與媒體報導',
    lede: '從 1885 年傳承起點，到中華老字號、非遺保護基地與公開節目記錄。',
    aside: '品牌背景不等同於每件商品的規格或資質。',
    ctaLabel: '提交資料',
    ctaUrl: '/pages/contact',
  },
  'official-verification': {
    kicker: 'OFFICIAL VERIFICATION · 官方核驗',
    title: '官方資料核驗',
    lede: '整理品牌名稱、所在地、傳承節點、公開資質與媒體記錄；需要進一步確認時，回到對應原始來源查核。',
    aside: '本頁用於資料核對，不替代商品規格、現貨狀態、商標資料庫或目的地法規。',
    ctaLabel: '聯絡核驗',
    ctaUrl: '/pages/contact',
  },
  'shen-xinpei': {
    kicker: 'MASTER PROFILE · 沈新培',
    title: '沈新培｜第四代傳承人',
    lede: '從父輩工作台開始學習龍泉寶劍鍛製，將材料、形制與手工流程延續到今天。',
    aside: '人物履歷用於理解工藝方向，現售作品以商品頁和最終確認為準。',
    ctaLabel: '查看沈新培作品',
    ctaUrl: '/collections/shen-xinpei-master-custom',
  },
  'shen-zhou': {
    kicker: 'MASTER PROFILE · 沈州',
    title: '沈州｜第五代傳承人',
    lede: '從 17 歲學藝到承接第五代工作，讓傳統刀劍工藝在當代用途與工作台上繼續。',
    aside: '人物履歷用於理解工藝方向，現售作品以商品頁和最終確認為準。',
    ctaLabel: '查看沈州作品',
    ctaUrl: '/collections/shen-zhou-master-custom',
  },
  'care-storage': {
    kicker: 'CARE & STORAGE · 保養與保存',
    title: '讓作品留在自己的狀態',
    lede: '從清潔、收納到安全使用，建立一套適合實際作品的保存習慣。',
    aside: '', ctaLabel: '', ctaUrl: '',
  },
  'shipping-legal-notice': {
    kicker: 'DELIVERY & LEGAL NOTICE · 配送與法規',
    title: '先確認能否交付',
    lede: '目的地、承運方式、稅費與當地規則，需要在付款前逐項確認。',
    aside: '', ctaLabel: '', ctaUrl: '',
  },
  'group-orders': {
    kicker: 'GROUP ORDERS · 團體採購',
    title: '先把差異說清楚',
    lede: '為武術館、社團、學校與活動整理可核對的採購流程。',
    aside: '', ctaLabel: '', ctaUrl: '',
  },
  'care-and-storage': {
    kicker: 'CARE & STORAGE · 保養與保存',
    title: '讓作品留在自己的狀態',
    lede: '正確保存能保護表面、結構，以及刀劍與使用者之間的關係。',
    aside: '保養方式取決於每件作品的材料與表面處理。諮詢時請準備好商品資料。',
    ctaLabel: '查看全部作品',
    ctaUrl: '/collections/all',
  },
  contact: {
    kicker: 'CONTACT · 聯絡諮詢',
    title: '先從一次溝通開始',
    lede: '告訴我們你想找什麼、準備寄往哪裡，以及預計如何使用；我們會協助你確認下一步。',
    aside: '如需訂製，請說明偏好的風格、尺寸、材料、時間與目的地。',
    ctaLabel: '瀏覽作品目錄',
    ctaUrl: '/collections',
  },
  default: {
    kicker: 'SHEN GUANG LONG · LONGQUAN · 沈廣隆龍泉',
    title: null,
    lede: '來自中國龍泉的傳統刀劍、練習器械與工作室故事。',
    aside: '對作品、用途或配送有疑問嗎？我們會協助你。',
    ctaLabel: '聯絡我們',
    ctaUrl: '/pages/contact',
  },
};

const BUILT_IN_PAGE_TITLES = {
  'about-shen-guang-long': '品牌故事',
  craftsmanship: '工藝與傳承',
  'master-custom': '大師訂製',
  'before-you-order': '購買前須知',
  faq: '常見問題',
  'longquan-swordmaking': '龍泉刀劍工藝',
  'craftsmanship-materials': '工藝與材質',
  'credentials-media': '資質與媒體報導',
  'official-verification': '官方核驗',
  'shen-xinpei': '沈新培｜第四代傳承人',
  'shen-zhou': '沈州｜第五代傳承人',
  'care-storage': '保養與保存',
  'shipping-legal-notice': '配送與法規說明',
  'group-orders': '團體採購',
};

const PAGE_BANNER_VARIANTS = {
  'about-shen-guang-long': 'workshop',
  craftsmanship: 'craft',
  'master-custom': 'master',
  'before-you-order': 'workshop',
  faq: 'media',
  'longquan-swordmaking': 'craft',
  'craftsmanship-materials': 'materials',
  'credentials-media': 'credentials',
  'official-verification': 'credentials',
  'shen-xinpei': 'master',
  'shen-zhou': 'master',
  'care-storage': 'workshop',
  'shipping-legal-notice': 'workshop',
  'group-orders': 'media',
};

const MASTER_CUSTOM_COLLECTIONS_QUERY = `#graphql
  fragment MasterCustomProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
  }
  query MasterCustomCollections(
    $first: Int!
    $xinpeiHandle: String!
    $zhouHandle: String!
    $productsFirst: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    xinpei: collection(handle: $xinpeiHandle) {
      handle
      title
      products(first: $first) {
        nodes {
          ...MasterCustomProductItem
        }
      }
    }
    zhou: collection(handle: $zhouHandle) {
      handle
      title
      products(first: $first) {
        nodes {
          ...MasterCustomProductItem
        }
      }
    }
    products(first: $productsFirst) {
      nodes {
        ...MasterCustomProductItem
      }
    }
  }
`;

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
