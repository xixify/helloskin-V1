# Hello Skin – minimal storefront preview (multipage)

Clickable design preview for the Hello Skin store, built to be rebuilt 1:1 in WordPress with Elementor Pro and the free WooCommerce plugin. No paid WooCommerce extensions are assumed.

Live: https://xixify.github.io/helloskin-V1/

Prices, ratings and some copy are placeholders. The retail direction lives in [helloskin-v2](https://github.com/xixify/helloskin-v2).

## Pages and how each one is built in WordPress

| Preview page | WordPress / WooCommerce page | Built with |
|---|---|---|
| `index.html` | Home (static front page) | Elementor page: containers, Loop Grid (bestsellers), Image Box/Loop for categories |
| `shop.html` (`?cat=`, `?brand=`, `?s=`) | Shop, product category, brand and search archives | Theme Builder **Products Archive** template: Archive Title, Loop Grid, WooCommerce sorting dropdown, category links |
| `product.html?p=…` | Single product | Theme Builder **Single Product** template: Product Images, Title, Price, Add to Cart, Accordion, Related/Upsells |
| `cart.html` | Cart (`/cart/`) | Elementor Pro **Cart** widget: quantities, coupon, shipping options, cross-sells |
| `checkout.html` | Checkout (`/checkout/`) | Elementor Pro **Checkout** widget: billing fields, ship-to-different-address, order notes, order review, payment, terms |
| `order-received.html` | Order received (checkout endpoint) | Elementor Pro **Purchase Summary** widget, or WooCommerce's default thank-you page |
| `my-account.html` | My account (`/my-account/`) | Elementor Pro **My Account** widget: login/register, Dashboard, Orders, Addresses, Account details, Log out |
| `about.html`, `shipping-returns.html` | Regular pages | Elementor page: text, image, Accordion (FAQ) |
| `contact.html` | Contact page | Elementor Pro **Form** widget |
| Header / footer / cart drawer | Site-wide | Theme Builder Header/Footer, **Menu Cart** widget (slide-out, View cart + Checkout), Search widget, Form widget for the newsletter |

## Store settings this preview assumes (all free WooCommerce)

- Shipping zone Bangladesh: flat rate "Inside Dhaka" ৳60, "Outside Dhaka" ৳120, and Free shipping with a ৳2,000 minimum order.
- Payments: Cash on delivery and Direct bank transfer.
- Coupon `HELLO10` (10% off) is an example.
- Checkout districts come from WooCommerce's built-in Bangladesh states list.
- Policy text on `shipping-returns.html` is example copy to replace.

`minimal/` redirects to the root for old links.
