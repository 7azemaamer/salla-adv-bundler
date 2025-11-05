import { useState } from "react";
import {
  Stack,
  Switch,
  Text,
  Group,
  NumberInput,
  Select,
  Paper,
  Badge,
  Button,
  TextInput,
  Textarea,
  Radio,
  Divider,
  ActionIcon,
  Avatar,
  Card,
  Rating,
  Alert,
} from "@mantine/core";
import {
  IconStar,
  IconTrendingUp,
  IconPlus,
  IconTrash,
  IconUserCircle,
  IconShoppingBag,
  IconInfoCircle,
} from "@tabler/icons-react";

export default function ReviewCountSettingsPanel({ settings, onToggle }) {
  const reviewCountSettings = settings?.review_count || {};
  const customReviews = settings?.custom_reviews || [];

  // State for new review form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReview, setNewReview] = useState({
    name: "",
    is_verified: false,
    date_text: "قبل يومين",
    stars: 5,
    gender: "male",
    comment: "",
  });

  const handleAddReview = () => {
    if (!newReview.name.trim()) return;

    const updatedReviews = [
      ...customReviews,
      {
        ...newReview,
        created_at: new Date().toISOString(),
      },
    ];

    onToggle("custom_reviews", updatedReviews);

    // Reset form
    setNewReview({
      name: "",
      is_verified: false,
      date_text: "قبل يومين",
      stars: 5,
      gender: "male",
      comment: "",
    });
    setShowAddForm(false);
  };

  const handleDeleteReview = (index) => {
    const updatedReviews = customReviews.filter((_, i) => i !== index);
    onToggle("custom_reviews", updatedReviews);
  };

  const getAvatarUrl = (gender) => {
    return gender === "female"
      ? "https://cdn.assets.salla.network/prod/stores/themes/default/assets/images/avatar_female.png"
      : "https://cdn.assets.salla.network/prod/stores/themes/default/assets/images/avatar_male.png";
  };

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

      {/* Show in Step Selection */}
      {reviewCountSettings.enabled !== false && (
        <Paper p="md" radius="md" withBorder>
          <Stack gap="md">
            <Group gap="xs">
              <Text fw={600} size="sm">
                إظهار عدد التقييمات في الخطوة
              </Text>
            </Group>
            <Select
              value={reviewCountSettings.show_in_step || "bundles"}
              onChange={(value) => onToggle("review_count.show_in_step", value)}
              data={[
                { value: "bundles", label: "اختيار الباقة" },
                { value: "target_variants", label: "تحديد الخيارات" },
                { value: "free_gifts", label: "الهدايا المجانية" },
                { value: "discounted", label: "المنتجات المخفضة" },
                { value: "review", label: "مراجعة الطلب" },
                { value: "all", label: "جميع الخطوات" },
              ]}
              disabled={false}
              comboboxProps={{
                position: "bottom",
                middlewares: { flip: false, shift: false },
              }}
            />
            <Text size="xs" c="dimmed">
              اختر في أي خطوة سيظهر عدد التقييمات في نافذة الباقة
            </Text>
          </Stack>
        </Paper>
      )}

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
              comboboxProps={{
                position: "bottom",
                middlewares: { flip: false, shift: false },
              }}
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

      {/* Custom Reviews Section */}
      <Divider
        label={
          <Group gap="xs">
            <IconUserCircle size="1.1rem" />
            <Text fw={600}>التقييمات المخصصة</Text>
          </Group>
        }
        labelPosition="center"
      />

      <Alert icon={<IconInfoCircle size="1rem" />} color="blue" variant="light">
        <Text size="xs">
          يمكنك إضافة تقييمات مخصصة لتظهر في قسم آراء العملاء داخل نافذة الباقة
        </Text>
      </Alert>

      {/* Existing Reviews List */}
      {customReviews.length > 0 && (
        <Stack gap="md">
          {customReviews.map((review, index) => (
            <Card key={index} withBorder padding="md" radius="md">
              <Group justify="space-between" mb="sm">
                <Group gap="sm">
                  <Avatar
                    src={getAvatarUrl(review.gender)}
                    alt={review.name}
                    radius="xl"
                    size="md"
                  />
                  <div>
                    <Group gap="xs">
                      <Text fw={600} size="sm">
                        {review.name}
                      </Text>
                      {review.is_verified && (
                        <Badge
                          size="xs"
                          variant="light"
                          color="green"
                          leftSection={<IconShoppingBag size="0.7rem" />}
                        >
                          قام بالشراء والتقييم
                        </Badge>
                      )}
                    </Group>
                    <Text size="xs" c="dimmed">
                      {review.date_text}
                    </Text>
                  </div>
                </Group>
                <ActionIcon
                  color="red"
                  variant="light"
                  onClick={() => handleDeleteReview(index)}
                >
                  <IconTrash size="1rem" />
                </ActionIcon>
              </Group>
              <div style={{ direction: "ltr", display: "inline-block" }}>
                <Rating value={review.stars} readOnly size="sm" mb="xs" />
              </div>
              {review.comment && (
                <Text size="sm" c="dimmed">
                  {review.comment}
                </Text>
              )}
            </Card>
          ))}
        </Stack>
      )}

      {/* Add New Review Button */}
      {!showAddForm && (
        <Button
          leftSection={<IconPlus size="1rem" />}
          variant="light"
          onClick={() => setShowAddForm(true)}
        >
          إضافة تقييم جديد
        </Button>
      )}

      {/* Add Review Form */}
      {showAddForm && (
        <Paper withBorder p="md" radius="md" bg="gray.0">
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={600} size="sm">
                تقييم جديد
              </Text>
              <Button
                variant="subtle"
                size="xs"
                onClick={() => setShowAddForm(false)}
              >
                إلغاء
              </Button>
            </Group>

            <TextInput
              label="اسم العميل"
              placeholder="أدخل اسم العميل"
              value={newReview.name}
              onChange={(e) =>
                setNewReview({ ...newReview, name: e.target.value })
              }
              required
            />

            <Group grow>
              <Radio.Group
                label="النوع"
                value={newReview.gender}
                onChange={(value) =>
                  setNewReview({ ...newReview, gender: value })
                }
              >
                <Group mt="xs">
                  <Radio value="male" label="ذكر" />
                  <Radio value="female" label="أنثى" />
                </Group>
              </Radio.Group>

              <div>
                <Text size="sm" fw={500} mb="xs">
                  عدد النجوم
                </Text>
                <div style={{ direction: "ltr", display: "inline-block" }}>
                  <Rating
                    value={newReview.stars}
                    onChange={(value) =>
                      setNewReview({ ...newReview, stars: value })
                    }
                    size="lg"
                  />
                </div>
              </div>
            </Group>

            <TextInput
              label="التاريخ"
              placeholder="مثال: قبل يومين، منذ أسبوع"
              value={newReview.date_text}
              onChange={(e) =>
                setNewReview({ ...newReview, date_text: e.target.value })
              }
            />

            <Switch
              label="قام بالشراء والتقييم"
              checked={newReview.is_verified}
              onChange={(e) =>
                setNewReview({
                  ...newReview,
                  is_verified: e.currentTarget.checked,
                })
              }
            />

            <Textarea
              label="التعليق (اختياري)"
              placeholder="أدخل تعليق العميل..."
              value={newReview.comment}
              onChange={(e) =>
                setNewReview({ ...newReview, comment: e.target.value })
              }
              minRows={3}
            />

            <Button
              leftSection={<IconPlus size="1rem" />}
              onClick={handleAddReview}
              disabled={!newReview.name.trim()}
            >
              إضافة التقييم
            </Button>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
