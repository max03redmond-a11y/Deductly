#!/usr/bin/env node

const ngrok = require('@expo/ngrok');

console.log('Testing ngrok tunnel connection...\n');

async function testTunnel() {
  try {
    console.log('1. Starting ngrok...');
    const url = await ngrok.connect({
      addr: 8081,
      proto: 'http'
    });

    console.log('✅ Tunnel created successfully!');
    console.log('📍 Tunnel URL:', url);
    console.log('\nYou can use this URL to connect from Expo Go app.');
    console.log('\nPress Ctrl+C to stop the tunnel.');

    // Keep process alive
    await new Promise(() => {});
  } catch (error) {
    console.error('❌ Tunnel failed:', error.message);
    console.error('\nThis might be due to:');
    console.error('  - Network restrictions in this environment');
    console.error('  - Ngrok rate limits');
    console.error('  - Firewall settings');
    process.exit(1);
  }
}

testTunnel();
