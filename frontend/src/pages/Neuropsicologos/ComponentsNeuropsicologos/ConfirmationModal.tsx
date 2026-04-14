import React from 'react';
import { AlertTriangle, Trash2, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  patientName?: string;
  details?: string[];
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'danger',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isLoading = false,
  patientName,
  details = []
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <Trash2 className="h-6 w-6 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'info':
      default:
        return <Info className="h-6 w-6 text-blue-600" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-red-50',
          icon: 'bg-red-100',
          button: 'bg-red-600 hover:bg-red-700',
          border: 'border-red-200'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          icon: 'bg-yellow-100',
          button: 'bg-yellow-600 hover:bg-yellow-700',
          border: 'border-yellow-200'
        };
      case 'success':
        return {
          bg: 'bg-green-50',
          icon: 'bg-green-100',
          button: 'bg-green-600 hover:bg-green-700',
          border: 'border-green-200'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50',
          icon: 'bg-blue-100',
          button: 'bg-blue-600 hover:bg-blue-700',
          border: 'border-blue-200'
        };
    }
  };

  const colors = getColors();

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px) saturate(180%) brightness(0.8)',
        WebkitBackdropFilter: 'blur(8px) saturate(180%) brightness(0.8)'
      }}
    >
      <Card className={`w-full max-w-md ${colors.border} border-2`}>
                    <CardHeader className="text-center">
            
            <div>
              <CardTitle className="text-lg text-gray-900">{title}</CardTitle>
              {patientName && (
                <CardDescription className="text-sm text-gray-600">
                  Paciente: <span className="font-medium">{patientName}</span>
                </CardDescription>
              )}
            </div>
                    </CardHeader>
            

        <CardContent className="p-1">
          <div className="space-y-2">
            <p className="text-gray-700 leading-relaxed">{message}</p>

            {details.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-md">
                <ul className="text-sm text-gray-600 space-y-1">
                  {details.map((detail, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

           
          </div>

          <div className="flex gap-4 mt-4 pt-2  border-gray-200 text">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 text-white ${colors.button}`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Procesando...
                </div>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmationModal;
