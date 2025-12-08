// Test Knowledge Base Upload Pipeline
// This will test: Upload → Process → Embed → Pinecone

const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const API_URL = 'https://salesboy-lilac.vercel.app';
const USER_ID = 'test-user-123';

// Create a test document
const testContent = `
# Salesboy AI - Product Information

## About Our Service
Salesboy AI is a WhatsApp-based business automation platform designed for Nigerian small businesses.

## Pricing
- Basic Plan: ₦5,000/month - Up to 100 messages
- Pro Plan: ₦15,000/month - Up to 1,000 messages  
- Enterprise: Custom pricing for unlimited messages

## Features
- Automated customer responses
- AI-powered chat assistant
- Knowledge base integration
- Task automation with n8n
- Multi-session support

## Contact
Email: support@salesboy.ai
Phone: +234 800 123 4567
Website: https://salesboy.ai

## Business Hours
Monday - Friday: 9:00 AM - 6:00 PM WAT
Saturday: 10:00 AM - 4:00 PM WAT
Sunday: Closed
`;

async function testKnowledgeBase() {
  console.log('=== Testing Knowledge Base Pipeline ===\n');

  try {
    // Step 1: Create test file
    console.log('Step 1: Creating test document...');
    const filename = 'test-product-info.txt';
    fs.writeFileSync(filename, testContent);
    console.log('✅ Test document created\n');

    // Step 2: Upload document
    console.log('Step 2: Uploading to knowledge base...');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filename));
    formData.append('user_id', USER_ID);

    const uploadResponse = await axios.post(`${API_URL}/api/kb/upload`, formData, {
      headers: formData.getHeaders()
    });
    
    console.log('✅ Upload response:', uploadResponse.data);
    const fileId = uploadResponse.data.file_id;
    console.log('File ID:', fileId, '\n');

    // Step 3: Process document (extract and chunk)
    console.log('Step 3: Processing document...');
    const processResponse = await axios.post(`${API_URL}/api/kb/process`, {
      user_id: USER_ID,
      file_id: fileId
    });
    
    console.log('✅ Process response:', processResponse.data);
    console.log('Chunks created:', processResponse.data.chunks?.length || 0, '\n');

    // Step 4: Generate embeddings and upload to Pinecone
    console.log('Step 4: Generating embeddings and uploading to Pinecone...');
    const embedResponse = await axios.post(`${API_URL}/api/kb/embed`, {
      user_id: USER_ID,
      file_id: fileId
    });
    
    console.log('✅ Embed response:', embedResponse.data);
    console.log('Vectors uploaded:', embedResponse.data.vectors_count || 0, '\n');

    // Cleanup
    fs.unlinkSync(filename);
    
    console.log('========================================');
    console.log('✅ SUCCESS! Knowledge base pipeline works!');
    console.log('========================================');
    console.log('\nNow check your Pinecone dashboard:');
    console.log('- Namespace: user_' + USER_ID);
    console.log('- Expected vectors: ' + (processResponse.data.chunks?.length || 0));
    console.log('\nYou can now test RAG queries against this data!');

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Full error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testKnowledgeBase();
