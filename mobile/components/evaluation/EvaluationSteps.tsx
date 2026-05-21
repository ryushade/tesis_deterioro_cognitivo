import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, ScrollView, Animated } from 'react-native';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { styles, CDT_SCALES } from './EvaluationStyles';

export const LoginStep = ({
  accessCode,
  setAccessCode,
  errorMessage,
  setErrorMessage,
  handlePatientLogin,
  loading,
  apiUrl,
  setApiUrl
}: any) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.logoCenter}>
        <View style={styles.avatarCircle}>
          <FontAwesome name="stethoscope" size={34} color="#4F46E5" />
        </View>
        <Text style={styles.loginTitle}>Sistema Inteligente de Evaluación Cognitiva</Text>
        <Text style={styles.loginSubtitle}>Adultos Mayores - Centro de Salud San Martín</Text>
      </View>
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Código de acceso temporal</Text>
        <View style={styles.inputWrapper}>
          <FontAwesome name="key" size={20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Ej: CDT-123"
            placeholderTextColor="#94A3B8"
            value={accessCode}
            onChangeText={(text) => { setAccessCode(text); setErrorMessage(null); }}
            autoCapitalize="characters"
            maxLength={12}
          />
        </View>
        <Text style={styles.inputHelper}>Ingrese el código asignado por el neuropsicólogo desde el panel web.</Text>
      </View>
      {errorMessage && (
        <View style={styles.errorAlert}>
          <MaterialIcons name="error-outline" size={22} color="#991B1B" />
          <Text style={styles.errorAlertText}>{errorMessage}</Text>
        </View>
      )}
      <TouchableOpacity style={[styles.primaryBtn, loading && styles.disabledBtn]} onPress={handlePatientLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.primaryBtnText}>Iniciar prueba</Text>}
      </TouchableOpacity>

      {/* Collapsible server settings */}
      <TouchableOpacity 
        style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: 6, 
          marginTop: 20, 
          paddingTop: 14, 
          borderTopWidth: 1, 
          borderTopColor: '#F1F5F9' 
        }} 
        onPress={() => setShowSettings(!showSettings)}
      >
        <FontAwesome name="cog" size={16} color="#64748B" />
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748B' }}>
          {showSettings ? "Ocultar configuración de red" : "Configurar dirección del servidor"}
        </Text>
      </TouchableOpacity>

      {showSettings && (
        <View style={{ marginTop: 14, backgroundColor: '#F8FAFC', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 6 }}>
            Dirección del Servidor API
          </Text>
          <View style={[styles.inputWrapper, { height: 44, paddingHorizontal: 12, backgroundColor: '#FFFFFF' }]}>
            <TextInput
              style={[styles.textInput, { fontSize: 13, fontWeight: '500' }]}
              placeholder="http://192.168.1.50:5001/api"
              placeholderTextColor="#94A3B8"
              value={apiUrl}
              onChangeText={setApiUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <Text style={{ fontSize: 11, color: '#64748B', marginTop: 8, lineHeight: 14 }}>
            Si está en otra red o usa datos móviles, inicie un túnel con <Text style={{ fontWeight: '700' }}>ngrok</Text> en el puerto <Text style={{ fontWeight: '700' }}>5001</Text> y pegue la URL pública aquí.
          </Text>
        </View>
      )}
    </View>
  );
};

