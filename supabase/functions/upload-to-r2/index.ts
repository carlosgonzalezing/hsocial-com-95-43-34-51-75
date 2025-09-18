
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createHash, createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

// AWS Signature Version 4 signing process
function getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string) {
  const kDate = createHmac('sha256', 'AWS4' + key).update(dateStamp).digest();
  const kRegion = createHmac('sha256', kDate).update(regionName).digest();
  const kService = createHmac('sha256', kRegion).update(serviceName).digest();
  const kSigning = createHmac('sha256', kService).update('aws4_request').digest();
  return kSigning;
}

function createAuthorizationHeader(
  accessKeyId: string,
  secretAccessKey: string,
  method: string,
  url: string,
  contentType: string,
  contentLength: number,
  timestamp: string
) {
  const algorithm = 'AWS4-HMAC-SHA256';
  const service = 's3';
  const region = 'auto'; // Cloudflare R2 uses 'auto' as region
  const date = timestamp.split('T')[0];
  
  // Create canonical request
  const urlObj = new URL(url);
  const canonicalUri = urlObj.pathname;
  const canonicalQueryString = '';
  
  const canonicalHeaders = [
    `host:${urlObj.host}`,
    `x-amz-content-sha256:UNSIGNED-PAYLOAD`,
    `x-amz-date:${timestamp}`
  ].join('\n') + '\n';
  
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
  
  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    'UNSIGNED-PAYLOAD'
  ].join('\n');
  
  // Create string to sign
  const credentialScope = `${date}/${region}/${service}/aws4_request`;
  const stringToSign = [
    algorithm,
    timestamp,
    credentialScope,
    createHash('sha256').update(canonicalRequest).digest('hex')
  ].join('\n');
  
  // Calculate signature
  const signingKey = getSignatureKey(secretAccessKey, date, region, service);
  const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex');
  
  // Create authorization header
  const credential = `${accessKeyId}/${credentialScope}`;
  return `${algorithm} Credential=${credential}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const fileName = formData.get('fileName') as string

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Cloudflare R2 credentials from environment
    const accountId = Deno.env.get('CLOUDFLARE_R2_ACCOUNT_ID')
    const accessKeyId = Deno.env.get('CLOUDFLARE_R2_ACCESS_KEY')
    const secretAccessKey = Deno.env.get('CLOUDFLARE_R2_SECRET_KEY')
    const bucketName = 'archivos-multimedia'

    if (!accountId || !accessKeyId || !secretAccessKey) {
      console.error('Missing R2 credentials:', { accountId: !!accountId, accessKeyId: !!accessKeyId, secretAccessKey: !!secretAccessKey })
      return new Response(
        JSON.stringify({ error: 'R2 credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Convert file to ArrayBuffer
    const fileBuffer = await file.arrayBuffer()
    
    // Create the R2 endpoint URL
    const r2Endpoint = `https://${accountId}.r2.cloudflarestorage.com`
    const uploadUrl = `${r2Endpoint}/${bucketName}/${fileName}`
    
    // Create timestamp for AWS signature
    const now = new Date()
    const timestamp = now.toISOString().replace(/[:\-]|\.\d{3}/g, '')
    
    // Create authorization header
    const authHeader = createAuthorizationHeader(
      accessKeyId,
      secretAccessKey,
      'PUT',
      uploadUrl,
      file.type,
      fileBuffer.byteLength,
      timestamp
    )

    console.log('Uploading to R2:', { uploadUrl, fileSize: fileBuffer.byteLength, contentType: file.type })

    // Upload to R2 using proper AWS S3 authentication
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
        'Authorization': authHeader,
        'X-Amz-Content-Sha256': 'UNSIGNED-PAYLOAD',
        'X-Amz-Date': timestamp,
        // Set long-term caching on the object to maximize CDN hits
        'Cache-Control': 'public, max-age=31536000, immutable'
      },
      body: fileBuffer
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error('R2 upload failed:', uploadResponse.status, uploadResponse.statusText, errorText)
      throw new Error(`R2 upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`)
    }

    // URL TEMPORAL - Usar la URL pública directa de Cloudflare R2
    // Esto funcionará temporalmente hasta que configures tu dominio personalizado
    const publicUrl = `https://pub-6404c41a9bda4757a01dabe94c0620a3.r2.dev/${fileName}`

    console.log('Upload successful:', { publicUrl })

    return new Response(
      JSON.stringify({ url: publicUrl }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'CDN-Cache-Control': 'public, max-age=31536000'
        } 
      }
    )

  } catch (error) {
    console.error('Upload error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
