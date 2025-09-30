import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader, Container, Text, Alert } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import useAuthStore from "../../stores/useAuthStore";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleAuthCallback, setError } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get("token");
    const user = searchParams.get("user");

    if (token && user) {
      try {
        const success = handleAuthCallback(token, user);

        if (success) {
          // Show success briefly then redirect
          setTimeout(() => {
            navigate("/dashboard", { replace: true });
          }, 1500);
        } else {
          setError("Authentication failed. Please try again.");
          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 3000);
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        setError("Authentication failed. Please try again.");
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 3000);
      }
    } else {
      setError("Invalid authentication parameters.");
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3000);
    }
  }, [searchParams, handleAuthCallback, setError, navigate]);

  const token = searchParams.get("token");
  const isSuccess = !!token;

  return (
    <Container
      size="sm"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
      }}
    >
      {isSuccess ? (
        <>
          <Alert
            icon={<IconCheck size="1rem" />}
            title="تم تسجيل الدخول بنجاح!"
            color="green"
            variant="light"
            mb="xl"
          >
            جاري توجيهك إلى لوحة التحكم...
          </Alert>
          <Loader size="lg" color="green" />
        </>
      ) : (
        <>
          <Alert
            icon={<IconX size="1rem" />}
            title="فشل في تسجيل الدخول"
            color="red"
            variant="light"
            mb="xl"
          >
            حدث خطأ أثناء تسجيل الدخول. سيتم إعادة توجيهك إلى صفحة تسجيل
            الدخول...
          </Alert>
          <Loader size="lg" color="red" />
        </>
      )}

      <Text size="sm" c="dimmed" mt="md">
        {isSuccess ? "جاري المعالجة..." : "جاري إعادة التوجيه..."}
      </Text>
    </Container>
  );
}
