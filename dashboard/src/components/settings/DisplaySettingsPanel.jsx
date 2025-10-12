import { Stack } from "@mantine/core";
import SettingToggle from "./SettingToggle";

/**
 * Display settings panel component
 */
export default function DisplaySettingsPanel({
  settings,
  loading,
  onToggle,
  onShowButtonsModal,
  onShowOfferModal,
  onShowOptionsModal,
  onShowQuantityModal,
  onShowPriceModal,
}) {
  return (
    <Stack gap="md">
      {/* Hide Default Buttons Toggle */}
      <SettingToggle
        label="إخفاء أزرار سلة الافتراضية"
        description='إخفاء أزرار "إضافة للسلة" و "اشتر الآن" الافتراضية من سلة في صفحات المنتجات التي تحتوي على باقات نشطة'
        checked={settings.hide_default_buttons}
        onChange={() => onToggle("hide_default_buttons")}
        disabled={loading.updating}
        onShowDemo={onShowButtonsModal}
        infoText="عند تفعيل هذا الخيار، سيتم إخفاء أزرار سلة الافتراضية في صفحات المنتجات التي لديها باقات نشطة فقط. سيظهر بدلاً منها زر العرض المركب الخاص بك. هذا يساعد على تجنب الارتباك ويشجع العملاء على اختيار العروض."
      />

      {/* Hide Salla Offer Modal Toggle */}
      <SettingToggle
        label="إخفاء نافذة عروض سلة الافتراضية"
        description="إخفاء النافذة المنبثقة الافتراضية من سلة التي تظهر عند وجود عروض خاصة على المنتج"
        checked={settings.hide_salla_offer_modal}
        onChange={() => onToggle("hide_salla_offer_modal")}
        disabled={loading.updating}
        onShowDemo={onShowOfferModal}
        infoText="هذا الخيار يخفي النافذة المنبثقة الافتراضية من سلة (s-offer-modal-type-products) فقط. النوافذ الأخرى من سلة ستعمل بشكل طبيعي."
      />

      {/* Hide Product Options Toggle */}
      <SettingToggle
        label="إخفاء خيارات المنتج الافتراضية"
        description="إخفاء قسم خيارات المنتج (salla-product-options) في المنتج المستهدف عند وجود عروض باقات نشطة عليه"
        checked={settings.hide_product_options}
        onChange={() => onToggle("hide_product_options")}
        disabled={loading.updating}
        onShowDemo={onShowOptionsModal}
        infoText="هذا الخيار يخفي قسم خيارات المنتج الافتراضي (salla-product-options) الموجود داخل النموذج (product-form) في صفحة المنتج المستهدف فقط عند وجود عروض باقات عليه. هذا يمنع الارتباك ويوجه العميل لاختيار الخيارات من نافذة العرض المركب."
      />

      {/* Hide Quantity Input Toggle */}
      <SettingToggle
        label="إخفاء حقل الكمية الافتراضي"
        description="إخفاء قسم الكمية (parent section of salla-quantity-input) في المنتج المستهدف عند وجود عروض باقات نشطة عليه"
        checked={settings.hide_quantity_input}
        onChange={() => onToggle("hide_quantity_input")}
        disabled={loading.updating}
        onShowDemo={onShowQuantityModal}
        infoText="هذا الخيار يخفي قسم الكمية الافتراضي الموجود داخل النموذج (product-form) في صفحة المنتج المستهدف فقط عند وجود عروض باقات عليه. يتم اختيار الكمية من خلال نافذة العرض المركب."
      />

      {/* Hide Price Section Toggle */}
      <SettingToggle
        label="إخفاء قسم السعر الافتراضي"
        description="إخفاء قسم السعر (price-wrapper وعناصر السعر) الموجود داخل النموذج (product-form) في المنتج المستهدف عند وجود عروض باقات نشطة عليه"
        checked={settings.hide_price_section}
        onChange={() => onToggle("hide_price_section")}
        disabled={loading.updating}
        onShowDemo={onShowPriceModal}
        infoText="هذا الخيار يخفي قسم السعر الافتراضي (price-wrapper, total-price, before-price) الموجود داخل النموذج (product-form) في صفحة المنتج المستهدف فقط عند وجود عروض باقات عليه. يتم عرض السعر من خلال نافذة العرض المركب بدلاً من ذلك."
        withDivider={false}
      />
    </Stack>
  );
}
