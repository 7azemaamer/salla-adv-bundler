import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Group,
  Title,
  Button,
  TextInput,
  Select,
  Card,
  Text,
  Badge,
  ActionIcon,
  Menu,
  Grid,
  Stack,
  Container,
  Alert,
  Skeleton,
  Pagination,
  Modal,
  Center,
  ThemeIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconPlus,
  IconSearch,
  IconDots,
  IconEye,
  IconEdit,
  IconTrash,
  IconPlayerPlay,
  IconPlayerPause,
  IconPackage,
  IconTrendingUp,
  IconCalendar,
  IconTarget,
  IconGift,
  IconCheck,
  IconX,
  IconExternalLink,
} from "@tabler/icons-react";
import useBundleStore from "../stores/useBundleStore";

function BundleCard({
  bundle,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onGenerateOffers,
}) {
  const [actionLoading, setActionLoading] = useState("");

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

  const handleAction = async (action, actionType) => {
    setActionLoading(actionType);
    try {
      await action();
    } catch (error) {
      console.error(`Action ${actionType} failed:`, error);
    } finally {
      setActionLoading("");
    }
  };

  const conversionRate =
    bundle.total_clicks > 0
      ? ((bundle.total_conversions / bundle.total_clicks) * 100).toFixed(1)
      : 0;

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      {/* Header */}
      <Group justify="space-between" mb="md">
        <div className="flex-1">
          <Group gap="sm" mb="xs">
            <Text fw={600} size="lg" lineClamp={1}>
              {bundle.name}
            </Text>
            <Badge color={statusColors[bundle.status]} size="sm">
              {statusLabels[bundle.status]}
            </Badge>
          </Group>

          <Text size="sm" c="dimmed" lineClamp={1}>
            {bundle.target_product_name || `منتج ${bundle.target_product_id}`}
          </Text>
        </div>

        <Menu shadow="md" width={200}>
          <Menu.Target>
            <ActionIcon variant="light" color="gray">
              <IconDots size="1rem" />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconEye size="0.9rem" />}
              onClick={() => onView(bundle._id)}
            >
              عرض التفاصيل
            </Menu.Item>

            <Menu.Item
              leftSection={<IconEdit size="0.9rem" />}
              onClick={() => onEdit(bundle._id)}
            >
              تعديل
            </Menu.Item>

            {/* <Menu.Item
              leftSection={<IconExternalLink size="0.9rem" />}
              onClick={() => {
                // Use the constructed product_url if available, otherwise fallback
                const previewUrl =
                  bundle.product_url ||
                  `https://${bundle.store_domain || "store.salla.sa"}/p${
                    bundle.target_product_id
                  }`;
                window.open(previewUrl, "_blank");
              }}
              disabled={bundle.status !== "active"}
            >
              معاينة في المتجر
            </Menu.Item> */}

            {bundle.status === "draft" && (
              <Menu.Item
                leftSection={<IconPlayerPlay size="0.9rem" />}
                color="green"
                onClick={() =>
                  handleAction(() => onGenerateOffers(bundle._id), "activate")
                }
                disabled={actionLoading === "activate"}
              >
                تفعيل الباقة
              </Menu.Item>
            )}

            {bundle.status === "active" && (
              <Menu.Item
                leftSection={<IconPlayerPause size="0.9rem" />}
                color="orange"
                onClick={() =>
                  handleAction(
                    () => onToggleStatus(bundle._id, "inactive"),
                    "deactivate"
                  )
                }
                disabled={actionLoading === "deactivate"}
              >
                إيقاف الباقة
              </Menu.Item>
            )}

            {bundle.status === "inactive" && (
              <Menu.Item
                leftSection={<IconPlayerPlay size="0.9rem" />}
                color="green"
                onClick={() =>
                  handleAction(
                    () => onToggleStatus(bundle._id, "active"),
                    "activate"
                  )
                }
                disabled={actionLoading === "activate"}
              >
                إعادة تفعيل الباقة
              </Menu.Item>
            )}

            <Menu.Divider />

            <Menu.Item
              leftSection={<IconTrash size="0.9rem" />}
              color="red"
              onClick={() => handleAction(() => onDelete(bundle._id), "delete")}
              disabled={actionLoading === "delete"}
            >
              حذف
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      {/* Bundle Info */}
      <Grid mb="md">
        <Grid.Col span={6}>
          <Group gap="xs">
            <IconTarget size="0.9rem" className="text-gray-500" />
            <Text size="sm" c="dimmed">
              {bundle.bundles?.length || 0} مستوى
            </Text>
          </Group>
        </Grid.Col>
        <Grid.Col span={6}>
          <Group gap="xs">
            <IconGift size="0.9rem" className="text-gray-500" />
            <Text size="sm" c="dimmed">
              {bundle.offers_count || 0} عرض
            </Text>
          </Group>
        </Grid.Col>
      </Grid>

      {/* Stats */}
      <Grid mb="md">
        <Grid.Col span={3}>
          <div className="text-center">
            <Text size="lg" fw={700} c="blue">
              {bundle.total_views || 0}
            </Text>
            <Text size="xs" c="dimmed">
              مشاهدة
            </Text>
          </div>
        </Grid.Col>
        <Grid.Col span={3}>
          <div className="text-center">
            <Text size="lg" fw={700} c="green">
              {bundle.total_clicks || 0}
            </Text>
            <Text size="xs" c="dimmed">
              نقرة
            </Text>
          </div>
        </Grid.Col>
        <Grid.Col span={3}>
          <div className="text-center">
            <Text size="lg" fw={700} c="violet">
              {bundle.total_conversions || 0}
            </Text>
            <Text size="xs" c="dimmed">
              تحويل
            </Text>
          </div>
        </Grid.Col>
        <Grid.Col span={3}>
          <div className="text-center">
            <Text size="lg" fw={700} c="orange">
              {conversionRate}%
            </Text>
            <Text size="xs" c="dimmed">
              معدل
            </Text>
          </div>
        </Grid.Col>
      </Grid>

      {/* Dates */}
      <Group gap="xs" justify="space-between">
        <Group gap="xs">
          <IconCalendar size="0.8rem" className="text-gray-400" />
          <Text size="xs" c="dimmed">
            {new Date(bundle.start_date).toLocaleDateString("ar-SA")}
          </Text>
        </Group>

        {bundle.expiry_date && (
          <Text size="xs" c="dimmed">
            حتى {new Date(bundle.expiry_date).toLocaleDateString("ar-SA")}
          </Text>
        )}
      </Group>

      {/* Action Button */}
      <Button
        fullWidth
        mt="md"
        variant="light"
        onClick={() => onView(bundle._id)}
        leftSection={<IconTrendingUp size="0.9rem" />}
      >
        عرض الأداء
      </Button>
    </Card>
  );
}

