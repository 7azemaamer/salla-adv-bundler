import { Container, Title, Text } from "@mantine/core";

export default function SettingsPage() {
  return (
    <Container size="lg">
      <Title order={1} className="text-gray-800 mb-2">
        الإعدادات
      </Title>
      <Text className="text-gray-600 mb-8">إدارة إعدادات الحساب والتطبيق</Text>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
        <Text size="lg" fw={600} className="text-yellow-700 mb-2">
          قيد التطوير
        </Text>
        <Text className="text-yellow-600">
          صفحة الإعدادات قيد التطوير وستكون متاحة قريباً
        </Text>
      </div>
    </Container>
  );
}
