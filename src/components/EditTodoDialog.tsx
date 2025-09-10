import { useState, useEffect } from 'react';
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
  Checkbox,
  makeStyles,
  MessageBar,
} from '@fluentui/react-components';
import { UPDATE_TODO, TodoPriority } from '../apollo/operations';
import type { Todo, UpdateTodoInput } from '../apollo/operations';
import { useContextEntityMutations } from '../utils/hooks/useEntityCache';

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

interface EditTodoDialogProps {
  todo: Todo;
  entityKey: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: (updatedTodo?: Todo) => void;
}

const EditTodoDialog = ({
  todo,
  entityKey,
  open,
  onClose,
  onSuccess,
}: EditTodoDialogProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: TodoPriority.MEDIUM,
    dueDate: '',
    completed: false,
  });
  const [errors, setErrors] = useState<string[]>([]);
  const styles = useStyles();

  // Use the new simplified entity mutations hook
  const { updateEntity: updateTodo } =
    useContextEntityMutations<Todo>(entityKey);

  useEffect(() => {
    setFormData({
      title: todo.title,
      description: todo.description ?? '',
      priority: todo.priority,
      dueDate:
        todo.dueDate !== undefined
          ? new Date(todo.dueDate).toISOString().slice(0, 16)
          : '',
      completed: todo.completed,
    });
  }, [todo]);

  const [updateTodoMutation, { loading }] = useMutation<{
    updateTodo: {
      id: string;
      title: string;
      description?: string;
      completed: boolean;
      priority: TodoPriority;
      dueDate?: string;
      createdAt: string;
      updatedAt: string;
    };
  }>(UPDATE_TODO, {
    onCompleted: async data => {
      // Use the new entity cache system for optimistic updates
      await updateTodo(data.updateTodo);

      setErrors([]);
      onSuccess?.(data.updateTodo);
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

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    const input: UpdateTodoInput = {
      title: formData.title.trim(),
      priority: formData.priority,
      completed: formData.completed,
    };

    if (formData.description.trim() !== (todo.description ?? '')) {
      input.description =
        formData.description.trim().length > 0
          ? formData.description.trim()
          : undefined;
    }

    const originalDueDate =
      todo.dueDate !== undefined
        ? new Date(todo.dueDate).toISOString().slice(0, 16)
        : '';
    if (formData.dueDate !== originalDueDate) {
      input.dueDate =
        formData.dueDate.length > 0
          ? new Date(formData.dueDate).toISOString()
          : undefined;
    }

    try {
      await updateTodoMutation({
        variables: {
          id: todo.id,
          input,
        },
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating todo:', error);
    }
  };

  const handleClose = () => {
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
          <DialogTitle>Edit TODO</DialogTitle>
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

              <Field>
                <Checkbox
                  checked={formData.completed}
                  onChange={(e, data) => {
                    setFormData({
                      ...formData,
                      completed: data.checked === true,
                    });
                  }}
                  label='Mark as completed'
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
              {loading ? 'Updating...' : 'Update TODO'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default EditTodoDialog;
