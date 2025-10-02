import { Navigate } from "react-router-dom";
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Stack,
  Group,
  ThemeIcon,
  List,
  Alert,
} from "@mantine/core";
import {
  IconShoppingBag,
  IconGift,
  IconTrendingUp,
  IconShield,
  IconInfoCircle,
} from "@tabler/icons-react";
import useAuthStore from "../stores/useAuthStore";

export default function LoginPage() {
  const { isAuthenticated, loginViaSalla, error } = useAuthStore();


  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: <IconShoppingBag size="1.2rem" />,
      title: "إنشاء باقات مخصصة",
      description: "أنشئ باقات مخصصة من منتجاتك مع هدايا مجانية",
    },
    // {
    //   icon: <IconGift size="1.2rem" />,
    //   title: "عروض تلقائية",
    //   description: "إنشاء عروض سلة تلقائياً عبر API للحصول على منتجات مجانية",
    // },
    {
      icon: <IconTrendingUp size="1.2rem" />,
      title: "تحليلات مفصلة",
      description: "تتبع أداء الباقات والمبيعات والتحويلات",
    },
    {
      icon: <IconShield size="1.2rem" />,
      title: "أمان عالي",
      description: "تكامل آمن مع منصة سلة وحماية بيانات العملاء",
    },
  ];

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50"
      style={{ backgroundColor: "#f0f9fa" }}
    >
      <Container size="lg" className="py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Features */}
          <div>
            <Title order={1} size="h1" className="mb-6 text-gray-800">
              منصة العروض المتقدمة
              <br />
              <span style={{ color: "#004b58" }}>لمتاجر سلة</span>
            </Title>

            <Text size="lg" className="text-gray-600 mb-8 leading-relaxed">
              زيد مبيعاتك وقيمة الطلب الواحد من خلال إنشاء باقات ذكية مع هدايا
              مجانية تجذب العملاء وتزيد الشراء
            </Text>

            <Stack gap="md">
              {features.map((feature, index) => (
                <Group key={index} align="flex-start" gap="md">
                  <ThemeIcon
                    size="xl"
                    radius="md"
                    style={{ backgroundColor: "#004b5820", color: "#004b58" }}
                  >
                    {feature.icon}
                  </ThemeIcon>
                  <div>
                    <Text fw={600} className="text-gray-800">
                      {feature.title}
                    </Text>
                    <Text size="sm" className="text-gray-600">
                      {feature.description}
                    </Text>
                  </div>
                </Group>
              ))}
            </Stack>
          </div>

          {/* Right Side - Login */}
          <div>
            <Paper shadow="xl" p="xl" radius="lg" className="bg-white">
              <Stack gap="lg">
                <div className="text-center">
                  <div className="mb-4">
                    <img
                      src="/salla-logo.png"
                      alt="Salla"
                      className="h-16 mx-auto"
                    />
                  </div>
                  <Title order={2} className="text-gray-800 mb-2">
                    تسجيل الدخول
                  </Title>
                  <Text className="text-gray-600">
                    ادخل إلى حسابك في سلة لإدارة الباقات
                  </Text>
                </div>

                {error && (
                  <Alert
                    icon={<IconInfoCircle size="1rem" />}
                    title="خطأ في تسجيل الدخول"
                    color="red"
                    variant="light"
                  >
                    {error}
                  </Alert>
                )}

                <Button
                  size="lg"
                  fullWidth
                  onClick={loginViaSalla}
                  style={{ backgroundColor: "#004b58" }}
                  className="hover:opacity-90"
                  leftSection={
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  }
                >
                  تسجيل الدخول عبر سلة
                </Button>

                <Text size="xs" className="text-gray-500 text-center">
                  بالمتابعة، أنت توافق على{" "}
                  <span
                    style={{ color: "#004b58" }}
                    className="hover:underline cursor-pointer"
                  >
                    شروط الاستخدام
                  </span>{" "}
                  و{" "}
                  <span
                    style={{ color: "#004b58" }}
                    className="hover:underline cursor-pointer"
                  >
                    سياسة الخصوصية
                  </span>
                </Text>
              </Stack>
            </Paper>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center">
                <Title order={3} style={{ color: "#004b58" }}>
                  250+
                </Title>
                <Text size="sm" className="text-gray-600">
                  متجر نشط
                </Text>
              </div>
              <div className="text-center">
                <Title order={3} style={{ color: "#004b58" }}>
                  40%
                </Title>
                <Text size="sm" className="text-gray-600">
                  زيادة المبيعات
                </Text>
              </div>
              <div className="text-center">
                <Title order={3} style={{ color: "#004b58" }}>
                  24/7
                </Title>
                <Text size="sm" className="text-gray-600">
                  دعم فني
                </Text>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
