const BASE = '/api'

export interface Consumer {
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
    fetch(`${BASE}/consumers?name=${encodeURIComponent(name)}&topic=${encodeURIComponent(topic)}&groupId=${encodeURIComponent(groupId)}&enabled=${enabled}`, {
      method: 'POST',
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

  getEventLogs: (): Promise<EventLog[]> =>
    fetch(`${BASE}/event-logs`).then(r => r.json()),

  testSend: (topic: string, message: string): Promise<string> =>
    fetch(`${BASE}/test-send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, message }),
    }).then(r => r.text()),
}