export const InstructionsStep = ({ patientInfo, startEvaluation }: any) => {
  const isCdt = patientInfo?.tipo_evaluacion?.toLowerCase().includes('reloj') || patientInfo?.tipo_evaluacion === 'CDT';
  return (
    <View style={styles.card}>
      <View style={styles.patientBanner}>
        <FontAwesome name="user-circle-o" size={20} color="#3730A3" />
        <Text style={styles.patientBannerText}>Paciente: {patientInfo?.nombre_paciente}</Text>
      </View>
      <Text style={styles.sectionTitle}>{isCdt ? "Prueba del Reloj (CDT)" : "Prueba de Fluidez Verbal"}</Text>
      <View style={styles.instructionCard}>
        <Text style={styles.insStepTitle}>Pasos para realizar la prueba:</Text>
        {isCdt ? (
          <>
            <View style={styles.insRow}><Text style={styles.insNumber}>1</Text><Text style={styles.insText}>Tome una hoja de papel en blanco y un lápiz o bolígrafo.</Text></View>
            <View style={styles.insRow}><Text style={styles.insNumber}>2</Text><Text style={styles.insText}>Dibuje un círculo grande (esfera del reloj) a mano alzada.</Text></View>
            <View style={styles.insRow}><Text style={styles.insNumber}>3</Text><Text style={styles.insText}>Coloque los números de las horas (del 1 al 12) en su posición correcta.</Text></View>
            <View style={styles.insRow}><Text style={styles.insNumber}>4</Text><Text style={styles.insText}>Dibuje las manecillas indicando la hora **once y diez (11:10)**.</Text></View>
            <View style={styles.insRow}><Text style={styles.insNumber}>5</Text><Text style={styles.insText}>Tome una fotografía nítida y centrada de su dibujo.</Text></View>
          </>
        ) : (
          <>
            <View style={styles.insRow}><Text style={styles.insNumber}>1</Text><Text style={styles.insText}>Ubíquese en un lugar silencioso sin ruidos de fondo.</Text></View>
            <View style={styles.insRow}><Text style={styles.insNumber}>2</Text><Text style={styles.insText}>Toque el botón del micrófono para empezar a grabar.</Text></View>
            <View style={styles.insRow}><Text style={styles.insNumber}>3</Text><Text style={styles.insText}>Mencione todos los nombres de **animales** que recuerde durante 60 segundos.</Text></View>
            <View style={styles.insRow}><Text style={styles.insNumber}>4</Text><Text style={styles.insText}>Al terminar, presione el botón rojo de detener para enviar el audio.</Text></View>
          </>
        )}
      </View>
      <TouchableOpacity style={styles.primaryBtn} onPress={startEvaluation}>
        <Text style={styles.primaryBtnText}>Comenzar evaluación</Text>
      </TouchableOpacity>
    </View>
  );
};

export const CdtCaptureStep = ({ patientInfo, rejectReason, imageUri, setImageUri, takePhoto, pickFromGallery, submitCdtTest, setRejectReason }: any) => (
  <View style={styles.card}>
    <Text style={styles.cardHeaderTitle}>Capturar dibujo del reloj</Text>
    <Text style={styles.cardHeaderSubtitle}>Suba la fotografía del test de {patientInfo?.nombre_paciente}</Text>
    
    {rejectReason && (
      <View style={styles.warningAlert}>
        <Ionicons name="warning" size={24} color="#B45309" />
        <View style={{ flex: 1 }}>
          <Text style={styles.warningAlertTitle}>Imagen no válida para inferencia por IA</Text>
          <Text style={styles.warningAlertText}>{rejectReason}</Text>
        </View>
      </View>
    )}

    {!imageUri && (
      <View style={{ 
        backgroundColor: '#F8FAFC', 
        borderRadius: 16, 
        padding: 16, 
        marginBottom: 20, 
        borderWidth: 1, 
        borderColor: '#E2E8F0' 
      }}>
        <Text style={{ fontSize: 13, fontWeight: '800', color: '#0F172A', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Requisitos para la validación por IA:
        </Text>
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            <Text style={{ fontSize: 13, color: '#475569', fontWeight: '500' }}>Dibujo hecho a lápiz/bolígrafo a mano alzada</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            <Text style={{ fontSize: 13, color: '#475569', fontWeight: '500' }}>Hoja de papel en blanco (sin líneas ni cuadriculado)</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            <Text style={{ fontSize: 13, color: '#475569', fontWeight: '500' }}>Foto bien enfocada, iluminada y sin sombras oscuras</Text>
          </View>
        </View>
      </View>
    )}

    <View style={styles.imageSelectorBox}>
      {imageUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          <View style={{ 
            position: 'absolute', 
            bottom: 12, 
            left: 12, 
            backgroundColor: 'rgba(16, 185, 129, 0.95)', 
            borderRadius: 20, 
            paddingVertical: 5, 
            paddingHorizontal: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6
          }}>
            <Ionicons name="checkmark-circle" size={16} color="white" />
            <Text style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>Foto seleccionada</Text>
          </View>
          <TouchableOpacity style={styles.removeImageBtn} onPress={() => { setImageUri(null); setRejectReason(null); }}>
            <FontAwesome name="times" size={18} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.emptyPhotoBox}>
          <View style={{
            width: 72, 
            height: 72, 
            borderRadius: 36, 
            backgroundColor: '#EEF2FF', 
            justifyContent: 'center', 
            alignItems: 'center',
            marginBottom: 12
          }}>
            <Ionicons name="camera-outline" size={36} color="#4F46E5" />
          </View>
          <Text style={styles.emptyPhotoText}>Esperando captura</Text>
          <Text style={styles.emptyPhotoSubtext}>Use la cámara del escáner para tomar el dibujo</Text>
        </View>
      )}
    </View>

    <View style={styles.captureOptionsRow}>
      <TouchableOpacity style={styles.secondaryBtn} onPress={takePhoto}>
        <Ionicons name="camera" size={18} color="#4F46E5" />
        <Text style={styles.secondaryBtnText}>Usar Escáner</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryBtn} onPress={pickFromGallery}>
        <Ionicons name="images" size={18} color="#4F46E5" />
        <Text style={styles.secondaryBtnText}>Galería</Text>
      </TouchableOpacity>
    </View>

    {imageUri && (
      <TouchableOpacity style={styles.primaryBtn} onPress={submitCdtTest}>
        <Ionicons name="analytics" size={20} color="white" style={{ marginRight: 4 }} />
        <Text style={styles.primaryBtnText}>Analizar con IA</Text>
      </TouchableOpacity>
    )}
  </View>
);

