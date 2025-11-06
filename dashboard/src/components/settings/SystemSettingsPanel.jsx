import { useState } from "react";
import { Stack, Button, Text, Card, Divider, Group } from "@mantine/core";
import { IconRefresh, IconCheck, IconX } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import useSettingsStore from "../../stores/useSettingsStore";

export default function SystemSettingsPanel() {
  const { refetchPaymentMethods } = useSettingsStore();
  const [isRefetching, setIsRefetching] = useState(false);

  const handleRefetchPaymentMethods = async () => {
    setIsRefetching(true);

    try {
      const result = await refetchPaymentMethods();

      notifications.show({
        title: "تم التحديث بنجاح",
        message: result.message || "تم تحديث طرق الدفع بنجاح",
        color: "green",
        icon: <IconCheck size="1rem" />,
        autoClose: 5000,
      });
    } catch (error) {
      notifications.show({
        title: "خطأ في التحديث",
        message: error.message || "حدث خطأ أثناء تحديث طرق الدفع",
        color: "red",
        icon: <IconX size="1rem" />,
        autoClose: 5000,
      });
    } finally {
      setIsRefetching(false);
    }
  };

  return (
    <Stack gap="lg">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <div>
            <Text size="lg" fw={600} mb={4}>
              طرق الدفع
            </Text>
            <Text size="sm" c="dimmed">
              يتم جلب طرق الدفع المفعلة تلقائياً عند تثبيت التطبيق وتحديثها كل
              24 ساعة. إذا قمت بتحديث إعدادات الدفع في لوحة تحكم سلة، استخدم
              الزر أدناه لتحديثها فوراً.
            </Text>
          </div>

          <Divider />

          <Group>
            <Button
              leftSection={<IconRefresh size="1rem" />}
              loading={isRefetching}
              onClick={handleRefetchPaymentMethods}
              variant="light"
            >
              تحديث طرق الدفع من سلة
            </Button>
          </Group>

          <Text size="xs" c="dimmed">
            نصيحة: استخدم هذا الزر بعد إضافة أو تعديل طرق الدفع في متجرك على سلة
          </Text>
        </Stack>
      </Card>
    </Stack>
  );
}
