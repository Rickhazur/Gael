import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { callChatApi } from '../../services/ai_service';

interface ExerciseScannerProps {
  onAnalysisComplete: (feedback: string, detectedProblem?: string) => void;
  onClose: () => void;
}

export const ExerciseScanner = ({ onAnalysisComplete, onClose }: ExerciseScannerProps) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  // Capture image from webcam
  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
  }, [webcamRef]);

  // Send image to centralized AI service for analysis
  const analyzeExercise = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    setAnalysisResult(null); // Limpiar errores previos

    try {
      // 1. COMPRIMIR IMAGEN (Evita errores de "Body too large")
      const compressedBase64 = await compressImage(capturedImage);

      const systemPrompt = `Eres un tutor de matemáticas experto. Analiza el ejercicio matemático en la imagen del cuaderno del estudiante.

Tu trabajo es:
1. Identificar qué operación matemática está realizando (suma, resta, multiplicación, división, fracciones, etc.)
2. Detectar si hay errores en el procedimiento o la respuesta
3. Si hay errores, explicar de forma amable y clara qué está mal y cómo corregirlo
4. Si está correcto, felicitar al estudiante y dar un tip adicional
5. Ser específico: mencionar los números, la operación, y el paso exacto donde hay error

REGLA CRÍTICA: Distingue bien entre fracciones (ej: "4/8 - 1/5") y división larga (ej: "48 / 8"). Si ves símbolos como / entre dos números pequeños, es una fracción.

Responde en español, de forma amigable y motivadora.

FORMATO DE RESPUESTA:
OPERACIÓN: [tipo]
PROBLEMA: [transcripción]
RESPUESTA_ESTUDIANTE: [valor]
ESTADO: [CORRECTO o INCORRECTO]
FEEDBACK: [explicación]`;

      const messages = [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analiza este ejercicio matemático del cuaderno del estudiante:' },
            { type: 'image_url', image_url: { url: compressedBase64 } }
          ]
        }
      ];

      // 2. LLAMAR A LA API (El servicio centralizado maneja fallbacks)
      const data = await callChatApi(messages, 'gpt-4o');
      const feedback = data.choices[0]?.message?.content;

      if (!feedback) throw new Error('La IA no devolvió respuesta');

      setAnalysisResult(feedback);

      // Extraer problema detectado
      const problemMatch = feedback.match(/PROBLEMA:\s*(.+)/);
      const detectedProblem = problemMatch ? problemMatch[1].trim() : undefined;

      onAnalysisComplete(feedback, detectedProblem);

    } catch (error: any) {
      console.error('Error analyzing exercise:', error);
      const errorMsg = error.message?.toLowerCase() || '';

      let userFriendlyError = '❌ Hubo un error al analizar la imagen.';

      if (errorMsg.includes('api key')) {
        userFriendlyError = '🔑 Error de configuración: Falta la API Key en el archivo .env';
      } else if (errorMsg.includes('large') || errorMsg.includes('limit')) {
        userFriendlyError = '📏 La foto es demasiado pesada incluso comprimida. Intenta tomarla desde un poco más lejos.';
      } else if (errorMsg.includes('fetch') || errorMsg.includes('network') || errorMsg.includes('failed')) {
        userFriendlyError = '🌐 Error de Conexión o Proxy. Si estás en modo desarrollo, por favor REINICIA el servidor (npm run dev) para aplicar los nuevos cambios de proxy en el túnel.';
      } else {
        userFriendlyError = `❌ Ups: ${error.message || 'Error desconocido'}. Revisa la consola para más detalles.`;
      }

      setAnalysisResult(userFriendlyError);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper para encoger la imagen antes de enviar
  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; // Resolución suficiente para OCR pero ligera
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // 70% de calidad es ideal
      };
    });
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
  };

  return (
    <div className="exercise-scanner-overlay">
      <div className="scanner-modal">
        <div className="scanner-header">
          <h2>📸 Muestra tu ejercicio del cuaderno</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="scanner-content">
          {!capturedImage ? (
            // Webcam view
            <div className="webcam-container">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  width: 1280,
                  height: 720,
                  facingMode: 'user'
                }}
                className="webcam-feed"
              />
              <div className="camera-instructions">
                <p>🎯 Posiciona el cuaderno frente a la cámara</p>
                <p>📝 Asegúrate de que el ejercicio se vea claramente</p>
              </div>
              <button onClick={handleCapture} className="capture-btn">
                📷 Capturar Ejercicio
              </button>
            </div>
          ) : (
            // Preview and analysis
            <div className="preview-container">
              <div className="image-scan-wrapper">
                <img src={capturedImage} alt="Ejercicio capturado" className="captured-image" />
                {isAnalyzing && <div className="scanning-laser"></div>}
                {isAnalyzing && (
                  <div className="scanning-overlay">
                    <div className="scan-text">ESCANEANDO...</div>
                  </div>
                )}
              </div>

              {!analysisResult ? (
                <div className="analysis-actions">
                  <button onClick={handleRetake} className="retake-btn">
                    🔄 Tomar otra foto
                  </button>
                  <button
                    onClick={analyzeExercise}
                    className="analyze-btn"
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? '🔍 Analizando...' : '✨ Revisar Ejercicio'}
                  </button>
                </div>
              ) : (
                <div className="analysis-result">
                  <div className="feedback-box">
                    <pre className="feedback-text">{analysisResult}</pre>
                  </div>
                  <button onClick={handleRetake} className="new-exercise-btn">
                    📝 Revisar otro ejercicio
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .exercise-scanner-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          backdrop-filter: blur(8px);
        }

        .scanner-modal {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 24px;
          width: 95%;
          max-width: 800px;
          max-height: 90vh;
          overflow: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .scanner-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .scanner-header h2 {
          color: white;
          font-size: 22px;
          font-weight: 800;
          margin: 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(90deg);
        }

        .scanner-content {
          background: #f8fafc;
          border-radius: 20px;
          padding: 24px;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
        }

        .webcam-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .webcam-feed {
          width: 100%;
          max-width: 500px;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          border: 4px solid white;
        }

        .camera-instructions {
          background: #eff6ff;
          padding: 16px 24px;
          border-radius: 12px;
          border-left: 4px solid #3b82f6;
          max-width: 500px;
        }

        .camera-instructions p {
          margin: 4px 0;
          color: #1e40af;
          font-weight: 600;
          font-size: 14px;
        }

        .capture-btn {
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          color: white;
          border: none;
          padding: 16px 40px;
          border-radius: 50px;
          font-size: 18px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.4);
        }

        .capture-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 20px 25px -5px rgba(99, 102, 241, 0.5);
        }

        .preview-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .image-scan-wrapper {
          position: relative;
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          border: 4px solid white;
        }

        .captured-image {
          width: 100%;
          display: block;
        }

        .scanning-laser {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: #22c55e;
          box-shadow: 0 0 15px 4px rgba(34, 197, 94, 0.8), 0 0 30px 8px rgba(34, 197, 94, 0.4);
          z-index: 10;
          animation: scan 2.5s linear infinite;
        }

        .scanning-overlay {
          position: absolute;
          inset: 0;
          background: rgba(34, 197, 94, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
        }

        .scan-text {
          background: rgba(0, 0, 0, 0.6);
          color: #22c55e;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 900;
          letter-spacing: 2px;
          font-size: 12px;
          border: 1px solid #22c55e;
          animation: pulse 1.5s infinite;
        }

        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        .analysis-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
        }

        .retake-btn, .analyze-btn, .new-exercise-btn {
          padding: 14px 28px;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
        }

        .retake-btn {
          background: #f1f5f9;
          color: #64748b;
        }

        .retake-btn:hover {
          background: #e2e8f0;
          color: #475569;
        }

        .analyze-btn {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: white;
          box-shadow: 0 10px 15px -3px rgba(34, 197, 94, 0.4);
        }

        .analyze-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 20px 25px -5px rgba(34, 197, 94, 0.5);
        }

        .analyze-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .analysis-result {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .feedback-box {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .feedback-text {
          white-space: pre-wrap;
          font-family: inherit;
          font-size: 16px;
          line-height: 1.6;
          color: #0f172a;
          margin: 0;
        }

        .new-exercise-btn {
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          color: white;
          align-self: center;
          padding: 16px 40px;
        }

        .new-exercise-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(99, 102, 241, 0.4);
        }
      `}</style>
    </div>
  );
};
