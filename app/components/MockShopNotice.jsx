export function MockShopNotice() {
  return (
    <section
      className="mock-shop-notice"
      aria-labelledby="mock-shop-notice-heading"
    >
      <div className="inner">
        <h2 id="mock-shop-notice-heading">目前顯示本地預覽目錄</h2>
        <p>
          尚未連接 Shopify 商品資料，因此商品列表會使用預覽內容。
        </p>
        <p>
          連接店鋪後，商品、庫存與購物車會由 Shopify 提供。
        </p>
      </div>
    </section>
  );
}
