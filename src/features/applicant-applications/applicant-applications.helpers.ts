import type { AdmissionStage } from '@/features/admission-calls/admission-calls.types';
import type { ApplicantApplication } from './applicant-applications.types';
export function obtenerPrimerStage(stages: AdmissionStage[]): AdmissionStage | undefined { return [...stages].sort((a, b) => a.orden - b.orden)[0]; }
export function crearApplicantApplication(postulanteId: number, convocatoriaId: string, stage: AdmissionStage): ApplicantApplication { const fecha = new Date().toISOString(); return { postulanteId, convocatoriaId, etapaActualId: stage.id, fechaRegistro: fecha, respuestas: {}, historial: [{ destinoId: stage.id, fecha, responsable: 'Sistema mock' }] }; }
export function formatearFechaApplicantApplication(value: string): string { return value ? new Date(value).toLocaleDateString('es-PE') : '—'; }
