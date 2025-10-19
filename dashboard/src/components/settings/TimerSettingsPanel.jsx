import { useState, useEffect } from "react";
import {
  Stack,
  Divider,
  Grid,
  Select,
  NumberInput,
  Switch,
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
 * Timer settings panel component
 */
export default function TimerSettingsPanel({ settings, loading, onToggle }) {
  // Timer customization state
  const timer = settings.timer || {};

  const [timerDurationType, setTimerDurationType] = useState(
    timer.duration_type || "6h"
  );
  const [timerDuration, setTimerDuration] = useState(timer.duration || 21600);
  const [timerAutoRestart, setTimerAutoRestart] = useState(
    timer.auto_restart ?? true
  );
  const [timerEffect, setTimerEffect] = useState(timer.effect || "pulse");
  const [timerTextColor, setTimerTextColor] = useState(
    timer.text_color || "#0E1012"
  );
  const [timerBgColor, setTimerBgColor] = useState(timer.bg_color || "#FFFFFF");
  const [timerBorderColor, setTimerBorderColor] = useState(
    timer.border_color || "#E5E8EC"
  );
  const [timerBorderRadius, setTimerBorderRadius] = useState(
    timer.border_radius || 12
  );
  const [timerLabel, setTimerLabel] = useState(
    timer.label || "عرض محدود ينتهي خلال"
  );
  const [timerLabelColor, setTimerLabelColor] = useState(
    timer.label_color || "#60646C"
  );
  const [timerFontSize, setTimerFontSize] = useState(timer.font_size || 14);

  // Sync local state with fetched settings
  useEffect(() => {
    if (settings.timer) {
      const t = settings.timer;
      setTimerDurationType(t.duration_type || "6h");
      setTimerDuration(t.duration || 21600);
      setTimerAutoRestart(t.auto_restart ?? true);
      setTimerEffect(t.effect || "pulse");
      setTimerTextColor(t.text_color || "#0E1012");
      setTimerBgColor(t.bg_color || "#FFFFFF");
      setTimerBorderColor(t.border_color || "#E5E8EC");
      setTimerBorderRadius(t.border_radius || 12);
      setTimerLabel(t.label || "عرض محدود ينتهي خلال");
      setTimerLabelColor(t.label_color || "#60646C");
      setTimerFontSize(t.font_size || 14);
    }
  }, [settings.timer]);

  const handleSaveTimerSettings = async () => {
    const notificationId = "update-timer";
    notifications.show({
      id: notificationId,
      loading: true,
      title: "جاري الحفظ...",
      message: "جاري تحديث إعدادات المؤقت...",
      autoClose: false,
      withCloseButton: false,
    });

    try {
      await useSettingsStore.getState().updateSettings({
        timer: {
          ...settings.timer,
          duration_type: timerDurationType,
          duration: timerDuration,
          auto_restart: timerAutoRestart,
          effect: timerEffect,
          text_color: timerTextColor,
          bg_color: timerBgColor,
          border_color: timerBorderColor,
          border_radius: timerBorderRadius,
          label: timerLabel,
          label_color: timerLabelColor,
          font_size: timerFontSize,
        },
      });

      notifications.update({
        id: notificationId,
        loading: false,
        title: "تم الحفظ بنجاح",
        message: "تم تحديث إعدادات المؤقت بنجاح",
        color: "green",
        icon: <IconCheck size="1rem" />,
        autoClose: 3000,
      });
    } catch (error) {
      notifications.update({
        id: notificationId,
        loading: false,
        title: "خطأ في الحفظ",
        message: error.message || "حدث خطأ أثناء تحديث إعدادات المؤقت",
        color: "red",
        icon: <IconX size="1rem" />,
        autoClose: 5000,
      });
    }
  };

  return (
    <Stack gap="md">
      {/* Enable Timer Toggle */}
      <SettingToggle
        label="تفعيل مؤقت العد التنازلي"
        description="عرض مؤقت للعد التنازلي في رأس نافذة الباقة لخلق إحساس بالإلحاح"
        checked={timer.enabled || false}
        onChange={() => onToggle("timer.enabled")}
        disabled={loading.updating}
        infoText="المؤقت يظهر في رأس نافذة الباقة ويمكنك التحكم في مدته، ألوانه، والمؤثرات البصرية."
        withDivider={false}
      />

      {/* Customization Options - Only show if enabled */}
      {timer.enabled && (
        <>
          <Divider label="تخصيص المؤقت" labelPosition="center" />

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="مدة المؤقت"
                value={timerDurationType}
                onChange={(value) => {
                  setTimerDurationType(value);
                  if (value === "6h") setTimerDuration(21600);
                  else if (value === "12h") setTimerDuration(43200);
                  else if (value === "24h") setTimerDuration(86400);
                }}
                data={[
                  { value: "6h", label: "6 ساعات" },
                  { value: "12h", label: "12 ساعة" },
                  { value: "24h", label: "24 ساعة" },
                  { value: "custom", label: "مدة مخصصة" },
                ]}
              />
            </Grid.Col>

            {timerDurationType === "custom" && (
              <Grid.Col span={{ base: 12, md: 6 }}>
                <NumberInput
                  label="المدة المخصصة (بالثواني)"
                  value={timerDuration}
                  onChange={setTimerDuration}
                  min={300}
                  max={86400}
                  description="من 5 دقائق (300) إلى 24 ساعة (86400)"
                />
              </Grid.Col>
            )}

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="المؤثر البصري"
                value={timerEffect}
                onChange={setTimerEffect}
                data={[
                  { value: "none", label: "بدون مؤثر" },
                  { value: "pulse", label: "نبض" },
                  { value: "glow", label: "توهج" },
                ]}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Switch
                label="إعادة التشغيل التلقائية"
                description="عند انتهاء المؤقت، يبدأ من جديد تلقائياً"
                checked={timerAutoRestart}
                onChange={(event) =>
                  setTimerAutoRestart(event.currentTarget.checked)
                }
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12 }}>
              <TextInput
                label="نص التسمية"
                value={timerLabel}
                onChange={(event) => setTimerLabel(event.currentTarget.value)}
                placeholder="عرض محدود ينتهي خلال"
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <ColorInput
                label="لون النص (الأرقام)"
                value={timerTextColor}
                onChange={setTimerTextColor}
                format="hex"
                swatches={["#0E1012", "#ef4444", "#f59e0b", "#10b981"]}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <ColorInput
                label="لون التسمية"
                value={timerLabelColor}
                onChange={setTimerLabelColor}
                format="hex"
                swatches={["#60646C", "#9ca3af", "#1f2937", "#0E1012"]}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <ColorInput
                label="لون الخلفية"
                value={timerBgColor}
                onChange={setTimerBgColor}
                format="hex"
                swatches={["#FFFFFF", "#F6F8FA", "#F2F4F7", "#fee2e2"]}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <ColorInput
                label="لون الحدود"
                value={timerBorderColor}
                onChange={setTimerBorderColor}
                format="hex"
                swatches={["#E5E8EC", "#d1d5db", "#9ca3af", "#ef4444"]}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput
                label="استدارة الزوايا (بكسل)"
                value={timerBorderRadius}
                onChange={setTimerBorderRadius}
                min={0}
                max={50}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput
                label="حجم الخط (بكسل)"
                value={timerFontSize}
                onChange={setTimerFontSize}
                min={10}
                max={24}
              />
            </Grid.Col>
          </Grid>

          <Group justify="flex-end" mt="md">
            <Button
              variant="filled"
              color="blue"
              onClick={handleSaveTimerSettings}
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
