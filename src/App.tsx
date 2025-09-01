import {
  AppContainer,
  createLocalNamedComponentLoader,
} from '@orbusinfinity-shared/app-container';
import type {
  NavigationItem,
  RouteConfig,
} from '@orbusinfinity-shared/app-container';
import {
  ContentView24Filled,
  ContentView24Regular,
  bundleIcon,
} from '@fluentui/react-icons';

const ContentIcon = bundleIcon(ContentView24Filled, ContentView24Regular);

// Navigation configuration for Remote-1
const navigationItems: NavigationItem[] = [
  {
    id: 'grid',
    icon: <ContentIcon />,
    label: 'Grid View',
    path: '/',
    type: 'route',
    enabled: true,
    order: 1,
  },
];

// Route configuration for Remote-1
const routeConfigs: RouteConfig[] = [
  {
    id: 'grid',
    path: '/',
    exact: true,
    componentLoader: createLocalNamedComponentLoader(
      () => import('./components/GridMock'),
      'default'
    ),
    enabled: true,
    title: 'Grid View',
    description: 'Data grid component showcase',
  },
];

function App() {
  return (
    <AppContainer
      layoutProps={{
        headerProps: {
          appName: 'Remote-1 Grid',
          showSearch: false,
          showHelp: false,
          showNotifications: false,
          showSettings: false,
          showUserMenu: false,
        },
        sidebarProps: {
          navigationItems,
        },
        mainContentProps: {
          routes: routeConfigs,
        },
      }}
    />
  );
}

export default App;
