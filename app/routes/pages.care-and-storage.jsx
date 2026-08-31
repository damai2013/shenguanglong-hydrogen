import {Link} from 'react-router';

export const meta = () => [{title: 'Shen Guang Long | Care & Storage'}];

export default function CareAndStorage() {
  return (
    <div className="page editorial-page editorial-page-care-and-storage">
      <header className="editorial-page-hero">
        <p className="eyebrow">SHEN GUANG LONG · CARE GUIDE</p>
        <h1>Care with <em>intention.</em></h1>
        <p className="editorial-page-lede">
          Basic storage and handling principles for traditional blades and metalwork.
        </p>
      </header>
      <div className="editorial-page-layout">
        <main className="editorial-page-content">
          <section className="editorial-section">
            <p className="section-label">AFTER HANDLING</p>
            <h2>保持干燥、清洁和稳定。</h2>
            <p>接触金属表面后，使用干净柔软的布擦去指纹和水分。不要让作品长时间接触潮气、盐分或酸性材料。</p>
            <p>清洁和上油前，应先确认当前商品的材料、表面处理和卖家说明；不同作品不应使用同一种护理方式。</p>
          </section>
          <section className="editorial-section">
            <p className="section-label">STORAGE</p>
            <h2>让作品远离潮湿与误用。</h2>
            <p>使用稳固、干燥、避免阳光直射的收纳位置，并远离儿童、宠物和未经训练的使用者。</p>
            <p>涉及开刃作品、运输或当地法规的问题，请在购买前先阅读购买指南并联系我们确认。</p>
            <Link className="text-link" to="/pages/before-you-order">查看购买前须知 <span aria-hidden="true">↗</span></Link>
          </section>
        </main>
        <aside className="editorial-page-aside">
          <span className="aside-index">CARE NOTES</span>
          <p>具体护理方法，以当前商品页和随货说明为准。</p>
          <Link className="text-link" to="/pages/contact">咨询具体作品 <span aria-hidden="true">↗</span></Link>
        </aside>
      </div>
    </div>
  );
}
