import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Card,
  Text,
  Title,
  Group,
  Badge,
  ActionIcon,
  SimpleGrid,
  Progress,
  ThemeIcon,
  Stack,
  Button,
  Alert,
  Skeleton,
} from "@mantine/core";
import {
  IconPackage,
  IconTrendingUp,
  IconEye,
  IconClick,
  IconCurrencyDollar,
  IconPlus,
  IconChartBar,
  IconGift,
  IconInfoCircle,
  IconArrowUpRight,
} from "@tabler/icons-react";
import useAuthStore from "../stores/useAuthStore";
import useBundleStore from "../stores/useBundleStore";

function StatCard({
  title,
  value,
  color,
  description,
  trend,
  icon: IconComponent,
}) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between">
        <div>
          <Text size="sm" c="dimmed" fw={500}>
            {title}
          </Text>
          <Text size="xl" fw={700} mt="xs">
            {value}
          </Text>
          {description && (
            <Text size="xs" c="dimmed" mt={4}>
              {description}
            </Text>
          )}
        </div>
        <ThemeIcon size="xl" variant="light" color={color}>
          {IconComponent && <IconComponent size="1.4rem" />}
        </ThemeIcon>
      </Group>

      {trend && (
        <Group gap="xs" mt="md">
          <IconArrowUpRight size="0.8rem" className="text-green-600" />
          <Text size="xs" c="green" fw={500}>
            +{trend}% هذا الشهر
          </Text>
        </Group>
      )}
    </Card>
  );
}

function QuickActionCard({
  title,
  description,
  icon: IconComponent,
  color,
  onClick,
  buttonText,
}) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder className="h-full">
      <Stack gap="md">
        <Group>
          <ThemeIcon size="lg" variant="light" color={color}>
            {IconComponent && <IconComponent size="1.2rem" />}
          </ThemeIcon>
          <div>
            <Text fw={600}>{title}</Text>
            <Text size="sm" c="dimmed">
              {description}
            </Text>
          </div>
        </Group>

        <Button
          variant="light"
          color={color}
          size="sm"
          onClick={onClick}
          fullWidth
        >
          {buttonText}
        </Button>
      </Stack>
    </Card>
  );
}

function RecentBundleCard({ bundle, onView }) {
  const statusColors = {
    active: "green",
    draft: "yellow",
    inactive: "gray",
    expired: "red",
  };

  const statusLabels = {
    active: "نشط",
    draft: "مسودة",
    inactive: "غير نشط",
    expired: "منتهي الصلاحية",
  };

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <Text fw={500} lineClamp={1}>
          {bundle.name}
        </Text>
        <Badge color={statusColors[bundle.status]} size="sm">
          {statusLabels[bundle.status]}
        </Badge>
      </Group>

      <Text size="sm" c="dimmed" mb="md" lineClamp={1}>
        {bundle.target_product_name || `منتج ${bundle.target_product_id}`}
      </Text>

      <Group justify="space-between">
        <div>
          <Text size="xs" c="dimmed">
            المشاهدات
          </Text>
          <Text size="sm" fw={500}>
            {bundle.total_views || 0}
          </Text>
        </div>
        <div>
          <Text size="xs" c="dimmed">
            التحويلات
          </Text>
          <Text size="sm" fw={500}>
            {bundle.total_conversions || 0}
          </Text>
        </div>
        <Button variant="light" size="xs" onClick={() => onView(bundle._id)}>
          عرض
        </Button>
      </Group>
    </Card>
  );
}

