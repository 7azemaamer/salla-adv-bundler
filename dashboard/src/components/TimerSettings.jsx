import { useState, useEffect } from "react";
import {
  Card,
  Title,
  Text,
  Stack,
  Group,
  Switch,
  Select,
  ColorInput,
  NumberInput,
  TextInput,
  Button,
  Divider,
  Alert,
  Grid,
  SegmentedControl,
  Paper,
} from "@mantine/core";
import {
  IconClock,
  IconCheck,
  IconX,
  IconInfoCircle,
  IconDeviceFloppy,
  IconRefresh,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function TimerSettings({ storeId }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    enabled: true,
    duration: 21600,
    duration_type: "6h",
    position: "above_summary",
    mobile_position: "sticky_top",
    style: {
      text_color: "#0E1012",
      bg_color: "#FFFFFF",
      border_color: "#E5E8EC",
      border_radius: 12,
      label: "عرض محدود ينتهي خلال",
      label_color: "#60646C",
      font_size: 14,
      format: "hms",
    },
    effect: "pulse",
    show_on_mobile: true,
    show_on_desktop: true,
    auto_restart: true,
  });

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, [storeId]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/v1/timer-settings/${storeId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch timer settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const notificationId = "save-timer-settings";

    notifications.show({
      id: notificationId,
      loading: true,
      title: "جاري الحفظ...",
      message: "جاري تحديث إعدادات المؤقت...",
      autoClose: false,
      withCloseButton: false,
    });

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/api/v1/timer-settings/${storeId}`,
        settings,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        notifications.update({
          id: notificationId,
          loading: false,
          title: "تم الحفظ بنجاح",
          message: "تم تحديث إعدادات المؤقت بنجاح",
          color: "green",
          icon: <IconCheck size="1rem" />,
          autoClose: 3000,
        });
      }
    } catch (error) {
      notifications.update({
        id: notificationId,
        loading: false,
        title: "خطأ في الحفظ",
        message: error.response?.data?.message || "حدث خطأ أثناء حفظ الإعدادات",
        color: "red",
        icon: <IconX size="1rem" />,
        autoClose: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    const notificationId = "reset-timer-settings";

    notifications.show({
      id: notificationId,
      loading: true,
      title: "جاري إعادة التعيين...",
      message: "جاري استعادة الإعدادات الافتراضية...",
      autoClose: false,
      withCloseButton: false,
    });

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/v1/timer-settings/${storeId}/reset`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSettings(response.data.data);
        notifications.update({
          id: notificationId,
          loading: false,
          title: "تمت إعادة التعيين بنجاح",
          message: "تم استعادة الإعدادات الافتراضية",
          color: "green",
          icon: <IconCheck size="1rem" />,
          autoClose: 3000,
        });
      }
    } catch (error) {
      notifications.update({
        id: notificationId,
        loading: false,
        title: "خطأ في إعادة التعيين",
        message: error.response?.data?.message || "حدث خطأ",
        color: "red",
        icon: <IconX size="1rem" />,
        autoClose: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}:${minutes.toString().padStart(2, "0")}:00`;
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between">
          <Group gap="xs">
            <IconClock size="1.5rem" className="text-blue-600" />
            <div>
              <Title order={3} className="text-gray-800">
                إعدادات المؤقت
              </Title>
              <Text size="sm" c="dimmed">
                أضف عداد تنازلي لخلق شعور بالإلحاح وزيادة التحويلات
              </Text>
            </div>
          </Group>

          <Group gap="xs">
            <Button
              variant="light"
              leftSection={<IconRefresh size="1rem" />}
              onClick={handleReset}
              loading={saving}
              size="sm"
            >
              إعادة تعيين
            </Button>
            <Button
              leftSection={<IconDeviceFloppy size="1rem" />}
              onClick={handleSave}
              loading={saving}
              size="sm"
            >
              حفظ التغييرات
            </Button>
          </Group>
        </Group>

        <Divider />

        {/* Enable/Disable Timer */}
        <Switch
          size="md"
          label={
            <div>
              <Text fw={500} size="sm">
                تفعيل المؤقت
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                عرض عداد تنازلي في نافذة الباقات لتشجيع العملاء على اتخاذ قرار
                الشراء
              </Text>
            </div>
          }
          checked={settings.enabled}
          onChange={(event) =>
            setSettings({ ...settings, enabled: event.currentTarget.checked })
          }
        />

        {settings.enabled && (
          <>
            {/* Duration Settings */}
            <div>
              <Text fw={500} size="sm" mb="xs">
                مدة المؤقت
              </Text>
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select
                    label="نوع المدة"
                    placeholder="اختر المدة"
                    data={[
                      { value: "6h", label: "6 ساعات" },
                      { value: "12h", label: "12 ساعة" },
                      { value: "24h", label: "24 ساعة" },
                      { value: "custom", label: "مخصص" },
                    ]}
                    value={settings.duration_type}
                    onChange={(value) => {
                      const durations = {
                        "6h": 21600,
                        "12h": 43200,
                        "24h": 86400,
                      };
                      setSettings({
                        ...settings,
                        duration_type: value,
                        duration: durations[value] || settings.duration,
                      });
                    }}
                  />
                </Grid.Col>
                {settings.duration_type === "custom" && (
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <NumberInput
                      label="المدة بالثواني"
                      placeholder="أدخل المدة"
                      min={300}
                      max={86400}
                      value={settings.duration}
                      onChange={(value) =>
                        setSettings({ ...settings, duration: value })
                      }
                      description={`الوقت: ${formatTime(settings.duration)}`}
                    />
                  </Grid.Col>
                )}
              </Grid>
            </div>

            <Divider />

            {/* Position Settings */}
            {/* <div>
              <Text fw={500} size="sm" mb="md">
                موضع المؤقت
              </Text>
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select
                    label="موضع الديسكتوب"
                    data={[
                      { value: "header", label: "في الأعلى (Header)" },
                      { value: "above_summary", label: "فوق الملخص" },
                      { value: "below_summary", label: "تحت الملخص" },
                      { value: "sticky_top", label: "ثابت أعلى" },
                    ]}
                    value={settings.position}
                    onChange={(value) =>
                      setSettings({ ...settings, position: value })
                    }
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select
                    label="موضع الموبايل"
                    data={[
                      { value: "header", label: "في الأعلى (Header)" },
                      { value: "above_summary", label: "فوق الملخص" },
                      { value: "below_summary", label: "تحت الملخص" },
                      { value: "sticky_top", label: "ثابت أعلى" },
                      { value: "sticky_bottom", label: "ثابت أسفل" },
                    ]}
                    value={settings.mobile_position}
                    onChange={(value) =>
                      setSettings({ ...settings, mobile_position: value })
                    }
                  />
                </Grid.Col>
              </Grid>
            </div> */}

            {/* <Divider /> */}

            {/* Style Settings */}
            <div>
              <Text fw={500} size="sm" mb="md">
                التصميم والألوان
              </Text>
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <ColorInput
                    label="لون النص (الأرقام)"
                    value={settings.style.text_color}
                    onChange={(value) =>
                      setSettings({
                        ...settings,
                        style: { ...settings.style, text_color: value },
                      })
                    }
                    format="hex"
                    swatches={[
                      "#0E1012",
                      "#ffffff",
                      "#ef4444",
                      "#f59e0b",
                      "#10b981",
                    ]}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <ColorInput
                    label="لون الخلفية"
                    value={settings.style.bg_color}
                    onChange={(value) =>
                      setSettings({
                        ...settings,
                        style: { ...settings.style, bg_color: value },
                      })
                    }
                    format="hex"
                    swatches={[
                      "#FFFFFF",
                      "#F6F8FA",
                      "#fef3cd",
                      "#d1fae5",
                      "#0E1012",
                    ]}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <ColorInput
                    label="لون الإطار"
                    value={settings.style.border_color}
                    onChange={(value) =>
                      setSettings({
                        ...settings,
                        style: { ...settings.style, border_color: value },
                      })
                    }
                    format="hex"
                    swatches={[
                      "#E5E8EC",
                      "#f6d55c",
                      "#a7f3d0",
                      "#fecaca",
                      "#0E1012",
                    ]}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <NumberInput
                    label="حجم الخط (بكسل)"
                    min={10}
                    max={24}
                    value={settings.style.font_size}
                    onChange={(value) =>
                      setSettings({
                        ...settings,
                        style: { ...settings.style, font_size: value },
                      })
                    }
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <NumberInput
                    label="استدارة الإطار (بكسل)"
                    min={0}
                    max={50}
                    value={settings.style.border_radius}
                    onChange={(value) =>
                      setSettings({
                        ...settings,
                        style: { ...settings.style, border_radius: value },
                      })
                    }
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                  <Select
                    label="التأثير"
                    data={[
                      { value: "none", label: "بدون تأثير" },
                      { value: "pulse", label: "نبض" },
                      { value: "fade", label: "تلاشي" },
                      { value: "bounce", label: "ارتداد" },
                      { value: "glow", label: "توهج" },
                    ]}
                    value={settings.effect}
                    onChange={(value) =>
                      setSettings({ ...settings, effect: value })
                    }
                  />
                </Grid.Col>
              </Grid>
            </div>

            <Divider />

            {/* Label Settings */}
            <div>
              <Text fw={500} size="sm" mb="md">
                النص والعناوين
              </Text>
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, md: 8 }}>
                  <TextInput
                    label="نص التسمية"
                    placeholder="مثال: عرض محدود ينتهي خلال"
                    value={settings.style.label}
                    onChange={(event) =>
                      setSettings({
                        ...settings,
                        style: {
                          ...settings.style,
                          label: event.currentTarget.value,
                        },
                      })
                    }
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <ColorInput
                    label="لون التسمية"
                    value={settings.style.label_color}
                    onChange={(value) =>
                      setSettings({
                        ...settings,
                        style: { ...settings.style, label_color: value },
                      })
                    }
                    format="hex"
                    swatches={["#60646C", "#0E1012", "#ef4444", "#f59e0b"]}
                  />
                </Grid.Col>
              </Grid>
            </div>

            <Divider />

            {/* Display Options */}
            <div>
              <Text fw={500} size="sm" mb="md">
                خيارات العرض
              </Text>
              <Stack gap="sm">
                <Switch
                  label="عرض على الموبايل"
                  checked={settings.show_on_mobile}
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      show_on_mobile: event.currentTarget.checked,
                    })
                  }
                />
                <Switch
                  label="عرض على الديسكتوب"
                  checked={settings.show_on_desktop}
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      show_on_desktop: event.currentTarget.checked,
                    })
                  }
                />
                <Switch
                  label="إعادة تشغيل تلقائي عند الانتهاء"
                  checked={settings.auto_restart}
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      auto_restart: event.currentTarget.checked,
                    })
                  }
                />
              </Stack>
            </div>

            <Divider />

            {/* Preview */}
            <div>
              <Text fw={500} size="sm" mb="md">
                معاينة المؤقت
              </Text>
              <Paper
                p="md"
                radius={settings.style.border_radius}
                style={{
                  backgroundColor: settings.style.bg_color,
                  border: `1px solid ${settings.style.border_color}`,
                }}
              >
                <Stack gap="xs" align="center">
                  <Text
                    size="sm"
                    style={{
                      color: settings.style.label_color,
                      fontSize: `${settings.style.font_size}px`,
                    }}
                  >
                    {settings.style.label}
                  </Text>
                  <Text
                    fw={700}
                    size="xl"
                    style={{
                      color: settings.style.text_color,
                      fontFamily: '"Courier New", monospace',
                      letterSpacing: "2px",
                      fontSize: "24px",
                    }}
                  >
                    {formatTime(settings.duration)}
                  </Text>
                </Stack>
              </Paper>
            </div>
          </>
        )}

        <Alert
          icon={<IconInfoCircle size="1rem" />}
          color="blue"
          variant="light"
        >
          <Text size="sm">
            <strong>ملاحظة:</strong> سيظهر المؤقت في نافذة الباقات لجميع العملاء
            ويعمل على خلق شعور بالإلحاح لتشجيع اتخاذ قرار الشراء. يمكنك تخصيص
            المظهر والموضع والمدة حسب احتياجاتك.
          </Text>
        </Alert>
      </Stack>
    </Card>
  );
}
