import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';

export default function CustomTaskForm({ examDateTime, onAdd, onClose }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      titulo: '',
      data: new Date(examDateTime).toISOString().split('T')[0],
      hora: '09:00'
    }
  });

  const handleAddTask = (data) => {
    const scheduledTime = new Date(`${data.data}T${data.hora}`);
    const now = new Date();

    if (scheduledTime < now) {
      alert('A data/hora não pode ser no passado');
      return;
    }

    onAdd({
      id: `custom-${Date.now()}`,
      titulo: data.titulo,
      descricao_pt: data.titulo,
      scheduledTime: scheduledTime.toISOString(),
      isCompleted: false,
      isCustom: true
    });

    reset();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Adicionar Lembrete
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(handleAddTask)} className="p-6 space-y-6">
          {/* Descrição */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              O que é o lembrete? *
            </label>
            <input
              type="text"
              placeholder="Ex: Pausar Aspirina, Última refeição, etc."
              {...register('titulo', {
                required: 'Campo obrigatório',
                minLength: { value: 3, message: 'Mínimo 3 caracteres' }
              })}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-blue dark:focus:ring-blue-400 placeholder-gray-400 dark:placeholder-gray-500"
            />
            {errors.titulo && (
              <p className="text-danger-red text-sm mt-2">{errors.titulo.message}</p>
            )}
          </div>

          {/* Data */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Data *
            </label>
            <input
              type="date"
              {...register('data', { required: 'Campo obrigatório' })}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-blue dark:focus:ring-blue-400"
            />
            {errors.data && (
              <p className="text-danger-red text-sm mt-2">{errors.data.message}</p>
            )}
          </div>

          {/* Hora */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Hora *
            </label>
            <input
              type="time"
              {...register('hora', { required: 'Campo obrigatório' })}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-blue dark:focus:ring-blue-400"
            />
            {errors.hora && (
              <p className="text-danger-red text-sm mt-2">{errors.hora.message}</p>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-primary-blue text-white font-semibold rounded-2xl hover:bg-blue-700 transition-colors active:scale-95"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