function DeleteConfirmModal({
  opened,
  onClose,
  onConfirm,
  bundleName,
  loading,
}) {
  return (
    <Modal opened={opened} onClose={onClose} title="تأكيد الحذف" centered>
      <Stack gap="md">
        <Alert color="red" variant="light">
          هل أنت متأكد من حذف الباقة "{bundleName}"؟ سيتم حذف جميع العروض
          المرتبطة بها نهائياً.
        </Alert>

        <Group justify="flex-end" gap="sm">
          <Button variant="light" onClick={onClose} disabled={loading}>
            إلغاء
          </Button>
          <Button color="red" onClick={onConfirm} loading={loading}>
            حذف
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default function BundlesPage() {
  const navigate = useNavigate();
  const [deleteModal, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure();
  const [bundleToDelete, setBundleToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    bundles,
    loading,
    error,
    fetchBundles,
    deleteBundle,
    generateOffers,
    deactivateBundle,
    setFilters,
    getFilteredBundles,
  } = useBundleStore();

  const itemsPerPage = 9;
  const filteredBundles = getFilteredBundles();
  const totalPages = Math.ceil(filteredBundles.length / itemsPerPage);
  const currentBundles = filteredBundles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    fetchBundles();
  }, [fetchBundles]);

  useEffect(() => {
    setFilters({ search: searchQuery, status: statusFilter });
  }, [searchQuery, statusFilter, setFilters]);

  const handleView = (bundleId) => {
    navigate(`/dashboard/bundles/${bundleId}`);
  };

  const handleEdit = (bundleId) => {
    navigate(`/dashboard/bundles/${bundleId}/edit`);
  };

  const handleDelete = (bundleId) => {
    const bundle = bundles.find((b) => b._id === bundleId);
    setBundleToDelete(bundle);
    openDeleteModal();
  };

  const confirmDelete = async () => {
    if (!bundleToDelete) return;

    try {
      await deleteBundle(bundleToDelete._id);
      notifications.show({
        title: "تم الحذف بنجاح",
        message: `تم حذف الباقة "${bundleToDelete.name}" بنجاح`,
        color: "green",
        icon: <IconCheck size="1rem" />,
      });
      closeDeleteModal();
      setBundleToDelete(null);
    } catch (error) {
      notifications.show({
        title: "خطأ في الحذف",
        message: error.message || "حدث خطأ أثناء حذف الباقة",
        color: "red",
        icon: <IconX size="1rem" />,
      });
    }
  };

  const handleGenerateOffers = async (bundleId) => {
    try {
      await generateOffers(bundleId);
      notifications.show({
        title: "تم تفعيل الباقة",
        message: "تم إنشاء العروض وتفعيل الباقة بنجاح",
        color: "green",
        icon: <IconCheck size="1rem" />,
      });
    } catch (error) {
      notifications.show({
        title: "خطأ في التفعيل",
        message: error.message || "حدث خطأ أثناء تفعيل الباقة",
        color: "red",
        icon: <IconX size="1rem" />,
      });
    }
  };

  const handleToggleStatus = async (bundleId, newStatus) => {
    try {
      if (newStatus === "inactive") {
        await deactivateBundle(bundleId);
        notifications.show({
          title: "تم إيقاف الباقة",
          message: "تم إيقاف الباقة وجميع عروضها",
          color: "orange",
          icon: <IconCheck size="1rem" />,
        });
      } else if (newStatus === "active") {
        await generateOffers(bundleId);
        notifications.show({
          title: "تم إعادة تفعيل الباقة",
          message: "تم إعادة تفعيل الباقة وجميع عروضها",
          color: "green",
          icon: <IconCheck size="1rem" />,
        });
      }
    } catch (error) {
      notifications.show({
        title: "خطأ في العملية",
        message: error.message || "حدث خطأ أثناء تحديث حالة الباقة",
        color: "red",
        icon: <IconX size="1rem" />,
      });
    }
  };

  return (
    <Container size="xl" px={0}>
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={1} className="text-gray-800 mb-2">
              إدارة الباقات
            </Title>
            <Text className="text-gray-600">
              عرض وإدارة جميع باقاتك والعروض الخاصة
            </Text>
          </div>

          <Button
            leftSection={<IconPlus size="1rem" />}
            onClick={() => navigate("/dashboard/bundles/create")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            إنشاء باقة جديدة
          </Button>
        </Group>

        {/* Error Alert */}
        {error && (
          <Alert color="red" variant="light">
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Card shadow="sm" padding="md" radius="md" withBorder>
          <Group gap="md">
            <TextInput
              placeholder="البحث في الباقات..."
              leftSection={<IconSearch size="0.9rem" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />

            <Select
              placeholder="الحالة"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value || "all")}
              data={[
                { value: "all", label: "جميع الحالات" },
                { value: "active", label: "نشط" },
                { value: "draft", label: "مسودة" },
                { value: "inactive", label: "غير نشط" },
                { value: "expired", label: "منتهي الصلاحية" },
              ]}
              w={150}
            />
          </Group>
        </Card>

        {/* Bundle Grid */}
        {loading.bundles ? (
          <Grid>
            {Array.from({ length: 6 }).map((_, i) => (
              <Grid.Col key={i} span={{ base: 12, sm: 6, lg: 4 }}>
                <Skeleton height={300} radius="md" />
              </Grid.Col>
            ))}
          </Grid>
        ) : currentBundles.length > 0 ? (
          <>
            <Grid>
              {currentBundles.map((bundle) => (
                <Grid.Col key={bundle._id} span={{ base: 12, sm: 6, lg: 4 }}>
                  <BundleCard
                    bundle={bundle}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                    onGenerateOffers={handleGenerateOffers}
                  />
                </Grid.Col>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Group justify="center">
                <Pagination
                  value={currentPage}
                  onChange={setCurrentPage}
                  total={totalPages}
                  size="sm"
                />
              </Group>
            )}
          </>
        ) : (
          <Center py="xl">
            <Stack align="center" gap="md">
              <ThemeIcon size="xl" variant="light" color="gray">
                <IconPackage size="3rem" />
              </ThemeIcon>
              <div className="text-center">
                <Title order={3} c="dimmed" mb="xs">
                  لا توجد باقات
                </Title>
                <Text c="dimmed" size="sm">
                  {searchQuery || statusFilter !== "all"
                    ? "لا توجد باقات تطابق معايير البحث"
                    : "لم تقم بإنشاء أي باقات بعد. ابدأ بإنشاء أول باقة لك!"}
                </Text>
              </div>
              {!searchQuery && statusFilter === "all" && (
                <Button
                  leftSection={<IconPlus size="1rem" />}
                  onClick={() => navigate("/dashboard/bundles/create")}
                >
                  إنشاء أول باقة
                </Button>
              )}
            </Stack>
          </Center>
        )}
      </Stack>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        opened={deleteModal}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        bundleName={bundleToDelete?.name || ""}
        loading={loading.deleting}
      />
    </Container>
  );
}
