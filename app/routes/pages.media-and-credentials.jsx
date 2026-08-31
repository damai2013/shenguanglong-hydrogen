import {Link} from 'react-router';
import {PageBannerMedia} from '~/components/PageBannerMedia';

export const meta = () => [{title: '沈廣隆｜資質與媒體報導'}];

export default function MediaAndCredentials() {
  const records = [
    {
      number: '01',
      label: '1885 · 傳承起點',
      title: '百年劍鋪的資質傳承',
      text: '沈廣隆鑄劍傳承始於 1885 年，家族工藝與劍鋪經營延續至今。',
      image: '/assets/reference/credential-01.png',
      alt: '沈廣隆品牌傳承公開資料',
    },
    {
      number: '02',
      label: '2010 · BRAND STATUS',
      title: '中華老字號',
      text: '沈廣隆劍鋪於 2010 年獲認定為中華老字號。',
      image: '/assets/reference/credential-02.png',
      alt: '沈廣隆品牌資質資料',
    },
    {
      number: '03',
      label: '2010 · INTANGIBLE HERITAGE',
      title: '非遺保護基地',
      text: '沈廣隆劍鋪於 2010 年成為龍泉寶劍鍛製技藝省級非物質文化遺產生產性保護基地。',
      image: '/assets/reference/credential-03.png',
      alt: '龍泉寶劍鍛製技藝公開資料',
    },
    {
      number: '04',
      label: 'TWO GENERATIONS',
      title: '沈新培與沈州',
      text: '第四代沈新培為國家級非物質文化遺產代表性傳承人；第五代沈州為浙江省非物質文化遺產代表性傳承人。',
      image: '/assets/reference/workshop-04.png',
      alt: '沈廣隆工坊與傳承相關影像',
    },
  ];
  const media = [
    ['《我有傳家寶》', 'CCTV-1', '節目圍繞傳統鑄劍技藝與沈氏傳承展開記錄。', '/assets/reference/media-01.png'],
    ['《手藝人》', 'CCTV-7', '透過匠人視角展示龍泉寶劍鍛製技藝。', '/assets/reference/media-02.png'],
    ['《傳承》', 'CCTV-9', '記錄傳統技藝的延續、人物與當代實踐。', '/assets/reference/media-03.png'],
    ['龍泉鑄劍文化專題', '鳳凰衛視', '圍繞龍泉鑄劍文化與沈氏技藝傳承進行報導。', '/assets/reference/workshop-02.jpg'],
    ['《中國面孔》', '山東衛視', '以人物為線索，展現沈廣隆鑄劍技藝與傳承。', '/assets/reference/workshop-03.jpg'],
    ['《百家姓》', '安徽衛視', '從家族與傳承的角度記錄沈氏鑄劍歷程。', '/assets/reference/workshop-01.jpg'],
  ];

  return (
    <div className="page editorial-page editorial-page-media-and-credentials">
      <header className="editorial-page-hero">
        <PageBannerMedia variant="credentials" />
        <p className="eyebrow">SHEN GUANG LONG · 資質與媒體報導</p>
        <h1>先看證據，<em>再說傳承。</em></h1>
        <p className="editorial-page-lede">
          從 1885 年家族製劍起點，到中華老字號、非遺保護基地與公開節目記錄。
        </p>
      </header>
      <div className="editorial-page-layout">
        <main className="editorial-page-content">
          <section className="credentials-opening editorial-section">
            <p className="section-label">PUBLIC RECORDS</p>
            <h2>一百多年，留下可查的記錄。</h2>
            <p>從 1885 年的家族製劍起點，到中華老字號、非遺保護基地、沈新培與沈州兩代傳承人的公開資歷，這些記錄共同呈現沈廣隆的品牌根基。</p>
          </section>

          <section className="credentials-records editorial-section">
            <div className="credentials-section-heading">
              <div><p className="section-label">CREDENTIALS · LINEAGE</p><h2>先看身份，再理解作品。</h2></div>
              <p>品牌資質說明沈廣隆的歷史與工藝背景；商品頁則提供每件作品的材料、尺寸、狀態與交付資訊。</p>
            </div>
            <div className="credentials-record-grid">
              {records.map((record) => (
                <article className="credentials-record-card" key={record.number}>
                  <img src={record.image} alt={record.alt} loading="lazy" />
                  <div className="credentials-record-card-body">
                    <span>{record.number}</span>
                    <p className="section-label">{record.label}</p>
                    <h3>{record.title}</h3>
                    <p>{record.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="credentials-bearers editorial-section">
            <div><p className="section-label">BEARER PROFILE</p><h2>兩代公開傳承人。</h2></div>
            <div className="credentials-bearer-list">
              <article><span>04</span><div><h3>沈新培</h3><p>中國工藝美術大師、國家級非物質文化遺產代表性傳承人。</p></div><Link className="text-link" to="/collections/shen-xinpei-master-custom">查看作品 <span aria-hidden="true">↗</span></Link></article>
              <article><span>05</span><div><h3>沈州</h3><p>浙江省工藝美術大師、浙江省非物質文化遺產代表性傳承人。</p></div><Link className="text-link" to="/collections/shen-zhou-master-custom">查看作品 <span aria-hidden="true">↗</span></Link></article>
            </div>
          </section>

          <section className="credentials-media editorial-section">
            <div className="credentials-section-heading">
              <div><p className="section-label">MEDIA RECORDS</p><h2>曾公開記錄的節目與專題。</h2></div>
              <p>以下節目與專題記錄，從技藝、人物與文化背景不同角度呈現沈廣隆及龍泉刀劍工藝。</p>
            </div>
            <div className="credentials-media-grid">
              {media.map(([title, channel, text, image], index) => (
                <article className="credentials-media-card" key={title}>
                  <img src={image} alt={`${title} 公開報導畫面`} loading="lazy" />
                  <div><span>{String(index + 1).padStart(2, '0')}</span><p className="section-label">{channel}</p><h3>{title}</h3><p>{text}</p></div>
                </article>
              ))}
            </div>
          </section>

          <section className="editorial-section editorial-source-note">
            <p className="section-label">SOURCES</p>
            <h2>查看原始資料，再回到商品本身。</h2>
            <p>想進一步了解品牌沿革、人物履歷與公開資質，可從下方入口查看原始資料；商品資訊請直接回到對應商品頁。</p>
            <div className="brand-story-actions"><a className="button button-gold" href="https://shen1885.com/pages/media-and-credentials" target="_blank" rel="noreferrer">品牌資質與媒體報導 ↗</a><Link className="text-link" to="/pages/about-shen-guang-long">返回品牌故事 <span aria-hidden="true">↗</span></Link></div>
          </section>
        </main>
      </div>
    </div>
  );
}
