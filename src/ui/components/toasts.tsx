import { Toast } from '@base-ui/react/toast';

/**
 * Where toasts show: the bottom corner, each a short confirmation. Render once
 * inside `Toast.Provider`; add toasts with `Toast.useToastManager().add`.
 */
export function Toasts() {
  const { toasts } = Toast.useToastManager();
  return (
    <Toast.Portal>
      <Toast.Viewport className="fixed right-4 bottom-4 z-30 flex w-72 flex-col gap-2">
        {toasts.map((toast) => (
          <Toast.Root
            key={toast.id}
            toast={toast}
            className="rounded-lg border border-surface-2 bg-surface-1 px-4 py-3 text-sm text-ink-1 shadow-lg transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0"
          >
            <Toast.Title className="font-medium text-ink-2" />
            <Toast.Description className="text-ink-0" />
          </Toast.Root>
        ))}
      </Toast.Viewport>
    </Toast.Portal>
  );
}
