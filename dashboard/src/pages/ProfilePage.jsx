import { useState } from "react";
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  Button,
  Group,
  Stack,
  Avatar,
  Badge,
  Divider,
  Grid,
  Card,
  Alert,
  Box,
} from "@mantine/core";
import {
  IconUser,
  IconMail,
  IconBuildingStore,
  IconWorld,
  IconInfoCircle,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import useAuthStore from "../stores/useAuthStore";

/**
 * Profile page component - displays and manages user/store profile information
 */
export default function ProfilePage() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Editable fields (if we add update functionality later)
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [contactEmail, setContactEmail] = useState(user?.email || "");

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // TODO: Add API call to update profile
      // await axios.put('/auth/profile', { name: displayName, email: contactEmail });

      notifications.show({
        title: "تم الحفظ بنجاح",
        message: "تم تحديث معلومات الملف الشخصي بنجاح",
        color: "green",
        icon: <IconCheck size="1rem" />,
      });

      setIsEditing(false);
    } catch (error) {
      notifications.show({
        title: "خطأ في الحفظ",
        message: error.message || "حدث خطأ أثناء تحديث الملف الشخصي",
        color: "red",
        icon: <IconX size="1rem" />,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(user?.name || "");
    setContactEmail(user?.email || "");
    setIsEditing(false);
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Title order={2} mb="xs">
            الملف الشخصي
          </Title>
          <Text c="dimmed" size="sm">
            معلومات المتجر والحساب الخاص بك
          </Text>
        </div>

        {/* Profile Card */}
        <Paper shadow="sm" p="xl" radius="md" withBorder>
          <Group gap="xl" align="flex-start" wrap="nowrap">
            {/* Avatar Section */}
            <div>
              <Avatar
                src={user?.avatar}
                alt={user?.name}
                size={120}
                radius="md"
              >
                {user?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Badge
                color="green"
                variant="light"
                size="sm"
                mt="sm"
                fullWidth
                style={{ textAlign: "center" }}
              >
                نشط
              </Badge>
            </div>

            {/* Profile Info */}
            <Box style={{ flex: 1 }}>
              <Group justify="space-between" mb="md">
                <div>
                  <Title order={3}>{user?.name}</Title>
                  <Text c="dimmed" size="sm">
                    {user?.domain}
                  </Text>
                </div>
                {!isEditing && (
                  <Button
                    variant="light"
                    onClick={() => setIsEditing(true)}
                    disabled
                  >
                    تعديل الملف الشخصي
                  </Button>
                )}
              </Group>

              <Divider my="md" />

              {/* Profile Details */}
              {isEditing ? (
                <Stack gap="md">
                  <TextInput
                    label="اسم العرض"
                    placeholder="اسم المتجر"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.currentTarget.value)}
                    leftSection={<IconUser size="1rem" />}
                  />
                  <TextInput
                    label="البريد الإلكتروني"
                    placeholder="email@example.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.currentTarget.value)}
                    leftSection={<IconMail size="1rem" />}
                    type="email"
                  />
                  <Group justify="flex-end" gap="sm">
                    <Button
                      variant="default"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      إلغاء
                    </Button>
                    <Button onClick={handleSave} loading={isSaving}>
                      حفظ التغييرات
                    </Button>
                  </Group>
                </Stack>
              ) : (
                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Text size="xs" c="dimmed" mb={4}>
                      البريد الإلكتروني
                    </Text>
                    <Group gap="xs">
                      <IconMail size="1rem" className="text-gray-400" />
                      <Text size="sm">{user?.email || "غير متوفر"}</Text>
                    </Group>
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Text size="xs" c="dimmed" mb={4}>
                      رقم المتجر
                    </Text>
                    <Group gap="xs">
                      <IconBuildingStore size="1rem" className="text-gray-400" />
                      <Text size="sm">{user?.store_id || "غير متوفر"}</Text>
                    </Group>
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Text size="xs" c="dimmed" mb={4}>
                      النطاق
                    </Text>
                    <Group gap="xs">
                      <IconWorld size="1rem" className="text-gray-400" />
                      <Text size="sm">{user?.domain || "غير متوفر"}</Text>
                    </Group>
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Text size="xs" c="dimmed" mb={4}>
                      المعرف الفريد
                    </Text>
                    <Group gap="xs">
                      <IconInfoCircle size="1rem" className="text-gray-400" />
                      <Text size="sm" style={{ fontFamily: "monospace" }}>
                        {user?._id?.slice(-8) || "غير متوفر"}
                      </Text>
                    </Group>
                  </Grid.Col>
                </Grid>
              )}
            </Box>
          </Group>
        </Paper>

        {/* Store Information Card */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <div>
              <Title order={4} mb={4}>
                معلومات المتجر
              </Title>
              <Text size="sm" c="dimmed">
                معلومات متجرك على منصة سلة
              </Text>
            </div>
            <Badge size="lg" variant="gradient" gradient={{ from: "blue", to: "cyan" }}>
              Salla Store
            </Badge>
          </Group>

          <Divider my="md" />

          <Grid gutter="md">
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Stack gap={4}>
                <Text size="xs" c="dimmed">
                  اسم المتجر
                </Text>
                <Text fw={500}>{user?.name || "غير متوفر"}</Text>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Stack gap={4}>
                <Text size="xs" c="dimmed">
                  رابط المتجر
                </Text>
                <Text fw={500} component="a" href={`https://${user?.domain}`} target="_blank" style={{ color: "var(--mantine-color-blue-6)", textDecoration: "none" }}>
                  {user?.domain || "غير متوفر"}
                </Text>
              </Stack>
            </Grid.Col>

            <Grid.Col span={12}>
              <Stack gap={4}>
                <Text size="xs" c="dimmed">
                  معرف المتجر (Store ID)
                </Text>
                <Text fw={500} style={{ fontFamily: "monospace" }}>
                  {user?.store_id || "غير متوفر"}
                </Text>
              </Stack>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Information Alert */}
        <Alert
          variant="light"
          color="blue"
          icon={<IconInfoCircle />}
          title="معلومات هامة"
        >
          <Text size="sm">
            يتم جلب معلومات الملف الشخصي من حسابك في منصة سلة. لتعديل معلومات المتجر، يرجى تسجيل الدخول إلى{" "}
            <Text component="a" href="https://s.salla.sa/apps" target="_blank" c="blue" fw={500}>
              لوحة تحكم سلة
            </Text>
            .
          </Text>
        </Alert>

        {/* Account Actions */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={4} mb="md">
            إعدادات الحساب
          </Title>
          <Stack gap="md">
            <Group justify="space-between" wrap="nowrap">
              <div>
                <Text fw={500} size="sm">
                  حذف الحساب
                </Text>
                <Text size="xs" c="dimmed">
                  حذف حسابك وجميع البيانات المرتبطة به بشكل نهائي
                </Text>
              </div>
              <Button color="red" variant="light" disabled>
                حذف الحساب
              </Button>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