export default function DashboardHome() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { bundles, loading, fetchBundles } = useBundleStore();

  const stats = {
    total: bundles.length,
    active: bundles.filter((b) => b.status === "active").length,
    draft: bundles.filter((b) => b.status === "draft").length,
    inactive: bundles.filter((b) => b.status === "inactive").length,
    totalViews: bundles.reduce((sum, b) => sum + (b.total_views || 0), 0),
    totalClicks: bundles.reduce((sum, b) => sum + (b.total_clicks || 0), 0),
    totalConversions: bundles.reduce(
      (sum, b) => sum + (b.total_conversions || 0),
      0
    ),
    totalRevenue: bundles.reduce((sum, b) => sum + (b.total_revenue || 0), 0),
  };

  useEffect(() => {
    fetchBundles();
  }, [fetchBundles]);

  const quickActions = [
    {
      title: "إنشاء باقة جديدة",
      description: "أنشئ باقة مخصصة مع هدايا مجانية",
      icon: IconPlus,
      color: "blue",
      buttonText: "إنشاء الآن",
      onClick: () => navigate("/dashboard/bundles/create"),
    },
    {
      title: "عرض التحليلات",
      description: "تحليل أداء العروض والمبيعات",
      icon: IconChartBar,
      color: "violet",
      buttonText: "عرض التقارير",
      onClick: () => navigate("/dashboard/analytics"),
    },
    {
      title: "إدارة العروض",
      description: "عرض وتعديل العروض الحالية",
      icon: IconPackage,
      color: "green",
      buttonText: "إدارة العروض",
      onClick: () => navigate("/dashboard/bundles"),
    },
  ];

  const recentBundles = bundles.slice(0, 3);
  const conversionRate =
    stats.totalClicks > 0
      ? ((stats.totalConversions / stats.totalClicks) * 100).toFixed(1)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Title order={1} className="text-gray-800 mb-2">
          أهلاً بك، {user?.name}
        </Title>
        <Text className="text-gray-600">
          إليك نظرة سريعة على أداء باقاتك ومبيعاتك
        </Text>
      </div>

      {/* Plan Limit Alert */}
      {stats.total >=
        (user?.plan === "basic" ? 3 : user?.plan === "pro" ? 10 : 50) && (
        <Alert
          icon={<IconInfoCircle size="1rem" />}
          title="وصلت إلى الحد الأقصى للباقات"
          color="yellow"
          variant="light"
        >
          لقد وصلت إلى الحد الأقصى لعدد العروض في خطتك الحالية.
          <Button variant="light" size="xs" ml="sm">
            ترقية الخطة
          </Button>
        </Alert>
      )}

      {/* Stats Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        <StatCard
          title="إجمالي العروض"
          value={stats.total}
          icon={IconPackage}
          color="blue"
          description={`${stats.active} نشط من ${stats.total}`}
        />

        <StatCard
          title="إجمالي المشاهدات"
          value={stats.totalViews.toLocaleString()}
          icon={IconEye}
          color="green"
          trend={12}
        />

        <StatCard
          title="معدل التحويل"
          value={`${conversionRate}%`}
          icon={IconClick}
          color="violet"
          description={`${stats.totalConversions} من ${stats.totalClicks}`}
        />
        {/* 
        <StatCard
          title="إجمالي الإيرادات"
          value={`${stats.totalRevenue.toLocaleString()} ريال`}
          icon={IconCurrencyDollar}
          color="orange"
          trend={25}
        /> */}
      </SimpleGrid>

      {/* Progress Bar */}
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <div>
            <Text fw={600}>استخدام الخطة الحالية</Text>
            <Text size="sm" c="dimmed">
              {stats.total} من{" "}
              {user?.plan === "basic" ? 3 : user?.plan === "pro" ? 10 : 50} باقة
            </Text>
          </div>
          <Badge
            variant="light"
            color={
              user?.plan === "basic"
                ? "blue"
                : user?.plan === "pro"
                ? "green"
                : "purple"
            }
            className="capitalize"
          >
            {user?.plan || "basic"}
          </Badge>
        </Group>

        <Progress
          value={
            (stats.total /
              (user?.plan === "basic" ? 3 : user?.plan === "pro" ? 10 : 50)) *
            100
          }
          color={
            user?.plan === "basic"
              ? "blue"
              : user?.plan === "pro"
              ? "green"
              : "purple"
          }
          size="lg"
        />
      </Card>

      <Grid>
        {/* Quick Actions */}
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">
              إجراءات سريعة
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
              {quickActions.map((action, index) => (
                <QuickActionCard key={index} {...action} />
              ))}
            </SimpleGrid>
          </Card>
        </Grid.Col>

        {/* Recent Bundles */}
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            className="h-full"
          >
            <Group justify="space-between" mb="md">
              <Title order={3}>العروض الأخيرة</Title>
              <Button
                variant="light"
                size="xs"
                onClick={() => navigate("/dashboard/bundles")}
              >
                عرض الكل
              </Button>
            </Group>

            <Stack gap="sm">
              {loading.bundles ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} height={80} radius="md" />
                ))
              ) : recentBundles.length > 0 ? (
                recentBundles.map((bundle) => (
                  <RecentBundleCard
                    key={bundle._id}
                    bundle={bundle}
                    onView={(id) => navigate(`/dashboard/bundles/${id}`)}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <ThemeIcon
                    size="xl"
                    variant="light"
                    color="gray"
                    className="mx-auto mb-4"
                  >
                    <IconGift size="1.4rem" />
                  </ThemeIcon>
                  <Text c="dimmed" size="sm">
                    لا توجد باقات بعد
                  </Text>
                  <Button
                    variant="light"
                    size="sm"
                    mt="sm"
                    onClick={() => navigate("/dashboard/bundles/create")}
                  >
                    إنشاء أول باقة
                  </Button>
                </div>
              )}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </div>
  );
}
