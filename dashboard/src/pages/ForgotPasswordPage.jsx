import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  PinInput,
  Button,
  Stack,
  Alert,
  Group,
  Center,
} from "@mantine/core";
import {
  IconInfoCircle,
  IconMail,
  IconLock,
  IconArrowLeft,
  IconCheck,
} from "@tabler/icons-react";
import axios from "axios";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = email, 2 = code + new password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Request reset code
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await axios.post("/auth/forgot-password", { email });

      setSuccess(
        res.data.message || "تم إرسال كود الإستعادة إلى بريدك الإلكتروني"
      );
      setStep(2);
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(
        err.response?.data?.message || "حدث خطأ، يرجى المحاولة مرة أخرى"
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password with code
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("كلمات المرور غير متطابقة");
      return;
    }

    // Validate password length
    if (newPassword.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }

    // Validate code
    if (code.length !== 6) {
      setError("الرجاء إدخال كود مكون من 6 أرقام");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("/auth/reset-password", {
        email,
        reset_code: code,
        new_password: newPassword,
      });

      setSuccess(res.data.message || "تم تغيير كلمة المرور بنجاح");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Reset password error:", err);
      setError(
        err.response?.data?.message || "حدث خطأ، يرجى المحاولة مرة أخرى"
      );
    } finally {
      setLoading(false);
    }
  };

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
                {step === 1 ? "نسيت كلمة المرور؟" : "إعادة تعيين كلمة المرور"}
              </Title>
              <Text className="text-gray-600">
                {step === 1
                  ? "أدخل بريدك الإلكتروني وسنرسل لك كود الإستعادة"
                  : "أدخل الكود المرسل إلى بريدك الإلكتروني"}
              </Text>
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

            {success && (
              <Alert
                icon={<IconCheck size="1rem" />}
                title="نجح"
                color="green"
                variant="light"
              >
                {success}
              </Alert>
            )}

            {step === 1 ? (
              <form onSubmit={handleRequestCode}>
                <Stack gap="md">
                  <TextInput
                    label="البريد الإلكتروني"
                    placeholder="example@domain.com"
                    type="email"
                    required
                    leftSection={<IconMail size="1rem" />}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    loading={loading}
                    style={{ backgroundColor: "#004b58" }}
                    className="hover:opacity-90"
                  >
                    إرسال كود الإستعادة
                  </Button>

                  <Center>
                    <Link
                      to="/login"
                      style={{
                        color: "#004b58",
                        textDecoration: "none",
                        fontSize: "0.9rem",
                      }}
                    >
                      <Group gap="xs">
                        <IconArrowLeft size="1rem" />
                        <Text>العودة لتسجيل الدخول</Text>
                      </Group>
                    </Link>
                  </Center>
                </Stack>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <Stack gap="md">
                  <div>
                    <Text size="sm" fw={500} className="mb-2">
                      كود الإستعادة
                    </Text>
                    <Center>
                      <PinInput
                        length={6}
                        type="number"
                        value={code}
                        onChange={setCode}
                        size="lg"
                        styles={{
                          input: {
                            borderColor: "#e0e0e0",
                            "&:focus": {
                              borderColor: "#004b58",
                            },
                          },
                        }}
                      />
                    </Center>
                  </div>

                  <PasswordInput
                    label="كلمة المرور الجديدة"
                    placeholder="8 أحرف على الأقل"
                    required
                    leftSection={<IconLock size="1rem" />}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    loading={loading}
                    style={{ backgroundColor: "#004b58" }}
                    className="hover:opacity-90"
                  >
                    تغيير كلمة المرور
                  </Button>

                  <Center>
                    <Button
                      variant="subtle"
                      onClick={() => {
                        setStep(1);
                        setCode("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setError(null);
                        setSuccess(null);
                      }}
                      style={{ color: "#004b58" }}
                    >
                      <Group gap="xs">
                        <IconArrowLeft size="1rem" />
                        <Text>العودة</Text>
                      </Group>
                    </Button>
                  </Center>
                </Stack>
              </form>
            )}
          </Stack>
        </Paper>
      </Container>
    </div>
  );
}
