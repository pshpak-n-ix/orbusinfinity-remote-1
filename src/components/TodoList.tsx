import { useState } from 'react';
import { useTodos } from '../utils/hooks/useTodos';
import {
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  makeStyles,
  Button,
  Badge,
  Spinner,
  MessageBar,
  tokens,
  Checkbox,
} from '@fluentui/react-components';
import {
  Add24Regular,
  CheckmarkCircle24Regular,
  Circle24Regular,
  Edit24Regular,
  Delete24Regular,
  ArrowClockwise24Regular,
} from '@fluentui/react-icons';
import { PageContentWrapper } from '@orbusinfinity-shared/ui-components';
import { TodoPriority } from '../apollo/operations';
import type { Todo } from '../apollo/types';
import CreateTodoDialog from './CreateTodoDialog';
import EditTodoDialog from './EditTodoDialog';
import DeleteTodoDialog from './DeleteTodoDialog';

const useStyles = makeStyles({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow:
      '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    padding: '16px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 200px)', // Account for header and padding
    minHeight: '400px',
  },
  tableContainer: {
    flexGrow: 1,
    overflowY: 'auto',
    overflowX: 'auto',
    minHeight: 0, // Allow flex child to shrink below content size
  },
  table: {
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  controlsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  actionCell: {
    display: 'flex',
    gap: '8px',
  },
  priorityBadge: {
    textTransform: 'capitalize',
  },
  completedRow: {
    opacity: 0.6,
  },
  statusIcon: {
    cursor: 'pointer',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
  },
});

const getPriorityColor = (priority: TodoPriority) => {
  switch (priority) {
    case TodoPriority.URGENT:
      return 'danger';
    case TodoPriority.HIGH:
      return 'important';
    case TodoPriority.MEDIUM:
      return 'warning';
    case TodoPriority.LOW:
      return 'success';
    default:
      return 'informative';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatOptionalDate = (dateString?: string | null) => {
  if (!dateString || dateString.length === 0) {
    return '-';
  }
  return formatDate(dateString);
};

const TodoList = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [avoidCache, setAvoidCache] = useState(false);
  const styles = useStyles();

  // Use the new simplified hook - much cleaner!
  const { loading, error, todos, refresh, entityKey } = useTodos();

  const handleRefresh = async () => {
    try {
      await refresh(avoidCache);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error refreshing todos:', err);
    }
  };

  const handleEdit = (todo: Todo) => {
    setSelectedTodo(todo);
    setEditDialogOpen(true);
  };

  const handleDelete = (todo: Todo) => {
    setSelectedTodo(todo);
    setDeleteDialogOpen(true);
  };

  if (error && todos.length === 0) {
    return (
      <PageContentWrapper title='TODO List'>
        <MessageBar intent='error'>
          Failed to load todos: {(error as Error).message || 'Unknown error'}
        </MessageBar>
      </PageContentWrapper>
    );
  }

  return (
    <PageContentWrapper title='TODO List'>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2>My TODOs ({todos.length})</h2>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.controlsGroup}>
              <Checkbox
                label='Avoid cache'
                checked={avoidCache}
                onChange={(_, data) => {
                  setAvoidCache(data.checked === true);
                }}
              />
              <Button
                appearance='subtle'
                icon={<ArrowClockwise24Regular />}
                onClick={handleRefresh}
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
            <Button
              appearance='primary'
              icon={<Add24Regular />}
              onClick={() => {
                setCreateDialogOpen(true);
              }}
            >
              Add TODO
            </Button>
          </div>
        </div>

        {loading && !todos.length ? (
          <div className={styles.loadingContainer}>
            <Spinner label='Loading todos...' />
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <Table aria-label='TODO data table' className={styles.table}>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Title</TableHeaderCell>
                  <TableHeaderCell>Description</TableHeaderCell>
                  <TableHeaderCell>Priority</TableHeaderCell>
                  <TableHeaderCell>Due Date</TableHeaderCell>
                  <TableHeaderCell>Created</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todos.map(todo => (
                  <TableRow
                    key={todo.id}
                    className={todo.completed ? styles.completedRow : ''}
                  >
                    <TableCell>
                      {todo.completed ? (
                        <CheckmarkCircle24Regular
                          className={styles.statusIcon}
                          style={{ color: tokens.colorPaletteGreenBackground2 }}
                        />
                      ) : (
                        <Circle24Regular className={styles.statusIcon} />
                      )}
                    </TableCell>
                    <TableCell>
                      <strong>{todo.title}</strong>
                    </TableCell>
                    <TableCell>{todo.description ?? '-'}</TableCell>
                    <TableCell>
                      <Badge
                        color={getPriorityColor(todo.priority)}
                        className={styles.priorityBadge}
                      >
                        {todo.priority.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatOptionalDate(todo.dueDate)}</TableCell>
                    <TableCell>{formatDate(todo.createdAt)}</TableCell>
                    <TableCell>
                      <div className={styles.actionCell}>
                        <Button
                          appearance='subtle'
                          icon={<Edit24Regular />}
                          size='small'
                          onClick={() => {
                            handleEdit(todo);
                          }}
                          disabled={loading}
                        />
                        <Button
                          appearance='subtle'
                          icon={<Delete24Regular />}
                          size='small'
                          onClick={() => {
                            handleDelete(todo);
                          }}
                          disabled={loading}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {todos.length === 0 && !loading && (
          <div className={styles.tableContainer}>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>No todos found. Create your first TODO to get started!</p>
            </div>
          </div>
        )}
      </div>

      <CreateTodoDialog
        open={createDialogOpen}
        entityKey={entityKey}
        onClose={() => {
          setCreateDialogOpen(false);
        }}
      />

      {selectedTodo && (
        <>
          <EditTodoDialog
            todo={selectedTodo}
            entityKey={entityKey}
            open={editDialogOpen}
            onClose={() => {
              setEditDialogOpen(false);
              setSelectedTodo(null);
            }}
          />

          <DeleteTodoDialog
            todo={selectedTodo}
            entityKey={entityKey}
            open={deleteDialogOpen}
            onClose={() => {
              setDeleteDialogOpen(false);
              setSelectedTodo(null);
            }}
          />
        </>
      )}
    </PageContentWrapper>
  );
};

export default TodoList;
