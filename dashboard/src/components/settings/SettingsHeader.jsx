import { Group, Title, Text } from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";

/**
 * Settings page header component
 */
export default function SettingsHeader() {
  return (
    <div>
      <Group gap="sm" mb="xs">
        <IconSettings size="2rem" className="text-blue-600" />
        <Title order={1} className="text-gray-800">
          الإعدادات
        </Title>
      </Group>
      <Text className="text-gray-600">
        إدارة إعدادات التطبيق والتحكم في سلوك الباقات
      </Text>
    </div>
  );
}
