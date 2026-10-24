# JAVI COFFEE Style Guide

## Brand foundation

- Primary: JAVI gold `#CDA434`; hover gold `#B38B22`.
- Supporting colors: coffee `#6F4E37`, charcoal `#10100F`, surface `#1A1A18`, warm white `#F5F3EE`, muted text `#A7A49C`.
- Status colors: success `#2E9B63`, danger `#D84A43`; Zalo blue `#0878FF` is reserved for contact actions.
- Shared CSS tokens are defined in `Shared/Frontend/css/brand-tokens.css` and imported by `global.css` (admin) and `storefront.css` (shop).

## Typography

- Use Be Vietnam Pro (400, 500, 600, 700, 800) for Vietnamese UI text.
- Use `var(--font-main)` in CSS instead of adding page-specific font stacks.
- Keep headings and controls in sentence case; do not apply uppercase globally to Vietnamese text.

## Icons

- Use Bootstrap Icons (Bootstrap 5 icon set), served locally from `/vendor/bootstrap-icons/bootstrap-icons.min.css`: `<i class="bi bi-plus-lg"></i>`. Do not mix other icon fonts.
- Prefer a familiar icon paired with a tooltip or accessible label for icon-only actions.
- Use the brand blue for Zalo and a neutral gold treatment for phone/contact actions.

## Usage

- Staff and customer pages should consume the shared CSS variables rather than defining a separate brand palette.
- Product photography and video areas are content slots; add approved JAVI assets there when they are ready.

## Compact spacing

- Bo góc không làm tăng kích thước nội dung. Khung thông báo dùng padding 8px 10px, chiều cao tự nhiên tối thiểu 52px; không cố định 80px. Icon toast 24px, nút đóng 24px; nội dung dài xuống dòng và cuộn khi cần.
- Header/footer form dùng khoảng đệm 8–10px theo chiều dọc; giữ nút trong vùng cố định, chỉ cuộn nội dung.
- Giữ cỡ chữ đọc được; giảm khoảng đệm trước khi giảm chữ hoặc ép chiều cao. Không dùng height hoặc min-height lớn chỉ để tạo khung bo góc.
