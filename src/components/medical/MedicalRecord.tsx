import React, { useState, useEffect } from 'react';
import { FileText, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { getApiUrl } from '../../constants/api';
import { useTheme } from '../../contexts/ThemeContext';

interface MedicalRecordProps {
  appointmentId: number;
  userId: number;
  professionalId: string;
  onSave?: () => void;
}

const MedicalRecord: React.FC<MedicalRecordProps> = ({
  appointmentId,
  userId,
  professionalId,
  onSave
}) => {
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [recordId, setRecordId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    anamnesis: '',
    physicalExamination: '',
    diagnosticHypothesis: '',
    cid10Code: '',
    prescription: '',
    clinicalEvolution: '',
    notes: ''
  });

  useEffect(() => {
    fetchRecord();
  }, [appointmentId]);

  const fetchRecord = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${getApiUrl('MEDICAL_RECORDS')}?appointmentId=${appointmentId}`);
      const data = await response.json();

      if (response.ok && data.records) {
        setRecordId(data.records.id);
        setFormData({
          anamnesis: data.records.anamnesis || '',
          physicalExamination: data.records.physicalExamination || '',
          diagnosticHypothesis: data.records.diagnosticHypothesis || '',
          cid10Code: data.records.cid10Code || '',
          prescription: data.records.prescription || '',
          clinicalEvolution: data.records.clinicalEvolution || '',
          notes: data.records.notes || ''
        });
      }
    } catch (err) {
      console.error('Erro ao carregar prontuário:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const method = recordId ? 'PUT' : 'POST';
      const endpoint = getApiUrl('MEDICAL_RECORDS');

      const payload = recordId
        ? { recordId, ...formData }
        : { appointmentId, userId, professionalId, ...formData };

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        if (!recordId && data.recordId) {
          setRecordId(data.recordId);
        }
        setSuccess(true);
        if (onSave) onSave();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.message || 'Erro ao salvar prontuário');
      }
    } catch (err) {
      setError('Erro de conexão ao salvar prontuário');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-4">Carregando prontuário...</div>;
  }

  return (
    <div className={`medical-record-container ${isDark ? 'bg-[#1a1a2e] text-white' : 'bg-white'} rounded-lg shadow-sm p-6`}>
      <div className="flex items-center gap-2 mb-6">
        <FileText size={24} className="text-blue-600" />
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Prontuário Eletrônico</h2>
      </div>

      {error && (
        <div className={`flex items-center gap-2 p-4 mb-4 ${isDark ? 'bg-red-900/30 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-700'} border rounded-lg`}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className={`flex items-center gap-2 p-4 mb-4 ${isDark ? 'bg-green-900/30 border-green-800 text-green-400' : 'bg-green-50 border-green-200 text-green-700'} border rounded-lg`}>
          <CheckCircle size={20} />
          <span>Prontuário salvo com sucesso!</span>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Anamnese</label>
          <textarea
            name="anamnesis"
            value={formData.anamnesis}
            onChange={handleInputChange}
            placeholder="Histórico clínico, queixa principal, duração dos sintomas..."
            className={`w-full p-3 border ${isDark ? 'bg-[#1e1e30] border-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            rows={4}
          />
        </div>

        <div>
          <label className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Exame Físico</label>
          <textarea
            name="physicalExamination"
            value={formData.physicalExamination}
            onChange={handleInputChange}
            placeholder="Achados do exame neurológico, sinais vitais, etc..."
            className={`w-full p-3 border ${isDark ? 'bg-[#1e1e30] border-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Hipótese Diagnóstica</label>
            <textarea
              name="diagnosticHypothesis"
              value={formData.diagnosticHypothesis}
              onChange={handleInputChange}
              placeholder="Diagnósticos considerados..."
              className={`w-full p-3 border ${isDark ? 'bg-[#1e1e30] border-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              rows={3}
            />
          </div>

          <div>
            <label className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Código CID-10</label>
            <input
              type="text"
              name="cid10Code"
              value={formData.cid10Code}
              onChange={handleInputChange}
              placeholder="Ex: G89.29"
              className={`w-full p-3 border ${isDark ? 'bg-[#1e1e30] border-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        </div>

        <div>
          <label className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Prescrição</label>
          <textarea
            name="prescription"
            value={formData.prescription}
            onChange={handleInputChange}
            placeholder="Medicamentos, dosagens, frequência, duração do tratamento..."
            className={`w-full p-3 border ${isDark ? 'bg-[#1e1e30] border-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            rows={3}
          />
        </div>

        <div>
          <label className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Evolução Clínica</label>
          <textarea
            name="clinicalEvolution"
            value={formData.clinicalEvolution}
            onChange={handleInputChange}
            placeholder="Resposta ao tratamento, mudanças no quadro clínico..."
            className={`w-full p-3 border ${isDark ? 'bg-[#1e1e30] border-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            rows={3}
          />
        </div>

        <div>
          <label className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Observações Adicionais</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Notas gerais, recomendações, acompanhamento necessário..."
            className={`w-full p-3 border ${isDark ? 'bg-[#1e1e30] border-gray-700 text-white' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            rows={3}
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="mt-6 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
      >
        <Save size={20} />
        {isSaving ? 'Salvando...' : 'Salvar Prontuário'}
      </button>
    </div>
  );
};

export default MedicalRecord;
