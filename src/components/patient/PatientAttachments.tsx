import React, { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, FileText, AlertCircle, CheckCircle, Loader, X, FileIcon, CloudUpload } from 'lucide-react';
import { getApiUrl } from '../../constants/api';
import '../../styles/attachments.css';

interface Attachment {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  description: string;
  createdAt: string;
  filePath: string;
}

interface PatientAttachmentsProps {
  userId: number;
  appointmentId?: number;
}

const PatientAttachments: React.FC<PatientAttachmentsProps> = ({ userId, appointmentId }) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAttachments();
  }, [userId, appointmentId]);

  const fetchAttachments = async () => {
    try {
      setIsLoading(true);
      const url = appointmentId
        ? `${getApiUrl('PATIENT_ATTACHMENTS')}?userId=${userId}&appointmentId=${appointmentId}`
        : `${getApiUrl('PATIENT_ATTACHMENTS')}?userId=${userId}`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setAttachments(Array.isArray(data.attachments) ? data.attachments : []);
      }
    } catch (err) {
      console.error('Erro ao carregar anexos:', err);
      setError('Erro ao carregar anexos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError('O arquivo deve ter no máximo 10MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Selecione um arquivo');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('userId', userId.toString());
      formData.append('description', description);
      if (appointmentId) {
        formData.append('appointmentId', appointmentId.toString());
      }
      formData.append('uploadedBy', 'patient');

      const response = await fetch(getApiUrl('PATIENT_ATTACHMENTS'), {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setSelectedFile(null);
        setDescription('');
        fetchAttachments();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.message || 'Erro ao enviar arquivo');
      }
    } catch (err) {
      setError('Erro de conexão ao enviar arquivo');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (attachmentId: number) => {
    if (!window.confirm('Tem certeza que deseja remover este anexo?')) {
      return;
    }

    try {
      const response = await fetch(getApiUrl('PATIENT_ATTACHMENTS'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attachmentId, userId })
      });

      if (response.ok) {
        setSuccess(true);
        fetchAttachments();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Erro ao remover anexo');
      }
    } catch (err) {
      setError('Erro de conexão ao remover anexo');
      console.error(err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="patient-attachments">
      <div className="attachments-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="attachments-header-icon">
            <CloudUpload size={28} />
          </div>
          <div>
            <h2 className="attachments-header-title">Meus Anexos</h2>
            <p className="attachments-header-subtitle">Gerencie seus documentos e exames</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="attachments-alert attachments-alert-error">
          <AlertCircle size={22} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="attachments-alert attachments-alert-success">
          <CheckCircle size={22} />
          <span>Operação realizada com sucesso!</span>
        </div>
      )}

      <div className="attachments-upload-area">
        {!selectedFile ? (
          <div
            className="attachments-upload-empty"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="attachments-upload-icon">
              <Upload size={24} />
            </div>
            <p className="attachments-upload-text">Clique para selecionar um arquivo</p>
            <p className="attachments-upload-hint">PDF, JPG, PNG ou Word (Máx. 10MB)</p>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <div className="attachments-file-preview">
            <div className="attachments-file-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                <div className="attachments-file-icon">
                  <FileIcon size={22} />
                </div>
                <div>
                  <p className="attachments-file-name">{selectedFile.name}</p>
                  <p className="attachments-file-size">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="attachments-file-remove"
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <label className="attachments-description-label">Descrição do Documento</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Resultado de Exame de Sangue - Março/2024"
                className="attachments-description-input"
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="attachments-upload-btn"
            >
              {isUploading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Confirmar Envio
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div>
        <h3 className="attachments-list-title">
          Anexos Recentes
          <span className="attachments-list-count">{attachments.length}</span>
        </h3>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
            <Loader size={32} className="animate-spin text-blue-600 mb-4" />
            <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Buscando seus arquivos...</p>
          </div>
        ) : attachments.length === 0 ? (
          <div className="attachments-list-empty">
            <div className="attachments-list-empty-icon">
              <FileText size={32} />
            </div>
            <p className="attachments-list-empty-title">Nenhum anexo encontrado</p>
            <p className="attachments-list-empty-text">Seus exames e documentos aparecerão aqui.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            {attachments.map((attachment) => (
              <div key={attachment.id} className="attachments-card">
                <div className="attachments-card-content">
                  <div className="attachments-card-icon">
                    <FileText size={24} />
                  </div>
                  <div className="attachments-card-info">
                    <p className="attachments-card-filename">{attachment.fileName}</p>
                    {attachment.description && (
                      <p className="attachments-card-description">{attachment.description}</p>
                    )}
                    <div className="attachments-card-meta">
                      <span>{formatFileSize(attachment.fileSize)}</span>
                      <span className="attachments-card-meta-dot"></span>
                      <span>{formatDate(attachment.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="attachments-card-actions">
                  <button
                    onClick={() => handleDelete(attachment.id)}
                    className="attachments-card-delete"
                    title="Remover anexo"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientAttachments;
