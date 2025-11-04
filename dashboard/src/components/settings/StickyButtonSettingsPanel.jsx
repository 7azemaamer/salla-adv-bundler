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
import { IconCheck, IconX, IconInfoCircle } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import useSettingsStore from "../../stores/useSettingsStore";
import SettingToggle from "./SettingToggle";

/**
 * Sticky button settings panel component
 */
export default function StickyButtonSettingsPanel({
  settings,
  loading,
  onToggle,
}) {
  // Sticky button customization state
  const stickyButton = settings.sticky_button || {};

  const [buttonText, setButtonText] = useState(
    stickyButton.text || "اطلب باقتك الآن"
  );
  const [buttonBgColor, setButtonBgColor] = useState(
    stickyButton.bg_color || "#10b981"
  );
  const [buttonTextColor, setButtonTextColor] = useState(
    stickyButton.text_color || "#ffffff"
  );
  const [buttonPosition, setButtonPosition] = useState(
    stickyButton.position || "bottom-center"
  );
  const [buttonWidthType, setButtonWidthType] = useState(
    stickyButton.width_type || "auto"
  );
  const [buttonCustomWidth, setButtonCustomWidth] = useState(
    stickyButton.custom_width || 250
  );

  // Sync local state with fetched settings
  useEffect(() => {
    if (settings.sticky_button) {
      const sb = settings.sticky_button;
      setButtonText(sb.text || "اطلب باقتك الآن");
      setButtonBgColor(sb.bg_color || "#10b981");
      setButtonTextColor(sb.text_color || "#ffffff");
      setButtonPosition(sb.position || "bottom-center");
      setButtonWidthType(sb.width_type || "auto");
      setButtonCustomWidth(sb.custom_width || 250);
    }
  }, [settings.sticky_button]);

  const handleSaveSettings = async () => {
    const notificationId = "update-sticky-button";
    notifications.show({
      id: notificationId,
      loading: true,
      title: "جاري الحفظ...",
      message: "جاري تحديث إعدادات الزر الثابت...",
      autoClose: false,
      withCloseButton: false,
    });

    try {
      await useSettingsStore.getState().updateSettings({
        sticky_button: {
          ...settings.sticky_button,
          text: buttonText,
          bg_color: buttonBgColor,
          text_color: buttonTextColor,
          position: buttonPosition,
          width_type: buttonWidthType,
          custom_width: buttonCustomWidth,
        },
      });

      notifications.update({
        id: notificationId,
        loading: false,
        title: "تم الحفظ بنجاح",
        message: "تم تحديث إعدادات الزر الثابت بنجاح",
        color: "green",
        icon: <IconCheck size="1rem" />,
        autoClose: 3000,
      });
    } catch (error) {
      notifications.update({
        id: notificationId,
        loading: false,
        title: "خطأ في الحفظ",
        message: error.message || "حدث خطأ أثناء تحديث إعدادات الزر الثابت",
        color: "red",
        icon: <IconX size="1rem" />,
        autoClose: 5000,
      });
    }
  };

  return (
    <Stack gap="md">
      {/* Enable Sticky Button Toggle */}
      <SettingToggle
        label="تفعيل الزر الثابت"
        description="عرض زر ثابت في أسفل الصفحة للوصول السريع لنافذة الباقة"
        checked={stickyButton.enabled || false}
        onChange={() => onToggle("sticky_button.enabled")}
        disabled={loading.updating}
      />

      <Alert icon={<IconInfoCircle size="1rem" />} color="blue" variant="light">
        <Text size="sm">
          <strong>ملاحظة:</strong> الزر الثابت يظهر في أسفل صفحة المنتج ويمكن
          للعميل الضغط عليه لفتح نافذة الباقة مباشرةً. يمكنك التحكم في النص،
          الألوان، الموضع، والعرض.
        </Text>
      </Alert>

      {/* Customization Options - Only show if enabled */}
      {stickyButton.enabled && (
        <>
          <Divider label="تخصيص الزر الثابت" labelPosition="center" />

          <Grid>
            <Grid.Col span={{ base: 12 }}>
              <TextInput
                label="نص الزر"
                placeholder="مثال: اطلب باقتك الآن"
                value={buttonText}
                onChange={(event) => setButtonText(event.currentTarget.value)}
                description="النص الذي يظهر على الزر"
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <ColorInput
                label="لون الخلفية"
                value={buttonBgColor}
                onChange={setButtonBgColor}
                format="hex"
                swatches={[
                  "#10b981",
                  "#3b82f6",
                  "#f59e0b",
                  "#ef4444",
                  "#8b5cf6",
                  "#ec4899",
                ]}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <ColorInput
                label="لون النص"
                value={buttonTextColor}
                onChange={setButtonTextColor}
                format="hex"
                swatches={["#ffffff", "#000000", "#1f2937", "#f3f4f6"]}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="موضع الزر"
                placeholder="اختر موضع الزر"
                value={buttonPosition}
                onChange={setButtonPosition}
                data={[
                  { value: "bottom-center", label: "أسفل في المنتصف" },
                  { value: "bottom-left", label: "أسفل على اليسار" },
                  { value: "bottom-right", label: "أسفل على اليمين" },
                ]}
                description="موضع الزر في أسفل الصفحة"
                comboboxProps={{
                  position: "bottom",
                  middlewares: { flip: false, shift: false },
                }}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="نوع العرض"
                placeholder="اختر نوع عرض الزر"
                value={buttonWidthType}
                onChange={setButtonWidthType}
                data={[
                  { value: "auto", label: "تلقائي (حسب النص)" },
                  { value: "full", label: "عرض كامل" },
                  { value: "custom", label: "عرض مخصص" },
                ]}
                description="كيفية عرض عرض الزر"
                comboboxProps={{
                  position: "bottom",
                  middlewares: { flip: false, shift: false },
                }}
              />
            </Grid.Col>

            {buttonWidthType === "custom" && (
              <Grid.Col span={{ base: 12, md: 6 }}>
                <NumberInput
                  label="العرض المخصص (بكسل)"
                  value={buttonCustomWidth}
                  onChange={setButtonCustomWidth}
                  min={150}
                  max={600}
                  description="عرض الزر بالبكسل"
                />
              </Grid.Col>
            )}
          </Grid>

          <Group justify="flex-end" mt="md">
            <Button
              variant="filled"
              color="blue"
              onClick={handleSaveSettings}
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
