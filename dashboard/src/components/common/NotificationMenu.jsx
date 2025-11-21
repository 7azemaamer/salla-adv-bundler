import { useState, useEffect, useRef } from "react";
import {
  Menu,
  ActionIcon,
  Text,
  Badge,
  ScrollArea,
  Group,
  Stack,
  Divider,
  Tooltip,
  ThemeIcon,
  Loader,
} from "@mantine/core";
import {
  IconBell,
  IconCheck,
  IconAlertCircle,
  IconInfoCircle,
  IconAlertTriangle,
  IconCircleX,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import useNotificationStore from "../../stores/useNotificationStore";

export default function NotificationMenu() {
  const [opened, setOpened] = useState(false);
  const navigate = useNavigate();
  const pollingIntervalRef = useRef(null);

  const {
    notifications,
    unreadCount,
    loading: isLoading,
    fetchNotifications,
    markAsRead,
    startPolling,
    stopPolling,
  } = useNotificationStore();

  // Start polling for unread count on mount
  useEffect(() => {
    pollingIntervalRef.current = startPolling();

    return () => {
      stopPolling(pollingIntervalRef.current);
    };
  }, [startPolling, stopPolling]);

  // Fetch notifications when menu opens
  useEffect(() => {
    if (opened) {
      fetchNotifications();
    }
  }, [opened, fetchNotifications]);

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    // Navigate to link if exists
    if (notification.link && notification.link.trim()) {
      const link = notification.link.trim();
      console.log("Navigating to:", link);

      if (link.startsWith("http")) {
        window.open(link, "_blank");
      } else {
        // Ensure path starts with /
        const path = link.startsWith("/") ? link : `/${link}`;
        navigate(path);
        setOpened(false);
      }
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      info: { Icon: IconInfoCircle, color: "blue" },
      success: { Icon: IconCheck, color: "green" },
      warning: { Icon: IconAlertTriangle, color: "yellow" },
      error: { Icon: IconCircleX, color: "red" },
    };
    return icons[type] || icons.info;
  };

  const hasUnread = unreadCount > 0;

  return (
    <Menu
      opened={opened}
      onChange={setOpened}
      width={360}
      position="bottom-end"
      shadow="md"
      withinPortal
    >
      <Menu.Target>
        <div style={{ position: "relative", display: "inline-block" }}>
          <Tooltip label="الإشعارات">
            <ActionIcon
              variant="light"
              color={hasUnread ? "blue" : "gray"}
              size="lg"
            >
              <IconBell size="1.1rem" />
            </ActionIcon>
          </Tooltip>
          {hasUnread && (
            <Badge
              size="xs"
              variant="filled"
              color="red"
              style={{
                position: "absolute",
                top: -5,
                right: -5,
                padding: "0 6px",
                minWidth: 18,
                height: 18,
                pointerEvents: "none",
                zIndex: 10,
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </div>
      </Menu.Target>

      <Menu.Dropdown>
        <Group justify="space-between" px="sm" py="xs">
          <Text size="sm" fw={600}>
            الإشعارات
          </Text>
          {hasUnread && (
            <Badge size="sm" variant="light" color="blue">
              {unreadCount} جديد
            </Badge>
          )}
        </Group>

        <Divider />

        <ScrollArea h={400} type="auto">
          {isLoading ? (
            <Stack align="center" py="xl">
              <Loader size="sm" />
              <Text size="sm" c="dimmed">
                جاري التحميل...
              </Text>
            </Stack>
          ) : notifications?.length === 0 ? (
            <Stack align="center" py="xl">
              <ThemeIcon size="xl" variant="light" color="gray">
                <IconBell size="1.5rem" />
              </ThemeIcon>
              <Text size="sm" c="dimmed">
                لا توجد إشعارات
              </Text>
            </Stack>
          ) : (
            <Stack gap={0}>
              {notifications?.map((notification) => {
                const { Icon, color } = getTypeIcon(notification.type);
                return (
                  <Menu.Item
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    style={{
                      padding: "12px 16px",
                      borderRadius: 0,
                      backgroundColor: notification.isRead
                        ? "transparent"
                        : "var(--mantine-color-blue-0)",
                    }}
                  >
                    <Group gap="sm" align="start" wrap="nowrap">
                      <ThemeIcon size="md" variant="light" color={color} mt={2}>
                        <Icon size="1rem" />
                      </ThemeIcon>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text
                          size="sm"
                          fw={notification.isRead ? 400 : 600}
                          lineClamp={1}
                        >
                          {notification.title}
                        </Text>
                        <Text size="xs" c="dimmed" lineClamp={2} mt={4}>
                          {notification.message}
                        </Text>
                        <Text size="xs" c="dimmed" mt={4}>
                          {new Date(notification.createdAt).toLocaleDateString(
                            "ar-SA"
                          )}
                        </Text>
                      </div>
                      {!notification.isRead && (
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor: "var(--mantine-color-blue-6)",
                            marginTop: 6,
                          }}
                        />
                      )}
                    </Group>
                  </Menu.Item>
                );
              })}
            </Stack>
          )}
        </ScrollArea>

        {/* {notifications?.length > 0 && (
          <>
            <Divider />
            <Menu.Item
              onClick={() => {
                // TODO: Navigate to all notifications page
                setOpened(false);
              }}
              style={{ textAlign: "center" }}
            >
              <Text size="sm" fw={500} c="blue">
                عرض جميع الإشعارات
              </Text>
            </Menu.Item>
          </>
        )} */}
      </Menu.Dropdown>
    </Menu>
  );
}
