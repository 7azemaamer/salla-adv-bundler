import { useEffect } from "react";
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
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import useBundleStore from "../stores/useBundleStore";

export default function BundleDetailsPage() {
  const { bundleId } = useParams();
  const navigate = useNavigate();
  const {
    currentBundle,
    loading,
    error,
    getBundleDetails,
    generateOffers,
    deactivateBundle,
    deleteBundle,
  } = useBundleStore();

  useEffect(() => {
    if (bundleId) {
      getBundleDetails(bundleId);
    }
  }, [bundleId, getBundleDetails]);

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

  if (loading.bundles) {
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

  const conversionRate =
    currentBundle.total_clicks > 0
      ? (
          (currentBundle.total_conversions / currentBundle.total_clicks) *
          100
        ).toFixed(1)
      : 0;

  const stats = [
    {
      title: "إجمالي المشاهدات",
      value: currentBundle.total_views || 0,
      icon: IconEye,
      color: "blue",
    },
    {
      title: "إجمالي النقرات",
      value: currentBundle.total_clicks || 0,
      icon: IconClick,
      color: "violet",
    },
    {
      title: "إجمالي التحويلات",
      value: currentBundle.total_conversions || 0,
      icon: IconTrendingUp,
      color: "green",
    },
    // {
    //   title: "الإيرادات المحققة",
    //   value: `${(currentBundle.total_revenue || 0).toFixed(2)} ر.س`,
    //   icon: IconCoin,
    //   color: "orange",
    // },
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

          <Group justify="space-between" align="flex-start">
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
                {/* 
                <Menu.Item
                  leftSection={<IconExternalLink size="0.9rem" />}
                  onClick={() => {
                    // Use the constructed product_url if available, otherwise fallback
                    const previewUrl =
                      currentBundle.product_url ||
                      `https://${
                        currentBundle.store_domain || "store.salla.sa"
                      }/p${currentBundle.target_product_id}`;
                    window.open(previewUrl, "_blank");
                  }}
                  disabled={currentBundle.status !== "active"}
                >
                  معاينة في المتجر
                </Menu.Item> */}

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
        </div>

        {/* Statistics Cards */}
        <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="md">
          {stats.map((stat, index) => (
            <Card key={index} padding="lg" radius="md" withBorder>
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
          ))}
        </SimpleGrid>

        {/* Performance Overview */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
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
                    {currentBundle.total_views > 0
                      ? (
                          (currentBundle.total_clicks /
                            currentBundle.total_views) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </Text>
                </Group>
                <Progress
                  value={
                    currentBundle.total_views > 0
                      ? (currentBundle.total_clicks /
                          currentBundle.total_views) *
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
                      عدد المستويات
                    </Text>
                    <Text size="sm" fw={500}>
                      {currentBundle.bundles?.length || 0} مستوى
                    </Text>
                  </div>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={3} className="text-gray-800" mb="md">
                مستويات الباقة
              </Title>

              <Stack gap="md">
                {currentBundle.bundles?.map((tier, index) => (
                  <Paper key={index} p="md" withBorder>
                    <Group justify="space-between" mb="sm">
                      <Text fw={600}>المستوى {tier.tier}</Text>
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
            هذه الباقة ما زالت في وضع المسودة. اضغط على "تفعيل الباقة" لإنشاء
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
