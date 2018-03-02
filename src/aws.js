import {
  formatDateTime,
  buildCanonicalRequest,
  hash,
  buildStringToSign,
  sign,
  buildAuthorization
} from 'aws-sigv4'

export { formatDateTime }

export function createRequestSigner(opts) {
  const {
    accessKeyId,
    secretAccessKey,
    region,
    service,
    path = '/'
  } = opts

  return async (request) => {
    const { headers } = request
    const requestDate = headers['x-amz-date']

    const sortedHeaders = Object.keys(headers).sort()

    const canonicalHeaders = sortedHeaders.map((name) => {
      return `${name}:${headers[name]}`
    }).join('\n')

    const signedHeaders = sortedHeaders.join(';')

    const canonicalRequest = await buildCanonicalRequest(
      request.method,
      path,
      '',
      canonicalHeaders,
      signedHeaders,
      request.body,
    )
    const hashedCanonicalRequest = await hash(canonicalRequest)

    const ymd = requestDate.slice(0, 8)

    const credentialScope = `${ymd}/${region}/${service}/aws4_request`;

    const stringToSign = buildStringToSign(
      requestDate,
      credentialScope,
      hashedCanonicalRequest,
    )

    const signature = await sign(
      secretAccessKey,
      ymd,
      region,
      service,
      stringToSign,
    )

    request.headers.authorization = buildAuthorization(
      accessKeyId,
      credentialScope,
      signedHeaders,
      signature,
    )

    return request;
  }
}
