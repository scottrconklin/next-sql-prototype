"use client";

import { useState } from "react";

import { api } from "~/trpc/react";

export function TodoList() {
  const [todos] = api.todo.getAll.useSuspenseQuery();
  const utils = api.useUtils();
  const [title, setTitle] = useState("");

  const createTodo = api.todo.create.useMutation({
    onSuccess: async () => {
      await utils.todo.invalidate();
      setTitle("");
    },
  });

  const toggleTodo = api.todo.toggleComplete.useMutation({
    onSuccess: async () => {
      await utils.todo.invalidate();
    },
  });

  return (
    <div className="w-full max-w-md">
      <ul className="mb-4 overflow-hidden rounded-xl bg-white/10 divide-y divide-white/10">
        {todos.length === 0 && (
          <li className="px-4 py-6 text-center text-white/50">
            No todos yet. Add one below!
          </li>
        )}
        {todos.map((todo) => (
          <li key={todo.id} className="flex items-center gap-3 px-4 py-3">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo.mutate({ id: todo.id })}
              className="h-4 w-4 cursor-pointer accent-purple-400"
            />
            <span
              className={`flex-1 text-white transition-opacity ${todo.completed ? "line-through opacity-40" : ""}`}
            >
              {todo.title}
            </span>
          </li>
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (title.trim()) createTodo.mutate({ title });
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          placeholder="Add a new todo..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 rounded-full bg-white/10 px-4 py-2 text-white placeholder-white/40 outline-none focus:bg-white/20"
        />
        <button
          type="submit"
          disabled={createTodo.isPending || !title.trim()}
          className="rounded-full bg-purple-500 px-6 py-2 font-semibold text-white transition hover:bg-purple-400 disabled:opacity-50"
        >
          {createTodo.isPending ? "Adding..." : "Add"}
        </button>
      </form>
    </div>
  );
}
