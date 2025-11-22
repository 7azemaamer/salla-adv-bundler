import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Title,
  Text,
  Card,
  Group,
  Badge,
  Button,
  Grid,
  Stack,
  Paper,
  ThemeIcon,
  Divider,
  Alert,
  ActionIcon,
  Menu,
  Skeleton,
  SimpleGrid,
  Progress,
  Overlay,
  Box,
  Select,
} from "@mantine/core";
import {
  IconArrowRight,
  IconPackage,
  IconCalendar,
  IconTarget,
  IconGift,
  IconEye,
  IconClick,
  IconTrendingUp,
  IconCoin,
  IconDots,
  IconEdit,
  IconPlayerPlay,
  IconPlayerPause,
  IconTrash,
  IconChartLine,
  IconExternalLink,
  IconLock,
  IconUsers,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import useBundleStore from "../stores/useBundleStore";
import { usePlanFeatures } from "../hooks/usePlanFeatures";
import UpgradePrompt from "../components/common/UpgradePrompt";

export default function BundleDetailsPage() {
  const { bundleId } = useParams();
  const navigate = useNavigate();
  const {
    currentBundle,
    loading,
    error,
    bundleAggregatedStats,
    getBundleDetails,
    generateOffers,
    deactivateBundle,
    deleteBundle,
    fetchBundleAggregatedStats,
  } = useBundleStore();
  const { features } = usePlanFeatures();
  const hasBundleAnalytics = features.bundleAnalytics !== false;
  const [selectedPeriod, setSelectedPeriod] = useState("30");

  useEffect(() => {
    if (bundleId) {
      getBundleDetails(bundleId);
      if (hasBundleAnalytics) {
        const days = selectedPeriod === "all" ? null : parseInt(selectedPeriod);
        fetchBundleAggregatedStats(bundleId, days);
      }
    }
  }, [
    bundleId,
    selectedPeriod,
    hasBundleAnalytics,
    getBundleDetails,
    fetchBundleAggregatedStats,
  ]);

  const handleGenerateOffers = async () => {
    try {
      await generateOffers(bundleId);
      notifications.show({
        title: "تم تفعيل الباقة",
        message: "تم إنشاء العروض الخاصة وتفعيل الباقة بنجاح",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "خطأ في تفعيل الباقة",
        message: error.message,
        color: "red",
      });
    }
  };

  const handleDeactivate = async () => {
    try {
      await deactivateBundle(bundleId);
      notifications.show({
        title: "تم إلغاء تفعيل الباقة",
        message: "تم إلغاء تفعيل الباقة بنجاح",
        color: "blue",
      });
    } catch (error) {
      notifications.show({
        title: "خطأ في إلغاء التفعيل",
        message: error.message,
        color: "red",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBundle(bundleId);
      notifications.show({
        title: "تم حذف الباقة",
        message: "تم حذف الباقة بنجاح",
        color: "green",
      });
      navigate("/dashboard/bundles");
    } catch (error) {
      notifications.show({
        title: "خطأ في حذف الباقة",
        message: error.message,
        color: "red",
      });
    }
  };

  // Show loading skeleton while fetching data
  if (loading.bundles || (!currentBundle && !error)) {
    return (
      <Container size="xl">
        <Stack gap="lg">
          <Skeleton height={40} radius="md" />
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={120} radius="md" />
            ))}
          </SimpleGrid>
          <Skeleton height={300} radius="md" />
        </Stack>
      </Container>
    );
  }

  // Show error only after loading is complete
  if (error || !currentBundle) {
    return (
      <Container size="xl">
        <Alert color="red" title="خطأ في تحميل البيانات">
          {error || "لم يتم العثور على الباقة"}
        </Alert>
      </Container>
    );
  }

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

  // Always use bundleAggregatedStats from analytics collection
  const displayStats = bundleAggregatedStats || {
    total_views: 0,
    total_clicks: 0,
    total_conversions: 0,
    total_revenue: 0,
    total_unique_visitors: 0,
    average_conversion_rate: 0,
  };

  const conversionRate =
    displayStats.total_views > 0
      ? (
          (displayStats.total_conversions / displayStats.total_views) *
          100
        ).toFixed(1)
      : 0;

  const stats = [
    {
      title: "المشاهدات",
      value: (displayStats.total_views || 0).toLocaleString(),
      icon: IconEye,
      color: "blue",
    },
    {
      title: "الزوار الفريدون",
      value: (displayStats.total_unique_visitors || 0).toLocaleString(),
      icon: IconUsers,
      color: "orange",
    },
    {
      title: "النقرات",
      value: (displayStats.total_clicks || 0).toLocaleString(),
      icon: IconClick,
      color: "violet",
    },
    {
      title: "التحويلات",
      value: (displayStats.total_conversions || 0).toLocaleString(),
      icon: IconTrendingUp,
      color: "green",
    },
  ];

  return (
    <Container size="xl">
      <Stack gap="lg">
        {/* Header */}
        <div>
          <Group gap="md" mb="sm">
            <Button
              variant="light"
              leftSection={<IconArrowRight size="1rem" />}
              onClick={() => navigate("/dashboard/bundles")}
            >
              العودة للباقات
            </Button>
          </Group>

          <Group justify="space-between" align="flex-start" wrap="wrap">
            <div>
              <Group gap="sm" mb="xs">
                <Title order={1} className="text-gray-800">
                  {currentBundle.name}
                </Title>
                <Badge color={statusColors[currentBundle.status]} size="lg">
                  {statusLabels[currentBundle.status]}
                </Badge>
              </Group>
              <Text className="text-gray-600">
                {currentBundle.description || "لا يوجد وصف"}
              </Text>
            </div>

            <Group gap="md">
              {hasBundleAnalytics && (
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
                  w={160}
                />
              )}
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <ActionIcon variant="light" color="gray" size="lg">
                    <IconDots size="1.2rem" />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconEdit size="0.9rem" />}
                    onClick={() =>
                      navigate(`/dashboard/bundles/${bundleId}/edit`)
                    }
                  >
                    تعديل الباقة
                  </Menu.Item>

                  {currentBundle.status === "draft" && (
                    <Menu.Item
                      leftSection={<IconPlayerPlay size="0.9rem" />}
                      color="green"
                      onClick={handleGenerateOffers}
                    >
                      تفعيل الباقة
                    </Menu.Item>
                  )}

                  {currentBundle.status === "active" && (
                    <Menu.Item
                      leftSection={<IconPlayerPause size="0.9rem" />}
                      color="orange"
                      onClick={handleDeactivate}
                    >
                      إلغاء التفعيل
                    </Menu.Item>
                  )}

                  {currentBundle.status === "inactive" && (
                    <Menu.Item
                      leftSection={<IconPlayerPlay size="0.9rem" />}
                      color="green"
                      onClick={handleGenerateOffers}
                    >
                      إعادة تفعيل الباقة
                    </Menu.Item>
                  )}

                  <Menu.Divider />

                  <Menu.Item
                    leftSection={<IconTrash size="0.9rem" />}
                    color="red"
                    onClick={handleDelete}
                  >
                    حذف الباقة
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </div>

        {/* Statistics Cards */}
        <div>
          <SimpleGrid cols={{ base: 2, sm: 2, md: 4 }} spacing="md">
            {stats.map((stat, index) => {
              const isLockedStat =
                !hasBundleAnalytics &&
                (stat.title === "النقرات الكلية" ||
                  stat.title === "التحويلات الكلية");

              return (
                <Box key={index} pos="relative">
                  {isLockedStat && (
                    <Overlay
                      color="#000"
                      backgroundOpacity={0.05}
                      blur={2}
                      zIndex={1}
                      style={{
                        backdropFilter: "blur(6px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ThemeIcon
                        size={40}
                        radius="xl"
                        color="orange"
                        variant="light"
                      >
                        <IconLock size={20} />
                      </ThemeIcon>
                    </Overlay>
                  )}
                  <Card
                    padding="lg"
                    radius="md"
                    withBorder
                    style={{ filter: isLockedStat ? "blur(2px)" : "none" }}
                  >
                    <Group gap="sm">
                      <ThemeIcon
                        size="lg"
                        radius="md"
                        color={stat.color}
                        variant="light"
                      >
                        <stat.icon size="1.2rem" />
                      </ThemeIcon>
                      <div>
                        <Text size="sm" c="dimmed">
                          {stat.title}
                        </Text>
                        <Text size="lg" fw={700}>
                          {stat.value}
                        </Text>
                      </div>
                    </Group>
                  </Card>
                </Box>
              );
            })}
          </SimpleGrid>
        </div>

        {/* Performance Overview */}
        <Box pos="relative">
          {!hasBundleAnalytics && (
            <Overlay
              color="#000"
              backgroundOpacity={0.05}
              blur={3}
              zIndex={1}
              style={{
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Stack align="center" gap="md">
                <ThemeIcon size={60} radius="xl" color="orange" variant="light">
                  <IconLock size={30} />
                </ThemeIcon>
                <UpgradePrompt featureName="أداء الباقة" compact={false} />
              </Stack>
            </Overlay>
          )}
          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            style={{ filter: hasBundleAnalytics ? "none" : "blur(2px)" }}
          >
            <Title order={3} className="text-gray-800" mb="md">
              أداء الباقة
            </Title>

            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>
                      معدل التحويل
                    </Text>
                    <Text size="sm" fw={700} c="green">
                      {conversionRate}%
                    </Text>
                  </Group>
                  <Progress
                    value={parseFloat(conversionRate)}
                    color="green"
                    size="lg"
                  />
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>
                      معدل النقر (CTR)
                    </Text>
                    <Text size="sm" fw={700} c="blue">
                      {displayStats.total_views > 0
                        ? (
                            (displayStats.total_clicks /
                              displayStats.total_views) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </Text>
                  </Group>
                  <Progress
                    value={
                      displayStats.total_views > 0
                        ? (displayStats.total_clicks /
                            displayStats.total_views) *
                          100
                        : 0
                    }
                    color="blue"
                    size="lg"
                  />
                </Stack>
              </Grid.Col>
            </Grid>
          </Card>
        </Box>

        {/* Tier Analytics */}
        <Box pos="relative">
          {!hasBundleAnalytics && (
            <Overlay
              color="#000"
              backgroundOpacity={0.05}
              blur={3}
              zIndex={1}
              style={{
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Stack align="center" gap="md">
                <ThemeIcon size={60} radius="xl" color="orange" variant="light">
                  <IconLock size={30} />
                </ThemeIcon>
                <UpgradePrompt featureName="تحليلات العروض" compact={false} />
              </Stack>
            </Overlay>
          )}
          <Card
            shadow="sm"
            padding="md"
            radius="md"
            withBorder
            style={{ filter: hasBundleAnalytics ? "none" : "blur(2px)" }}
          >
            <Title order={3} className="text-gray-800" mb="sm">
              تحليلات العروض (الباقات)
            </Title>

            {currentBundle.bundles && currentBundle.bundles.length > 0 ? (
              <Stack gap="xs">
                {currentBundle.bundles.map((tier, index) => {
                  const checkouts = tier.tier_checkouts || 0;
                  const bundleViews = currentBundle.total_views || 0;
                  const conversionRate =
                    bundleViews > 0
                      ? ((checkouts / bundleViews) * 100).toFixed(1)
                      : 0;

                  return (
                    <Paper key={index} p="sm" withBorder>
                      <Group justify="space-between" mb="xs">
                        <Group gap="xs">
                          <Text fw={600} size="md">
                            {tier.tier_title || `العرض ${tier.tier}`}
                          </Text>
                          <Badge size="xs" variant="light" color="blue">
                            اشترِ {tier.buy_quantity}
                          </Badge>
                          {tier.is_default && (
                            <Badge size="xs" variant="light" color="yellow">
                              افتراضي
                            </Badge>
                          )}
                        </Group>
                      </Group>

                      <Group justify="space-between" grow>
                        <Stack gap={2}>
                          <Text size="xs" c="dimmed">
                            نقرات الدفع
                          </Text>
                          <Text size="lg" fw={700} c="blue">
                            {checkouts}
                          </Text>
                        </Stack>
                        <Stack gap={2}>
                          <Text size="xs" c="dimmed">
                            معدل التحويل من المشاهدات
                          </Text>
                          <Text size="lg" fw={700} c="violet">
                            {conversionRate}%
                          </Text>
                        </Stack>
                      </Group>
                    </Paper>
                  );
                })}

                <Alert color="blue" variant="light" title="ملاحظة" p="xs">
                  <Text size="xs">
                    <strong>نقرات الدفع:</strong> عدد المرات التي نقر فيها
                    العملاء على زر الدفع مع هذا العرض المحدد
                    <br />
                    <strong>معدل التحويل من المشاهدات:</strong> نسبة العملاء
                    الذين نقروا على الدفع مع هذا العرض من إجمالي مشاهدات الباقة
                  </Text>
                </Alert>
              </Stack>
            ) : (
              <Text c="dimmed" size="sm">
                لا توجد بيانات تحليلية متاحة بعد
              </Text>
            )}
          </Card>
        </Box>

        {/* Bundle Configuration */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={3} className="text-gray-800" mb="md">
                معلومات الباقة
              </Title>

              <Stack gap="md">
                <Group gap="sm">
                  <ThemeIcon size="sm" color="blue" variant="light">
                    <IconTarget size="0.9rem" />
                  </ThemeIcon>
                  <div>
                    <Text size="sm" c="dimmed">
                      المنتج المستهدف
                    </Text>
                    <Text size="sm" fw={500}>
                      {currentBundle.target_product_name ||
                        `منتج ${currentBundle.target_product_id}`}
                    </Text>
                  </div>
                </Group>

                <Group gap="sm">
                  <ThemeIcon size="sm" color="green" variant="light">
                    <IconCalendar size="0.9rem" />
                  </ThemeIcon>
                  <div>
                    <Text size="sm" c="dimmed">
                      تاريخ البدء
                    </Text>
                    <Text size="sm" fw={500}>
                      {new Date(currentBundle.start_date).toLocaleDateString(
                        "ar-SA"
                      )}
                    </Text>
                  </div>
                </Group>

                {currentBundle.expiry_date && (
                  <Group gap="sm">
                    <ThemeIcon size="sm" color="orange" variant="light">
                      <IconCalendar size="0.9rem" />
                    </ThemeIcon>
                    <div>
                      <Text size="sm" c="dimmed">
                        تاريخ الانتهاء
                      </Text>
                      <Text size="sm" fw={500}>
                        {new Date(currentBundle.expiry_date).toLocaleDateString(
                          "ar-SA"
                        )}
                      </Text>
                    </div>
                  </Group>
                )}

                <Group gap="sm">
                  <ThemeIcon size="sm" color="violet" variant="light">
                    <IconPackage size="0.9rem" />
                  </ThemeIcon>
                  <div>
                    <Text size="sm" c="dimmed">
                      عدد العروض
                    </Text>
                    <Text size="sm" fw={500}>
                      {currentBundle.bundles?.length || 0} عرض
                    </Text>
                  </div>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={3} className="text-gray-800" mb="md">
                عروض الباقة
              </Title>

              <Stack gap="md">
                {currentBundle.bundles?.map((tier, index) => (
                  <Paper key={index} p="md" withBorder>
                    <Group justify="space-between" mb="sm">
                      <Text fw={600}>العرض {tier.tier}</Text>
                      <Badge size="sm" variant="light">
                        اشترِ {tier.buy_quantity}
                      </Badge>
                    </Group>

                    <Stack gap="xs">
                      {tier.offers?.map((offer, offerIndex) => (
                        <Group key={offerIndex} gap="xs">
                          <ThemeIcon size="xs" color="green" variant="light">
                            <IconGift size="0.7rem" />
                          </ThemeIcon>
                          <Text size="sm" c="dimmed">
                            {offer.product_name || `منتج ${offer.product_id}`}
                            {offer.discount_type === "free" && " (مجاني)"}
                            {offer.discount_type === "percentage" &&
                              ` (خصم ${offer.discount_amount}%)`}
                            {offer.discount_type === "fixed_amount" &&
                              ` (خصم ${offer.discount_amount} ر.س)`}
                            {offer.quantity > 1 && ` × ${offer.quantity}`}
                          </Text>
                        </Group>
                      )) ||
                        tier.gifts?.map((gift, giftIndex) => (
                          <Group key={giftIndex} gap="xs">
                            <ThemeIcon size="xs" color="green" variant="light">
                              <IconGift size="0.7rem" />
                            </ThemeIcon>
                            <Text size="sm" c="dimmed">
                              {gift.product_name || `منتج ${gift.product_id}`}{" "}
                              (مجاني)
                              {gift.quantity > 1 && ` × ${gift.quantity}`}
                            </Text>
                          </Group>
                        ))}
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Status-specific alerts */}
        {currentBundle.status === "draft" && (
          <Alert color="yellow" title="باقة غير مفعلة">
            هذه الباقة ما زالت في وضع المسودة. اضغط على "تفعيل المركب" لإنشاء
            العروض الخاصة وتفعيلها.
          </Alert>
        )}

        {currentBundle.status === "expired" && (
          <Alert color="red" title="باقة منتهية الصلاحية">
            انتهت صلاحية هذه الباقة. يمكنك تعديل تاريخ الانتهاء أو إنشاء باقة
            جديدة.
          </Alert>
        )}
      </Stack>
    </Container>
  );
}
