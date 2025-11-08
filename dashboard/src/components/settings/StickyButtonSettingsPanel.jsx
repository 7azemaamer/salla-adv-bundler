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
  const [desktopBottom, setDesktopBottom] = useState(
    stickyButton.desktop_bottom ?? 20
  );
  const [desktopLeft, setDesktopLeft] = useState(
    stickyButton.desktop_left ?? 20
  );
  const [desktopRight, setDesktopRight] = useState(
    stickyButton.desktop_right ?? 20
  );
  const [mobileBottom, setMobileBottom] = useState(
    stickyButton.mobile_bottom ?? 20
  );
  const [mobileLeft, setMobileLeft] = useState(stickyButton.mobile_left ?? 20);
  const [mobileRight, setMobileRight] = useState(
    stickyButton.mobile_right ?? 20
  );
  const [borderRadius, setBorderRadius] = useState(
    stickyButton.border_radius ?? 12
  );
  const [desktopWidth, setDesktopWidth] = useState(
    stickyButton.desktop_width ?? 250
  );
  const [mobileWidth, setMobileWidth] = useState(
    stickyButton.mobile_width ?? 250
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
      setDesktopBottom(sb.desktop_bottom ?? 20);
      setDesktopLeft(sb.desktop_left ?? 20);
      setDesktopRight(sb.desktop_right ?? 20);
      setMobileBottom(sb.mobile_bottom ?? 20);
      setMobileLeft(sb.mobile_left ?? 20);
      setMobileRight(sb.mobile_right ?? 20);
      setBorderRadius(sb.border_radius ?? 12);
      setDesktopWidth(sb.desktop_width ?? 250);
      setMobileWidth(sb.mobile_width ?? 250);
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
          desktop_bottom: desktopBottom,
          desktop_left: desktopLeft,
          desktop_right: desktopRight,
          mobile_bottom: mobileBottom,
          mobile_left: mobileLeft,
          mobile_right: mobileRight,
          border_radius: borderRadius,
          desktop_width: desktopWidth,
          mobile_width: mobileWidth,
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
          </Grid>

          <Divider label="التموضع والشكل" labelPosition="center" mt="lg" />

          <Grid>
            <Grid.Col span={{ base: 12 }}>
              <Text size="sm" fw={500} mb="xs">
                الحاسوب (Desktop)
              </Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <NumberInput
                label="المسافة من الأسفل (px)"
                value={desktopBottom}
                onChange={setDesktopBottom}
                min={0}
                max={200}
                description="المسافة من أسفل الشاشة"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <NumberInput
                label="المسافة من اليسار (px)"
                value={desktopLeft}
                onChange={setDesktopLeft}
                min={0}
                max={500}
                description="المسافة من الجانب الأيسر"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <NumberInput
                label="المسافة من اليمين (px)"
                value={desktopRight}
                onChange={setDesktopRight}
                min={0}
                max={500}
                description="المسافة من الجانب الأيمن"
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12 }}>
              <Text size="sm" fw={500} mt="md" mb="xs">
                الجوال (Mobile)
              </Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <NumberInput
                label="المسافة من الأسفل (px)"
                value={mobileBottom}
                onChange={setMobileBottom}
                min={0}
                max={200}
                description="المسافة من أسفل الشاشة"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <NumberInput
                label="المسافة من اليسار (px)"
                value={mobileLeft}
                onChange={setMobileLeft}
                min={0}
                max={200}
                description="المسافة من الجانب الأيسر"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <NumberInput
                label="المسافة من اليمين (px)"
                value={mobileRight}
                onChange={setMobileRight}
                min={0}
                max={200}
                description="المسافة من الجانب الأيمن"
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput
                label="استدارة الحواف (px)"
                value={borderRadius}
                onChange={setBorderRadius}
                min={0}
                max={50}
                description="مقدار استدارة زوايا الزر"
              />
            </Grid.Col>

            {buttonWidthType === "custom" && (
              <>
                <Grid.Col span={{ base: 12 }}>
                  <Text size="sm" fw={500} mt="md" mb="xs">
                    العرض (Width)
                  </Text>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <NumberInput
                    label="عرض الزر - حاسوب (px)"
                    value={desktopWidth}
                    onChange={setDesktopWidth}
                    min={100}
                    max={800}
                    description="عرض الزر على شاشات الحاسوب"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <NumberInput
                    label="عرض الزر - جوال (px)"
                    value={mobileWidth}
                    onChange={setMobileWidth}
                    min={100}
                    max={500}
                    description="عرض الزر على شاشات الجوال"
                  />
                </Grid.Col>
              </>
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
