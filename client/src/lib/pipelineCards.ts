// Re-export pipeline and contact card types and fetchers for easy client access
export type { PipelineCard, ContactCard } from '../../../shared/types/pipelineCards';
export { fetchPipelineCards, fetchContactCards, formatCurrencyRange } from '../../../shared/types/pipelineCards';