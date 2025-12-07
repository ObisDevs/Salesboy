// Status check for Salesboy AI system
const http = require('http')
const https = require('https')

async function checkGateway() {
  console.log('🔍 Checking Gateway Status...')
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'srv892192.hstgr.cloud',
      port: 3001,
      path: '/health',
      method: 'GET',
      headers: {
        'X-API-KEY': '0ac2f6495dbba3807785e791780244afdeb63829d78331a6611d0fbd56d7812f'
      }
    }
    
    const req = http.request(options, (res) => {
      let body = ''
      res.on('data', chunk => body += chunk)
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Gateway is running:', body)
          resolve(true)
        } else {
          console.log('❌ Gateway error:', res.statusCode, body)
          resolve(false)
        }
      })
    })
    
    req.on('error', (error) => {
      console.log('❌ Gateway connection failed:', error.message)
      resolve(false)
    })
    
    req.setTimeout(5000, () => {
      console.log('❌ Gateway timeout')
      req.destroy()
      resolve(false)
    })
    
    req.end()
  })
}

async function checkCore() {
  console.log('🔍 Checking Core Backend...')
  
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/sessions/status',
      method: 'GET'
    }, (res) => {
      if (res.statusCode === 400) {
        console.log('✅ Core backend is running (validation working)')
        resolve(true)
      } else {
        console.log('❌ Core backend unexpected response:', res.statusCode)
        resolve(false)
      }
    })
    
    req.on('error', (error) => {
      console.log('❌ Core backend not running:', error.message)
      console.log('   Start with: cd salesboy-core && npm run dev')
      resolve(false)
    })
    
    req.setTimeout(2000, () => {
      console.log('❌ Core backend timeout')
      req.destroy()
      resolve(false)
    })
    
    req.end()
  })
}

async function checkSupabase() {
  console.log('🔍 Checking Supabase Connection...')
  
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'hlkyicsgsjruneetymin.supabase.co',
      path: '/rest/v1/',
      method: 'GET',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsa3lpY3Nnc2pydW5lZXR5bWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMTcxNDUsImV4cCI6MjA4MDY5MzE0NX0.FjG3pw06E0cTZmw095axjnt6_UFKAbsZw6TFNoZ7AWg'
      }
    }, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Supabase is accessible')
        resolve(true)
      } else {
        console.log('❌ Supabase error:', res.statusCode)
        resolve(false)
      }
    })
    
    req.on('error', (error) => {
      console.log('❌ Supabase connection failed:', error.message)
      resolve(false)
    })
    
    req.setTimeout(5000, () => {
      console.log('❌ Supabase timeout')
      req.destroy()
      resolve(false)
    })
    
    req.end()
  })
}

async function main() {
  console.log('🚀 Salesboy AI System Status Check\n')
  
  const gatewayOk = await checkGateway()
  console.log()
  
  const coreOk = await checkCore()
  console.log()
  
  const supabaseOk = await checkSupabase()
  console.log()
  
  console.log('📊 System Status Summary:')
  console.log('Gateway (VPS):', gatewayOk ? '✅ Running' : '❌ Down')
  console.log('Core Backend:', coreOk ? '✅ Running' : '❌ Down')
  console.log('Supabase:', supabaseOk ? '✅ Connected' : '❌ Error')
  
  if (gatewayOk && coreOk && supabaseOk) {
    console.log('\n🎉 All systems operational!')
    console.log('Ready for integration testing.')
  } else {
    console.log('\n⚠️  Some systems need attention.')
    if (!coreOk) {
      console.log('Start core: cd salesboy-core && npm run dev')
    }
  }
}

main().catch(console.error)