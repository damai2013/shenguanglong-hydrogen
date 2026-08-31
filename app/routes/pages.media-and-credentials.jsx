import {Link} from 'react-router';

export const meta = () => [{title: 'Shen Guang Long | Credentials & Media'}];

export default function MediaAndCredentials() {
  return (
    <div className="page editorial-page editorial-page-media-and-credentials">
      <header className="editorial-page-hero">
        <p className="eyebrow">SHEN GUANG LONG · CREDENTIALS & MEDIA</p>
        <h1>Evidence, <em>not noise.</em></h1>
        <p className="editorial-page-lede">
          A place for verified workshop information, published coverage, and supporting materials.
        </p>
      </header>
      <div className="editorial-page-layout">
        <main className="editorial-page-content">
          <section className="editorial-section">
            <p className="section-label">PUBLIC INFORMATION</p>
            <h2>资料会逐步整理。</h2>
            <p>我们只发布能够核对来源的品牌历史、工艺资料、证书和媒体报道。未经确认的年份、人物身份和荣誉，不会作为事实展示。</p>
            <p>当资料完成核验后，这里会按“品牌历史、工艺与传承、证书与报道”分类更新。</p>
          </section>
          <section className="editorial-section">
            <p className="section-label">CURRENT REFERENCE</p>
            <h2>先从品牌故事开始。</h2>
            <p>目前可公开查阅的品牌背景与传承结构，集中在品牌故事和工艺页面。</p>
            <Link className="text-link" to="/pages/about-shen-guang-long">查看品牌故事 <span aria-hidden="true">↗</span></Link>
          </section>
        </main>
      </div>
    </div>
  );
}
