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
  Table24Filled,
  Table24Regular,
  bundleIcon,
} from '@fluentui/react-icons';
import { ApolloProvider } from '@apollo/client/react';
import { type ApolloClient } from '@apollo/client';
import { EntityCacheProvider } from './utils/context/EntityCacheContext';

const ContentIcon = bundleIcon(ContentView24Filled, ContentView24Regular);
const TableIcon = bundleIcon(Table24Filled, Table24Regular);

const navigationItems: NavigationItem[] = [
  {
    id: 'todos',
    icon: <ContentIcon />,
    label: 'TODO List',
    path: '/',
    type: 'route',
    enabled: true,
    order: 1,
  },
  {
    id: 'projects',
    icon: <TableIcon />,
    label: 'Projects',
    path: '/projects',
    type: 'route',
    enabled: true,
    order: 2,
  },
];

const routeConfigs: RouteConfig[] = [
  {
    id: 'todos',
    path: '/',
    exact: true,
    componentLoader: createLocalNamedComponentLoader(
      () => import('./components/TodoList'),
      'default'
    ),
    enabled: true,
    title: 'TODO List',
    description: 'Manage your TODO items',
  },
  {
    id: 'projects',
    path: '/projects',
    exact: true,
    componentLoader: createLocalNamedComponentLoader(
      () => import('./components/GridMock'),
      'default'
    ),
    enabled: true,
    title: 'Projects',
    description: 'View and manage project data',
  },
];

interface AppProps {
  client: ApolloClient;
}

function App({ client }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <EntityCacheProvider apolloClient={client}>
        <AppContainer
          layoutProps={{
            headerProps: {
              appName: 'TODO Manager',
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
      </EntityCacheProvider>
    </ApolloProvider>
  );
}

export default App;
