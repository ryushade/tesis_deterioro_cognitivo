import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, ScrollView, Animated } from 'react-native';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { styles, CDT_SCALES } from './EvaluationStyles';

export const LoginStep = ({ accessCode, setAccessCode, errorMessage, setErrorMessage, handlePatientLogin, loading }: any) => (
  <View style={styles.card}>
    <View style={styles.logoCenter}>
      <Text style={styles.loginTitle}>App móvil para apoyar la evaluación del deterioro cognitivo</Text>
    </View>
    <View style={styles.inputSection}>
      <Text style={styles.inputLabel}>Código de acceso</Text>
      <View style={styles.inputWrapper}>
        <FontAwesome name="key" size={20} color="#637381" style={styles.inputIcon} />
        <TextInput
          style={styles.textInput}
          placeholder="Ej: CDT-123"
          placeholderTextColor="#919EAB"
          value={accessCode}
          onChangeText={(text) => { setAccessCode(text); setErrorMessage(null); }}
          autoCapitalize="characters"
          maxLength={12}
        />
      </View>
      <Text style={styles.inputHelper}>Ingrese el código temporal generado por el neuropsicólogo en el panel web.</Text>
    </View>
    {errorMessage && (
      <View style={styles.errorAlert}>
        <MaterialIcons name="error-outline" size={22} color="#C62828" />
        <Text style={styles.errorAlertText}>{errorMessage}</Text>
      </View>
    )}
    <TouchableOpacity style={[styles.primaryBtn, loading && styles.disabledBtn]} onPress={handlePatientLogin} disabled={loading}>
      {loading ? <ActivityIndicator color="white" /> : <Text style={styles.primaryBtnText}>Iniciar evaluación</Text>}
    </TouchableOpacity>
  </View>
);

export const InstructionsStep = ({ patientInfo, startEvaluation }: any) => {
  const isCdt = patientInfo?.tipo_evaluacion?.toLowerCase().includes('reloj') || patientInfo?.tipo_evaluacion === 'CDT';
  return (
    <View style={styles.card}>
      <View style={styles.patientBanner}>
        <FontAwesome name="user-circle-o" size={24} color="#0D47A1" />
        <Text style={styles.patientBannerText}>Paciente: {patientInfo?.nombre_paciente}</Text>
      </View>
      <Text style={styles.sectionTitle}>{isCdt ? "Prueba del reloj" : "Prueba de fluidez verbal"}</Text>
      <View style={styles.instructionCard}>
        <Text style={styles.insStepTitle}>Pasos a seguir:</Text>
        {isCdt ? (
          <>
            <View style={styles.insRow}><Text style={styles.insNumber}>1</Text><Text style={styles.insText}>Tome una hoja de papel en blanco y un lápiz o bolígrafo.</Text></View>
            <View style={styles.insRow}><Text style={styles.insNumber}>2</Text><Text style={styles.insText}>Dibuje un reloj circular grande.</Text></View>
            <View style={styles.insRow}><Text style={styles.insNumber}>3</Text><Text style={styles.insText}>Coloque todos los números de las horas (del 1 al 12) en su posición correcta.</Text></View>
            <View style={styles.insRow}><Text style={styles.insNumber}>4</Text><Text style={styles.insText}>Dibuje las manecillas indicando exactamente las once y diez (11:10).</Text></View>
            <View style={styles.insRow}><Text style={styles.insNumber}>5</Text><Text style={styles.insText}>Al finalizar, tome una foto nítida de su dibujo usando el botón de captura móvil.</Text></View>
          </>
        ) : (
          <>
            <View style={styles.insRow}><Text style={styles.insNumber}>1</Text><Text style={styles.insText}>Busque un ambiente tranquilo y libre de ruidos molestos.</Text></View>
            <View style={styles.insRow}><Text style={styles.insNumber}>2</Text><Text style={styles.insText}>Haga clic en el micrófono rojo para comenzar a grabar su voz.</Text></View>
            <View style={styles.insRow}><Text style={styles.insNumber}>3</Text><Text style={styles.insText}>Mencione la mayor cantidad de nombres de animales que pueda recordar durante 60 segundos.</Text></View>
            <View style={styles.insRow}><Text style={styles.insNumber}>4</Text><Text style={styles.insText}>Al finalizar, toque el botón cuadrado de stop para enviar su audio a análisis de IA.</Text></View>
          </>
        )}
      </View>
      <TouchableOpacity style={styles.primaryBtn} onPress={startEvaluation}>
        <Text style={styles.primaryBtnText}>Comenzar prueba</Text>
      </TouchableOpacity>
    </View>
  );
};

