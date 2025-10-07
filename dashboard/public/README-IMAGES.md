# Dashboard Images

## salla-price.png

Currently using a placeholder image. Please replace with an actual screenshot showing the price section from a Salla product page.

The price section should show:
- Label "السعر" (Price)
- Price wrapper with total-price
- Before price (if on sale)
- Price display elements

Example HTML structure:
```html
<section class="flex bg-white p-5 sm:pb-0 rounded-md rounded-b-none">
  <div class="center-between w-full">
    <label class="form-label">
      <b class="block">السعر</b>
    </label>
    <div class="flex whitespace-nowrap price-wrapper gap-4 items-center">
      <div class="price_is_on_sale space-x-2">
        <h2 class="total-price text-red-800 font-bold text-xl">١٧٤ <i class="sicon-sar"></i></h2>
        <span class="before-price text-gray-500 line-through">٣٤٩ <i class="sicon-sar"></i></span>
      </div>
    </div>
  </div>
</section>
```
