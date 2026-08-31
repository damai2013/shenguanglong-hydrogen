import {Link} from 'react-router';
import {PageBannerMedia} from '~/components/PageBannerMedia';

export const meta = () => [{title: '沈廣隆｜聯絡諮詢'}];

export default function Contact() {
  return (
    <div className="page editorial-page editorial-page-contact">
      <header className="editorial-page-hero">
        <PageBannerMedia variant="workshop" />
        <p className="eyebrow">SHEN GUANG LONG · 聯絡諮詢</p>
        <h1><span className="hero-heading-line">先從，</span><br /><em><span className="hero-heading-line">一次清楚的</span><br /><span className="hero-heading-line">溝通開始。</span></em></h1>
        <p className="editorial-page-lede">
          告訴我們你想找什麼、準備寄往哪裡，以及預計如何使用；我們會協助你確認下一步。
        </p>
      </header>
      <div className="editorial-page-layout">
        <main className="editorial-page-content">
          <section className="contact-card editorial-section">
            <p className="section-label">DIRECT CONTACT</p>
            <h2>聯絡沈廣隆。</h2>
            <p>商品、訂製、規格、配送和目的地要求，都可以先透過以下方式諮詢。</p>
            <div className="contact-methods contact-methods-expanded">
              <div className="contact-methods-qr">
                <a className="contact-method contact-method-qr" href="https://wa.me/8613372508696" rel="noreferrer" target="_blank">
                  <div>
                    <span className="contact-method-label">WhatsApp</span>
                    <strong>掃描 QR Code 聯絡</strong>
                    <small>使用手機掃描，或點擊 QR Code 開啟 WhatsApp</small>
                  </div>
                  <img src="/assets/reference/whatsapp-qr.png" alt="沈廣隆 WhatsApp 聯絡 QR Code" loading="lazy" />
                </a>
                <a className="contact-method contact-method-qr" href="https://line.me/ti/p/~shenguanglong1885" rel="noreferrer" target="_blank">
                  <div>
                    <span className="contact-method-label">LINE</span>
                    <strong>掃描 QR Code 聯絡</strong>
                    <small>使用手機掃描，或點擊 QR Code 開啟 LINE</small>
                  </div>
                  <img src="/assets/reference/line-qr.png" alt="沈廣隆 LINE 聯絡 QR Code" loading="lazy" />
                </a>
                <div className="contact-method contact-method-wechat">
                  <div>
                    <span className="contact-method-label">微信</span>
                    <strong>Shen Guanglong</strong>
                    <small>請掃描 QR Code，備註「官網諮詢」</small>
                  </div>
                  <img src="/assets/reference/wechat-qr.jpg" alt="沈廣隆微信聯絡 QR Code" loading="lazy" />
                </div>
              </div>
              <div className="contact-methods-email">
                <a className="contact-method" href="mailto:sales@shenguanglong1885.com">
                  <span className="contact-method-label">商品諮詢郵箱</span>
                  <strong>sales@shenguanglong1885.com</strong>
                  <small>適合商品、報價與配送諮詢</small>
                </a>
                <a className="contact-method" href="mailto:service@shenguanglong1885.com">
                  <span className="contact-method-label">客服郵箱</span>
                  <strong>service@shenguanglong1885.com</strong>
                  <small>適合售後與一般服務問題</small>
                </a>
              </div>
            </div>
            <section className="contact-address" aria-label="公開聯絡地址">
              <div>
                <p className="contact-method-label">公開聯絡地址</p>
                <address>浙江省麗水市龍泉市公園路 123 號<br />郵編 323799 · 中國</address>
              </div>
              <p>如需到訪、寄送文件或確認收貨安排，請先透過 LINE、WhatsApp、微信或電子郵件與我們確認。</p>
            </section>
          </section>
          <section className="editorial-section">
            <p className="section-label">WHAT TO INCLUDE</p>
            <h2>一次說明關鍵資訊。</h2>
            <ul className="contact-brief-list">
              <li>想了解的商品名稱或商品連結；</li>
              <li>用途、尺寸、材料或外觀偏好；</li>
              <li>目的地國家／地區，以及是否有特殊運輸要求；</li>
              <li>希望確認的庫存、交期、配件或保養問題。</li>
            </ul>
            <p>如果是訂製作品，請盡量同時說明預算範圍和計畫時間，方便我們判斷下一步溝通方式。</p>
          </section>
          <section className="editorial-section contact-next-steps">
            <p className="section-label">BEFORE YOU WRITE</p>
            <h2>先了解，再做選擇。</h2>
            <div className="contact-links">
              <Link className="text-link" to="/pages/before-you-order">購買前須知 <span aria-hidden="true">↗</span></Link>
              <Link className="text-link" to="/pages/faq">常見問題 <span aria-hidden="true">↗</span></Link>
              <Link className="text-link" to="/collections">瀏覽作品 <span aria-hidden="true">↗</span></Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
