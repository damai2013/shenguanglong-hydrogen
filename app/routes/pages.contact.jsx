import {Link} from 'react-router';

export const meta = () => [{title: 'Shen Guang Long | Contact'}];

export default function Contact() {
  return (
    <div className="page editorial-page editorial-page-contact">
      <header className="editorial-page-hero">
        <p className="eyebrow">SHEN GUANG LONG · CONTACT</p>
        <h1>Begin with <em>a conversation.</em></h1>
        <p className="editorial-page-lede">
          Tell us what you are looking for, where it is going, and how you intend to use it. We will help you find the next step.
        </p>
      </header>
      <div className="editorial-page-layout">
        <main className="editorial-page-content">
          <section className="contact-card editorial-section">
            <p className="section-label">DIRECT CONTACT</p>
            <h2>联系沈广隆。</h2>
            <p>商品、定制、规格、配送和目的地要求，都可以先通过以下方式咨询。</p>
            <div className="contact-methods">
              <a className="contact-method" href="mailto:service@shenguanglong1885.com">
                <span className="contact-method-label">EMAIL</span>
                <strong>service@shenguanglong1885.com</strong>
              </a>
              <a className="contact-method" href="tel:08080857905">
                <span className="contact-method-label">PHONE</span>
                <strong>08080857905</strong>
              </a>
            </div>
          </section>
          <section className="editorial-section">
            <p className="section-label">WHAT TO INCLUDE</p>
            <h2>一次说明关键信息。</h2>
            <ul className="contact-brief-list">
              <li>想了解的商品名称或商品链接；</li>
              <li>用途、尺寸、材料或外观偏好；</li>
              <li>目的地国家/地区，以及是否有特殊运输要求；</li>
              <li>希望确认的库存、交期、配件或保养问题。</li>
            </ul>
            <p>如果是定制作品，请尽量同时说明预算范围和计划时间，方便我们判断下一步沟通方式。</p>
          </section>
          <section className="editorial-section contact-next-steps">
            <p className="section-label">BEFORE YOU WRITE</p>
            <h2>先了解，再做选择。</h2>
            <div className="contact-links">
              <Link className="text-link" to="/pages/before-you-order">购买前须知 <span aria-hidden="true">↗</span></Link>
              <Link className="text-link" to="/pages/faq">常见问题 <span aria-hidden="true">↗</span></Link>
              <Link className="text-link" to="/collections">浏览作品 <span aria-hidden="true">↗</span></Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
