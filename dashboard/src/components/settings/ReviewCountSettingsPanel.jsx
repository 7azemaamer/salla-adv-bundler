import {
  Stack,
  Switch,
  Text,
  Group,
  NumberInput,
  Select,
  Paper,
  Badge,
} from "@mantine/core";
import { IconStar, IconTrendingUp } from "@tabler/icons-react";

export default function ReviewCountSettingsPanel({ settings, onToggle }) {
  const reviewCountSettings = settings?.review_count || {};

  return (
    <Stack gap="xl">
      {/* Enable/Disable Review Count Display */}
      <Paper p="md" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <div style={{ flex: 1 }}>
              <Group gap="xs" mb={4}>
                <IconStar size="1.1rem" style={{ color: "#f59f00" }} />
                <Text fw={600} size="sm">
                  عرض عدد التقييمات
                </Text>
              </Group>
              <Text size="xs" c="dimmed">
                عرض عدد التقييمات في قسم آراء العملاء داخل نافذة الباقة
              </Text>
            </div>
            <Switch
              checked={
                reviewCountSettings.enabled === undefined
                  ? true
                  : reviewCountSettings.enabled
              }
              onChange={(e) =>
                onToggle("review_count.enabled", e.currentTarget.checked)
              }
              disabled={false}
              size="md"
            />
          </Group>
        </Stack>
      </Paper>

      {/* Mode Selection */}
      {reviewCountSettings.enabled !== false && (
        <Paper p="md" radius="md" withBorder>
          <Stack gap="md">
            <Group gap="xs">
              <Text fw={600} size="sm">
                نوع العدد
              </Text>
            </Group>
            <Select
              value={reviewCountSettings.mode || "real"}
              onChange={(value) => onToggle("review_count.mode", value)}
              data={[
                { value: "real", label: "عدد حقيقي (عدد التقييمات الفعلية)" },
                { value: "custom", label: "عدد مخصص (يزيد تلقائياً كل يوم)" },
              ]}
              disabled={false}
            />
            <Text size="xs" c="dimmed">
              {reviewCountSettings.mode === "custom"
                ? "سيتم عرض عدد مخصص ويزداد تلقائياً كل يوم برقم عشوائي بين الحد الأدنى والأقصى"
                : "سيتم عرض عدد التقييمات الحقيقية المضافة من لوحة التحكم"}
            </Text>
          </Stack>
        </Paper>
      )}

      {/* Custom Number Settings */}
      {reviewCountSettings.enabled !== false &&
        reviewCountSettings.mode === "custom" && (
          <>
            {/* Current Count Display */}
            <Paper p="md" radius="md" withBorder>
              <Stack gap="md">
                <Group justify="space-between">
                  <div>
                    <Text fw={600} size="sm" mb={4}>
                      العدد الحالي
                    </Text>
                    <Text size="xs" c="dimmed">
                      هذا هو العدد الذي يظهر حالياً للعملاء
                    </Text>
                  </div>
                  <Badge size="xl" variant="light" color="blue">
                    <Group gap={4}>
                      <IconStar size="0.9rem" />
                      <Text fw={700}>
                        {(
                          reviewCountSettings.current_count ||
                          reviewCountSettings.initial_count ||
                          150
                        ).toLocaleString("en-US")}
                      </Text>
                    </Group>
                  </Badge>
                </Group>
              </Stack>
            </Paper>

            {/* Initial Count */}
            <Paper p="md" radius="md" withBorder>
              <Stack gap="md">
                <Text fw={600} size="sm">
                  العدد الابتدائي
                </Text>
                <NumberInput
                  value={reviewCountSettings.initial_count || 150}
                  onChange={(value) =>
                    onToggle("review_count.initial_count", value)
                  }
                  min={0}
                  max={100000}
                  disabled={false}
                  leftSection={<IconStar size="1rem" />}
                  description="العدد الذي سيبدأ منه النظام (يمكن تغييره في أي وقت)"
                />
              </Stack>
            </Paper>

            {/* Daily Increase Range */}
            <Paper p="md" radius="md" withBorder>
              <Stack gap="md">
                <Group gap="xs">
                  <IconTrendingUp size="1.1rem" style={{ color: "#40c057" }} />
                  <Text fw={600} size="sm">
                    نطاق الزيادة اليومية
                  </Text>
                </Group>
                <Text size="xs" c="dimmed" mb="md">
                  كل يوم سيتم إضافة رقم عشوائي بين الحد الأدنى والأقصى إلى العدد
                  الحالي
                </Text>
                <Group grow>
                  <NumberInput
                    label="الحد الأدنى"
                    value={reviewCountSettings.daily_increase_min || 1}
                    onChange={(value) =>
                      onToggle("review_count.daily_increase_min", value)
                    }
                    min={0}
                    max={reviewCountSettings.daily_increase_max || 100}
                    disabled={false}
                    description="أقل رقم يمكن إضافته يومياً"
                  />
                  <NumberInput
                    label="الحد الأقصى"
                    value={reviewCountSettings.daily_increase_max || 5}
                    onChange={(value) =>
                      onToggle("review_count.daily_increase_max", value)
                    }
                    min={reviewCountSettings.daily_increase_min || 0}
                    max={100}
                    disabled={false}
                    description="أكبر رقم يمكن إضافته يومياً"
                  />
                </Group>
                <Text size="xs" c="dimmed" mt="xs">
                  مثال: إذا كان الحد الأدنى 1 والأقصى 5، سيتم إضافة رقم عشوائي
                  بين 1 و 5 كل يوم (مثل: 3، 2، 5، 1، 4...)
                </Text>
              </Stack>
            </Paper>

            {/* Last Update Info */}
            {reviewCountSettings.last_update_date && (
              <Paper p="md" radius="md" withBorder bg="gray.0">
                <Text size="xs" c="dimmed">
                  آخر تحديث تلقائي:{" "}
                  {new Date(
                    reviewCountSettings.last_update_date
                  ).toLocaleDateString("ar-SA", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </Paper>
            )}
          </>
        )}
    </Stack>
  );
}
