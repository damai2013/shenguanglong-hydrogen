import {useState} from 'react';
import {Link} from 'react-router';

export function ConsultationFloat() {
  const [open, setOpen] = useState(false);

  return (
    <div className={`consultation-float ${open ? 'is-open' : ''}`}>
      {open && (
        <section id="consultation-float-panel" className="consultation-float-panel" aria-label="聯絡諮詢">
          <div className="consultation-float-panel-heading">
            <div>
              <p className="section-label">SHEN GUANG LONG</p>
              <h2>需要協助選擇作品？</h2>
            </div>
            <button
              className="consultation-float-close reset"
              type="button"
              onClick={() => setOpen(false)}
              aria-label="關閉聯絡諮詢"
            >
              ×
            </button>
          </div>
          <p>如果你對規格、用途、配送或訂製有疑問，可以直接聯絡我們。</p>
          <div className="consultation-float-actions">
            <a href="mailto:service@shenguanglong1885.com">發送電子郵件</a>
            <a href="tel:08080857905">撥打電話</a>
            <Link to="/pages/contact" onClick={() => setOpen(false)}>
              查看完整聯絡方式
            </Link>
          </div>
        </section>
      )}
      <button
        className="consultation-float-trigger"
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="consultation-float-panel"
      >
        {open ? '關閉' : '聯絡諮詢'}
      </button>
    </div>
  );
}
