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
  Input,
  Textarea,
  Field,
  Dropdown,
  Option,
  makeStyles,
  MessageBar,
} from '@fluentui/react-components';
import { CREATE_TODO, GET_TODOS, TodoPriority } from '../apollo/operations';
import type { CreateTodoInput } from '../apollo/operations';
import type { Todo } from '../apollo/types';
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
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
});

interface CreateTodoDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (newTodo?: Todo) => void;
}

const CreateTodoDialog = ({
  open,
  onClose,
  onSuccess,
}: CreateTodoDialogProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: TodoPriority.MEDIUM,
    dueDate: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const styles = useStyles();

  const { onCreateCompleted } = useOptimisticCache<
    Todo & Record<string, unknown>
  >({
    query: GET_TODOS,
    variables: DEFAULT_TODOS_QUERY_VARIABLES,
    queryResultKey: 'todos',
    dataStructure: DataStructure.PAGINATED,
    entityName: 'Todo',
    idField: 'id',
  });

  const [createTodo, { loading }] = useMutation<{
    createTodo: {
      id: string;
      title: string;
      description?: string;
      completed: boolean;
      priority: TodoPriority;
      dueDate?: string;
      createdAt: string;
      updatedAt: string;
    };
  }>(CREATE_TODO, {
    update: (_cache, { data }) => {
      if (data?.createTodo) {
        onCreateCompleted({ createTodo: data.createTodo });
      }
    },
    onCompleted: data => {
      setFormData({
        title: '',
        description: '',
        priority: TodoPriority.MEDIUM,
        dueDate: '',
      });
      setErrors([]);
      onSuccess?.(data.createTodo);
      onClose();
    },
    onError: error => {
      setErrors([error.message]);
    },
  });

  const handleSubmit = async () => {
    const newErrors: string[] = [];

    if (formData.title.trim().length === 0) {
      newErrors.push('Title is required');
    }

    if (
      formData.dueDate &&
      formData.dueDate.length > 0 &&
      new Date(formData.dueDate) < new Date()
    ) {
      newErrors.push('Due date cannot be in the past');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    const input: CreateTodoInput = {
      title: formData.title.trim(),
      priority: formData.priority,
    };

    if (formData.description && formData.description.trim().length > 0) {
      input.description = formData.description.trim();
    }

    if (formData.dueDate && formData.dueDate.length > 0) {
      input.dueDate = new Date(formData.dueDate).toISOString();
    }

    try {
      await createTodo({
        variables: { input },
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating todo:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      priority: TodoPriority.MEDIUM,
      dueDate: '',
    });
    setErrors([]);
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
          <DialogTitle>Create New TODO</DialogTitle>
          <DialogContent>
            <div className={styles.dialogBody}>
              {errors.length > 0 && (
                <MessageBar intent='error'>
                  {errors.map(error => (
                    <div key={error}>{error}</div>
                  ))}
                </MessageBar>
              )}

              <Field label='Title' required>
                <Input
                  value={formData.title}
                  onChange={e => {
                    setFormData({ ...formData, title: e.target.value });
                  }}
                  placeholder='Enter todo title...'
                  disabled={loading}
                />
              </Field>

              <Field label='Description'>
                <Textarea
                  value={formData.description}
                  onChange={e => {
                    setFormData({ ...formData, description: e.target.value });
                  }}
                  placeholder='Enter todo description...'
                  rows={3}
                  disabled={loading}
                />
              </Field>

              <Field label='Priority'>
                <Dropdown
                  value={formData.priority}
                  selectedOptions={[formData.priority]}
                  onOptionSelect={(event, data) => {
                    setFormData({
                      ...formData,
                      priority: data.optionValue as TodoPriority,
                    });
                  }}
                  disabled={loading}
                >
                  <Option value={TodoPriority.LOW}>Low</Option>
                  <Option value={TodoPriority.MEDIUM}>Medium</Option>
                  <Option value={TodoPriority.HIGH}>High</Option>
                  <Option value={TodoPriority.URGENT}>Urgent</Option>
                </Dropdown>
              </Field>

              <Field label='Due Date'>
                <Input
                  type='datetime-local'
                  value={formData.dueDate}
                  onChange={e => {
                    setFormData({ ...formData, dueDate: e.target.value });
                  }}
                  disabled={loading}
                />
              </Field>
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
              onClick={handleSubmit}
              disabled={loading || formData.title.trim().length === 0}
            >
              {loading ? 'Creating...' : 'Create TODO'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default CreateTodoDialog;
