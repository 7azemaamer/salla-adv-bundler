import { useState } from "react";
import {
  Stack,
  Text,
  TextInput,
  Button,
  Group,
  Badge,
  Alert,
  Box,
  ActionIcon,
  Paper,
  Divider,
} from "@mantine/core";
import {
  IconPlus,
  IconTrash,
  IconInfoCircle,
  IconEyeOff,
  IconCode,
  IconAlertTriangle,
} from "@tabler/icons-react";

export default function CustomHideSelectorsPanel({
  settings,
  loading,
  onToggle,
}) {
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
      {/* Info Alert */}
      <Alert
        icon={<IconInfoCircle size="1rem" />}
        title="إخفاء عناصر مخصصة"
        color="blue"
        variant="light"
      >
        <Text size="sm">
          يمكنك إضافة محددات CSS أو معرفات (IDs) لإخفاء أي عنصر في صفحة المنتج
          عند وجود عروض باقات نشطة. استخدم محددات CSS القياسية مثل:
        </Text>
        <Stack gap="xs" mt="sm">
          <Text size="sm" c="dimmed">
            • <strong>.my-class</strong> - لإخفاء عنصر بكلاس معين
          </Text>
          <Text size="sm" c="dimmed">
            • <strong>#my-id</strong> - لإخفاء عنصر بمعرف معين
          </Text>
          <Text size="sm" c="dimmed">
            • <strong>div.product-badge</strong> - لإخفاء عنصر div بكلاس معين
          </Text>
          <Text size="sm" c="dimmed">
            • <strong>[data-product-badge]</strong> - لإخفاء عنصر بصفة معينة
          </Text>
        </Stack>
      </Alert>

      {/* Add Selector Input */}
      <Paper withBorder p="md" radius="md">
        <Stack gap="md">
          <Group gap="xs">
            <IconCode size="1.2rem" />
            <Text fw={500}>إضافة محدد جديد</Text>
          </Group>

          <Group align="flex-end">
            <TextInput
              placeholder="مثال: .my-custom-class أو #my-element-id"
              value={newSelector}
              onChange={(e) => setNewSelector(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{ flex: 1 }}
              styles={{ input: { direction: "ltr", textAlign: "left" } }}
              leftSection={<IconEyeOff size="1rem" />}
              disabled={loading.updating}
            />
            <Button
              onClick={handleAddSelector}
              disabled={!newSelector.trim() || loading.updating}
              leftSection={<IconPlus size="1rem" />}
            >
              إضافة
            </Button>
          </Group>
        </Stack>
      </Paper>

      <Divider />

      {/* List of Selectors */}
      <Box>
        <Group gap="xs" mb="md">
          <IconEyeOff size="1.2rem" />
          <Text fw={500}>المحددات المخفية</Text>
          <Badge color="blue" variant="light">
            {customSelectors.length}
          </Badge>
        </Group>

        {customSelectors.length === 0 ? (
          <Alert
            icon={<IconInfoCircle size="1rem" />}
            color="gray"
            variant="light"
          >
            <Text size="sm">
              لم تتم إضافة أي محددات مخصصة بعد. أضف محددات CSS أو معرفات لإخفاء
              العناصر المطلوبة.
            </Text>
          </Alert>
        ) : (
          <Stack gap="xs">
            {customSelectors.map((selector, index) => (
              <Paper key={index} withBorder p="sm" radius="md">
                <Group justify="space-between">
                  <Group gap="sm">
                    <IconCode size="1rem" color="gray" />
                    <Text
                      size="sm"
                      ff="monospace"
                      fw={500}
                      style={{ direction: "ltr", textAlign: "left" }}
                    >
                      {selector}
                    </Text>
                  </Group>
                  <ActionIcon
                    color="red"
                    variant="light"
                    onClick={() => handleRemoveSelector(selector)}
                    disabled={loading.updating}
                  >
                    <IconTrash size="1rem" />
                  </ActionIcon>
                </Group>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>

      {/* Warning */}
      {customSelectors.length > 0 && (
        <Alert
          icon={<IconAlertTriangle size="1rem" />}
          color="yellow"
          variant="light"
        >
          <Text size="sm">
            تأكد من صحة المحددات قبل الحفظ. المحددات الخاطئة قد تؤثر على عرض
            الصفحة بشكل غير متوقع.
          </Text>
        </Alert>
      )}
    </Stack>
  );
}
