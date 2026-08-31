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
    return {page};
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
          ) : page.handle === 'craftsmanship' ? (
            <CraftsmanshipContent />
          ) : page.handle === 'master-custom' ? (
            <MasterCustomContent />
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
    ['01', '中華老字號', '公開品牌資料將沈廣隆列入中華老字號相關記錄；正式證書與认定文件可在資料核驗後補充。'],
    ['02', '非遺與保護基地', '龍泉寶劍鍛製技藝及其傳承記錄，是理解沈廣隆工藝背景的重要公開資料。'],
    ['03', '傳承人資質', '公開資料聚焦第四代沈新培與第五代沈州的工藝與傳承經歷，不延伸書寫尚未參與工作的下一代。'],
  ];
  const media = ['《我有傳家寶》', '《手藝人》', '《傳承》', '龍泉鑄劍文化專題', '《中國面孔》', '《百家姓》'];

  return (
    <div className="brand-story-content">
      <section className="brand-story-opening">
        <div className="brand-story-number">1885</div>
        <div><p className="section-label">PUBLIC RECORDS</p><h2>資質與報導，<em>以可核對為先。</em></h2><p>本頁整理沈廣隆品牌背景、工藝傳承與公開媒體記錄。它們用來說明品牌脈絡，不代表每一件現售商品都具有相同的資質或歷史背景。</p></div>
      </section>
      <section className="brand-story-lineage"><div className="brand-story-section-heading"><p className="section-label">CREDENTIALS</p><h2>品牌資料索引。</h2></div><div className="generation-grid">{records.map(([number,title,text]) => <article className="generation-card" key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
      <section className="brand-story-principles"><div><p className="section-label">MEDIA RECORDS</p><h2>曾公開記錄的節目與專題。</h2></div><div className="principle-list">{media.map((title, index) => <div key={title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>圍繞龍泉刀劍、傳統技藝或沈氏傳承進行公開記錄。</p></div>)}</div></section>
      <section className="brand-story-today"><p className="section-label">SOURCE STATUS</p><h2>資料會持續整理與核驗。</h2><p>證書影像、節目連結與出版資料將在完成來源核對後逐步補充。未經確認的年份、人物身份與榮譽，不作為現售商品的承諾。</p><div className="brand-story-actions"><Link className="button button-gold" to="/pages/contact">提交資料諮詢 <span aria-hidden="true">↗</span></Link><Link className="text-link" to="/pages/about-shen-guang-long">查看品牌故事 <span aria-hidden="true">↗</span></Link></div></section>
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
        <h2>工艺的价值，<em>藏在每一次判断里。</em></h2>
        <p>传统工艺不是一句“手工制作”就能说明白。对一件刀剑作品来说，材料、比例、热处理、表面处理与装配，每一步都会影响最后的手感、外观与保存方式。</p>
      </section>

      <section className="craftsmanship-flow">
        <div className="craftsmanship-section-heading">
          <p className="section-label">THE WORKFLOW</p>
          <h2>从工作台开始，直到交付。</h2>
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

      <section className="craftsmanship-inspection">
        <div className="inspection-mark">手<br />作</div>
        <div>
          <p className="section-label">WHAT THE MAKER LOOKS FOR</p>
          <h2>不是把每件作品做得一模一样，而是让它符合自己的用途。</h2>
          <div className="inspection-points">
            <p><strong>比例</strong><br />尺寸、线条与装具之间应当形成完整关系。</p>
            <p><strong>平衡</strong><br />不同用途对应不同的重量与握持感，具体以商品规格为准。</p>
            <p><strong>细节</strong><br />手工作品会有纹理、色泽与细部差异，这些差异需要被如实说明。</p>
          </div>
        </div>
      </section>

      <section className="craftsmanship-boundary">
        <div className="craftsmanship-section-heading">
          <p className="section-label">A CLEAR BOUNDARY</p>
          <h2>历史作品与当代商品，各自有自己的位置。</h2>
        </div>
        <div className="boundary-copy">
          <p>历史订制、收藏、礼仪或展览作品，用来展示品牌经历和工艺方向，不代表当前有库存，也不自动代表可以复制。</p>
          <p>当前可售商品以 Shopify 商品目录为准。商品页会逐项说明图片、规格、状态、交期和适用的购买前须知；不确定时，请先联系我们。</p>
          <Link className="text-link" to="/pages/before-you-order">查看购买前须知 <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <section className="craftsmanship-next">
        <p className="section-label">CONTINUE EXPLORING</p>
        <h2>看见工艺之后，再选择适合你的作品。</h2>
        <div className="brand-story-actions">
          <Link className="button button-gold" to="/collections">浏览作品 <span aria-hidden="true">↗</span></Link>
          <Link className="text-link" to="/pages/master-custom">大师订制 <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </div>
  );
}

function MasterCustomContent() {
  const process = [
    ['01', '先说用途', '告诉我们作品的使用或展示场景、目的地，以及你最在意的部分。'],
    ['02', '确认方向', '围绕器型、尺寸、材料、装具、刻饰和预算范围，整理可行方向。'],
    ['03', '确认规格', '在报价前明确规格、交期、付款节点、配送方式及购买前须知。'],
    ['04', '制作与交付', '确认方案后进入制作，完成检查并按约定方式交付。'],
  ];

  return (
    <div className="master-custom-content">
      <section className="custom-intro">
        <p className="section-label">A CONVERSATION BEFORE A COMMISSION</p>
        <h2>订制不是从一张图片开始，<em>而是从一次清楚的沟通开始。</em></h2>
        <p>每一件订制作品都需要先了解用途、尺寸、材料、装具、预算和目的地。我们会先判断需求是否适合，再讨论可以实现的方向。</p>
        <Link className="button button-gold" to="/pages/contact">开始咨询 <span aria-hidden="true">↗</span></Link>
      </section>

      <section className="custom-scope">
        <div className="custom-section-heading">
          <p className="section-label">WHAT WE CAN DISCUSS</p>
          <h2>先把范围讲清楚，方案才有意义。</h2>
        </div>
        <div className="custom-scope-grid">
          <article><span>01</span><h3>器型与尺寸</h3><p>讨论整体比例、长度、重量和握持方式，具体以最终规格确认单为准。</p></article>
          <article><span>02</span><h3>材料与装具</h3><p>根据用途与风格讨论剑身、刀身、剑鞘和装具等组成部分。</p></article>
          <article><span>03</span><h3>刻饰与细节</h3><p>讨论纹样、文字和装饰位置；是否能够制作，需要结合工艺与授权判断。</p></article>
          <article><span>04</span><h3>收藏与展示</h3><p>历史作品和展示方向可以作为参考，但不代表当前一定有库存或可以直接复制。</p></article>
        </div>
      </section>

      <section className="custom-process">
        <div className="custom-section-heading">
          <p className="section-label">THE PROCESS</p>
          <h2>四个阶段，把想法变成可确认的方案。</h2>
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
          <h2>咨询时，准备这六项信息就够了。</h2>
          <ol>
            <li>希望制作或了解的作品类型</li>
            <li>使用、练习、收藏或展示场景</li>
            <li>期望尺寸、风格与材料方向</li>
            <li>是否需要刻饰或个性化细节</li>
            <li>预算范围与希望完成时间</li>
            <li>收货国家或地区</li>
          </ol>
        </div>
      </section>

      <section className="custom-notes">
        <div className="custom-section-heading">
          <p className="section-label">IMPORTANT NOTES</p>
          <h2>订制作品，需要比普通商品更多的确认。</h2>
        </div>
        <div className="custom-note-list">
          <p><strong>价格与交期</strong>需要在规格确认后单独报价，不能用目录商品价格或历史作品价格直接推断。</p>
          <p><strong>可行性</strong>不是所有图片、纹样、尺寸或历史作品都能照做，最终以工作室确认结果为准。</p>
          <p><strong>配送与法规</strong>目的地、承运商、税费和当地法规可能影响交付，咨询阶段需要提前说明。</p>
        </div>
        <Link className="text-link" to="/pages/before-you-order">先阅读购买前须知 <span aria-hidden="true">↗</span></Link>
      </section>
    </div>
  );
}

function BeforeYouOrderContent() {
  const checks = [
    ['01', '先确认用途', '练习、收藏、展示或礼赠，不同用途对应不同的规格、装具和注意事项。'],
    ['02', '再看商品规格', '请阅读尺寸、重量、材料、配件、状态和库存信息，不要只依据主图判断。'],
    ['03', '确认交期与配送', '现货和订制的交期不同；目的地、承运商、税费与当地规则需要单独确认。'],
    ['04', '最后再进入结账', '确认商品、数量、收货信息和适用政策后，再通过 Shopify Checkout 完成付款。'],
  ];

  return (
    <div className="before-order-content">
      <section className="before-order-intro">
        <p className="section-label">A CONSIDERED PURCHASE</p>
        <h2>在点击购买之前，<em>先把重要的事看清楚。</em></h2>
        <p>传统刀剑及相关作品不是普通的冲动型商品。请先确认用途、规格、目的地与当地要求；如果仍有疑问，欢迎在结账前联系我们。</p>
        <Link className="button button-gold" to="/pages/contact">咨询作品 <span aria-hidden="true">↗</span></Link>
      </section>

      <section className="before-order-checklist">
        <div className="before-order-heading">
          <p className="section-label">BEFORE CHECKOUT</p>
          <h2>四项检查，帮助你做出合适的选择。</h2>
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
          <h2>商品页上的信息，都有实际用途。</h2>
        </div>
        <div className="before-order-detail-list">
          <p><strong>用途与状态</strong>请确认作品适合练习、收藏、展示还是礼赠。开刃、未开刃、展示状态和可使用状态不能混为一谈，具体以商品页说明为准。</p>
          <p><strong>规格与手工差异</strong>尺寸和重量以商品页或确认单为准。天然材料、手工纹理、色泽和细部可能存在差异，图片不能完全代表实物。</p>
          <p><strong>库存与交期</strong>有库存不等于当天发货；订制、补货、装配和检查都可能影响交期，请以确认后的时间为准。</p>
          <p><strong>支付与结账</strong>购物车用于确认商品和数量，最终付款在 Shopify Checkout 完成。订单是否成立，以结账页面和店铺订单记录为准。</p>
        </div>
      </section>

      <section className="before-order-regulations">
        <div className="regulations-mark">知<br />悉</div>
        <div>
          <p className="section-label">DESTINATION &amp; REGULATIONS</p>
          <h2>配送能否完成，取决于目的地和具体商品。</h2>
          <p>不同国家或地区可能对刀剑、金属制品、木制装具、长度、锋利状态、进口申报和承运方式有不同要求。我们不会用“全球配送”一句话替代目的地确认。</p>
          <p>下单前请提供收货国家或地区；如有需要，也请向当地海关、承运商或相关机构确认。税费、清关、退运和当地限制可能由收货方承担。</p>
          <Link className="text-link" to="/pages/contact">提交目的地咨询 <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <section className="before-order-final">
        <p className="section-label">READY WHEN YOU ARE</p>
        <h2>看完仍然确定，再把作品放进购物车。</h2>
        <div className="brand-story-actions">
          <Link className="button button-gold" to="/collections">浏览商品 <span aria-hidden="true">↗</span></Link>
          <Link className="text-link" to="/pages/faq">查看常见问题 <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
    </div>
  );
}

function FaqContent() {
  const groups = [
    {
      label: 'PRODUCTS',
      title: '关于商品',
      items: [
        ['如何判断一件商品是否适合我？', '先看商品页的用途、尺寸、重量、材料、状态和配件说明。不同作品的手感与适用场景不同；如果你仍不确定，请在下单前联系我们。'],
        ['商品图片是否完全代表实物？', '商品图片用于展示整体外观，但天然材料、手工纹理、色泽和细节可能存在差异。具体规格以商品页和确认信息为准。'],
        ['历史作品是否可以直接购买或复制？', '不一定。历史订制、收藏、礼仪或展览作品可能只用于展示品牌和工艺方向，不代表当前有库存或可以复制。'],
      ],
    },
    {
      label: 'AVAILABILITY & CUSTOM',
      title: '库存与订制',
      items: [
        ['有库存是否代表可以马上发货？', '不一定。装配、检查、包装和目的地确认都可能影响发货时间。请以商品页或确认后的交期为准。'],
        ['可以订制尺寸、材料或刻饰吗？', '部分需求可以讨论，但需要结合用途、工艺可行性、材料和目的地确认。请通过大师订制页面提交完整需求。'],
        ['订制价格和交期如何确定？', '订制需要先确认器型、尺寸、材料、装具、刻饰、预算与目的地，再单独报价和确认交期，不能直接套用目录商品价格。'],
      ],
    },
    {
      label: 'PAYMENT & DELIVERY',
      title: '支付与配送',
      items: [
        ['如何完成付款？', '商品加入购物车后，最终通过 Shopify Checkout 完成结账和付款。订单是否成立，以结账页面和店铺订单记录为准。'],
        ['是否支持全球配送？', '不能一概而论。刀剑、金属制品和相关装具可能受到目的地法规、承运商和清关要求影响，请先提供收货国家或地区确认。'],
        ['税费和清关由谁负责？', '税费、清关、退运和当地限制可能由收货方承担，具体取决于目的地、承运商和当地规则。下单前请先确认。'],
      ],
    },
    {
      label: 'CARE & AFTER SALES',
      title: '保养与售后',
      items: [
        ['收到作品后应该如何保存？', '请先阅读对应商品的保养说明，避免潮湿、碰撞、长时间接触腐蚀性物质或不适当的使用环境。不同材料的护理方式可能不同。'],
        ['发现问题应该怎么办？', '请保留订单信息、外包装和现场照片，尽快通过联系页面说明问题。我们会根据商品状态、运输情况和订单约定进一步确认。'],
        ['可以退换货吗？', '退换条件以店铺政策和具体商品页面说明为准。订制、个性化或特殊状态商品可能有不同规则，请在付款前确认。'],
      ],
    },
  ];

  return (
    <div className="faq-content">
      <section className="faq-intro">
        <p className="section-label">QUESTIONS, ANSWERED</p>
        <h2>先把问题问清楚，<em>再选择下一步。</em></h2>
        <p>这里整理购买前最常见的问题。如果答案涉及具体商品、目的地或订制规格，请以商品页、店铺政策和最终确认信息为准。</p>
        <Link className="button button-gold" to="/pages/contact">还有问题？联系我们 <span aria-hidden="true">↗</span></Link>
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
        <h2>带上商品名称、目的地和你的用途，我们会更快帮你判断。</h2>
        <div className="brand-story-actions">
          <Link className="button button-gold" to="/pages/contact">提交咨询 <span aria-hidden="true">↗</span></Link>
          <Link className="text-link" to="/pages/before-you-order">购买前须知 <span aria-hidden="true">↗</span></Link>
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
    lede: '整理品牌資質、傳承記錄與公開節目資料，以可核對為先。',
    aside: '公開資料持續整理，未核驗內容不作為商品承諾。',
    ctaLabel: '提交資料',
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

const BUILT_IN_PAGE_TITLES = {
  'about-shen-guang-long': '品牌故事',
  craftsmanship: '工藝與傳承',
  'master-custom': '大師訂製',
  'before-you-order': '購買前須知',
  faq: '常見問題',
  'longquan-swordmaking': '龍泉刀劍工藝',
  'craftsmanship-materials': '工藝與材質',
  'credentials-media': '資質與媒體報導',
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
