import {useEffect, useState} from 'react';

const ANNOUNCEMENTS = [
  '新作系列即將登場｜訂閱電子報，優先收到發售通知',
  '客製諮詢開放中｜告訴我們你的用途與尺寸，我們會回覆製作方向',
  '全站作品皆由工作室逐件確認｜商品細節與交付時間以訂單確認為準',
];

export function AnnouncementBar() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % ANNOUNCEMENTS.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  const goTo = (index) => {
    setActiveIndex((index + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length);
  };

  return (
    <section
      aria-label="店鋪公告"
      className="announcement-bar"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="announcement-bar-inner">
        <button
          aria-label="上一則公告"
          className="announcement-control reset"
          onClick={() => goTo(activeIndex - 1)}
          type="button"
        >
          ←
        </button>
        <p aria-live="polite" className="announcement-message">
          {ANNOUNCEMENTS[activeIndex]}
        </p>
        <button
          aria-label="下一則公告"
          className="announcement-control reset"
          onClick={() => goTo(activeIndex + 1)}
          type="button"
        >
          →
        </button>
        <div className="announcement-dots" role="tablist" aria-label="公告切換">
          {ANNOUNCEMENTS.map((announcement, index) => (
            <button
              aria-label={`查看公告 ${index + 1}`}
              aria-selected={activeIndex === index}
              className={`announcement-dot${activeIndex === index ? ' is-active' : ''}`}
              key={announcement}
              onClick={() => goTo(index)}
              role="tab"
              type="button"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
