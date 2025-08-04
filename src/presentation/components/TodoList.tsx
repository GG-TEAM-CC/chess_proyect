import type { Todo } from '../../domain/models/Todo.ts';
interface TodoListProps {
  todos: Todo[];
}

export function TodoList({ todos }: Readonly<TodoListProps>) {
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          <span>{todo.title}</span> {todo.completed ? '✅' : '❌'}
        </li>
      ))}
    </ul>
  );
}

