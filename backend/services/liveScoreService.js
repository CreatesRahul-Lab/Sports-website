const axios = require('axios');
const cron = require('node-cron');
const Match = require('../models/Match');

class LiveScoreService {
  constructor(io) {
    this.io = io;
    this.sportsDbApiKey = process.env.SPORTS_DB_API_KEY;
    this.sportMonksApiKey = process.env.SPORTMONKS_API_KEY;
  }

  // Start automatic updates
  startUpdates() {
    console.log('Starting live score updates...');
    
    // Update every 30 seconds during active hours
    cron.schedule('*/30 * * * * *', async () => {
      try {
        await this.updateLiveScores();
      } catch (error) {
        console.error('Scheduled live score update failed:', error);
      }
    });

    // Update upcoming matches every hour
    cron.schedule('0 * * * *', async () => {
      try {
        await this.updateUpcomingMatches();
      } catch (error) {
        console.error('Scheduled upcoming matches update failed:', error);
      }
    });
  }

  // Update live scores
  async updateLiveScores() {
    try {
      const liveMatches = await Match.find({ status: 'live' });
      
      for (const match of liveMatches) {
        await this.updateSingleMatch(match);
      }
    } catch (error) {
      console.error('Update live scores error:', error);
    }
  }

  // Update a single match
  async updateSingleMatch(match) {
    try {
      let updatedData;
      
      switch (match.sport) {
        case 'football':
          updatedData = await this.fetchFootballMatchData(match.matchId);
          break;
        case 'cricket':
          updatedData = await this.fetchCricketMatchData(match.matchId);
          break;
        case 'basketball':
          updatedData = await this.fetchBasketballMatchData(match.matchId);
          break;
        case 'tennis':
          updatedData = await this.fetchTennisMatchData(match.matchId);
          break;
        default:
          console.log(`Sport ${match.sport} not supported for live updates`);
          return;
      }

      if (updatedData) {
        // Update match data
        const updatedMatch = await Match.findOneAndUpdate(
          { matchId: match.matchId },
          { 
            ...updatedData,
            lastUpdated: new Date()
          },
          { new: true }
        );

        // Emit real-time update via Socket.IO
        if (this.io) {
          this.io.to(`match_${match.matchId}`).emit('matchUpdate', updatedMatch);
        }

        console.log(`Updated match: ${match.homeTeam.name} vs ${match.awayTeam.name}`);
      }
    } catch (error) {
      console.error(`Error updating match ${match.matchId}:`, error);
    }
  }

  // Fetch football match data from TheSportsDB
  async fetchFootballMatchData(matchId) {
    try {
      const response = await axios.get(
        `https://www.thesportsdb.com/api/v1/json/${this.sportsDbApiKey}/eventslive.php?id=${matchId}`
      );

      const matchData = response.data.events?.[0];
      if (!matchData) return null;

      return {
        homeTeam: {
          ...matchData.strHomeTeam && { name: matchData.strHomeTeam },
          ...matchData.intHomeScore && { score: parseInt(matchData.intHomeScore) }
        },
        awayTeam: {
          ...matchData.strAwayTeam && { name: matchData.strAwayTeam },
          ...matchData.intAwayScore && { score: parseInt(matchData.intAwayScore) }
        },
        status: this.mapStatus(matchData.strStatus),
        liveData: {
          currentTime: matchData.strProgress || '',
          period: matchData.strProgress || '',
          events: this.parseEvents(matchData.strEvents),
          stats: this.parseStats(matchData)
        }
      };
    } catch (error) {
      console.error(`Error fetching football data for ${matchId}:`, error);
      return null;
    }
  }

  // Fetch cricket match data
  async fetchCricketMatchData(matchId) {
    try {
      // Using a mock API structure since cricket APIs vary significantly
      const response = await axios.get(
        `https://api.cricapi.com/v1/match_info?apikey=${this.sportsDbApiKey}&id=${matchId}`
      );

      const matchData = response.data.data;
      if (!matchData) return null;

      return {
        homeTeam: {
          name: matchData.teams[0],
          score: matchData.score?.[0]?.r || 0
        },
        awayTeam: {
          name: matchData.teams[1],
          score: matchData.score?.[1]?.r || 0
        },
        status: this.mapCricketStatus(matchData.status),
        cricketData: {
          overs: {
            homeTeam: matchData.score?.[0]?.o || 0,
            awayTeam: matchData.score?.[1]?.o || 0
          },
          wickets: {
            homeTeam: matchData.score?.[0]?.w || 0,
            awayTeam: matchData.score?.[1]?.w || 0
          },
          runRate: {
            homeTeam: this.calculateRunRate(matchData.score?.[0]),
            awayTeam: this.calculateRunRate(matchData.score?.[1])
          }
        }
      };
    } catch (error) {
      console.error(`Error fetching cricket data for ${matchId}:`, error);
      return null;
    }
  }

