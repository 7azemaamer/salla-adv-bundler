import { useState, useEffect, useMemo } from "react";
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
  IconInfoCircle,
  IconRefresh,
  IconClock,
} from "@tabler/icons-react";

const DEFAULT_REVIEW_DATE_PRESETS = [
  "قبل يوم",
  "قبل يومين",
  "قبل 3 أيام",
  "قبل 5 أيام",
  "منذ أسبوع",
  "منذ 10 أيام",
  "منذ أسبوعين",
  "منذ 3 أسابيع",
  "منذ شهر",
  "منذ شهر ونصف",
];

export default function ReviewCountSettingsPanel({ settings, onToggle }) {
  const reviewCountSettings = settings?.review_count || {};
  const customReviews = settings?.custom_reviews || [];
  const dateRandomizer = settings?.review_date_randomizer || {};
  const reviewDisplay = settings?.review_display || {};

  const normalizedDatePresets = useMemo(() => {
    if (
      Array.isArray(dateRandomizer.presets) &&
      dateRandomizer.presets.length > 0
    ) {
      return dateRandomizer.presets;
    }
    return DEFAULT_REVIEW_DATE_PRESETS;
  }, [dateRandomizer.presets]);

  const [datePresetsInput, setDatePresetsInput] = useState(
    normalizedDatePresets.join("\n")
  );

  const dateRandomizerEnabled =
    dateRandomizer.enabled === undefined ? false : dateRandomizer.enabled;
  const hideRealReviews = dateRandomizer.hide_real_reviews === true;
  const hideDates = reviewDisplay.hide_dates === true;
  const hideRatings = reviewDisplay.hide_ratings === true;
  const hideNames = reviewDisplay.hide_names === true;
  const hideAvatars = reviewDisplay.hide_avatars === true;

  useEffect(() => {
    setDatePresetsInput(normalizedDatePresets.join("\n"));
  }, [normalizedDatePresets]);

  const handlePresetsBlur = () => {
    const sanitizedPresets = datePresetsInput
      .split("\n")
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    if (
      Array.isArray(dateRandomizer.presets) &&
      JSON.stringify(sanitizedPresets) ===
        JSON.stringify(dateRandomizer.presets)
    ) {
      return;
    }

    onToggle("review_date_randomizer.presets", sanitizedPresets);
  };

  const handleResetPresets = () => {
    setDatePresetsInput(DEFAULT_REVIEW_DATE_PRESETS.join("\n"));
    onToggle("review_date_randomizer.presets", DEFAULT_REVIEW_DATE_PRESETS);
  };

  // State for new review form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReview, setNewReview] = useState({
    name: "",
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
                  عرض التقييمات
                </Text>
              </Group>
              <Text size="xs" c="dimmed">
                عرض التقييمات في قسم آراء العملاء داخل نافذة الباقة
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
                إظهار التقييمات في الخطوة
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
              اختر في أي خطوة سيظهر التقييمات في نافذة الباقة
            </Text>
          </Stack>
        </Paper>
      )}

      {/* Review Display Options */}
      <Paper p="md" radius="md" withBorder>
        <Stack gap="md">
          <Group gap="xs">
            <IconStar size="1.1rem" style={{ color: "#339af0" }} />
            <Text fw={600} size="sm">
              عناصر التقييم الظاهرة
            </Text>
          </Group>
          <Text size="xs" c="dimmed">
            تحكّم في العناصر التي تظهر داخل بطاقة التقييم.
          </Text>

          <Group justify="space-between">
            <div>
              <Text fw={600} size="sm">
                إخفاء التاريخ
              </Text>
              <Text size="xs" c="dimmed">
                لن يظهر عمر التقييم (مثل منذ أسبوع).
              </Text>
            </div>
            <Switch
              checked={hideDates}
              onChange={(e) =>
                onToggle("review_display.hide_dates", e.currentTarget.checked)
              }
            />
          </Group>

          <Group justify="space-between">
            <div>
              <Text fw={600} size="sm">
                إخفاء التقييم النجمي
              </Text>
              <Text size="xs" c="dimmed">
                سيتم إخفاء عدد النجوم لكل مراجعة.
              </Text>
            </div>
            <Switch
              checked={hideRatings}
              onChange={(e) =>
                onToggle("review_display.hide_ratings", e.currentTarget.checked)
              }
            />
          </Group>

          <Group justify="space-between">
            <div>
              <Text fw={600} size="sm">
                إخفاء اسم العميل
              </Text>
              <Text size="xs" c="dimmed">
                يتم عرض التعليق بدون اسم العميل.
              </Text>
            </div>
            <Switch
              checked={hideNames}
              onChange={(e) =>
                onToggle("review_display.hide_names", e.currentTarget.checked)
              }
            />
          </Group>

          <Group justify="space-between">
            <div>
              <Text fw={600} size="sm">
                إخفاء صورة الملف الشخصي
              </Text>
              <Text size="xs" c="dimmed">
                لن يتم عرض الصورة الرمزية للعميل.
              </Text>
            </div>
            <Switch
              checked={hideAvatars}
              onChange={(e) =>
                onToggle("review_display.hide_avatars", e.currentTarget.checked)
              }
            />
          </Group>
        </Stack>
      </Paper>

      {/* Review Date Randomizer */}
      <Paper p="md" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between" align="flex-start">
            <div style={{ flex: 1 }}>
              <Group gap="xs" mb={4}>
                <IconClock size="1.1rem" style={{ color: "#228be6" }} />
                <Text fw={600} size="sm">
                  تواريخ التقييمات الظاهرة
                </Text>
              </Group>
              <Text size="xs" c="dimmed">
                فعّل هذا الخيار لعرض تواريخ حديثة وعشوائية بدلاً من التواريخ
                الأصلية القادمة من سلة.
              </Text>
            </div>
            <Switch
              checked={dateRandomizerEnabled}
              onChange={(e) =>
                onToggle(
                  "review_date_randomizer.enabled",
                  e.currentTarget.checked
                )
              }
              size="md"
            />
          </Group>

          <Textarea
            label="القيم المحتملة"
            placeholder="قبل يوم\nقبل يومين\nمنذ أسبوع ..."
            description="يتم اختيار أحد هذه القيم بشكل عشوائي لكل تقييم. اكتب كل قيمة في سطر مستقل."
            value={datePresetsInput}
            onChange={(event) => setDatePresetsInput(event.currentTarget.value)}
            onBlur={handlePresetsBlur}
            disabled={!dateRandomizerEnabled}
            minRows={4}
            autosize
          />

          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              يمكنك تعديل النصوص لتناسب أسلوب متجرك. يتم تجاهل الأسطر الفارغة
              تلقائياً.
            </Text>
            <Button
              variant="subtle"
              size="xs"
              leftSection={<IconRefresh size="0.9rem" />}
              onClick={handleResetPresets}
              disabled={!dateRandomizerEnabled}
            >
              استعادة القيم الافتراضية
            </Button>
          </Group>

          <Group justify="space-between">
            <div>
              <Text fw={600} size="sm">
                إخفاء التقييمات الحقيقية
              </Text>
              <Text size="xs" c="dimmed">
                عند التفعيل سيتم عرض التقييمات المخصصة فقط ولن يتم تحميل
                التقييمات القادمة من سلة.
              </Text>
            </div>
            <Switch
              checked={hideRealReviews}
              onChange={(e) =>
                onToggle(
                  "review_date_randomizer.hide_real_reviews",
                  e.currentTarget.checked
                )
              }
              size="md"
            />
          </Group>
        </Stack>
      </Paper>

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

            <Textarea
              label="التقييم"
              placeholder="شارك تجربتك"
              value={newReview.comment}
              onChange={(e) =>
                setNewReview({
                  ...newReview,
                  comment: e.currentTarget.value,
                })
              }
              autosize
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
