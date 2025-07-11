const axios = require('axios');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  }

  async generateSummary(articleContent) {
    try {
      const prompt = `Please provide a concise summary of the following sports article in 2-3 sentences. Focus on the key points and main events:\n\n${articleContent}`;
      
      const response = await axios.post(
        `${this.baseUrl}?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const summary = response.data.candidates[0].content.parts[0].text;
      return summary.trim();
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate AI summary');
    }
  }

  async generateFantasyPredictions(matchData, playerStats) {
    try {
      const prompt = `Based on the following match data and player statistics, provide fantasy sports predictions:

Match Information:
${JSON.stringify(matchData, null, 2)}

Player Statistics:
${JSON.stringify(playerStats, null, 2)}

Please provide:
1. Top 5 captain picks with reasoning
2. Top 5 differential picks (low ownership, high potential)
3. 3-5 transfer suggestions
4. Overall strategy summary

Format the response as a JSON object with structured data.`;

      const response = await axios.post(
        `${this.baseUrl}?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const predictions = response.data.candidates[0].content.parts[0].text;
      return this.parseFantasyPredictions(predictions);
    } catch (error) {
      console.error('Gemini fantasy predictions error:', error);
      throw new Error('Failed to generate fantasy predictions');
    }
  }

  async generateMatchBotResponse(question, matchContext) {
    try {
      const prompt = `You are a knowledgeable sports commentator providing real-time match analysis. 

Current Match Context:
${JSON.stringify(matchContext, null, 2)}

User Question: ${question}

Please provide a conversational, informative response about the match. Keep it concise and engaging.`;

      const response = await axios.post(
        `${this.baseUrl}?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const answer = response.data.candidates[0].content.parts[0].text;
      return answer.trim();
    } catch (error) {
      console.error('Gemini matchbot error:', error);
      throw new Error('Failed to generate match bot response');
    }
  }

  async generateArticleIdeas(sport, recentTrends) {
    try {
      const prompt = `Generate 5 trending sports article ideas for ${sport} based on recent trends:

Recent Trends:
${recentTrends}

Please provide article titles and brief descriptions that would be engaging for sports fans.`;

      const response = await axios.post(
        `${this.baseUrl}?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const ideas = response.data.candidates[0].content.parts[0].text;
      return ideas.trim();
    } catch (error) {
      console.error('Gemini article ideas error:', error);
      throw new Error('Failed to generate article ideas');
    }
  }

  parseFantasyPredictions(predictionsText) {
    try {
      // Try to parse as JSON first
      const jsonMatch = predictionsText.match(/```json\n(.*?)\n```/s);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }

      // If not JSON, parse manually
      return {
        captainPicks: this.extractCaptainPicks(predictionsText),
        differentialPicks: this.extractDifferentialPicks(predictionsText),
        transferSuggestions: this.extractTransferSuggestions(predictionsText),
        summary: this.extractSummary(predictionsText)
      };
    } catch (error) {
      console.error('Error parsing fantasy predictions:', error);
      return {
        captainPicks: [],
        differentialPicks: [],
        transferSuggestions: [],
        summary: 'Failed to parse predictions'
      };
    }
  }

  extractCaptainPicks(text) {
    const captainSection = text.match(/captain picks?:?\s*(.*?)(?=\n\n|\n[0-9]|\ndifferential|$)/is);
    if (!captainSection) return [];

    return captainSection[1]
      .split('\n')
      .filter(line => line.trim())
      .slice(0, 5)
      .map(line => ({
        playerName: line.split(':')[0]?.trim() || line.trim(),
        reasoning: line.split(':')[1]?.trim() || 'No reasoning provided'
      }));
  }

  extractDifferentialPicks(text) {
    const differentialSection = text.match(/differential picks?:?\s*(.*?)(?=\n\n|\n[0-9]|\ntransfer|$)/is);
    if (!differentialSection) return [];

    return differentialSection[1]
      .split('\n')
      .filter(line => line.trim())
      .slice(0, 5)
      .map(line => ({
        playerName: line.split(':')[0]?.trim() || line.trim(),
        reasoning: line.split(':')[1]?.trim() || 'No reasoning provided'
      }));
  }

  extractTransferSuggestions(text) {
    const transferSection = text.match(/transfer suggestions?:?\s*(.*?)(?=\n\n|\n[0-9]|\nstrategy|$)/is);
    if (!transferSection) return [];

    return transferSection[1]
      .split('\n')
      .filter(line => line.trim())
      .slice(0, 5)
      .map(line => ({
        suggestion: line.trim(),
        priority: 'medium'
      }));
  }

  extractSummary(text) {
    const summarySection = text.match(/strategy summary:?\s*(.*?)$/is);
    return summarySection ? summarySection[1].trim() : 'No summary available';
  }
}

module.exports = new GeminiService();
