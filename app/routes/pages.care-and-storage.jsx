import {Link} from 'react-router';
import {WorkshopMedia} from '~/components/WorkshopMedia';
import {PageBannerMedia} from '~/components/PageBannerMedia';

export const meta = () => [{title: '沈廣隆｜保養與保存'}];

export default function CareAndStorage() {
  return (
    <div className="page editorial-page editorial-page-care-and-storage">
      <header className="editorial-page-hero">
        <PageBannerMedia variant="workshop" />
        <p className="eyebrow">SHEN GUANG LONG · 保養指南</p>
        <h1>讓作品，<em>留在自己的狀態。</em></h1>
        <p className="editorial-page-lede">
          傳統刀劍與金屬工藝作品的基礎保存、清潔與安全使用原則。
        </p>
      </header>
      <div className="editorial-page-layout">
        <main className="editorial-page-content">
          <section className="editorial-section">
            <p className="section-label">AFTER HANDLING</p>
            <h2>保持乾燥、清潔與穩定。</h2>
            <p>接觸金屬表面後，使用乾淨柔軟的布擦去指紋和水分。不要讓作品長時間接觸潮氣、鹽分或酸性材料。</p>
            <p>清潔和上油前，應先確認當前商品的材料、表面處理和店家說明；不同作品不應使用同一種護理方式。</p>
          </section>
          <WorkshopMedia
            label="CARE IN CONTEXT"
            title="保存不是附加項，而是作品的一部分。"
            intro="工作室與作品影像，提示金屬、木作與展示環境的關係；具體護理仍以商品說明為準。"
          />
          <section className="editorial-section">
            <p className="section-label">STORAGE</p>
            <h2>讓作品遠離潮濕與誤用。</h2>
            <p>使用穩固、乾燥、避免陽光直射的收納位置，並遠離兒童、寵物和未受訓練的使用者。</p>
            <p>涉及開刃作品、運輸或當地法規的問題，請在購買前先閱讀購買指南並聯絡我們確認。</p>
            <Link className="text-link" to="/pages/before-you-order">查看購買前須知 <span aria-hidden="true">↗</span></Link>
          </section>
        </main>
      </div>
    </div>
  );
}