export const VoiceCaptureStep = ({
  patientInfo,
  voiceCurrentIndex,
  voiceIsRecording,
  voiceIsPaused,
  voiceTimer,
  formatTime,
  pulseAnim,
  onStartRecording,
  onTogglePause,
  onNextQuestion,
  onCancel,
}: any) => {
  const PREGUNTAS = [
    { id: 1, tipo: "Descripción narrativa", texto: "Por favor, cuéntenos cómo es un día normal en su vida. ¿Qué hace desde que se levanta hasta que se acuesta?", limit: null },
    { id: 2, tipo: "Fluidez semántica", texto: "Por favor, nombre todos los animales que le vengan a la mente durante un minuto.", limit: 60 },
    { id: 3, tipo: "Fluidez fonémica", texto: "Por favor, diga todas las palabras que empiecen con la letra 'P' durante un minuto.", limit: 60 },
    { id: 4, tipo: "Repetición de oraciones", texto: "Por favor, repita la siguiente oración: 'El gato se esconde bajo el sofá cuando llueve'.", limit: null },
    { id: 5, tipo: "Recuerdo", texto: "Ahora, ¿recuerda los objetos que anteriormente aparecieron? Por favor, menciónelos.", limit: null }
  ];

  const pregunta = PREGUNTAS[voiceCurrentIndex] || PREGUNTAS[0];
  const isTimed = pregunta.limit !== null;
  const displayTimer = isTimed
    ? `${Math.max(0, 60 - voiceTimer)}s`
    : formatTime(voiceTimer);

  return (
    <View style={styles.card}>
      {/* Progress Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Text style={{ fontSize: 13, color: '#64748B', fontWeight: '700' }}>
          Pregunta {pregunta.id} de {PREGUNTAS.length}
        </Text>
        <View style={styles.voiceQuestionBadge}>
          <Text style={styles.voiceQuestionBadgeText}>{pregunta.tipo}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.voiceProgressBarContainer}>
        <View style={[styles.voiceProgressBarFiller, { width: `${((voiceCurrentIndex) / PREGUNTAS.length) * 100}%` }]} />
      </View>

      {/* Question Text */}
      <View style={{ backgroundColor: '#F8FAFC', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#E2E8F0', minHeight: 110, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 15, color: '#0F172A', fontWeight: '600', textAlign: 'center', lineHeight: 22 }}>
          {pregunta.texto}
        </Text>
      </View>

      {/* T5 3x2 Grid of cards */}
      {voiceCurrentIndex === 4 && (
        <View style={styles.voiceGridContainer}>
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <View key={num} style={styles.voiceGridCard}>
              <Text style={styles.voiceGridCardText}>?</Text>
            </View>
          ))}
        </View>
      )}

      {/* Voice Recording zone */}
      <View style={styles.voiceRecordOuterZone}>
        <View style={{ justifyContent: 'center', alignItems: 'center', height: 140, width: 140 }}>
          {voiceIsRecording && !voiceIsPaused && (
            <>
              <Animated.View style={{
                position: 'absolute',
                width: 130,
                height: 130,
                borderRadius: 65,
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                transform: [{ scale: pulseAnim }],
              }} />
              <Animated.View style={{
                position: 'absolute',
                width: 110,
                height: 110,
                borderRadius: 55,
                backgroundColor: 'rgba(239, 68, 68, 0.25)',
                transform: [{ scale: pulseAnim }],
              }} />
            </>
          )}
          {voiceIsRecording ? (
            voiceIsPaused ? (
              <TouchableOpacity style={[styles.largeMicBtn, styles.micPausedColor]} onPress={onTogglePause}>
                <FontAwesome name="play" size={24} color="white" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.largeMicBtn, styles.micActiveColor]} onPress={onTogglePause}>
                <FontAwesome name="pause" size={24} color="white" />
              </TouchableOpacity>
            )
          ) : (
            <TouchableOpacity style={styles.largeMicBtn} onPress={onStartRecording}>
              <FontAwesome name="microphone" size={28} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {/* Timer */}
        <Text style={[
          styles.timerText, 
          voiceIsRecording && !voiceIsPaused && styles.timerActive,
          voiceIsRecording && voiceIsPaused && styles.timerPaused
        ]}>
          {voiceIsRecording ? displayTimer : "00:00"}
        </Text>

        {/* Status text */}
        <Text style={styles.voiceStatusText}>
          {!voiceIsRecording 
            ? "Toque el micrófono para iniciar"
            : voiceIsPaused 
              ? "Grabación pausada. Pulse Play para reanudar" 
              : isTimed 
                ? `Hablando... Tiempo restante: ${displayTimer}`
                : "Grabando voz del paciente..."}
        </Text>
      </View>

      {/* Info box context */}
      <View style={styles.infoBoxBlue}>
        <MaterialIcons name="info-outline" size={20} color="#1E40AF" />
        <Text style={styles.infoBoxText}>
          {isTimed 
            ? "Esta es una tarea con tiempo límite de 1 minuto. Se avanzará automáticamente al expirar."
            : "Hable de forma clara. Al finalizar de responder, presione el botón de abajo para avanzar."}
        </Text>
      </View>

      {/* Bottom Button Actions */}
      <View style={styles.voiceButtonsRow}>
        <TouchableOpacity style={styles.voiceCancelBtn} onPress={onCancel}>
          <FontAwesome name="times" size={18} color="#EF4444" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.voiceNextBtn, 
            !voiceIsRecording && styles.voiceNextBtnDisabled
          ]} 
          onPress={onNextQuestion}
          disabled={!voiceIsRecording}
        >
          <Text style={styles.voiceNextBtnText}>
            {voiceCurrentIndex === 4 ? "Finalizar prueba" : "Siguiente pregunta"}
          </Text>
          <Ionicons name={voiceCurrentIndex === 4 ? "checkmark-done" : "arrow-forward"} size={18} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const ProcessingStep = () => (
  <View style={styles.card}>
    <View style={styles.loadingSpinnerBox}>
      <ActivityIndicator size="large" color="#4F46E5" style={{ transform: [{ scale: 1.5 }] }} />
      <Text style={styles.loadingTitle}>Procesando evaluación por IA...</Text>
      <Text style={styles.loadingSubtitle}>Evaluando patrones visuales/acústicos en el servidor de inferencia médica.</Text>
    </View>
  </View>
);

