// import './global'
import { encode as msgpack } from 'messagepack'
import { encode as base64 } from '@protobufjs/base64'
import { formatDateTime, createRequestSigner } from './aws'
import uuid from './uuid'

export { uuid }

export function createResponder(opts) {
  const firehose = createFirehose(opts)
  return async (data, date) => {
    try {
      const res = await firehose(data, date);
      return new Response(emptyGif, {
        headers: {
          'content-type': 'image/gif',
        },
      })
    } catch (error) {
      return new Response(JSON.stringify(error.body, null, '  '), {
        status: 500,
        headers: {
          'content-type': 'application/json',
        }
      });
    }
  };
}

export const emptyGif = new Uint8Array([
  71,73,70,56,
  57,97,1,0,
  1,0,128,0,
  0,255,255,255,
  255,255,255,33,
  249,4,1,10,
  0,1,0,44,
  0,0,0,0,
  1,0,1,0,
  0,2,2,76,
  1,0,59
])

export function createFirehose(opts = {}) {
  const {
    accessKeyId,
    secretAccessKey,
    deliveryStreamName,
    region = 'us-east-1',
    domain = 'amazonaws.com'
  } = opts

  const signRequest = createRequestSigner({
    accessKeyId,
    secretAccessKey,
    region,
    service: 'firehose'
  })

  return async (data, date = new Date()) => {
    const encoded = msgpack(data)
    const Data = base64(encoded, 0, encoded.length)

    const host = `firehose.${region}.${domain}`

    const request = await signRequest({
      method: 'POST',
      headers: {
        'content-type': 'application/x-amz-json-1.1',
        host,
        'x-amz-target': 'Firehose_20150804.PutRecord',
        'x-amz-date': formatDateTime(date),
      },
      body: JSON.stringify({
        DeliveryStreamName: deliveryStreamName,
        Record: {
          Data,
        },
      }),
    })

    const res = await fetch(`https://${host}`, request)

    if (res.status === 200) return res

    const error = new Error()
    error.status = res.status
    error.body = await res.json()
    error.response = res
    throw error
  }
}
