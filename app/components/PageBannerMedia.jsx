const BANNER_MEDIA = {
  workshop: {
    src: '/assets/reference/workshop-01.jpg',
    alt: '沈廣隆工作室與龍泉文化場景',
  },
  craft: {
    src: '/assets/reference/workshop-03.jpg',
    alt: '傳統刀劍工藝與工作室展示場景',
  },
  master: {
    src: '/assets/reference/workshop-04.png',
    alt: '龍泉刀劍鍛製技藝展示場景',
  },
  materials: {
    src: '/assets/reference/workshop-02.jpg',
    alt: '傳統刀劍作品與材質細節',
  },
  credentials: {
    src: '/assets/reference/credential-01.png',
    alt: '龍泉刀劍鍛製技藝公開資料影像',
  },
  media: {
    src: '/assets/reference/media-01.png',
    alt: '傳統刀劍技藝節目公開畫面',
  },
  home: {
    type: 'video',
    src: '/assets/reference/workshop-demo.mp4',
    poster: '/assets/reference/workshop-01.jpg',
  },
};

export function PageBannerMedia({variant = 'workshop'}) {
  const media = BANNER_MEDIA[variant] || BANNER_MEDIA.workshop;

  return (
    <div className={`page-banner-media page-banner-media-${variant}`} aria-hidden="true">
      {media.type === 'video' ? (
        <video autoPlay loop muted playsInline poster={media.poster} preload="metadata">
          <source src={media.src} type="video/mp4" />
        </video>
      ) : (
        <img src={media.src} alt="" loading="eager" />
      )}
    </div>
  );
}
