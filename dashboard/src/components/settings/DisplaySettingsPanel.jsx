import { useState } from "react";
import {
  Stack,
  Accordion,
  Text,
  TextInput,
  Button,
  Group,
  Badge,
  Alert,
  ActionIcon,
  Paper,
  Divider,
  Select,
} from "@mantine/core";
import {
  IconPlus,
  IconTrash,
  IconInfoCircle,
  IconEyeOff,
  IconCode,
  IconChevronDown,
  IconPalette,
  IconAlertTriangle,
  IconClock,
  IconClipboard,
  IconBulb,
  IconSettings,
} from "@tabler/icons-react";
import SettingToggle from "./SettingToggle";
import UpgradePrompt from "../common/UpgradePrompt";

/**
 * Display settings panel component
 */
export default function DisplaySettingsPanel({
  settings,
  loading,
  onToggle,
  planFeatures = {},
  onShowButtonsModal,
  onShowOfferModal,
  onShowOptionsModal,
  onShowQuantityModal,
  onShowPriceModal,
}) {
  const hasCustomSelectors = planFeatures.customHideSelectors !== false;
  const hasCouponControls = planFeatures.couponControls !== false;
  const [newSelector, setNewSelector] = useState("");
  const customSelectors = settings?.custom_hide_selectors || [];

  const handleAddSelector = () => {
    const trimmedSelector = newSelector.trim();
    if (!trimmedSelector) return;

    // Check if selector already exists
    if (customSelectors.includes(trimmedSelector)) {
      return;
    }

    // Add the new selector
    const updatedSelectors = [...customSelectors, trimmedSelector];
    onToggle("custom_hide_selectors", updatedSelectors);
    setNewSelector("");
  };

  const handleRemoveSelector = (selectorToRemove) => {
    const updatedSelectors = customSelectors.filter(
      (s) => s !== selectorToRemove
    );
    onToggle("custom_hide_selectors", updatedSelectors);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddSelector();
    }
  };

  return (
    <Stack gap="md">
      {/* Theme Selector */}
      <Paper withBorder p="md" radius="md" bg="blue.0">
        <Stack gap="sm">
          <Group gap="xs">
            <IconPalette size="1.2rem" />
            <Text fw={600} size="sm">
              الثيم الحالي المفعل على سلة
            </Text>
          </Group>
          <Select
            placeholder="اختر الثيم المستخدم في متجرك"
            value={settings.salla_theme || "default"}
            onChange={(value) => onToggle("salla_theme", value)}
            disabled={loading.updating}
            data={[
              { value: "basic", label: "الثيم الأساسي (Basic)" },
              { value: "raed", label: "ثيم رائد (Raed)" },
              { value: "wathiq", label: "ثيم واثق (Wathiq)" },
              { value: "on-demand", label: "طلب دعم ثيم مخصص (On Demand)" },
            ]}
            description="اختر الثيم المستخدم في متجرك لتطبيق التعديلات الصحيحة على عناصر الصفحة"
            comboboxProps={{
              position: "bottom",
              middlewares: { flip: false, shift: false },
            }}
          />
          <Alert icon={<IconBulb size="1rem" />} color="blue" variant="light">
            <Text size="xs">
              تأكد من اختيار الثيم الصحيح المستخدم في متجرك لضمان عمل الإعدادات
              بشكل صحيح. يمكنك معرفة الثيم من لوحة تحكم سلة في قسم المتجر →
              القوالب.
            </Text>
          </Alert>

          {/* On-Demand Theme Support Form */}
          {settings.salla_theme === "on-demand" && (
            <Paper withBorder p="md" radius="md" bg="orange.0">
              <Stack gap="sm">
                <Group gap="xs">
                  <IconClipboard
                    size="1.2rem"
                    color="var(--mantine-color-orange-9)"
                  />
                  <Text fw={600} size="sm" c="orange.9">
                    نموذج طلب دعم ثيم مخصص
                  </Text>
                </Group>
                <Alert
                  icon={<IconInfoCircle size="1rem" />}
                  color="orange"
                  variant="light"
                >
                  <Text size="xs">
                    يرجى ملء المعلومات التالية وسيقوم فريق الدعم بمراجعة ثيمك
                    وإضافة الدعم المناسب له في أقرب وقت ممكن.
                  </Text>
                </Alert>
                <TextInput
                  label="اسم الثيم"
                  placeholder="مثال: ثيم التاجر"
                  description="اسم الثيم المستخدم في متجرك"
                  size="sm"
                />
                <TextInput
                  label="رابط اختبار المنتج"
                  placeholder="https://yourstore.com/product/..."
                  description="رابط أي صفحة منتج في متجرك لفحص الثيم"
                  size="sm"
                />
                <TextInput
                  label="العناصر المراد إخفاؤها"
                  placeholder="مثال: زر الشراء، خيارات المنتج، السعر"
                  description="اذكر العناصر التي تريد إخفاءها عند تفعيل العروض"
                  size="sm"
                />
                <Button
                  color="orange"
                  variant="light"
                  size="sm"
                  fullWidth
                  leftSection={<IconInfoCircle size="1rem" />}
                >
                  إرسال الطلب للدعم
                </Button>
                <Group gap="xs" justify="center">
                  <IconClock
                    size="0.9rem"
                    color="var(--mantine-color-dimmed)"
                  />
                  <Text size="xs" c="dimmed">
                    عادة ما يتم الرد خلال 24-48 ساعة
                  </Text>
                </Group>
              </Stack>
            </Paper>
          )}
        </Stack>
      </Paper>

      <Divider my="xs" />

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
      />

      {/* Hide Coupon Section Toggle */}
      <div data-tour="locked-features">
        {!hasCouponControls && (
          <UpgradePrompt featureName="التحكم في قسم الكوبون" />
        )}
        <SettingToggle
          label="إخفاء قسم الكوبون"
          description="إخفاء قسم الكوبون في نافذة الباقة (يطبق على النسخة المكتبية والجوال)"
          checked={settings.hide_coupon_section}
          onChange={() => onToggle("hide_coupon_section")}
          disabled={loading.updating || !hasCouponControls}
          infoText="عند تفعيل هذا الخيار، سيتم إخفاء قسم إدخال كود الكوبون من نافذة الباقة على جميع الأجهزة. مفيد إذا كنت لا تستخدم أكواد الخصم في متجرك."
          withDivider={false}
        />
      </div>

      <Divider my="lg" />

      {/* Custom Hide Selectors - Advanced Section */}
      {!hasCustomSelectors && (
        <UpgradePrompt featureName="إخفاء عناصر مخصصة (متقدم)" />
      )}
      <Accordion variant="separated" chevron={<IconChevronDown size="1rem" />}>
        <Accordion.Item value="custom-selectors" disabled={!hasCustomSelectors}>
          <Accordion.Control icon={<IconCode size="1.2rem" />}>
            <Group gap="xs">
              <Text fw={500}>إخفاء عناصر مخصصة (متقدم)</Text>
              {customSelectors.length > 0 && (
                <Badge color="blue" variant="light" size="sm">
                  {customSelectors.length}
                </Badge>
              )}
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="md">
              {/* Info Alert */}
              <Alert
                icon={<IconInfoCircle size="1rem" />}
                title="إخفاء عناصر مخصصة"
                color="blue"
                variant="light"
              >
                <Text size="sm">
                  يمكنك إضافة محددات CSS أو معرفات (IDs) لإخفاء أي عنصر في صفحة
                  المنتج عند وجود عروض باقات نشطة. استخدم محددات CSS القياسية
                  مثل:
                </Text>
                <Stack gap="xs" mt="sm">
                  <Text size="sm" c="dimmed">
                    • <strong>.my-class</strong> - لإخفاء عنصر بكلاس معين
                  </Text>
                  <Text size="sm" c="dimmed">
                    • <strong>#my-id</strong> - لإخفاء عنصر بمعرف معين
                  </Text>
                  <Text size="sm" c="dimmed">
                    • <strong>div.product-badge</strong> - لإخفاء عنصر div بكلاس
                    معين
                  </Text>
                  <Text size="sm" c="dimmed">
                    • <strong>[data-product-badge]</strong> - لإخفاء عنصر بصفة
                    معينة
                  </Text>
                </Stack>
              </Alert>

              {/* Add Selector Input */}
              <Paper withBorder p="md" radius="md">
                <Stack gap="md">
                  <Group gap="xs">
                    <IconEyeOff size="1rem" />
                    <Text size="sm" fw={500}>
                      إضافة محدد جديد
                    </Text>
                  </Group>

                  <Group align="flex-end">
                    <TextInput
                      placeholder="مثال: .my-custom-class أو #my-element-id"
                      value={newSelector}
                      onChange={(e) => setNewSelector(e.target.value)}
                      onKeyPress={handleKeyPress}
                      style={{ flex: 1 }}
                      styles={{
                        input: { direction: "ltr", textAlign: "left" },
                      }}
                      leftSection={<IconCode size="1rem" />}
                      disabled={loading.updating || !hasCustomSelectors}
                    />
                    <Button
                      onClick={handleAddSelector}
                      disabled={
                        !newSelector.trim() ||
                        loading.updating ||
                        !hasCustomSelectors
                      }
                      leftSection={<IconPlus size="1rem" />}
                      size="sm"
                    >
                      إضافة
                    </Button>
                  </Group>
                </Stack>
              </Paper>

              {/* List of Selectors */}
              {customSelectors.length > 0 && (
                <>
                  <Text size="sm" fw={500} c="dimmed">
                    المحددات المخفية ({customSelectors.length})
                  </Text>
                  <Stack gap="xs">
                    {customSelectors.map((selector, index) => (
                      <Paper key={index} withBorder p="xs" radius="md">
                        <Group justify="space-between">
                          <Group gap="sm">
                            <IconCode size="0.9rem" color="gray" />
                            <Text
                              size="sm"
                              ff="monospace"
                              style={{ direction: "ltr", textAlign: "left" }}
                            >
                              {selector}
                            </Text>
                          </Group>
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            size="sm"
                            onClick={() => handleRemoveSelector(selector)}
                            disabled={loading.updating || !hasCustomSelectors}
                          >
                            <IconTrash size="1rem" />
                          </ActionIcon>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                </>
              )}

              {/* Warning */}
              {customSelectors.length > 0 && (
                <Alert
                  icon={<IconAlertTriangle size="1rem" />}
                  color="yellow"
                  variant="light"
                >
                  <Text size="sm">
                    تأكد من صحة المحددات. المحددات الخاطئة قد تؤثر على عرض
                    الصفحة بشكل غير متوقع.
                  </Text>
                </Alert>
              )}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Stack>
  );
}
