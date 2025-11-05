import { useState, useEffect } from "react";
import {
  Stack,
  Divider,
  Grid,
  Select,
  NumberInput,
  TextInput,
  ColorInput,
  Group,
  Button,
  Alert,
  Text,
} from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import useSettingsStore from "../../stores/useSettingsStore";
import SettingToggle from "./SettingToggle";
import IconPicker from "./IconPicker";

/**
 * Free shipping settings panel component
 */
export default function FreeShippingSettingsPanel({
  settings,
  loading,
  onToggle,
}) {
  // Free shipping banner customization state
  const freeShipping = settings.free_shipping || {};

  const [freeShippingMode, setFreeShippingMode] = useState(
    freeShipping.mode || "always"
  );
  const [freeShippingMinPrice, setFreeShippingMinPrice] = useState(
    freeShipping.min_price || 0
  );
  const [freeShippingText, setFreeShippingText] = useState(
    freeShipping.text || "شحن مجاني لهذه الباقة"
  );
  const [freeShippingProgressText, setFreeShippingProgressText] = useState(
    freeShipping.progress_text || "أضف {amount} ريال للحصول على شحن مجاني"
  );
  const [freeShippingBgColor, setFreeShippingBgColor] = useState(
    freeShipping.bg_color || "#10b981"
  );
  const [freeShippingTextColor, setFreeShippingTextColor] = useState(
    freeShipping.text_color || "#ffffff"
  );
  const [freeShippingIcon, setFreeShippingIcon] = useState(
    freeShipping.icon ||
      '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path><path d="M15 18H9"></path><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path><circle cx="17" cy="18" r="2"></circle><circle cx="7" cy="18" r="2"></circle></svg>'
  );
  const [freeShippingProgressColor, setFreeShippingProgressColor] = useState(
    freeShipping.progress_color || "#ffffff"
  );
  const [freeShippingProgressBgColor, setFreeShippingProgressBgColor] =
    useState(freeShipping.progress_bg_color || "rgba(255, 255, 255, 0.3)");
  const [freeShippingBorderRadius, setFreeShippingBorderRadius] = useState(
    freeShipping.border_radius || 12
  );
  const [freeShippingShowInStep, setFreeShippingShowInStep] = useState(
    freeShipping.show_in_step || "review"
  );

  // Sync local state with fetched settings
  useEffect(() => {
    if (settings.free_shipping) {
      const fs = settings.free_shipping;
      setFreeShippingMode(fs.mode || "always");
      setFreeShippingMinPrice(fs.min_price || 0);
      setFreeShippingText(fs.text || "شحن مجاني لهذه الباقة");
      setFreeShippingProgressText(
        fs.progress_text || "أضف {amount} ريال للحصول على شحن مجاني"
      );
      setFreeShippingBgColor(fs.bg_color || "#10b981");
      setFreeShippingTextColor(fs.text_color || "#ffffff");
      setFreeShippingIcon(
        fs.icon ||
          '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path><path d="M15 18H9"></path><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path><circle cx="17" cy="18" r="2"></circle><circle cx="7" cy="18" r="2"></circle></svg>'
      );
      setFreeShippingProgressColor(fs.progress_color || "#ffffff");
      setFreeShippingProgressBgColor(
        fs.progress_bg_color || "rgba(255, 255, 255, 0.3)"
      );
      setFreeShippingBorderRadius(fs.border_radius || 12);
      setFreeShippingShowInStep(fs.show_in_step || "review");
    }
  }, [settings.free_shipping]);

  const handleSaveFreeShippingSettings = async () => {
    const notificationId = "update-free-shipping";
    notifications.show({
      id: notificationId,
      loading: true,
      title: "جاري الحفظ...",
      message: "جاري تحديث إعدادات لافتة الشحن المجاني...",
      autoClose: false,
      withCloseButton: false,
    });

    try {
      await useSettingsStore.getState().updateSettings({
        free_shipping: {
          ...settings.free_shipping,
          mode: freeShippingMode,
          min_price: freeShippingMinPrice,
          text: freeShippingText,
          progress_text: freeShippingProgressText,
          bg_color: freeShippingBgColor,
          text_color: freeShippingTextColor,
          icon: freeShippingIcon,
          progress_color: freeShippingProgressColor,
          progress_bg_color: freeShippingProgressBgColor,
          border_radius: freeShippingBorderRadius,
          show_in_step: freeShippingShowInStep,
        },
      });

      notifications.update({
        id: notificationId,
        loading: false,
        title: "تم الحفظ بنجاح",
        message: "تم تحديث إعدادات لافتة الشحن المجاني بنجاح",
        color: "green",
        icon: <IconCheck size="1rem" />,
        autoClose: 3000,
      });
    } catch (error) {
      notifications.update({
        id: notificationId,
        loading: false,
        title: "خطأ في الحفظ",
        message:
          error.message || "حدث خطأ أثناء تحديث إعدادات لافتة الشحن المجاني",
        color: "red",
        icon: <IconX size="1rem" />,
        autoClose: 5000,
      });
    }
  };

  return (
    <Stack gap="md">
      {/* Enable Free Shipping Banner Toggle */}
      <SettingToggle
        label="تفعيل لافتة الشحن المجاني"
        description="عرض لافتة جذابة تعلم العملاء بالشحن المجاني في خطوة الهدايا داخل نافذة الباقة"
        checked={freeShipping.enabled || false}
        onChange={() => onToggle("free_shipping.enabled")}
        disabled={loading.updating}
        infoText="اللافتة تظهر في خطوة الهدايا المجانية داخل نافذة الباقة. يمكنك التحكم في النصوص والألوان والأيقونة، وكذلك إضافة حد أدنى لسعر الطلب لعرض شريط التقدم."
        withDivider={false}
      />

      {/* Customization Options - Only show if enabled */}
      {freeShipping.enabled && (
        <>
          <Divider label="تخصيص لافتة الشحن المجاني" labelPosition="center" />

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="إظهار لافتة الشحن المجاني في الخطوة"
                value={freeShippingShowInStep}
                onChange={setFreeShippingShowInStep}
                data={[
                  { value: "bundles", label: "اختيار الباقة" },
                  { value: "target_variants", label: "تحديد الخيارات" },
                  { value: "free_gifts", label: "الهدايا المجانية" },
                  { value: "discounted", label: "المنتجات المخفضة" },
                  { value: "review", label: "مراجعة الطلب" },
                  { value: "all", label: "جميع الخطوات" },
                ]}
                description="اختر في أي خطوة ستظهر لافتة الشحن المجاني"
                comboboxProps={{
                  position: "bottom",
                  middlewares: { flip: false, shift: false },
                }}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="وضع العرض"
                placeholder="اختر وضع العرض"
                value={freeShippingMode}
                onChange={setFreeShippingMode}
                data={[
                  {
                    value: "always",
                    label: "دائماً (لجميع الطلبات)",
                  },
                  {
                    value: "min_price",
                    label: "بناءً على حد أدنى للسعر",
                  },
                  { value: "hidden", label: "مخفي (لا يظهر)" },
                ]}
                description="متى تظهر لافتة الشحن المجاني"
                comboboxProps={{
                  position: "bottom",
                  middlewares: { flip: false, shift: false },
                }}
              />
            </Grid.Col>

            {freeShippingMode === "min_price" && (
              <Grid.Col span={{ base: 12, md: 6 }}>
                <NumberInput
                  label="الحد الأدنى للسعر (ريال)"
                  placeholder="0"
                  value={freeShippingMinPrice}
                  onChange={setFreeShippingMinPrice}
                  min={0}
                  description="الحد الأدنى لسعر الطلب للشحن المجاني"
                />
              </Grid.Col>
            )}

            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="نص الرسالة"
                placeholder="مثال: شحن مجاني لهذه الباقة"
                value={freeShippingText}
                onChange={(event) =>
                  setFreeShippingText(event.currentTarget.value)
                }
                description="النص الذي يظهر عند الوصول للحد الأدنى"
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="نص التقدم"
                placeholder="مثال: أضف {amount} ريال للحصول على شحن مجاني"
                value={freeShippingProgressText}
                onChange={(event) =>
                  setFreeShippingProgressText(event.currentTarget.value)
                }
                description="النص الذي يظهر قبل الوصول للحد الأدنى. استخدم {amount} للمبلغ المتبقي"
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <IconPicker
                label="الأيقونة"
                description="اختر أيقونة احترافية لتظهر بجانب رسالة الشحن المجاني"
                value={freeShippingIcon}
                onChange={setFreeShippingIcon}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <ColorInput
                label="لون الخلفية"
                value={freeShippingBgColor}
                onChange={setFreeShippingBgColor}
                format="hex"
                swatches={[
                  "#10b981",
                  "#3b82f6",
                  "#f59e0b",
                  "#ef4444",
                  "#8b5cf6",
                ]}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <ColorInput
                label="لون النص"
                value={freeShippingTextColor}
                onChange={setFreeShippingTextColor}
                format="hex"
                swatches={["#ffffff", "#000000", "#1f2937", "#f3f4f6"]}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <ColorInput
                label="لون شريط التقدم"
                value={freeShippingProgressColor}
                onChange={setFreeShippingProgressColor}
                format="hex"
                swatches={["#ffffff", "#10b981", "#3b82f6", "#f59e0b"]}
                description="لون التعبئة في شريط التقدم"
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <ColorInput
                label="لون خلفية شريط التقدم"
                value={freeShippingProgressBgColor}
                onChange={setFreeShippingProgressBgColor}
                format="rgba"
                swatches={[
                  "rgba(255, 255, 255, 0.3)",
                  "rgba(255, 255, 255, 0.5)",
                  "rgba(0, 0, 0, 0.1)",
                  "rgba(0, 0, 0, 0.2)",
                ]}
                description="لون الخلفية للشريط مع الشفافية"
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput
                label="نصف قطر الحواف (Border Radius)"
                value={freeShippingBorderRadius}
                onChange={setFreeShippingBorderRadius}
                min={0}
                max={50}
                step={1}
                suffix=" px"
                description="درجة استدارة حواف اللافتة (0 = حواف حادة، 50 = استدارة كاملة)"
              />
            </Grid.Col>
          </Grid>

          <Group justify="flex-end" mt="md">
            <Button
              variant="filled"
              color="blue"
              onClick={handleSaveFreeShippingSettings}
              disabled={loading.updating}
            >
              حفظ التخصيصات
            </Button>
          </Group>
        </>
      )}
    </Stack>
  );
}
