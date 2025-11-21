import { Alert, Button, Group, Text } from "@mantine/core";
import { IconLock, IconSparkles } from "@tabler/icons-react";

const SALLA_UPGRADE_URL = "/dashboard/plans";

export default function UpgradePrompt({
  featureName,
  size = "sm",
  compact = false,
  showButton = true,
}) {
  if (compact) {
    return (
      <Group gap="xs" style={{ opacity: 0.8 }}>
        <IconLock size="0.9rem" className="text-amber-600" />
        <Text size="xs" className="text-gray-600">
          متاح في الباقات الأعلى
        </Text>
        {showButton && (
          <Button
            size="xs"
            variant="light"
            color="orange"
            component="a"
            href={SALLA_UPGRADE_URL}
          >
            ترقية
          </Button>
        )}
      </Group>
    );
  }

  return (
    <Alert
      icon={<IconLock size="1rem" />}
      title={
        <Group gap="xs">
          <Text size={size} fw={600}>
            {featureName
              ? `ميزة ${featureName} متاحة في الباقات الأعلى`
              : "متاح في الباقات الأعلى"}
          </Text>
          <IconSparkles size="1rem" className="text-amber-500" />
        </Group>
      }
      color="orange"
      variant="light"
    >
      <Group justify="space-between" align="center">
        <Text size="sm" className="text-gray-700">
          قم بالترقية من سلة للحصول على هذه الميزة والمزيد من الإمكانيات
          المتقدمة
        </Text>
        {showButton && (
          <Button
            size="sm"
            variant="filled"
            color="orange"
            component="a"
            href={SALLA_UPGRADE_URL}
            leftSection={<IconSparkles size="1rem" />}
          >
            ترقية الباقة
          </Button>
        )}
      </Group>
    </Alert>
  );
}
