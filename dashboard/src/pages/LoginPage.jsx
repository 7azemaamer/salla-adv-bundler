import { Navigate, useSearchParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Group,
  ThemeIcon,
  Alert,
  Anchor,
} from "@mantine/core";
import {
  IconShoppingBag,
  IconTrendingUp,
  IconShield,
  IconInfoCircle,
  IconCheck,
  IconMail,
  IconLock,
} from "@tabler/icons-react";
import axios from "axios";
import useAuthStore from "../stores/useAuthStore";

export default function LoginPage() {
  const { isAuthenticated, setAuth } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Check for success messages from setup or pre-fill email
  useEffect(() => {
    const message = searchParams.get("message");
    const email = searchParams.get("email");

    if (message === "setup_complete") {
      setSuccessMessage("تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول");
    } else if (message === "already_setup") {
      setSuccessMessage("الحساب موجود بالفعل. يرجى تسجيل الدخول");
    }

    // Pre-fill email if provided
    if (email) {
      setFormData((prev) => ({ ...prev, email: decodeURIComponent(email) }));
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const { token, store } = response.data;

      // Save to auth store
      setAuth(token, store);

      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
          "حدث خطأ في تسجيل الدخول. يرجى المحاولة مرة أخرى"
      );
    } finally {
      setLoading(false);
    }
  };

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
      description: "تتبع أداء العروض والمبيعات والتحويلات",
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
                    ادخل إلى حسابك في سلة لإدارة العروض
                  </Text>
                </div>

                {successMessage && (
                  <Alert
                    icon={<IconCheck size="1rem" />}
                    title="نجح"
                    color="green"
                    variant="light"
                  >
                    {successMessage}
                  </Alert>
                )}

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

                <form onSubmit={handleSubmit}>
                  <Stack gap="md">
                    <TextInput
                      label="البريد الإلكتروني"
                      placeholder="example@domain.com"
                      type="email"
                      required
                      leftSection={<IconMail size="1rem" />}
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      styles={{
                        input: {
                          "&:focus": {
                            borderColor: "#004b58",
                          },
                        },
                      }}
                    />

                    <PasswordInput
                      label="كلمة المرور"
                      placeholder="أدخل كلمة المرور"
                      required
                      leftSection={<IconLock size="1rem" />}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      styles={{
                        input: {
                          "&:focus": {
                            borderColor: "#004b58",
                          },
                        },
                      }}
                    />

                    <Group justify="flex-end">
                      <Anchor
                        component={Link}
                        to="/forgot-password"
                        size="sm"
                        style={{ color: "#004b58" }}
                      >
                        نسيت كلمة المرور؟
                      </Anchor>
                    </Group>

                    <Button
                      type="submit"
                      size="lg"
                      fullWidth
                      loading={loading}
                      style={{ backgroundColor: "#004b58" }}
                      className="hover:opacity-90"
                    >
                      تسجيل الدخول
                    </Button>
                  </Stack>
                </form>

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