  // Fetch basketball match data
  async fetchBasketballMatchData(matchId) {
    try {
      const response = await axios.get(
        `https://www.thesportsdb.com/api/v1/json/${this.sportsDbApiKey}/eventslive.php?id=${matchId}`
      );

      const matchData = response.data.events?.[0];
      if (!matchData) return null;

      return {
        homeTeam: {
          name: matchData.strHomeTeam,
          score: parseInt(matchData.intHomeScore) || 0
        },
        awayTeam: {
          name: matchData.strAwayTeam,
          score: parseInt(matchData.intAwayScore) || 0
        },
        status: this.mapStatus(matchData.strStatus),
        liveData: {
          currentTime: matchData.strProgress || '',
          period: this.mapBasketballPeriod(matchData.strProgress),
          events: this.parseEvents(matchData.strEvents)
        }
      };
    } catch (error) {
      console.error(`Error fetching basketball data for ${matchId}:`, error);
      return null;
    }
  }

  // Fetch tennis match data
  async fetchTennisMatchData(matchId) {
    try {
      const response = await axios.get(
        `https://www.thesportsdb.com/api/v1/json/${this.sportsDbApiKey}/eventslive.php?id=${matchId}`
      );

      const matchData = response.data.events?.[0];
      if (!matchData) return null;

      return {
        homeTeam: {
          name: matchData.strHomeTeam,
          score: this.parseTennisScore(matchData.strHomeScore)
        },
        awayTeam: {
          name: matchData.strAwayTeam,
          score: this.parseTennisScore(matchData.strAwayScore)
        },
        status: this.mapStatus(matchData.strStatus),
        liveData: {
          currentTime: matchData.strProgress || '',
          period: matchData.strProgress || ''
        }
      };
    } catch (error) {
      console.error(`Error fetching tennis data for ${matchId}:`, error);
      return null;
    }
  }

  // Update upcoming matches
  async updateUpcomingMatches() {
    try {
      console.log('Updating upcoming matches...');
      
      // Fetch upcoming matches from various APIs
      const sports = ['football', 'cricket', 'basketball', 'tennis'];
      
      for (const sport of sports) {
        await this.fetchUpcomingMatches(sport);
      }
    } catch (error) {
      console.error('Update upcoming matches error:', error);
    }
  }

  // Fetch upcoming matches for a sport
  async fetchUpcomingMatches(sport) {
    try {
      const response = await axios.get(
        `https://www.thesportsdb.com/api/v1/json/${this.sportsDbApiKey}/eventsnext.php?sport=${sport}`
      );

      const events = response.data.events || [];
      
      for (const event of events) {
        await this.saveUpcomingMatch(event, sport);
      }
    } catch (error) {
      console.error(`Error fetching upcoming ${sport} matches:`, error);
    }
  }

  // Save upcoming match to database
  async saveUpcomingMatch(eventData, sport) {
    try {
      const existingMatch = await Match.findOne({ matchId: eventData.idEvent });
      
      if (!existingMatch) {
        const match = new Match({
          matchId: eventData.idEvent,
          sport: sport,
          league: eventData.strLeague,
          homeTeam: {
            id: eventData.idHomeTeam,
            name: eventData.strHomeTeam,
            logo: eventData.strHomeTeamBadge
          },
          awayTeam: {
            id: eventData.idAwayTeam,
            name: eventData.strAwayTeam,
            logo: eventData.strAwayTeamBadge
          },
          startTime: new Date(eventData.dateEvent + ' ' + eventData.strTime),
          venue: {
            name: eventData.strVenue,
            city: eventData.strCity
          },
          status: 'scheduled'
        });

        await match.save();
        console.log(`Saved upcoming match: ${match.homeTeam.name} vs ${match.awayTeam.name}`);
      }
    } catch (error) {
      console.error('Error saving upcoming match:', error);
    }
  }

  // Helper methods
  mapStatus(status) {
    const statusMap = {
      'Match Finished': 'finished',
      'Not Started': 'scheduled',
      'In Progress': 'live',
      'Half Time': 'live',
      'Full Time': 'finished'
    };
    return statusMap[status] || 'scheduled';
  }

  mapCricketStatus(status) {
    const statusMap = {
      'completed': 'finished',
      'live': 'live',
      'upcoming': 'scheduled'
    };
    return statusMap[status] || 'scheduled';
  }

  mapBasketballPeriod(progress) {
    if (!progress) return '';
    
    const periodMap = {
      '1st Quarter': 'Q1',
      '2nd Quarter': 'Q2',
      '3rd Quarter': 'Q3',
      '4th Quarter': 'Q4',
      'Overtime': 'OT'
    };
    return periodMap[progress] || progress;
  }

  parseEvents(eventsString) {
    if (!eventsString) return [];
    
    try {
      // Parse events from string format
      const events = eventsString.split(';').map(event => {
        const parts = event.split(':');
        return {
          time: parts[0],
          description: parts[1] || '',
          type: 'event'
        };
      });
      return events;
    } catch (error) {
      return [];
    }
  }

  parseStats(matchData) {
    return {
      possession: {
        home: parseInt(matchData.intHomeShots) || 0,
        away: parseInt(matchData.intAwayShots) || 0
      },
      shots: {
        home: parseInt(matchData.intHomeShots) || 0,
        away: parseInt(matchData.intAwayShots) || 0
      }
    };
  }

  parseTennisScore(scoreString) {
    // Tennis scores are complex, this is a simplified version
    return scoreString || '0';
  }

  calculateRunRate(scoreData) {
    if (!scoreData || !scoreData.r || !scoreData.o) return 0;
    return (scoreData.r / scoreData.o).toFixed(2);
  }
}

module.exports = LiveScoreService;
