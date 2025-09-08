import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  makeStyles,
  MessageBar,
} from '@fluentui/react-components';
import { DELETE_TODO, GET_TODOS } from '../apollo/operations';
import type { Todo } from '../apollo/operations';
import {
  useOptimisticCache,
  DataStructure,
  DEFAULT_TODOS_QUERY_VARIABLES,
} from '../utils/optimisticCacheManager';

const useStyles = makeStyles({
  dialogBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    minWidth: '400px',
  },
  todoInfo: {
    backgroundColor: '#f8f9fa',
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #e9ecef',
  },
  warningText: {
    color: '#d73a49',
    fontWeight: 'bold',
  },
});

interface DeleteTodoDialogProps {
  todo: Todo;
  open: boolean;
  onClose: () => void;
  onSuccess?: (deletedTodoId?: string) => void;
}

const DeleteTodoDialog = ({
  todo,
  open,
  onClose,
  onSuccess,
}: DeleteTodoDialogProps) => {
  const [error, setError] = useState<string>('');
  const styles = useStyles();

  const { onDeleteCompleted } = useOptimisticCache<
    Todo & Record<string, unknown>
  >({
    query: GET_TODOS,
    variables: DEFAULT_TODOS_QUERY_VARIABLES,
    queryResultKey: 'todos',
    dataStructure: DataStructure.PAGINATED,
    entityName: 'Todo',
    idField: 'id',
  });

  const [deleteTodo, { loading }] = useMutation<{
    deleteTodo: {
      success: boolean;
      message: string;
    };
  }>(DELETE_TODO, {
    update: (_cache, { data }, { variables }) => {
      if (
        data?.deleteTodo.success === true &&
        typeof variables?.id === 'string'
      ) {
        onDeleteCompleted(data, { id: variables.id });
      }
    },
    onCompleted: data => {
      if (data.deleteTodo.success) {
        setError('');
        onSuccess?.(todo.id);
        onClose();
      } else {
        setError(data.deleteTodo.message || 'Failed to delete todo');
      }
    },
    onError: error => {
      setError(error.message);
    },
  });

  const handleDelete = async () => {
    try {
      await deleteTodo({
        variables: { id: todo.id },
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating todo:', error);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(_event, data) => {
        if (!data.open) {
          handleClose();
        }
      }}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Delete TODO</DialogTitle>
          <DialogContent>
            <div className={styles.dialogBody}>
              {error.length > 0 && (
                <MessageBar intent='error'>{error}</MessageBar>
              )}

              <p className={styles.warningText}>
                Are you sure you want to delete this TODO? This action cannot be
                undone.
              </p>

              <div className={styles.todoInfo}>
                <h4>TODO Details:</h4>
                <p>
                  <strong>Title:</strong> {todo.title}
                </p>
                <p>
                  <strong>Description:</strong> {todo.description}
                </p>
                <p>
                  <strong>Priority:</strong> {todo.priority}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  {todo.completed ? 'Completed' : 'Pending'}
                </p>
                {todo.dueDate !== undefined && (
                  <p>
                    <strong>Due Date:</strong>{' '}
                    {new Date(todo.dueDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button
                appearance='secondary'
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
            </DialogTrigger>
            <Button
              appearance='primary'
              onClick={handleDelete}
              disabled={loading}
              style={{ backgroundColor: '#d73a49', borderColor: '#d73a49' }}
            >
              {loading ? 'Deleting...' : 'Delete TODO'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default DeleteTodoDialog;
