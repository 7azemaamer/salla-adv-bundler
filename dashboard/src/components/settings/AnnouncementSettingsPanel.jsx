import { useState, useEffect } from "react";
import {
  Stack,
  Switch,
  TextInput,
  Textarea,
  ColorInput,
  Select,
  Group,
  Button,
  Alert,
  Text,
  Paper,
  Divider,
} from "@mantine/core";
import {
  IconCheck,
  IconX,
  IconBell,
  IconInfoCircle,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import useSettingsStore from "../../stores/useSettingsStore";

/**
 * Announcement banner settings panel component
 */
export default function AnnouncementSettingsPanel({
  settings,
  loading,
  //   onToggle,
}) {
  const announcement = settings.announcement || {};
  const { updateSettings } = useSettingsStore();

  const [announcementEnabled, setAnnouncementEnabled] = useState(
    announcement.enabled || false
  );
  const [announcementTitle, setAnnouncementTitle] = useState(
    announcement.title || ""
  );
  const [announcementContent, setAnnouncementContent] = useState(
    announcement.content || "إعلان مهم للعملاء"
  );
  const [announcementIcon, setAnnouncementIcon] = useState(
    announcement.icon || "info"
  );
  const [announcementBgColor, setAnnouncementBgColor] = useState(
    announcement.bg_color || "#e0f2fe"
  );
  const [announcementTextColor, setAnnouncementTextColor] = useState(
    announcement.text_color || "#0c4a6e"
  );

  useEffect(() => {
    setAnnouncementEnabled(announcement.enabled || false);
    setAnnouncementTitle(announcement.title || "");
    setAnnouncementContent(announcement.content || "إعلان مهم للعملاء");
    setAnnouncementIcon(announcement.icon || "info");
    setAnnouncementBgColor(announcement.bg_color || "#e0f2fe");
    setAnnouncementTextColor(announcement.text_color || "#0c4a6e");
  }, [announcement]);

  const handleSaveAnnouncement = async () => {
    try {
      await updateSettings({
        announcement: {
          enabled: announcementEnabled,
          title: announcementTitle,
          content: announcementContent,
          icon: announcementIcon,
          bg_color: announcementBgColor,
          text_color: announcementTextColor,
        },
      });

      notifications.show({
        title: "تم الحفظ",
        message: "تم حفظ إعدادات الإعلان بنجاح",
        color: "green",
        icon: <IconCheck size="1rem" />,
      });
    } catch (error) {
      notifications.show({
        title: "خطأ",
        message: error.message || "فشل حفظ الإعدادات",
        color: "red",
        icon: <IconX size="1rem" />,
      });
    }
  };

  const iconOptions = [
    { value: "info", label: "معلومات (Info)" },
    { value: "warning", label: "تحذير (Warning)" },
    { value: "success", label: "نجاح (Success)" },
    { value: "star", label: "نجمة (Star)" },
    { value: "gift", label: "هدية (Gift)" },
    { value: "bell", label: "جرس (Bell)" },
    { value: "fire", label: "نار (Fire)" },
  ];

  const presetColors = [
    { bg: "#e0f2fe", text: "#0c4a6e", label: "أزرق فاتح" },
    { bg: "#fef3c7", text: "#78350f", label: "أصفر فاتح" },
    { bg: "#dcfce7", text: "#14532d", label: "أخضر فاتح" },
    { bg: "#fee2e2", text: "#7f1d1d", label: "أحمر فاتح" },
    { bg: "#f3e8ff", text: "#581c87", label: "بنفسجي فاتح" },
  ];

  return (
    <Stack gap="md">
      <Alert icon={<IconBell size="1rem" />} title="لافتة الإعلان" color="blue">
        عرض إعلان أو رسالة مهمة للعملاء في صفحة الفاتورة النهائية
      </Alert>

      <Paper p="md" withBorder>
        <Stack gap="md">
          <Switch
            label="تفعيل لافتة الإعلان"
            description="إظهار إعلان مهم للعملاء في صفحة الفاتورة النهائية"
            checked={announcementEnabled}
            onChange={(event) =>
              setAnnouncementEnabled(event.currentTarget.checked)
            }
            disabled={loading.updating || loading.fetching}
          />

          {announcementEnabled && (
            <>
              <Divider />

              <TextInput
                label="عنوان الإعلان (اختياري)"
                placeholder="عنوان الإعلان"
                value={announcementTitle}
                onChange={(event) =>
                  setAnnouncementTitle(event.currentTarget.value)
                }
                disabled={loading.updating}
              />

              <Textarea
                label="محتوى الإعلان"
                placeholder="اكتب نص الإعلان هنا..."
                value={announcementContent}
                onChange={(event) =>
                  setAnnouncementContent(event.currentTarget.value)
                }
                minRows={3}
                disabled={loading.updating}
                required
              />

              <Select
                label="أيقونة الإعلان"
                data={iconOptions}
                value={announcementIcon}
                onChange={(value) => setAnnouncementIcon(value)}
                disabled={loading.updating}
              />

              <Group grow>
                <ColorInput
                  label="لون الخلفية"
                  value={announcementBgColor}
                  onChange={setAnnouncementBgColor}
                  disabled={loading.updating}
                  format="hex"
                  swatches={presetColors.map((c) => c.bg)}
                />

                <ColorInput
                  label="لون النص"
                  value={announcementTextColor}
                  onChange={setAnnouncementTextColor}
                  disabled={loading.updating}
                  format="hex"
                  swatches={presetColors.map((c) => c.text)}
                />
              </Group>

              <Alert
                icon={<IconInfoCircle size="1rem" />}
                title="قوالب جاهزة"
                color="blue"
                variant="light"
              >
                <Stack gap="xs">
                  {presetColors.map((preset) => (
                    <Button
                      key={preset.label}
                      size="xs"
                      variant="light"
                      onClick={() => {
                        setAnnouncementBgColor(preset.bg);
                        setAnnouncementTextColor(preset.text);
                      }}
                      leftSection={
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 4,
                            backgroundColor: preset.bg,
                            border: "1px solid #ddd",
                          }}
                        />
                      }
                    >
                      {preset.label}
                    </Button>
                  ))}
                </Stack>
              </Alert>

              {/* Preview */}
              <div>
                <Text size="sm" fw={500} mb="xs">
                  معاينة
                </Text>
                <div
                  style={{
                    backgroundColor: announcementBgColor,
                    color: announcementTextColor,
                    padding: "12px 16px",
                    borderRadius: 8,
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  <span style={{ flexShrink: 0 }}>
                    {iconOptions.find((i) => i.value === announcementIcon)
                      ?.label || "معلومات"}
                  </span>
                  <div style={{ flex: 1 }}>
                    {announcementTitle && (
                      <div
                        style={{
                          fontWeight: 600,
                          marginBottom: 4,
                          fontSize: 14,
                        }}
                      >
                        {announcementTitle}
                      </div>
                    )}
                    <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                      {announcementContent || "محتوى الإعلان"}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <Group justify="flex-start" mt="md">
            <Button
              onClick={handleSaveAnnouncement}
              loading={loading.updating}
              leftSection={<IconCheck size="1rem" />}
            >
              حفظ الإعدادات
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}