export const CdtCaptureStep = ({ patientInfo, rejectReason, imageUri, setImageUri, takePhoto, pickFromGallery, submitCdtTest, setRejectReason }: any) => (
  <View style={styles.card}>
    <Text style={styles.cardHeaderTitle}>Capturar prueba del reloj</Text>
    <Text style={styles.cardHeaderSubtitle}>Suba el dibujo de {patientInfo?.nombre_paciente}</Text>
    
    {rejectReason && (
      <View style={styles.warningAlert}>
        <Ionicons name="warning" size={24} color="#E65100" />
        <View style={{ flex: 1 }}>
          <Text style={styles.warningAlertTitle}>No se pudo validar la imagen</Text>
          <Text style={styles.warningAlertText}>{rejectReason}</Text>
        </View>
      </View>
    )}

    {/* Tips box based on AI verification logic in backend */}
    {!imageUri && (
      <View style={{ 
        backgroundColor: '#F0F4F8', 
        borderRadius: 16, 
        padding: 14, 
        marginBottom: 18, 
        borderWidth: 1, 
        borderColor: '#E1E9F0' 
      }}>
        <Text style={{ fontSize: 13, fontWeight: '800', color: '#0A2540', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Requisitos para validación por IA:
        </Text>
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
            <Text style={{ fontSize: 12, color: '#637381', fontWeight: '500' }}>Dibujo hecho completamente a mano alzada (no perfecto)</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
            <Text style={{ fontSize: 12, color: '#637381', fontWeight: '500' }}>Papel blanco puro, sin líneas ni cuadrículas</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
            <Text style={{ fontSize: 12, color: '#637381', fontWeight: '500' }}>Trazos oscuros con bolígrafo o lápiz nítido</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
            <Text style={{ fontSize: 12, color: '#637381', fontWeight: '500' }}>Buena iluminación, sin sombras ni destellos de flash</Text>
          </View>
        </View>
      </View>
    )}

    <View style={styles.imageSelectorBox}>
      {imageUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          {/* Badge indicator */}
          <View style={{ 
            position: 'absolute', 
            bottom: 12, 
            left: 12, 
            backgroundColor: 'rgba(46, 125, 50, 0.9)', 
            borderRadius: 20, 
            paddingVertical: 4, 
            paddingHorizontal: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4
          }}>
            <Ionicons name="checkmark-circle-outline" size={16} color="white" />
            <Text style={{ color: 'white', fontSize: 11, fontWeight: '700' }}>Captura lista</Text>
          </View>
          <TouchableOpacity style={styles.removeImageBtn} onPress={() => { setImageUri(null); setRejectReason(null); }}>
            <FontAwesome name="times" size={18} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.emptyPhotoBox}>
          <View style={{
            width: 70, 
            height: 70, 
            borderRadius: 35, 
            backgroundColor: '#E3F2FD', 
            justifyContent: 'center', 
            alignItems: 'center',
            marginBottom: 12
          }}>
            <Ionicons name="camera-outline" size={36} color="#0D47A1" />
          </View>
          <Text style={styles.emptyPhotoText}>Esperando captura</Text>
          <Text style={styles.emptyPhotoSubtext}>Use la cámara del escáner para tomar el dibujo</Text>
        </View>
      )}
    </View>

    <View style={styles.captureOptionsRow}>
      <TouchableOpacity style={styles.secondaryBtn} onPress={takePhoto}>
        <Ionicons name="camera" size={18} color="#0D47A1" />
        <Text style={styles.secondaryBtnText}>Usar Escáner</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryBtn} onPress={pickFromGallery}>
        <Ionicons name="images" size={18} color="#0D47A1" />
        <Text style={styles.secondaryBtnText}>Galería</Text>
      </TouchableOpacity>
    </View>

    {imageUri && (
      <TouchableOpacity style={styles.primaryBtn} onPress={submitCdtTest}>
        <Ionicons name="analytics" size={20} color="white" style={{ marginRight: 4 }} />
        <Text style={styles.primaryBtnText}>Analizar dibujo</Text>
      </TouchableOpacity>
    )}
  </View>
);

export const VoiceCaptureStep = ({ patientInfo, isRecording, pulseAnim, stopRecording, startRecording, voiceTimer, formatTime }: any) => (
  <View style={styles.card}>
    <Text style={styles.cardHeaderTitle}>Prueba de fluidez verbal</Text>
    <Text style={styles.cardHeaderSubtitle}>Prueba de voz del paciente: {patientInfo?.nombre_paciente}</Text>
    <View style={styles.voiceRecordOuterZone}>
      {isRecording ? (
        <Animated.View style={[styles.micPulseCircle, { transform: [{ scale: pulseAnim }] }]}>
          <TouchableOpacity style={[styles.largeMicBtn, styles.micActiveColor]} onPress={stopRecording}>
            <FontAwesome name="stop" size={32} color="white" />
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <TouchableOpacity style={styles.largeMicBtn} onPress={startRecording}>
          <FontAwesome name="microphone" size={36} color="white" />
        </TouchableOpacity>
      )}
      <Text style={[styles.timerText, isRecording && styles.timerActive]}>{isRecording ? formatTime(voiceTimer) : "00:00"}</Text>
      <Text style={styles.voiceStatusText}>{isRecording ? "Grabando... Toque el botón rojo para finalizar" : "Toque el micrófono para iniciar"}</Text>
    </View>
    <View style={styles.infoBoxBlue}>
      <Text style={styles.infoBoxText}>El paciente tiene 60 segundos para nombrar animales.</Text>
    </View>
  </View>
);

