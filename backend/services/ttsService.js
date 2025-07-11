const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

class TTSService {
  constructor() {
    this.client = new textToSpeech.TextToSpeechClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE
    });
    this.audioDir = path.join(__dirname, '../uploads/audio');
    
    // Create audio directory if it doesn't exist
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
  }

  async generateAudio(text, title) {
    try {
      // Clean and prepare text for TTS
      const cleanText = this.cleanTextForTTS(text);
      
      // Configure the request
      const request = {
        input: { text: cleanText },
        voice: {
          languageCode: 'en-US',
          name: 'en-US-Standard-D', // Male voice
          ssmlGender: 'MALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGainDb: 0.0
        }
      };

      // Generate audio
      const [response] = await this.client.synthesizeSpeech(request);
      
      // Save audio file
      const fileName = this.generateFileName(title);
      const filePath = path.join(this.audioDir, fileName);
      
      const writeFile = promisify(fs.writeFile);
      await writeFile(filePath, response.audioContent, 'binary');
      
      // Return URL path
      return `/api/audio/${fileName}`;
    } catch (error) {
      console.error('TTS generation error:', error);
      throw new Error('Failed to generate audio');
    }
  }

  cleanTextForTTS(text) {
    // Remove HTML tags
    let cleanText = text.replace(/<[^>]*>/g, '');
    
    // Remove markdown formatting
    cleanText = cleanText.replace(/[*_`#]/g, '');
    
    // Replace multiple spaces with single space
    cleanText = cleanText.replace(/\s+/g, ' ');
    
    // Remove URLs
    cleanText = cleanText.replace(/https?:\/\/[^\s]+/g, '');
    
    // Limit length for TTS (Google Cloud TTS has character limits)
    if (cleanText.length > 5000) {
      cleanText = cleanText.substring(0, 5000) + '...';
    }
    
    return cleanText.trim();
  }

  generateFileName(title) {
    const timestamp = Date.now();
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    return `${slug}-${timestamp}.mp3`;
  }

  async deleteAudio(audioUrl) {
    try {
      const fileName = audioUrl.split('/').pop();
      const filePath = path.join(this.audioDir, fileName);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Delete audio error:', error);
      return false;
    }
  }

  // Get audio file
  getAudioFile(fileName) {
    const filePath = path.join(this.audioDir, fileName);
    
    if (fs.existsSync(filePath)) {
      return filePath;
    }
    return null;
  }

  // Alternative TTS service using ElevenLabs (if Google Cloud is not available)
  async generateAudioElevenLabs(text, title) {
    try {
      const axios = require('axios');
      const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
      
      if (!elevenLabsApiKey) {
        throw new Error('ElevenLabs API key not configured');
      }

      const cleanText = this.cleanTextForTTS(text);
      
      const response = await axios.post(
        'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', // Rachel voice
        {
          text: cleanText,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': elevenLabsApiKey
          },
          responseType: 'arraybuffer'
        }
      );

      // Save audio file
      const fileName = this.generateFileName(title);
      const filePath = path.join(this.audioDir, fileName);
      
      const writeFile = promisify(fs.writeFile);
      await writeFile(filePath, response.data);
      
      return `/api/audio/${fileName}`;
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      throw new Error('Failed to generate audio with ElevenLabs');
    }
  }
}

module.exports = new TTSService();