export const CdtResultsStep = ({ cdtResult, handleLogout }: any) => {
  const rating = cdtResult?.puntuacion ?? 0;
  const resultTheme = CDT_SCALES[rating] || CDT_SCALES[0];
  return (
    <View style={styles.card}>
      <View style={styles.resultsBadgeRow}>
        <View style={[styles.badgeContainer, { backgroundColor: resultTheme.bg, borderColor: resultTheme.border }]}>
          <Text style={[styles.badgeText, { color: resultTheme.color }]}>Puntuación: {rating}/5</Text>
        </View>
        <View style={[styles.badgeContainer, { backgroundColor: resultTheme.bg, borderColor: resultTheme.border }]}>
          <Text style={[styles.badgeText, { color: resultTheme.color }]}>{resultTheme.title}</Text>
        </View>
      </View>
      <Text style={styles.resultDetailsHeader}>Diagnóstico Estructural por IA</Text>
      {resultTheme.alert ? (
        <View style={styles.alertCriticalBanner}>
          <MaterialIcons name="warning" size={24} color="#991B1B" />
          <View style={{ flex: 1 }}>
            <Text style={styles.alertCriticalTitle}>Atención Médica Sugerida</Text>
            <Text style={styles.alertCriticalText}>Los patrones del dibujo del reloj sugieren posible deterioro cognitivo. Requiere revisión especializada.</Text>
          </View>
        </View>
      ) : (
        <View style={styles.alertSuccessBanner}>
          <Ionicons name="checkmark-circle" size={24} color="#065F46" />
          <View style={{ flex: 1 }}>
            <Text style={styles.alertSuccessTitle}>Desempeño Esperado</Text>
            <Text style={styles.alertSuccessText}>Las características del trazo y manecillas se encuentran en rangos de normalidad cognitiva.</Text>
          </View>
        </View>
      )}
      <View style={styles.resultTextCard}>
        <Text style={styles.resultDescText}>{cdtResult.observaciones || resultTheme.desc}</Text>
      </View>
      <Text style={styles.scaleHierarchyHeader}>Escala de Shulman (Referencia Clínica):</Text>
      <View style={styles.scaleTracker}>
        {[5, 4, 3, 2, 1, 0].map((num) => {
          const isCurrent = rating === num;
          const itemTheme = CDT_SCALES[num] || CDT_SCALES[0];
          return (
            <View 
              key={num} 
              style={[
                styles.scaleItem, 
                isCurrent 
                  ? { backgroundColor: itemTheme.bg, borderColor: itemTheme.color, borderWidth: 2 } 
                  : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderWidth: 1, opacity: 0.75 }
              ]}
            >
              <Text style={[
                styles.scaleItemNumber, 
                { color: isCurrent ? itemTheme.color : '#64748B' }, 
                isCurrent && { fontWeight: '800' }
              ]}>
                {num}
              </Text>
              <Text style={[
                styles.scaleItemText, 
                isCurrent && { fontWeight: '700', color: '#0F172A' }
              ]} numberOfLines={1}>
                {itemTheme.title}
              </Text>
              {isCurrent && <FontAwesome name="check-circle" size={16} color={itemTheme.color} />}
            </View>
          );
        })}
      </View>
      <TouchableOpacity style={styles.primaryBtn} onPress={handleLogout}>
        <Text style={styles.primaryBtnText}>Finalizar y Salir</Text>
      </TouchableOpacity>
    </View>
  );
};

