import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  AppShell,
  Text,
  UnstyledButton,
  Group,
  Avatar,
  Menu,
  ScrollArea,
  Badge,
  ThemeIcon,
  Burger,
  Divider,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconDashboard,
  IconPackage,
  IconChartBar,
  IconSettings,
  IconLogout,
  IconBell,
  IconUser,
  IconChevronDown,
  IconHelpCircle,
} from "@tabler/icons-react";
import useAuthStore from "../../stores/useAuthStore";
import useBundleStore from "../../stores/useBundleStore";
import useTourStore from "../../stores/useTourStore";

const navItems = [
  {
    icon: IconDashboard,
    label: "الرئيسية",
    path: "/dashboard",
    color: "blue",
    dataTour: "nav-dashboard",
  },
  {
    icon: IconPackage,
    label: "الباقات",
    path: "/dashboard/bundles",
    color: "green",
    dataTour: "nav-bundles",
  },
  {
    icon: IconChartBar,
    label: "التحليلات",
    path: "/dashboard/analytics",
    color: "violet",
    dataTour: "nav-analytics",
  },
  {
    icon: IconSettings,
    label: "الإعدادات",
    path: "/dashboard/settings",
    color: "gray",
    dataTour: "nav-settings",
  },
];

function NavbarLink({ icon: Icon, label, color, active, onClick }) {
  const IconComponent = Icon;
  return (
    <UnstyledButton
      onClick={onClick}
      className={`w-full p-3 rounded-lg transition-all duration-200 ${
        active
          ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
      }`}
    >
      <Group gap="sm">
        <ThemeIcon
          size="md"
          variant={active ? "filled" : "light"}
          color={active ? "blue" : color}
        >
          <IconComponent size="1.1rem" />
        </ThemeIcon>
        <Text size="sm" fw={active ? 600 : 400}>
          {label}
        </Text>
      </Group>
    </UnstyledButton>
  );
}

function UserMenu() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Menu shadow="md" width={240}>
      <Menu.Target>
        <UnstyledButton className="p-2 rounded-lg hover:bg-gray-50 transition-colors">
          <Group gap="sm">
            <Avatar src={user?.avatar} alt={user?.name} radius="xl" size="sm">
              {user?.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            <div className="flex-1 text-right">
              <Text size="sm" fw={500} lineClamp={1}>
                {user?.name}
              </Text>
              <Text size="xs" c="dimmed" lineClamp={1}>
                {user?.domain}
              </Text>
            </div>
            <IconChevronDown size="0.9rem" className="text-gray-400" />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>الحساب</Menu.Label>
        <Menu.Item
          leftSection={<IconUser size="0.9rem" />}
          onClick={() => navigate("/dashboard/profile")}
        >
          الملف الشخصي
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item
          leftSection={<IconLogout size="0.9rem" />}
          color="red"
          onClick={handleLogout}
        >
          تسجيل الخروج
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

export default function DashboardLayout() {
  const [mobileNavOpened, { toggle: toggleMobileNav }] = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  // Use a selector that returns a stable reference
  const activeBundles = useBundleStore((state) => {
    const bundles = state.bundles || [];
    return bundles.filter((b) => b.status === "active").length;
  });
  // const totalConversions = bundles.reduce(
  //   (sum, b) => sum + (b.total_conversions || 0),
  //   0
  // );

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 280,
        breakpoint: "sm",
        collapsed: { mobile: !mobileNavOpened },
      }}
      padding="md"
      dir="rtl"
    >
      {/* Header */}
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={mobileNavOpened}
              onClick={toggleMobileNav}
              hiddenFrom="sm"
              size="sm"
            />

            <Group gap="sm">
              <ThemeIcon size="lg" color="blue" variant="filled" radius="md">
                <IconPackage size="1.4rem" />
              </ThemeIcon>
              <div>
                <Text size="lg" fw={700} className="text-gray-800">
                  منصة العروض المتقدمة
                </Text>
                <Text size="xs" c="dimmed">
                  إدارة ذكية للعروض والعروض
                </Text>
              </div>
            </Group>
          </Group>

          <Group gap="md">
            <Tooltip label="جولة إرشادية" data-tour="settings">
              <ActionIcon
                variant="light"
                color="blue"
                size="lg"
                onClick={() => {
                  const tourStore = useTourStore.getState();
                  tourStore.startTour();
                }}
              >
                <IconHelpCircle size="1.1rem" />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="الإشعارات">
              <ActionIcon variant="light" color="gray" size="lg">
                <IconBell size="1.1rem" />
              </ActionIcon>
            </Tooltip>

            <UserMenu />
          </Group>
        </Group>
      </AppShell.Header>

      {/* Navbar */}
      <AppShell.Navbar p="md">
        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {/* Store Info */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <Group gap="sm" mb="xs">
                <Avatar
                  src={user?.avatar}
                  alt={user?.name}
                  size="sm"
                  radius="xl"
                >
                  {user?.name?.charAt(0)?.toUpperCase()}
                </Avatar>
                <div className="flex-1">
                  <Text size="sm" fw={600} lineClamp={1}>
                    {user?.name}
                  </Text>
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    {user?.domain}
                  </Text>
                </div>
                <Badge
                  size="xs"
                  variant="light"
                  color="blue"
                  className="capitalize"
                >
                  {user?.plan || "basic"}
                </Badge>
              </Group>

              <Group gap="xs" justify="center">
                <div className="text-center">
                  <Text size="lg" fw={700} c="blue">
                    {activeBundles}
                  </Text>
                  <Text size="xs" c="dimmed">
                    باقة نشطة
                  </Text>
                </div>
                <Divider orientation="vertical" />
              </Group>
            </div>

            {/* Navigation Items */}
            <div className="space-y-1">
              {navItems.map((item) => (
                <div key={item.path} data-tour={item.dataTour}>
                  <NavbarLink
                    icon={item.icon}
                    label={item.label}
                    path={item.path}
                    color={item.color}
                    active={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                  />
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </AppShell.Navbar>

      {/* Main Content */}
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
