const MEDIA = {
  workshop: [
    {
      src: '/assets/reference/workshop-01.jpg',
      alt: '沈廣隆工作室建築與龍泉文化場景',
      caption: '龍泉 · 工作室與文化場景',
    },
    {
      src: '/assets/reference/workshop-03.jpg',
      alt: '沈廣隆工作室或工藝展示空間',
      caption: '工作台之外，還有作品的生活背景',
    },
    {
      src: '/assets/reference/workshop-04.png',
      alt: '龍泉寶劍鍛製技藝展示相關影像',
      caption: '工作台與工藝展示場景',
    },
  ],
  credentials: [
    {
      src: '/assets/reference/credential-01.png',
      alt: '龍泉寶劍鍛製技藝相關公開資料影像',
      caption: '公開資料 · 工藝背景',
    },
    {
      src: '/assets/reference/credential-02.png',
      alt: '非物質文化遺產相關標誌與資料影像',
      caption: '資質與傳承記錄',
    },
    {
      src: '/assets/reference/credential-03.png',
      alt: '龍泉刀劍文化公開展示影像',
      caption: '公開資料 · 資質與傳承',
    },
  ],
  media: [
    {
      src: '/assets/reference/media-01.png',
      alt: '傳統刀劍技藝節目公開畫面',
      caption: '節目記錄 · 傳統技藝',
    },
    {
      src: '/assets/reference/media-02.png',
      alt: '龍泉刀劍文化專題公開畫面',
      caption: '公開專題 · 龍泉文化',
    },
    {
      src: '/assets/reference/media-03.png',
      alt: '刀劍工藝人物節目公開畫面',
      caption: '人物記錄 · 工藝傳承',
    },
  ],
};

export function WorkshopMedia({kind = 'workshop', label = 'WORKSHOP NOTES', title, intro}) {
  const items = MEDIA[kind] || MEDIA.workshop;

  return (
    <section className={`workshop-media workshop-media-${kind}`} aria-label={title || label}>
      <div className="workshop-media-heading">
        <div>
          <p className="section-label">{label}</p>
          {title ? <h2>{title}</h2> : null}
        </div>
        {intro ? <p>{intro}</p> : null}
      </div>
      <div className="workshop-media-grid">
        {items.map((item, index) => (
          <figure className={`workshop-media-card workshop-media-card-${index + 1}`} key={item.src}>
            <img src={item.src} alt={item.alt} loading="lazy" />
            <figcaption><span>0{index + 1}</span>{item.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function WorkshopVideo({label = 'MOVING IMAGE', title = '讓工藝在影像裡動起來。', intro}) {
  return (
    <section className="workshop-video" aria-label={title}>
      <div className="workshop-video-heading">
        <div>
          <p className="section-label">{label}</p>
          <h2>{title}</h2>
        </div>
        {intro ? <p>{intro}</p> : null}
      </div>
      <div className="workshop-video-frame">
        <video controls muted loop playsInline preload="metadata" poster="/assets/reference/workshop-01.jpg">
          <source src="/assets/reference/workshop-demo.mp4" type="video/mp4" />
          你的瀏覽器不支援影片播放。
        </video>
        <span className="workshop-video-caption">真實工作室影像 · 工藝現場記錄</span>
      </div>
    </section>
  );
}
