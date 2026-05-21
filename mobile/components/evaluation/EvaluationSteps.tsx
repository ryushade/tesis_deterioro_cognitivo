import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, ScrollView, Animated } from 'react-native';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { styles, CDT_SCALES } from './EvaluationStyles';

export const LoginStep = ({ accessCode, setAccessCode, errorMessage, setErrorMessage, handlePatientLogin, loading }: any) => (
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
  </View>
);

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

export const VoiceCaptureStep = ({ patientInfo, isRecording, pulseAnim, stopRecording, startRecording, voiceTimer, formatTime }: any) => (
  <View style={styles.card}>
    <Text style={styles.cardHeaderTitle}>Capturar Fluidez Verbal</Text>
    <Text style={styles.cardHeaderSubtitle}>Módulo de captura vocal de {patientInfo?.nombre_paciente}</Text>
    <View style={styles.voiceRecordOuterZone}>
      <View style={{ justifyContent: 'center', alignItems: 'center', height: 160, width: 160 }}>
        {isRecording && (
          <>
            <Animated.View style={{
              position: 'absolute',
              width: 144,
              height: 144,
              borderRadius: 72,
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              transform: [{ scale: pulseAnim }],
            }} />
            <Animated.View style={{
              position: 'absolute',
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: 'rgba(239, 68, 68, 0.25)',
              transform: [{ scale: pulseAnim }],
            }} />
          </>
        )}
        {isRecording ? (
          <TouchableOpacity style={[styles.largeMicBtn, styles.micActiveColor]} onPress={stopRecording}>
            <FontAwesome name="stop" size={28} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.largeMicBtn} onPress={startRecording}>
            <FontAwesome name="microphone" size={32} color="white" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={[styles.timerText, isRecording && styles.timerActive]}>{isRecording ? formatTime(voiceTimer) : "00:00"}</Text>
      <Text style={styles.voiceStatusText}>{isRecording ? "Grabando voz del paciente..." : "Toque el micrófono para iniciar"}</Text>
    </View>
    <View style={styles.infoBoxBlue}>
      <MaterialIcons name="info-outline" size={20} color="#1E40AF" />
      <Text style={styles.infoBoxText}>La prueba se detendrá automáticamente a los 60 segundos o al presionar detener.</Text>
    </View>
  </View>
);

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
