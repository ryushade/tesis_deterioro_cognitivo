import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateUser, useUpdateUser } from '../../hooks/useUsers';
import type { User, CreateUserRequest } from '../../types';

interface UserFormProps {
  user?: User;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({ user, onSuccess, onCancel }) => {
  const isEditing = !!user;
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateUserRequest>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const onSubmit = async (data: CreateUserRequest) => {
    try {
      if (isEditing && user) {
        await updateUserMutation.mutateAsync({ id: user.id, userData: data });
      } else {
        await createUserMutation.mutateAsync(data);
      }
      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const isPending = createUserMutation.isPending || updateUserMutation.isPending;

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            {isEditing ? 'Editar Usuario' : 'Crear Usuario'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nombre:
              </label>
              <Input
                id="name"
                type="text"
                {...register('name', {
                  required: 'El nombre es requerido',
                  minLength: {
                    value: 2,
                    message: 'El nombre debe tener al menos 2 caracteres',
                  },
                })}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <span className="text-sm text-red-500">{errors.name.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email:
              </label>
              <Input
                id="email"
                type="email"
                {...register('email', {
                  required: 'El email es requerido',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido',
                  },
                })}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <span className="text-sm text-red-500">{errors.email.message}</span>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                type="submit"
                disabled={isPending || isSubmitting}
                className="flex-1"
              >
                {isPending ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  onClick={onCancel}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
