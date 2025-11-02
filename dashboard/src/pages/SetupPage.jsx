import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Alert,
  Loader,
  Center,
  ThemeIcon,
  Radio,
  Group,
} from "@mantine/core";
import {
  IconInfoCircle,
  IconMail,
  IconLock,
  IconAlertCircle,
} from "@tabler/icons-react";
import axios from "axios";

export default function SetupPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setupToken = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storeInfo, setStoreInfo] = useState(null);

  const [emailOption, setEmailOption] = useState("merchant"); // 'merchant' or 'custom'
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch store info on mount
  useEffect(() => {
    const fetchStoreInfo = async () => {
      if (!setupToken) {
        setError("رابط الإعداد غير صالح");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`/auth/setup?token=${setupToken}`);
        setStoreInfo(res.data.data);

        // Pre-fill merchant email if available
        if (res.data.data.merchant_email) {
          setFormData((prev) => ({
            ...prev,
            email: res.data.data.merchant_email,
          }));
        } else {
          // No merchant email, force custom
          setEmailOption("custom");
        }

        setLoading(false);
      } catch (err) {
        console.error("Setup fetch error:", err);

        // If already setup, redirect to login
        if (err.response?.data?.error_code === "ALREADY_SETUP") {
          navigate("/login?message=already_setup");
          return;
        }

        setError(
          err.response?.data?.message || "حدث خطأ في تحميل بيانات المتجر"
        );
        setLoading(false);
      }
    };

    fetchStoreInfo();
  }, [setupToken, navigate]);

  // Handle email option change
  const handleEmailOptionChange = (value) => {
    setEmailOption(value);
    if (value === "merchant" && storeInfo?.merchant_email) {
      setFormData((prev) => ({
        ...prev,
        email: storeInfo.merchant_email,
      }));
    } else if (value === "custom") {
      setFormData((prev) => ({
        ...prev,
        email: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (formData.password !== formData.confirmPassword) {
      setError("كلمات المرور غير متطابقة");
      return;
    }

    if (formData.password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await axios.post(`/auth/setup`, {
        token: setupToken,
        email: formData.email,
        password: formData.password,
      });

      console.log("[Setup]: Account created successfully", response.data);

      // Navigate to login page with success message
      navigate(
        "/login?message=setup_complete&email=" +
          encodeURIComponent(formData.email)
      );
    } catch (err) {
      console.error("Setup submit error:", err);

      // If already setup, redirect to login
      if (err.response?.data?.error_code === "ALREADY_SETUP") {
        navigate("/login?message=already_setup");
        return;
      }

      setError(err.response?.data?.message || "حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#f0f9fa" }}>
        <Center style={{ minHeight: "100vh" }}>
          <Stack align="center" gap="md">
            <Loader size="lg" style={{ color: "#004b58" }} />
            <Text className="text-gray-600">جاري التحميل...</Text>
          </Stack>
        </Center>
      </div>
    );
  }

  if (error && !storeInfo) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#f0f9fa" }}>
        <Container size="sm" className="py-20">
          <Paper shadow="xl" p="xl" radius="lg" className="bg-white">
            <Stack align="center" gap="lg">
              <ThemeIcon size={80} radius="xl" color="red" variant="light">
                <IconAlertCircle size={50} />
              </ThemeIcon>
              <Title order={2} className="text-gray-800">
                خطأ
              </Title>
              <Text className="text-gray-600 text-center">{error}</Text>
              <Button
                onClick={() => navigate("/login")}
                style={{ backgroundColor: "#004b58" }}
                className="hover:opacity-90"
              >
                العودة لتسجيل الدخول
              </Button>
            </Stack>
          </Paper>
        </Container>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50"
      style={{ backgroundColor: "#f0f9fa" }}
    >
      <Container size="sm" className="py-20">
        <Paper shadow="xl" p="xl" radius="lg" className="bg-white">
          <Stack gap="lg">
            <div className="text-center">
              <Title order={1} className="text-gray-800 mb-2">
                مرحباً بك في منصة العروض المتقدمة
              </Title>
              <Text className="text-gray-600">
                إعداد حساب المتجر:{" "}
                <span className="font-semibold" style={{ color: "#004b58" }}>
                  {storeInfo?.name}
                </span>
              </Text>
              {storeInfo?.domain && (
                <Text size="sm" className="text-gray-500 mt-1">
                  {storeInfo.domain}
                </Text>
              )}
            </div>

            {error && (
              <Alert
                icon={<IconInfoCircle size="1rem" />}
                title="خطأ"
                color="red"
                variant="light"
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                {/* Email Option Selector - only show if merchant email exists */}
                {storeInfo?.merchant_email && (
                  <div>
                    <Text size="sm" fw={500} mb="xs">
                      اختر البريد الإلكتروني للدخول إلى لوحة التحكم
                    </Text>
                    <Text size="xs" c="dimmed" mb="sm">
                      سيتم استخدام هذا البريد لتسجيل الدخول إلى حسابك في
                      المستقبل
                    </Text>
                    <Radio.Group
                      value={emailOption}
                      onChange={handleEmailOptionChange}
                    >
                      <Stack gap="xs">
                        <Radio
                          value="merchant"
                          label={
                            <Group gap="xs">
                              <Text size="sm">
                                استخدام بريد المتجر:{" "}
                                <Text
                                  span
                                  fw={600}
                                  style={{ color: "#004b58" }}
                                >
                                  {storeInfo.merchant_email}
                                </Text>
                              </Text>
                            </Group>
                          }
                          styles={{
                            radio: {
                              "&:checked": {
                                backgroundColor: "#004b58",
                                borderColor: "#004b58",
                              },
                            },
                          }}
                        />
                        <Radio
                          value="custom"
                          label="استخدام بريد إلكتروني آخر (مخصص)"
                          styles={{
                            radio: {
                              "&:checked": {
                                backgroundColor: "#004b58",
                                borderColor: "#004b58",
                              },
                            },
                          }}
                        />
                      </Stack>
                    </Radio.Group>
                  </div>
                )}

                <TextInput
                  label="البريد الإلكتروني"
                  placeholder="example@domain.com"
                  type="email"
                  required
                  disabled={
                    emailOption === "merchant" && storeInfo?.merchant_email
                  }
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
                  description={
                    storeInfo?.merchant_email && emailOption === "merchant"
                      ? "سيتم استخدام بريد المتجر المحفوظ في سلة"
                      : null
                  }
                />

                <PasswordInput
                  label="كلمة المرور"
                  placeholder="8 أحرف على الأقل"
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

                <PasswordInput
                  label="تأكيد كلمة المرور"
                  placeholder="أعد كتابة كلمة المرور"
                  required
                  leftSection={<IconLock size="1rem" />}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  styles={{
                    input: {
                      "&:focus": {
                        borderColor: "#004b58",
                      },
                    },
                  }}
                />

                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  loading={submitting}
                  style={{ backgroundColor: "#004b58" }}
                  className="hover:opacity-90"
                >
                  إنشاء الحساب
                </Button>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Container>
    </div>
  );
}
