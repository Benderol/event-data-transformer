const BASE = '/api'

export interface Consumer {
  id: number
  name: string
  topic: string
  groupId: string
  createdAt: string
  enabled: boolean
}

export type TransformationType = 'INCLUDE' | 'RENAME' | 'FORMAT_DATE'

export interface FieldRule {
  fieldName: string
  type: TransformationType
  targetName?: string
  fromFormat?: string
  toFormat?: string
}

export interface Transformer {
  id: number
  name: string
  inputTopic: string
  outputTopic: string
  enabled: boolean
  createdAt: string
  rules: FieldRule[]
}

export interface CreateTransformerRequest {
  inputTopic: string
  name: string
  outputTopic: string
  rules: FieldRule[]
}

export type EventLogType = 'CONSUMER' | 'PRODUCER'

export interface EventLog {
  type: EventLogType
  inputTopic: string
  outputTopic: string | null
  message: string
  createdAt: string
}

export const api = {
  getConsumers: (): Promise<Consumer[]> =>
    fetch(`${BASE}/consumers`).then(r => r.json()),

  createConsumer: (name: string, topic: string, groupId: string, enabled: boolean): Promise<Consumer> =>
    fetch(`${BASE}/consumers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, topic, groupId, enabled }),
    }).then(r => r.json()),

  getTransformers: (): Promise<Transformer[]> =>
    fetch(`${BASE}/transformers`).then(r => r.json()),

  createTransformer: (data: CreateTransformerRequest): Promise<Transformer> =>
    fetch(`${BASE}/transformers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  deleteTransformer: (id: number): Promise<void> =>
    fetch(`${BASE}/transformers/${id}`, { method: 'DELETE' }).then(() => {}),

  enableTransformer: (id: number): Promise<void> =>
    fetch(`${BASE}/transformers/${id}/enable`, { method: 'POST' }).then(() => {}),

  disableTransformer: (id: number): Promise<void> =>
    fetch(`${BASE}/transformers/${id}/disable`, { method: 'POST' }).then(() => {}),

  deleteConsumer: (id: number): Promise<void> =>
    fetch(`${BASE}/consumers/${id}`, { method: 'DELETE' }).then(() => {}),

  startConsumer: (id: number): Promise<void> =>
    fetch(`${BASE}/consumers/${id}/start`, { method: 'POST' }).then(() => {}),

  stopConsumer: (id: number): Promise<void> =>
    fetch(`${BASE}/consumers/${id}/stop`, { method: 'POST' }).then(() => {}),

  getEventLogs: (): Promise<EventLog[]> =>
    fetch(`${BASE}/event-logs`).then(r => r.json()),

  testSend: (topic: string, message: string): Promise<string> =>
    fetch(`${BASE}/test-send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, message }),
    }).then(r => r.text()),
}
