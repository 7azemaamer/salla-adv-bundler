import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Text,
  Card,
  Stack,
  Group,
  Badge,
  Button,
  List,
  ThemeIcon,
  Alert,
  LoadingOverlay,
  SimpleGrid,
  Divider,
} from "@mantine/core";
import {
  IconCheck,
  IconX,
  IconCrown,
  IconRocket,
  IconStar,
  IconAlertCircle,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import useAuthStore from "../stores/useAuthStore";

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, planContext } = useAuthStore();
  const currentPlan = planContext?.plan || user?.plan || "basic";

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/auth/plans");

      if (response.data.success) {
        // Sort plans by displayOrder (lower numbers first)
        const sortedPlans = response.data.data.sort((a, b) => {
          const orderA = a.ui?.displayOrder ?? 999;
          const orderB = b.ui?.displayOrder ?? 999;
          return orderA - orderB;
        });
        setPlans(sortedPlans);
      }
    } catch (error) {
      console.error("Failed to fetch plans:", error);
      notifications.show({
        title: "خطأ",
        message: "فشل تحميل الخطط",
        color: "red",
        icon: <IconX size="1rem" />,
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (key) => {
    const icons = {
      free: IconStar,
      basic: IconCheck,
      pro: IconRocket,
      enterprise: IconCrown,
    };
    return icons[key] || IconStar;
  };

  const getPlanColor = (key) => {
    const colors = {
      free: "gray",
      basic: "blue",
      pro: "violet",
      enterprise: "yellow",
    };
    return colors[key] || "gray";
  };

  const formatPrice = (price, duration) => {
    if (!price || price === 0) return "مجاناً";
    return `${price} ر.س / ${duration === "monthly" ? "شهرياً" : "سنوياً"}`;
  };

  const isCurrentPlan = (key) => key === currentPlan;

  return (
    <Container size="xl">
      <Stack gap="lg">
        {/* Header */}
        <div>
          <Title order={1} className="text-gray-800 mb-2">
            الخطط والأسعار
          </Title>
          <Text className="text-gray-600">
            اختر الخطة المناسبة لاحتياجات متجرك
          </Text>
        </div>

        {/* Plans Grid */}
        <SimpleGrid
          cols={{ base: 1, sm: 2, lg: 4 }}
          spacing="lg"
          style={{
            marginTop: "2rem",
          }}
        >
          <LoadingOverlay visible={loading} />

          {plans.map((plan) => {
            const IconComponent = getPlanIcon(plan.key);
            const color = getPlanColor(plan.key);
            const isCurrent = isCurrentPlan(plan.key);

            return (
              <Card
                key={plan._id}
                shadow={isCurrent || plan.ui?.highlight ? "xl" : "sm"}
                padding="lg"
                radius="md"
                withBorder
                style={{
                  borderWidth: isCurrent || plan.ui?.highlight ? 3 : 1,
                  borderColor:
                    isCurrent || plan.ui?.highlight
                      ? `var(--mantine-color-${color}-6)`
                      : undefined,
                  position: "relative",
                  backgroundColor: isCurrent
                    ? `var(--mantine-color-${color}-0)`
                    : undefined,
                  overflow: "visible",
                }}
              >
                {/* Show badge: Current plan takes priority, then popular badge */}
                {(isCurrent || plan.ui?.popularBadge) && (
                  <Badge
                    color={color}
                    variant="filled"
                    size="lg"
                    style={{
                      position: "absolute",
                      top: -12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      zIndex: 10,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {isCurrent ? "خطتك الحالية" : plan.ui.popularBadge}
                  </Badge>
                )}

                <Stack
                  gap="md"
                  style={{ height: "100%", justifyContent: "space-between" }}
                >
                  <div>
                    {/* Plan Header */}
                    <Group justify="center">
                      <ThemeIcon size="xl" variant="light" color={color}>
                        <IconComponent size="1.5rem" />
                      </ThemeIcon>
                    </Group>

                    <div style={{ textAlign: "center", marginTop: "1rem" }}>
                      <Title order={3} className="mb-1">
                        {plan.ui?.displayTitle || plan.label}
                      </Title>
                      {(plan.ui?.displayDescription || plan.description) && (
                        <Text size="sm" c="dimmed">
                          {plan.ui?.displayDescription || plan.description}
                        </Text>
                      )}
                    </div>

                    {/* Price */}
                    <div style={{ textAlign: "center", marginTop: "1rem" }}>
                      {plan.ui?.originalPrice && (
                        <Text size="md" c="dimmed" td="line-through">
                          {plan.ui.originalPrice}
                        </Text>
                      )}
                      <Text
                        size="48px"
                        fw={900}
                        c={color}
                        style={{
                          fontFamily: "'Inter', 'Cairo', system-ui, sans-serif",
                          letterSpacing: "-0.02em",
                          lineHeight: 1.2,
                        }}
                      >
                        {plan.ui?.displayPrice ||
                          formatPrice(plan.price, "monthly")}
                      </Text>
                      {plan.ui?.discountBadge && (
                        <Badge color="red" variant="light" size="sm" mt="xs">
                          {plan.ui.discountBadge}
                        </Badge>
                      )}
                    </div>

                    <Divider
                      style={{ marginTop: "1rem", marginBottom: "1rem" }}
                    />

                    {/* Features */}
                    <List
                      spacing="xs"
                      size="sm"
                      icon={
                        <ThemeIcon color="green" size={20} radius="xl">
                          <IconCheck size="0.8rem" />
                        </ThemeIcon>
                      }
                    >
                      {plan.ui?.featuresIncluded &&
                      plan.ui.featuresIncluded.length > 0 ? (
                        plan.ui.featuresIncluded.map((feature, idx) => (
                          <List.Item key={idx}>{feature}</List.Item>
                        ))
                      ) : (
                        <>
                          <List.Item>
                            {plan.limits?.maxBundles === -1
                              ? "باقات غير محدودة"
                              : `حتى ${plan.limits?.maxBundles || 0} باقات`}
                          </List.Item>

                          {plan.features?.advancedBundleStyling && (
                            <List.Item>تخصيص متقدم للتصميم</List.Item>
                          )}

                          {plan.features?.reviewsWidget && (
                            <List.Item>عرض عدد التقييمات</List.Item>
                          )}

                          {plan.features?.stickyButton && (
                            <List.Item>زر ثابت للباقات</List.Item>
                          )}

                          {plan.features?.freeShipping && (
                            <List.Item>لافتة الشحن المجاني</List.Item>
                          )}

                          {plan.features?.timer && (
                            <List.Item>مؤقت العد التنازلي</List.Item>
                          )}

                          {plan.features?.announcement && (
                            <List.Item>لافتة الإعلانات</List.Item>
                          )}

                          {plan.features?.customHideSelectors && (
                            <List.Item>إخفاء عناصر مخصصة</List.Item>
                          )}

                          {plan.features?.couponControls && (
                            <List.Item>التحكم في الكوبونات</List.Item>
                          )}

                          {plan.features?.bundleAnalytics && (
                            <List.Item>تحليلات الباقات</List.Item>
                          )}
                        </>
                      )}
                    </List>

                    {/* Features Excluded */}
                    {plan.ui?.featuresExcluded &&
                      plan.ui.featuresExcluded.length > 0 && (
                        <List
                          spacing="xs"
                          size="sm"
                          mt="sm"
                          icon={
                            <ThemeIcon color="red" size={20} radius="xl">
                              <IconX size="0.8rem" />
                            </ThemeIcon>
                          }
                        >
                          {plan.ui.featuresExcluded.map((feature, idx) => (
                            <List.Item key={idx} c="dimmed">
                              {feature}
                            </List.Item>
                          ))}
                        </List>
                      )}
                  </div>

                  {/* Action Button - Always at bottom */}
                  <div style={{ marginTop: "auto" }}>
                    <Button
                      fullWidth
                      variant={
                        isCurrent
                          ? "light"
                          : plan.ui?.highlight
                          ? "filled"
                          : "outline"
                      }
                      color={color}
                      disabled={isCurrent}
                      onClick={() => {
                        const upgradeUrl =
                          plan.ui?.upgradeLink || "https://salla.sa";
                        window.open(upgradeUrl, "_blank");
                      }}
                      rightSection={
                        isCurrent ? (
                          <IconCheck size="1rem" />
                        ) : (
                          <IconRocket size="1rem" />
                        )
                      }
                    >
                      {isCurrent ? "الخطة الحالية" : "الترقية الآن"}
                    </Button>
                  </div>
                </Stack>
              </Card>
            );
          })}
        </SimpleGrid>

        {/* Contact Section */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" align="center">
            <div>
              <Title order={4} className="mb-1">
                هل تحتاج إلى خطة مخصصة؟
              </Title>
              <Text size="sm" c="dimmed">
                تواصل معنا لمناقشة احتياجاتك والحصول على عرض خاص
              </Text>
            </div>
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                notifications.show({
                  title: "تواصل معنا",
                  message:
                    "يرجى التواصل عبر البريد الإلكتروني: support@example.com",
                  color: "blue",
                });
              }}
            >
              تواصل معنا
            </Button>
          </Group>
        </Card>
      </Stack>
    </Container>
  );
}