export const ProcessingStep = () => (
  <View style={styles.card}>
    <View style={styles.loadingSpinnerBox}>
      <ActivityIndicator size="large" color="#0D47A1" style={{ transform: [{ scale: 1.5 }] }} />
      <Text style={styles.loadingTitle}>Procesando evaluación...</Text>
      <Text style={styles.loadingSubtitle}>Evaluando parámetros biométricos y clínicos en el servidor.</Text>
    </View>
  </View>
);

export const CdtResultsStep = ({ cdtResult, handleLogout }: any) => {
  const resultTheme = CDT_SCALES[cdtResult.puntuacion] || CDT_SCALES[0];
  return (
    <View style={styles.card}>
      <View style={styles.resultsBadgeRow}>
        <View style={[styles.badgeContainer, { backgroundColor: resultTheme.bg, borderColor: resultTheme.border }]}>
          <Text style={[styles.badgeText, { color: resultTheme.color }]}>Puntuación: {cdtResult.puntuacion}/5</Text>
        </View>
        <View style={[styles.badgeContainer, { backgroundColor: resultTheme.bg, borderColor: resultTheme.border }]}>
          <Text style={[styles.badgeText, { color: resultTheme.color }]}>{resultTheme.title}</Text>
        </View>
      </View>
      <Text style={styles.resultDetailsHeader}>Resultados del análisis estructural</Text>
      {resultTheme.alert && (
        <View style={styles.alertCriticalBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertCriticalTitle}>Revisión clínica sugerida</Text>
            <Text style={styles.alertCriticalText}>Los patrones del dibujo sugieren posible compromiso cognitivo. Se aconseja interconsulta.</Text>
          </View>
        </View>
      )}
      <View style={styles.resultTextCard}>
        <Text style={styles.resultDescText}>{cdtResult.observaciones || resultTheme.desc}</Text>
      </View>
      <Text style={styles.scaleHierarchyHeader}>Escala de Shulman</Text>
      <View style={styles.scaleTracker}>
        {[5, 4, 3, 2, 1, 0].map((num) => {
          const isCurrent = cdtResult.puntuacion === num;
          const itemTheme = CDT_SCALES[num];
          return (
            <View key={num} style={[styles.scaleItem, isCurrent && { backgroundColor: itemTheme.bg, borderColor: itemTheme.color, borderWidth: 2 }]}>
              <Text style={[styles.scaleItemNumber, { color: itemTheme.color }, isCurrent && { fontWeight: '800' }]}>{num}</Text>
              <Text style={[styles.scaleItemText, isCurrent && { fontWeight: '700', color: '#0A2540' }]} numberOfLines={1}>{itemTheme.title}</Text>
              {isCurrent && <FontAwesome name="check-circle" size={16} color={itemTheme.color} />}
            </View>
          );
        })}
      </View>
      <TouchableOpacity style={styles.primaryBtn} onPress={handleLogout}>
        <Text style={styles.primaryBtnText}>Finalizar y salir</Text>
      </TouchableOpacity>
    </View>
  );
};

export const VoiceResultsStep = ({ voiceResult, handleLogout }: any) => (
  <View style={styles.card}>
    <View style={styles.resultsBadgeRow}>
      <View style={[styles.badgeContainer, { backgroundColor: voiceResult.alerta ? '#FFEBEE' : '#E8F5E9', borderColor: voiceResult.alerta ? '#FFCDD2' : '#A5D6A7' }]}>
        <Text style={[styles.badgeText, { color: voiceResult.alerta ? '#C62828' : '#2E7D32' }]}>{voiceResult.alerta ? "Revisión sugerida" : "Sin alteraciones"}</Text>
      </View>
      <View style={[styles.badgeContainer, { backgroundColor: voiceResult.alerta ? '#FFEBEE' : '#E8F5E9', borderColor: voiceResult.alerta ? '#FFCDD2' : '#A5D6A7' }]}>
        <Text style={[styles.badgeText, { color: voiceResult.alerta ? '#C62828' : '#2E7D32' }]}>Confianza: {voiceResult.confianza}%</Text>
      </View>
    </View>
    <Text style={styles.resultDetailsHeader}>Resultados de fluidez verbal</Text>
    {voiceResult.alerta ? (
      <View style={styles.alertCriticalBanner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.alertCriticalTitle}>Resultados fuera de rango</Text>
          <Text style={styles.alertCriticalText}>Se detectaron pausas prolongadas o variaciones inusuales en el flujo del habla.</Text>
        </View>
      </View>
    ) : (
      <View style={styles.alertSuccessBanner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.alertSuccessTitle}>Resultados esperados</Text>
          <Text style={styles.alertSuccessText}>La fluidez léxica y las características de voz se encuentran dentro de parámetros normales.</Text>
        </View>
      </View>
    )}
    <Text style={styles.transcriptSubHeader}>Transcripción:</Text>
    <ScrollView style={styles.transcriptBox}>
      <Text style={styles.transcriptText}>{voiceResult.transcripcion}</Text>
    </ScrollView>
    <TouchableOpacity style={styles.primaryBtn} onPress={handleLogout}>
      <Text style={styles.primaryBtnText}>Finalizar y salir</Text>
    </TouchableOpacity>
  </View>
);