export const VoiceResultsStep = ({ voiceResult, handleLogout }: any) => {
  const hasAlert = voiceResult?.alerta ?? false;
  const confidence = voiceResult?.confianza ?? 0;
  return (
    <View style={styles.card}>
      <View style={styles.resultsBadgeRow}>
        <View style={[styles.badgeContainer, { backgroundColor: hasAlert ? '#FEF2F2' : '#ECFDF5', borderColor: hasAlert ? '#FCA5A5' : '#A7F3D0' }]}>
          <Text style={[styles.badgeText, { color: hasAlert ? '#991B1B' : '#065F46' }]}>{hasAlert ? "Revisión sugerida" : "Sin alteraciones"}</Text>
        </View>
        <View style={[styles.badgeContainer, { backgroundColor: hasAlert ? '#FEF2F2' : '#ECFDF5', borderColor: hasAlert ? '#FCA5A5' : '#A7F3D0' }]}>
          <Text style={[styles.badgeText, { color: hasAlert ? '#991B1B' : '#065F46' }]}>Confianza: {confidence}%</Text>
        </View>
      </View>
      <Text style={styles.resultDetailsHeader}>Resultados de Fluidez Verbal</Text>
      {hasAlert ? (
        <View style={styles.alertCriticalBanner}>
          <MaterialIcons name="warning" size={24} color="#991B1B" />
          <View style={{ flex: 1 }}>
            <Text style={styles.alertCriticalTitle}>Atención Médica Sugerida</Text>
            <Text style={styles.alertCriticalText}>Se identificaron pausas inusuales o desorganización léxica en la captura acústica.</Text>
          </View>
        </View>
      ) : (
        <View style={styles.alertSuccessBanner}>
          <Ionicons name="checkmark-circle" size={24} color="#065F46" />
          <View style={{ flex: 1 }}>
            <Text style={styles.alertSuccessTitle}>Resultados en Rango</Text>
            <Text style={styles.alertSuccessText}>La fluidez semántica y los biomarcadores de voz se sitúan en niveles esperados.</Text>
          </View>
        </View>
      )}
      <Text style={styles.transcriptSubHeader}>Transcripción del Audio:</Text>
      <ScrollView style={styles.transcriptBox}>
        <Text style={styles.transcriptText}>{"\"" + (voiceResult?.transcripcion || "Sin transcripción disponible") + "\""}</Text>
      </ScrollView>
      <TouchableOpacity style={styles.primaryBtn} onPress={handleLogout}>
        <Text style={styles.primaryBtnText}>Finalizar y Salir</Text>
      </TouchableOpacity>
    </View>
  );
};
