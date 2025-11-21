import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Text,
  Alert,
  Card,
  Group,
  Stack,
  Paper,
  Grid,
  SimpleGrid,
  ThemeIcon,
  Select,
  LoadingOverlay,
  Badge,
  Progress,
  RingProgress,
} from "@mantine/core";
import {
  IconLock,
  IconTrendingUp,
  IconTrendingDown,
  IconEye,
  IconClick,
  IconShoppingCart,
  IconCoin,
  IconPercentage,
  IconPackage,
  IconChartBar,
} from "@tabler/icons-react";
import { usePlanFeatures } from "../hooks/usePlanFeatures";
import UpgradePrompt from "../components/common/UpgradePrompt";
import useBundleStore from "../stores/useBundleStore";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsPage() {
  const { features } = usePlanFeatures();
  const {
    storeAnalytics,
    bundles,
    fetchStoreAnalytics,
    fetchBundles,
    loading,
  } = useBundleStore();

  const [selectedPeriod, setSelectedPeriod] = useState("30");

  useEffect(() => {
    if (features.analyticsPage) {
      // For "all" period, we'll calculate from bundles, but still fetch for consistency
      const days = selectedPeriod === "all" ? null : parseInt(selectedPeriod);
      fetchStoreAnalytics(days);
      fetchBundles();
    }
  }, [
    features.analyticsPage,
    selectedPeriod,
    fetchStoreAnalytics,
    fetchBundles,
  ]);

  // Check if user has access to analytics page
  if (!features.analyticsPage) {
    return (
      <Container size="xl">
        <Title order={1} className="text-gray-800 mb-2">
          التحليلات والتقارير
        </Title>
        <Text className="text-gray-600 mb-8">
          تحليل أداء الباقات والمبيعات والتحويلات
        </Text>
        <div className="mt-4"></div>

        <UpgradePrompt featureName="صفحة التحليلات" compact={false} />
      </Container>
    );
  }

  // Always use storeAnalytics from analytics collection
  const stats = storeAnalytics?.data || {};

  // Prepare chart data
  const conversionData = [
    { name: "المشاهدات", value: stats.total_views || 0 },
    { name: "النقرات", value: stats.total_clicks || 0 },
    { name: "التحويلات", value: stats.total_conversions || 0 },
  ];

  const bundlePerformanceData =
    bundles
      ?.filter((b) => b.status === "active")
      .slice(0, 5)
      .map((bundle) => ({
        name: bundle.name,
        views: bundle.current_month_analytics?.views || 0,
        clicks: bundle.current_month_analytics?.clicks || 0,
        conversions: bundle.current_month_analytics?.conversions || 0,
        revenue: bundle.current_month_analytics?.revenue || 0,
      })) || [];

  const COLORS = ["#228be6", "#40c057", "#fab005", "#fd7e14", "#e64980"];

  const conversionRate =
    stats.total_views > 0
      ? ((stats.total_conversions / stats.total_views) * 100).toFixed(2)
      : 0;

  const clickThroughRate =
    stats.total_views > 0
      ? ((stats.total_clicks / stats.total_views) * 100).toFixed(2)
      : 0;

  return (
    <Container size="xl">
      <LoadingOverlay visible={loading.analytics} />

      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1} className="text-gray-800 mb-2">
            التحليلات والتقارير
          </Title>
          <Text className="text-gray-600">
            نظرة شاملة على أداء باقاتك والمبيعات
          </Text>
        </div>
        <Select
          placeholder="الفترة الزمنية"
          value={selectedPeriod}
          onChange={setSelectedPeriod}
          data={[
            { value: "7", label: "آخر 7 أيام" },
            { value: "30", label: "آخر 30 يوم" },
            { value: "90", label: "آخر 90 يوم" },
            { value: "365", label: "آخر سنة" },
            { value: "all", label: "كل الوقت" },
          ]}
          w={180}
        />
      </Group>

      {/* Key Metrics */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb="xl">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>
              إجمالي المشاهدات
            </Text>
            <ThemeIcon color="blue" variant="light" size="lg" radius="md">
              <IconEye size="1.2rem" />
            </ThemeIcon>
          </Group>
          <Text size="xl" fw={700} className="text-gray-800">
            {(stats.total_views || 0).toLocaleString()}
          </Text>
          <Group gap={4} mt="xs">
            <IconTrendingUp size="1rem" color="green" />
            <Text size="xs" c="dimmed">
              +12% من الشهر الماضي
            </Text>
          </Group>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>
              إجمالي النقرات
            </Text>
            <ThemeIcon color="green" variant="light" size="lg" radius="md">
              <IconClick size="1.2rem" />
            </ThemeIcon>
          </Group>
          <Text size="xl" fw={700} className="text-gray-800">
            {(stats.total_clicks || 0).toLocaleString()}
          </Text>
          <Group gap={4} mt="xs">
            <Text size="xs" c="dimmed">
              معدل النقر: {clickThroughRate}%
            </Text>
          </Group>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>
              إجمالي التحويلات
            </Text>
            <ThemeIcon color="orange" variant="light" size="lg" radius="md">
              <IconShoppingCart size="1.2rem" />
            </ThemeIcon>
          </Group>
          <Text size="xl" fw={700} className="text-gray-800">
            {(stats.total_conversions || 0).toLocaleString()}
          </Text>
          <Group gap={4} mt="xs">
            <Text size="xs" c="dimmed">
              معدل التحويل: {conversionRate}%
            </Text>
          </Group>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>
              إجمالي الإيرادات
            </Text>
            <ThemeIcon color="teal" variant="light" size="lg" radius="md">
              <IconCoin size="1.2rem" />
            </ThemeIcon>
          </Group>
          <Text size="xl" fw={700} className="text-gray-800">
            {(stats.total_revenue || 0).toLocaleString()} ر.س
          </Text>
          <Group gap={4} mt="xs">
            <IconTrendingUp size="1rem" color="green" />
            <Text size="xs" c="dimmed">
              +8% من الشهر الماضي
            </Text>
          </Group>
        </Card>
      </SimpleGrid>

      <Grid mb="xl">
        {/* Conversion Funnel */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Text size="lg" fw={600} mb="md">
              مسار التحويل
            </Text>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#228be6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid.Col>

        {/* Conversion Rate */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Text size="lg" fw={600} mb="md">
              معدلات الأداء
            </Text>
            <Stack gap="xl" mt="xl">
              <div>
                <Group justify="space-between" mb="xs">
                  <Text size="sm" fw={500}>
                    معدل التحويل
                  </Text>
                  <Text size="sm" fw={700} c="blue">
                    {conversionRate}%
                  </Text>
                </Group>
                <Progress value={parseFloat(conversionRate)} color="blue" />
              </div>

              <div>
                <Group justify="space-between" mb="xs">
                  <Text size="sm" fw={500}>
                    معدل النقر (CTR)
                  </Text>
                  <Text size="sm" fw={700} c="green">
                    {clickThroughRate}%
                  </Text>
                </Group>
                <Progress value={parseFloat(clickThroughRate)} color="green" />
              </div>

              <div>
                <Group justify="space-between" mb="xs">
                  <Text size="sm" fw={500}>
                    متوسط قيمة الطلب
                  </Text>
                  <Text size="sm" fw={700} c="orange">
                    {stats.total_conversions > 0
                      ? (stats.total_revenue / stats.total_conversions).toFixed(
                          2
                        )
                      : 0}{" "}
                    ر.س
                  </Text>
                </Group>
                <Progress
                  value={
                    stats.total_revenue > 0
                      ? Math.min(
                          (stats.total_revenue /
                            stats.total_conversions /
                            1000) *
                            100,
                          100
                        )
                      : 0
                  }
                  color="orange"
                />
              </div>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Bundle Performance */}
      <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
        <Text size="lg" fw={600} mb="md">
          أداء الباقات (أفضل 5)
        </Text>
        {bundlePerformanceData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={bundlePerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="views" fill="#228be6" name="المشاهدات" />
              <Bar dataKey="clicks" fill="#40c057" name="النقرات" />
              <Bar dataKey="conversions" fill="#fab005" name="التحويلات" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Paper p="xl" className="bg-gray-50 text-center">
            <IconPackage size={48} className="text-gray-400 mx-auto mb-2" />
            <Text c="dimmed">لا توجد بيانات لعرضها</Text>
          </Paper>
        )}
      </Card>

      {/* Top Performing Bundles */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text size="lg" fw={600} mb="md">
          الباقات الأعلى أداءً (هذا الشهر)
        </Text>
        <Stack gap="md">
          {bundles && bundles.length > 0 ? (
            bundles
              .filter((b) => b.status === "active")
              .sort(
                (a, b) =>
                  (b.current_month_analytics?.conversions || 0) -
                  (a.current_month_analytics?.conversions || 0)
              )
              .slice(0, 5)
              .map((bundle, index) => (
                <Paper key={bundle._id} p="md" withBorder>
                  <Group justify="space-between">
                    <Group>
                      <ThemeIcon
                        color={COLORS[index % COLORS.length]}
                        variant="light"
                        size="lg"
                      >
                        <IconPackage size="1.2rem" />
                      </ThemeIcon>
                      <div>
                        <Text fw={500}>{bundle.name}</Text>
                        <Text size="xs" c="dimmed">
                          {bundle.bundles?.length || 0} عروض
                        </Text>
                      </div>
                    </Group>
                    <Group gap="xl">
                      <div className="text-center">
                        <Text size="xs" c="dimmed">
                          المشاهدات
                        </Text>
                        <Text fw={700}>
                          {(
                            bundle.current_month_analytics?.views || 0
                          ).toLocaleString()}
                        </Text>
                      </div>
                      <div className="text-center">
                        <Text size="xs" c="dimmed">
                          التحويلات
                        </Text>
                        <Text fw={700} c="blue">
                          {(
                            bundle.current_month_analytics?.conversions || 0
                          ).toLocaleString()}
                        </Text>
                      </div>
                      <div className="text-center">
                        <Text size="xs" c="dimmed">
                          الإيرادات
                        </Text>
                        <Text fw={700} c="teal">
                          {(
                            bundle.current_month_analytics?.revenue || 0
                          ).toLocaleString()}{" "}
                          ر.س
                        </Text>
                      </div>
                    </Group>
                  </Group>
                </Paper>
              ))
          ) : (
            <Paper p="xl" className="bg-gray-50 text-center">
              <IconPackage size={48} className="text-gray-400 mx-auto mb-2" />
              <Text c="dimmed">لا توجد باقات نشطة</Text>
            </Paper>
          )}
        </Stack>
      </Card>
    </Container>
  );
}
