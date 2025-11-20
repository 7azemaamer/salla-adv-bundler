import { Button, Group, Text, ThemeIcon } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import useAuthStore from "../../stores/useAuthStore";

export default function PlanRefreshButton({ compact = false }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { refreshPlanContext } = useAuthStore();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const success = await refreshPlanContext();
      if (success) {
        notifications.show({
          title: "تم التحديث",
          message: "تم تحديث ميزات الخطة بنجاح",
          color: "green",
          icon: <IconRefresh size={18} />,
        });
      } else {
        throw new Error("Failed to refresh");
      }
    } catch {
      notifications.show({
        title: "خطأ في التحديث",
        message: "لم نتمكن من تحديث ميزات الخطة",
        color: "red",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (compact) {
    return (
      <Button
        variant="subtle"
        size="xs"
        leftSection={<IconRefresh size={14} />}
        onClick={handleRefresh}
        loading={isRefreshing}
      >
        تحديث الميزات
      </Button>
    );
  }

  return (
    <Button
      variant="light"
      leftSection={<IconRefresh size={18} />}
      onClick={handleRefresh}
      loading={isRefreshing}
    >
      تحديث ميزات الخطة
    </Button>
  );
}
